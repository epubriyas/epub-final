'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Globe2,
  Pause,
  Play,
  BookOpenCheck,
  LayoutTemplate,
  Languages,
  FileCheck2,
  ArrowUpRight,
} from 'lucide-react'
import Link from '@/components/i18n/LocalizedLink'
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
  type MouseEvent,
} from 'react'
import type { createEarth } from './earth-renderer'
import styles from './publishing-hero-visual.module.css'

const connectedServices = [
  {
    label: 'Typesetting',
    detail: 'LAYOUT & PRODUCTION',
    href: '/typesetting-services',
    icon: LayoutTemplate,
  },
  {
    label: 'eBook Creation',
    detail: 'DIGITAL PUBLICATIONS',
    href: '/ebook-creation-services',
    icon: BookOpenCheck,
  },
  {
    label: 'Translation',
    detail: 'MULTILINGUAL CONTENT',
    href: '/translation-services',
    icon: Languages,
  },
  {
    label: 'Accessibility',
    detail: 'INCLUSIVE CONTENT',
    href: '/accessibility-services',
    icon: FileCheck2,
  },
]

export function PublishingHeroVisual() {
  const router = useRouter()
  const figure = useRef<HTMLElement>(null)
  const scene = useRef<HTMLDivElement>(null)
  const network = useRef<SVGSVGElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const controls = useRef<ReturnType<typeof createEarth> | null>(null)
  const destination = useRef<HTMLDivElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const pending = useRef<{ href: string; index: number } | null>(null)
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [journey, setJourney] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const select = (index: number | null) => {
    if (pending.current) return
    setActive(index)
    controls.current?.select(index)
  }
  const loaded = useCallback(() => setReady(true), [])
  const cancelJourney = useCallback(() => {
    const index = pending.current?.index
    pending.current = null
    if (navigationTimer.current) clearTimeout(navigationTimer.current)
    controls.current?.cancelFlight()
    setJourney(null)
    if (index !== undefined)
      requestAnimationFrame(() =>
        figure.current
          ?.querySelectorAll<HTMLAnchorElement>('nav[aria-label="Explore EPUBTRANS services"] a')
          [index]?.focus(),
      )
  }, [])
  const beginJourney = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    if (!ready || paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    event.preventDefault()
    if (pending.current || !controls.current) return
    const url = new URL(event.currentTarget.href)
    const href = `${url.pathname}${url.search}${url.hash}`
    pending.current = { href, index }
    setActive(index)
    setJourney(index)
    router.prefetch(href)
    let navigating = false
    const navigate = () => {
      if (!pending.current || navigating) return
      navigating = true
      if (navigationTimer.current) clearTimeout(navigationTimer.current)
      router.push(href)
    }
    controls.current.flyToChennai(() => {
      if (navigationTimer.current) clearTimeout(navigationTimer.current)
      navigationTimer.current = setTimeout(navigate, 350)
    })
    // Keep navigation usable even if the GPU stops rendering or the tab is hidden.
    navigationTimer.current = setTimeout(navigate, 3400)
  }
  useEffect(() => {
    if (journey === null) return
    cancelButton.current?.focus({ preventScroll: true })
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancelJourney()
    }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [journey, cancelJourney])
  useEffect(
    () => () => {
      pending.current = null
      if (navigationTimer.current) clearTimeout(navigationTimer.current)
    },
    [],
  )
  useEffect(() => {
    const root = scene.current
    if (!root) return
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let targetX = 0,
      targetY = 0,
      x = 0,
      y = 0
    const draw = () => {
      frame = 0
      x += (targetX - x) * 0.12
      y += (targetY - y) * 0.12
      root.style.setProperty('--pointer-x', `${(50 + x * 45).toFixed(2)}%`)
      root.style.setProperty('--pointer-y', `${(50 + y * 45).toFixed(2)}%`)
      root.style.setProperty('--depth-x', `${(x * 9).toFixed(2)}px`)
      root.style.setProperty('--depth-y', `${(y * 7).toFixed(2)}px`)
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.002) frame = requestAnimationFrame(draw)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const move = (event: PointerEvent) => {
      if (preference.matches || paused || event.pointerType !== 'mouse') return
      const box = root.getBoundingClientRect()
      targetX = (event.clientX - box.left) / box.width - 0.5
      targetY = (event.clientY - box.top) / box.height - 0.5
      schedule()
    }
    const reset = () => {
      targetX = 0
      targetY = 0
      schedule()
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      targetX = targetY = x = y = 0
      for (const property of ['--pointer-x', '--pointer-y', '--depth-x', '--depth-y'])
        root.style.removeProperty(property)
    }
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerleave', reset)
    preference.addEventListener('change', stop)
    return () => {
      stop()
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerleave', reset)
      preference.removeEventListener('change', stop)
    }
  }, [paused])
  useEffect(() => {
    let disposed = false
    const element = canvas.current
    if (!element) return
    const failed = () => {
      if (!disposed) setReady(false)
    }
    void import('./earth-renderer')
      .then(({ createEarth }) => {
        if (disposed) return
        try {
          controls.current = createEarth(
            element,
            loaded,
            failed,
            (points) => {
              const groups = network.current?.querySelectorAll<SVGGElement>('[data-service-path]')
              points.forEach((point, index) => {
                const group = groups?.[index]
                if (!group) return
                const startX = index % 2 === 0 ? 150 : 450
                const startY = index < 2 ? 160 + index * 55 : 455
                const path = `M${startX} ${startY} Q300 ${Math.min(startY, point.y) - 55} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
                group.querySelectorAll('path').forEach((line) => line.setAttribute('d', path))
                group.querySelectorAll('circle').forEach((dot) => {
                  dot.setAttribute('cx', String(point.x))
                  dot.setAttribute('cy', String(point.y))
                })
                group.dataset.visible = String(point.visible)
              })
            },
            (point) => {
              const marker = destination.current
              if (!marker) return
              marker.style.left = `${point.x / 6}%`
              marker.style.top = `${point.y / 6}%`
              marker.dataset.visible = String(point.visible)
            },
          )
        } catch {
          failed()
          element.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext()
        }
      })
      .catch(failed)
    let dragging = false,
      lastX = 0
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return
      dragging = true
      lastX = event.clientX
      element.setPointerCapture(event.pointerId)
      element.dataset.dragging = 'true'
    }
    const move = (event: PointerEvent) => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
      if (dragging) {
        controls.current?.rotate((event.clientX - lastX) * 0.007)
        lastX = event.clientX
      } else if (event.pointerType === 'mouse') {
        const rect = element.getBoundingClientRect()
        controls.current?.aim(
          (event.clientX - rect.left) / rect.width - 0.5,
          (event.clientY - rect.top) / rect.height - 0.5,
        )
      }
    }
    const up = () => {
      dragging = false
      delete element.dataset.dragging
      controls.current?.aim(0, 0)
    }
    const keyboard = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
      event.preventDefault()
      controls.current?.rotate(event.key === 'ArrowLeft' ? -0.18 : 0.18)
    }
    element.addEventListener('pointerdown', down)
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerup', up)
    element.addEventListener('pointercancel', up)
    element.addEventListener('pointerleave', up)
    element.addEventListener('keydown', keyboard)
    return () => {
      disposed = true
      controls.current?.dispose()
      controls.current = null
      element.removeEventListener('pointerdown', down)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerup', up)
      element.removeEventListener('pointercancel', up)
      element.removeEventListener('pointerleave', up)
      element.removeEventListener('keydown', keyboard)
    }
  }, [loaded])
  useEffect(() => {
    const root = figure.current
    if (!root) return
    let inView = false
    const update = () => {
      root.dataset.motionVisible = String(inView && !document.hidden)
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      update()
    })
    observer.observe(root)
    document.addEventListener('visibilitychange', update)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  useEffect(() => {
    controls.current?.pause(paused)
  }, [paused])
  return (
    <figure
      ref={figure}
      className={`et-hero-art ${styles.figure}`}
      aria-labelledby="publishing-visual-caption"
      data-earth-ready={ready}
      data-earth-paused={paused}
      data-active-service={active ?? 'none'}
      data-journey={journey !== null}
    >
      <div ref={scene} className={styles.scene}>
        <div className={styles.atmosphere} aria-hidden="true">
          <span className={styles.aura} />
          <span className={styles.coordinateGrid} />
          <span className={styles.orbitalRing} />
          <span className={styles.orbitalRingSecondary} />
          <span className={styles.dustField} />
        </div>
        <Image
          src="/images/earth-hero-poster.webp"
          alt="Earth with shaded continents and a soft atmospheric glow."
          fill
          unoptimized
          loading="eager"
          className={styles.image}
          aria-hidden={ready}
        />
        <canvas
          ref={canvas}
          className={styles.earth}
          role="img"
          aria-label="Rotating Earth with shaded continents and atmosphere. Drag or use left and right arrow keys to explore."
          aria-hidden={!ready}
          tabIndex={ready ? 0 : -1}
        />
        {journey !== null && (
          <div className={styles.journeyMap} aria-hidden="true">
            <div ref={destination} className={styles.destination}>
              <span className={styles.destinationDot} />
              <span className={styles.destinationLabel}>
                <strong>Chennai</strong>
                <span>TAMIL NADU · INDIA</span>
              </span>
            </div>
          </div>
        )}
        <svg
          ref={network}
          className={styles.orbit}
          viewBox="0 0 600 600"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          {connectedServices.map(({ label }, index) => (
            <g
              key={label}
              className={styles.route}
              data-service-path={index}
              data-active={active === index}
              style={{ '--service-index': index } as CSSProperties}
            >
              <path className={styles.routeLine} pathLength="1" />
              <path className={styles.connection} pathLength="1" />
              <circle className={styles.beacon} r="8" />
              <circle r="3" />
            </g>
          ))}
        </svg>
        <div className={styles.contentOrbit} aria-hidden="true">
          <span className={styles.orbitTrack} />
          {connectedServices.map(({ label, icon: Icon }, index) => (
            <span
              key={label}
              className={styles.contentSatellite}
              data-service-satellite={index}
              data-active={active === index}
              data-muted={active !== null && active !== index}
              style={{ '--service-index': index } as CSSProperties}
            >
              <span className={styles.satellitePage}>
                <span className={styles.pageFold} />
                <Icon size={19} strokeWidth={1.3} />
                <span className={styles.contentLines}>
                  <i />
                  <i />
                  <i />
                </span>
                <span className={styles.contentScan} />
              </span>
              <span className={styles.satelliteLabel}>{label}</span>
            </span>
          ))}
        </div>
        <span className={styles.tag} aria-hidden="true">
          <Globe2 size={13} /> EPUBTRANS / CONNECTED EXPERTISE
        </span>
        <nav className={styles.services} aria-label="Explore EPUBTRANS services">
          {connectedServices.map(({ label, detail, href, icon: Icon }, index) => (
            <Link
              key={href}
              href={href}
              className={styles.service}
              style={{ '--service-index': index } as CSSProperties}
              data-active={active === index}
              data-muted={active !== null && active !== index}
              onPointerEnter={() => select(index)}
              onPointerLeave={(event) => {
                if (document.activeElement !== event.currentTarget) select(null)
              }}
              onPointerDown={() => select(index)}
              onFocus={() => select(index)}
              onBlur={() => select(null)}
              onClick={(event) => beginJourney(event, index)}
            >
              <span className={styles.serviceIcon}>
                <Icon size={18} strokeWidth={1.4} aria-hidden="true" />
              </span>
              <span>
                <span className={styles.serviceDetail}>{detail}</span>
                <span className={styles.serviceName}>{label}</span>
              </span>
              <ArrowUpRight className={styles.serviceArrow} size={13} aria-hidden="true" />
            </Link>
          ))}
        </nav>
        {ready && (
          <span className={styles.hint} aria-hidden="true">
            DRAG TO EXPLORE <span>↔</span>
          </span>
        )}
        {journey !== null && (
          <div className={styles.journeyPanel}>
            <div role="status">
              <span>CONNECTED FROM CHENNAI</span>
              <strong>Opening {connectedServices[journey].label}</strong>
            </div>
            <div className={styles.journeyActions}>
              <Link href={connectedServices[journey].href}>
                Open now <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              <button ref={cancelButton} type="button" onClick={cancelJourney}>
                Cancel journey
              </button>
            </div>
          </div>
        )}
      </div>
      <figcaption className={styles.caption} id="publishing-visual-caption">
        <div>
          <span className={styles.eyebrow}>CONNECTED CONTENT SERVICES</span>
          <p className={styles.captionTitle}>
            <span data-visible={active === null}>Publish. Transform. Localize.</span>
            {connectedServices.map(({ label }, index) => (
              <span key={label} data-visible={active === index}>
                {label}. Connected to your world.
              </span>
            ))}
          </p>
          <div className={styles.signalBars} aria-hidden="true">
            {connectedServices.map(({ label }, index) => (
              <i
                key={label}
                data-active={active === index}
                style={{ '--service-index': index } as CSSProperties}
              />
            ))}
          </div>
        </div>
        <button
          className={styles.replay}
          type="button"
          disabled={!ready}
          aria-label={paused ? 'Resume globe animation' : 'Pause globe animation'}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
        </button>
      </figcaption>
    </figure>
  )
}
