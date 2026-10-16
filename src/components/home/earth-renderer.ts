type EarthControls = {
  pause: (value: boolean) => void
  aim: (x: number, y: number) => void
  rotate: (delta: number) => void
  select: (index: number | null) => void
  flyToChennai: (onComplete: () => void) => void
  cancelFlight: () => void
  dispose: () => void
}

const vertexSource = `
attribute vec2 position;
varying vec2 uv;
void main() { uv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
`
const fragmentSource = `
precision highp float;
varying vec2 uv;
uniform sampler2D earth;
uniform float aspect;
uniform float angle;
uniform float tilt;
uniform float emphasis;
uniform float edgeWidth;
uniform float zoom;
const float PI = 3.14159265359;
void main() {
  vec2 p = (uv * 2. - 1.) * vec2(aspect, 1.) / (.84 * zoom);
  float d = dot(p,p);
  if (d > 1.) {
    float halo = exp(-18. * (sqrt(d)-1.)) * .27;
    gl_FragColor = vec4(.39,.77,.72,halo);
    return;
  }
  vec3 normal = vec3(p, sqrt(1.-d));
  float ct=cos(tilt), st=sin(tilt);
  vec3 n=vec3(normal.x, normal.y*ct-normal.z*st, normal.y*st+normal.z*ct);
  float c=cos(angle), s=sin(angle);
  n=vec3(n.x*c+n.z*s,n.y,-n.x*s+n.z*c);
  vec2 mapUv=vec2(atan(n.x,n.z)/(2.*PI)+.5, asin(clamp(n.y,-1.,1.))/PI+.5);
  vec3 tex=texture2D(earth,mapUv).rgb;
  vec3 light=normalize(vec3(-.65 + emphasis * .12,.65,1.3));
  float diffuse=max(dot(normal,light),0.);
  vec3 color=tex*vec3(.82,1.06,1.02)*(.34+.88*diffuse);
  float ocean=1.-smoothstep(.04,.16,tex.r-tex.b*.55);
  float shine=pow(max(dot(reflect(-light,normal),vec3(0.,0.,1.)),0.),32.);
  color+=vec3(.32,.62,.57)*shine*.30*ocean;
  float rim=pow(1.-normal.z,3.5);
  color=mix(color,vec3(.30,.68,.69),rim*.68);
  float atmosphere=pow(1.-normal.z,5.);
  color+=vec3(.17,.37,.36)*atmosphere*diffuse;
  color=pow(color,vec3(.92));
  // Blend the sphere into its atmosphere over a physical pixel to soften the silhouette.
  float edge=smoothstep(1.-edgeWidth,1.,d);
  gl_FragColor=vec4(mix(color,vec3(.39,.77,.72),edge),mix(1.,.27,edge));
}
`

