'use client'

import Image from 'next/image'
import Link from '@/components/i18n/LocalizedLink'
import { useEffect, useRef, useState } from 'react'
import type { WorkSample } from '@/lib/portfolio'
import styles from './work-hero-carousel.module.css'

type Preview = Pick<WorkSample, 'id' | 'slug' | 'title' | 'category' | 'thumbnail'>

export function WorkHeroCarousel({ samples }: { samples: Preview[] }) {
  const stage = useRef<HTMLDivElement>(null)
  const motion = useRef({ offset: 0, velocity: 0, dragging: false, moved: false, x: 0, time: 0 })
  const [paused, setPaused] = useState(false)
  const pause = useRef(false)
  // Enough physical cards to wrap beyond both edges, even with a small catalog.
  const cards = samples.length
    ? Array.from({ length: Math.max(10, samples.length) }, (_, i) => samples[i % samples.length])
    : []

  useEffect(() => {
    pause.current = paused
  }, [paused])

  useEffect(() => {
    const root = stage.current
    if (!root || !cards.length) return
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-carousel-card]'))
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    let reduced = preference.matches
    let visible = true
    let width = root.clientWidth
    let frame = 0
    let last = 0
    const pitch = 196
    const span = items.length * pitch
    const draw = () => {
      const scale = width / (width <= 820 ? 640 : 1440)
      const center = width / scale / 2
      items.forEach((item, i) => {
        const t =
          ((((i * pitch + motion.current.offset + span / 2) % span) + span) % span) - span / 2
        const x = center + t * (1 + 0.083 * (t / 706) ** 2)
        const d = Math.abs(x - center) / 706
        const w = 170 + 48 * d * d
        const left = 280 + 92 * (Math.abs(x - w / 2 - center) / 706) ** 2.6
        const right = 280 + 92 * (Math.abs(x + w / 2 - center) / 706) ** 2.6
        const h = Math.max(left, right)
        const l = (h - left) / 2
        const r = (h - right) / 2
        const radius = 15
        item.style.width = `${w}px`
        item.style.height = `${h}px`
        item.style.transform = `translate(${(x - w / 2) * scale}px, ${(210 - 12 * d * d - h / 2) * scale}px) scale(${scale})`
        item.style.clipPath = `path('M ${radius} ${l} L ${w - radius} ${r} Q ${w} ${r} ${w} ${r + radius} L ${w} ${r + right - radius} Q ${w} ${r + right} ${w - radius} ${r + right} L ${radius} ${l + left} Q 0 ${l + left} 0 ${l + left - radius} L 0 ${l + radius} Q 0 ${l} ${radius} ${l} Z')`
        const outside = x + w / 2 < 0 || x - w / 2 > width / scale
        item.inert = outside || i >= samples.length
        item.setAttribute('aria-hidden', String(outside || i >= samples.length))
      })
    }
    const tick = (time: number) => {
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0
      last = time
      if (
        visible &&
        !document.hidden &&
        !reduced &&
        !pause.current &&
        !root.contains(document.activeElement) &&
        !motion.current.dragging
      ) {
        motion.current.offset += (-50 + motion.current.velocity) * dt
        motion.current.offset %= span
        motion.current.velocity *= Math.exp(-3 * dt)
        draw()
      }
      frame = requestAnimationFrame(tick)
    }
    const resize = new ResizeObserver(() => {
      width = root.clientWidth
      draw()
    })
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    const change = () => {
      reduced = preference.matches
      motion.current.velocity = 0
      draw()
    }
    resize.observe(root)
    observer.observe(root)
    preference.addEventListener('change', change)
    draw()
    frame = requestAnimationFrame(tick)
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || (event.target as HTMLElement).closest('button')) return
      Object.assign(motion.current, {
        dragging: true,
        moved: false,
        x: event.clientX,
        time: event.timeStamp,
        velocity: 0,
      })
      root.dataset.dragging = 'true'
    }
    const move = (event: PointerEvent) => {
      const state = motion.current
      if (!state.dragging) return
      const delta = event.clientX - state.x
      if (Math.abs(delta) > 3) state.moved = true
      if (state.moved && !root.hasPointerCapture(event.pointerId))
        root.setPointerCapture(event.pointerId)
      const scale = width / (width <= 820 ? 640 : 1440)
      state.offset += delta / scale
      state.velocity = Math.max(
        -1800,
        Math.min(1800, delta / scale / Math.max((event.timeStamp - state.time) / 1000, 0.008)),
      )
      state.x = event.clientX
      state.time = event.timeStamp
      draw()
    }
    const up = () => {
      motion.current.dragging = false
      root.dataset.dragging = 'false'
    }
    root.addEventListener('pointerdown', down)
    root.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    root.addEventListener('pointercancel', up)
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      observer.disconnect()
      preference.removeEventListener('change', change)
      root.removeEventListener('pointerdown', down)
      root.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      root.removeEventListener('pointercancel', up)
    }
  }, [samples.length, cards.length])

  if (!samples.length) return null
  return (
    <div className={styles.carousel}>
      <div
        ref={stage}
        className={styles.stage}
        aria-label="Selected portfolio previews"
        role="region"
        onClickCapture={(event) => {
          if (motion.current.moved) {
            event.preventDefault()
            event.stopPropagation()
            motion.current.moved = false
          }
        }}
      >
        {cards.map((sample, i) => (
          <Link
            key={`${sample.id}-${i}`}
            href={`/work/${sample.slug}`}
            data-carousel-card
            className={styles.card}
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
          >
            <Image
              src={sample.thumbnail!.url}
              alt={sample.thumbnail!.alt || sample.title}
              fill
              unoptimized
              sizes="240px"
              draggable={false}
              loading={i < 7 ? 'eager' : 'lazy'}
            />
            <span className={styles.caption}>
              <span>{sample.category}</span>
              <strong>{sample.title}</strong>
              <span aria-hidden="true">↗</span>
            </span>
          </Link>
        ))}
      </div>
      <div className={styles.controls}>
        <span>
          THE WORK IN DETAIL <span aria-hidden="true"> / </span> Drag to explore
        </span>
        <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
          {paused ? 'Resume motion' : 'Pause motion'}{' '}
          <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
        </button>
      </div>
    </div>
  )
}
