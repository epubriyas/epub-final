'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!root.current || !('IntersectionObserver' in window)) return
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const targets = root.current.querySelectorAll<HTMLElement>('[data-home-motion]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          ;(entry.target as HTMLElement).dataset.homeState = preference.matches ? 'static' : 'run'
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.15 },
    )
    const stop = () => {
      if (!preference.matches) return
      observer.disconnect()
      targets.forEach((target) => {
        target.dataset.homeState = 'static'
      })
    }
    if (preference.matches) stop()
    else targets.forEach((target) => observer.observe(target))
    preference.addEventListener('change', stop)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', stop)
    }
  }, [])
  return (
    <main className="et-home-premium" ref={root}>
      {children}
    </main>
  )
}
