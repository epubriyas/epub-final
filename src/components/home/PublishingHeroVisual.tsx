'use client'

import Image from 'next/image'
import {
  Globe2,
  Pause,
  Play,
  BookOpenCheck,
  LayoutTemplate,
  Languages,
  Accessibility,
  ArrowUpRight,
} from 'lucide-react'
import Link from '@/components/i18n/LocalizedLink'
import { useEffect, useRef, useState, useCallback, type CSSProperties } from 'react'
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
    icon: Accessibility,
  },
]

export function PublishingHeroVisual() {
  const figure = useRef<HTMLElement>(null)
  const network = useRef<SVGSVGElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const controls = useRef<ReturnType<typeof createEarth> | null>(null)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const select = (index: number | null) => {
    setActive(index)
    controls.current?.select(index)
  }
  const loaded = useCallback(() => setReady(true), [])
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
          controls.current = createEarth(element, loaded, failed, (points) => {
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
          })
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
    >
      <div className={styles.scene}>
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
              onPointerEnter={() => select(index)}
              onPointerLeave={(event) => {
                if (document.activeElement !== event.currentTarget) select(null)
              }}
              onPointerDown={() => select(index)}
              onFocus={() => select(index)}
              onBlur={() => select(null)}
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
      </div>
      <figcaption className={styles.caption} id="publishing-visual-caption">
        <div>
          <span className={styles.eyebrow}>CONNECTED CONTENT SERVICES</span>
          <p>Publish. Transform. Localize.</p>
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