/** A textured, shaded sphere rendered on the GPU. No geometry or image-spin approximation. */
export function createEarth(
  canvas: HTMLCanvasElement,
  onReady: () => void,
  onFailure: () => void,
  onProject?: (points: { x: number; y: number; visible: boolean }[]) => void,
  onDestination?: (point: { x: number; y: number; visible: boolean }) => void,
): EarthControls {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    powerPreference: 'low-power',
  })
  if (!gl) throw new Error('WebGL unavailable')
  const shaders: WebGLShader[] = []
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader)
      throw new Error('Earth shader unavailable')
    }
    shaders.push(shader)
    return shader
  }
  const program = gl.createProgram()!
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error('Earth renderer unavailable')
  gl.useProgram(program)
  const buffer = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  )
  const position = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
  const texture = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.uniform1i(gl.getUniformLocation(program, 'earth'), 0)
  const aspect = gl.getUniformLocation(program, 'aspect')
  const angleUniform = gl.getUniformLocation(program, 'angle')
  const tiltUniform = gl.getUniformLocation(program, 'tilt')
  const emphasisUniform = gl.getUniformLocation(program, 'emphasis')
  const edgeWidthUniform = gl.getUniformLocation(program, 'edgeWidth')
  const zoomUniform = gl.getUniformLocation(program, 'zoom')
  const chennai = { latitude: 13.0827, longitude: 80.2707 }
  let flight: {
    start: number
    angle: number
    tilt: number
    target: number
    complete: () => void
  } | null = null
  let zoom = 1
  let cameraTilt = -0.16
  let selected: number | null = null
  let emphasis = 0
  // Illustrative audience locations, not company offices or customer coverage.
  const locations = [
    [40, -74],
    [51, 0],
    [13, 80],
    [-34, 151],
  ]
  let raf = 0,
    disposed = false,
    loaded = false,
    visible = true,
    paused = false
  let angle = 0.45,
    last = 0,
    x = 0,
    y = 0,
    targetX = 0,
    targetY = 0
  const preference = matchMedia('(prefers-reduced-motion: reduce)')
  const render = (now: number) => {
    raf = 0
    if (disposed || !loaded || !visible || document.hidden) {
      last = 0
      return
    }
    const moving = !paused && !preference.matches
    const delta = last ? Math.min((now - last) / 1000, 0.05) : 0
    last = now
    if (moving && !flight && zoom === 1) angle += delta * 0.115
    const easing = preference.matches ? 1 : 1 - Math.exp(-delta * 5)
    x += ((preference.matches ? 0 : targetX) - x) * easing
    y += ((preference.matches ? 0 : targetY) - y) * easing
    emphasis +=
      ((selected === null ? 0 : 1) - emphasis) * (preference.matches || paused ? 1 : easing)
    let rotation = angle + x * 0.18
    let tilt = zoom > 1 ? cameraTilt : -0.16 + y * 0.12
    let completed: (() => void) | undefined
    if (flight) {
      const progress = Math.min((now - flight.start) / 2200, 1)
      const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
      const turn = smooth(Math.min(progress / 0.72, 1))
      const approach = smooth(Math.max(0, (progress - 0.3) / 0.7))
      rotation = flight.angle + (flight.target - flight.angle) * turn
      tilt = flight.tilt + ((-chennai.latitude * Math.PI) / 180 - flight.tilt) * turn
      zoom = 1 + approach * 3.2
      angle = rotation
      cameraTilt = tilt
      canvas.dataset.flightProgress = progress.toFixed(3)
      if (progress === 1) {
        completed = flight.complete
        flight = null
      }
    }
    gl.uniform1f(aspect, canvas.width / canvas.height)
    gl.uniform1f(angleUniform, rotation)
    gl.uniform1f(tiltUniform, tilt)
    gl.uniform1f(emphasisUniform, emphasis)
    gl.uniform1f(edgeWidthUniform, 4 / canvas.height)
    gl.uniform1f(zoomUniform, zoom)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    const project = ([latitude, longitude]: number[]) => {
      const lat = (latitude * Math.PI) / 180
      const lon = (longitude * Math.PI) / 180 - rotation
      const nx = Math.cos(lat) * Math.sin(lon)
      const ny = Math.sin(lat)
      const nz = Math.cos(lat) * Math.cos(lon)
      const py = ny * Math.cos(tilt) + nz * Math.sin(tilt)
      const pz = -ny * Math.sin(tilt) + nz * Math.cos(tilt)
      return {
        x: 300 + (nx * 0.84 * zoom * 300) / (canvas.width / canvas.height),
        y: 300 - py * 0.84 * zoom * 300,
        visible: pz > 0.08,
      }
    }
    onProject?.(locations.map(project))
    onDestination?.(project([chennai.latitude, chennai.longitude]))
    canvas.dataset.rotation = angle.toFixed(4)
    canvas.dataset.earthState = flight
      ? 'flying'
      : zoom > 1
        ? 'arrived'
        : preference.matches
          ? 'static'
          : paused
            ? 'paused'
            : 'rotating'
    if (completed) {
      completed()
      return
    }
    if ((moving && zoom === 1) || flight) raf = requestAnimationFrame(render)
  }
  const schedule = () => {
    if (!disposed && !raf) raf = requestAnimationFrame(render)
  }
  const resize = () => {
    const box = canvas.getBoundingClientRect()
    const ratio = Math.min(devicePixelRatio || 1, box.width < 600 ? 1.25 : 1.75)
    canvas.width = Math.max(1, Math.round(box.width * ratio))
    canvas.height = Math.max(1, Math.round(box.height * ratio))
    gl.viewport(0, 0, canvas.width, canvas.height)
    schedule()
  }
  const image = new window.Image()
  image.onload = () => {
    if (disposed) return
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
    loaded = true
    resize()
    onReady()
  }
  image.onerror = () => {
    if (!disposed) onFailure()
  }
  image.src = '/images/earth-daymap.jpg'
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (!visible) {
      cancelAnimationFrame(raf)
      raf = 0
      last = 0
      canvas.dataset.earthState = 'offscreen'
    } else schedule()
  })
  intersection.observe(canvas)
  const visibility = () => {
    cancelAnimationFrame(raf)
    raf = 0
    last = 0
    if (!document.hidden) schedule()
  }
  const reduced = () => {
    if (preference.matches && flight) {
      const complete = flight.complete
      flight = null
      complete()
    }
    cancelAnimationFrame(raf)
    raf = 0
    last = 0
    schedule()
  }
  const lost = (event: Event) => {
    event.preventDefault()
    loaded = false
    cancelAnimationFrame(raf)
    raf = 0
    onFailure()
  }
  document.addEventListener('visibilitychange', visibility)
  preference.addEventListener('change', reduced)
  canvas.addEventListener('webglcontextlost', lost)
  return {
    flyToChennai(onComplete) {
      if (!loaded || preference.matches || paused) {
        onComplete()
        return
      }
      const current = angle + x * 0.18
      const target = (chennai.longitude * Math.PI) / 180
      const distance = Math.atan2(Math.sin(target - current), Math.cos(target - current))
      flight = {
        start: performance.now(),
        angle: current,
        tilt: -0.16 + y * 0.12,
        target: current + distance,
        complete: onComplete,
      }
      canvas.dataset.flightProgress = '0'
      schedule()
    },
    cancelFlight() {
      flight = null
      zoom = 1
      angle = angle % (Math.PI * 2)
      x = y = targetX = targetY = 0
      cameraTilt = -0.16
      delete canvas.dataset.flightProgress
      schedule()
    },
    select(index) {
      if (flight || zoom > 1) return
      selected = index
      targetX = index === null ? 0 : index % 2 === 0 ? -0.25 : 0.25
      targetY = index === null ? 0 : index < 2 ? -0.12 : 0.12
      schedule()
    },
    pause(value) {
      paused = value
      cancelAnimationFrame(raf)
      raf = 0
      last = 0
      schedule()
    },
    aim(a, b) {
      if (flight || zoom > 1) return
      targetX = a
      targetY = b
      if (!paused) schedule()
    },
    rotate(delta) {
      if (flight || zoom > 1) return
      angle += delta
      schedule()
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      image.onload = null
      image.onerror = null
      observer.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      preference.removeEventListener('change', reduced)
      canvas.removeEventListener('webglcontextlost', lost)
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      shaders.forEach((shader) => gl.deleteShader(shader))
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
