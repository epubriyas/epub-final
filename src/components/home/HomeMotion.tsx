'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!root.current || !('IntersectionObserver' in window)) return
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const targets = root.current.querySelectorAll<HTMLElement>('[data-home-motion]')
    let disposed = false
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const reveal = (target: HTMLElement) => {
      if (target.dataset.homeMotion !== 'hero' || preference.matches) {
        target.dataset.homeState = preference.matches ? 'static' : 'run'
        return
      }
      target.dataset.homeState = 'waiting'
      let started = false
      const start = () => {
        if (disposed || started) return
        started = true
        clearTimeout(ceiling)
        target.dataset.homeState = preference.matches ? 'static' : 'run'
        const cleanup = setTimeout(() => {
          if (!disposed && target.dataset.homeState === 'run') target.dataset.homeState = 'done'
        }, 2000)
        timers.add(cleanup)
      }
      const ceiling = setTimeout(start, 900)
      timers.add(ceiling)
      void document.fonts.ready.then(start, start)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          reveal(entry.target as HTMLElement)
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
      disposed = true
      timers.forEach(clearTimeout)
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
