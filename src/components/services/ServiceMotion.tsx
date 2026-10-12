'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** Content is server rendered in its final state. Only motion triggers need a client boundary. */
export function ServiceMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = root.current
    if (!container || !('IntersectionObserver' in window)) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-motion]'))
    // Trigger long sections at their actual animated content, after the section heading is read.
    const targets = new Map<Element, HTMLElement>(
      sections.map((section) => [
        section.querySelector('.sp-capability-list, .sp-timeline, .sp-related-grid') || section,
        section,
      ]),
    )
    const seen = new Set<HTMLElement>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const section = targets.get(entry.target)
          if (!section) continue
          section.dataset.motionState = preference.matches ? 'static' : 'run'
          seen.add(section)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    )
    const sync = () => {
      if (!preference.matches) return
      // A preference change stops running sequences and suppresses pending entrances.
      sections.forEach((section) => {
        section.dataset.motionState = 'static'
        seen.add(section)
      })
      observer.disconnect()
    }
    sync()
    targets.forEach((section, target) => {
      if (!seen.has(section)) observer.observe(target)
    })
    preference.addEventListener('change', sync)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', sync)
    }
  }, [])

  return (
    <main ref={root} className="sp-page">
      {children}
    </main>
  )
}
