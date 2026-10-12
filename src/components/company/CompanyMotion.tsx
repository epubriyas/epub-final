'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export function CompanyMotion({ children, className }: { children: ReactNode; className: string }) {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = root.current
    if (!element || !('IntersectionObserver' in window)) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const targets = element.querySelectorAll<HTMLElement>('[data-company-motion]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          ;(entry.target as HTMLElement).dataset.motionState = 'visible'
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.12 },
    )
    const update = () => {
      observer.disconnect()
      targets.forEach((target) => {
        if (preference.matches) target.dataset.motionState = 'static'
        else if (target.dataset.motionState !== 'visible') observer.observe(target)
      })
    }
    update()
    preference.addEventListener('change', update)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', update)
    }
  }, [])

  return (
    <main ref={root} className={className}>
      {children}
    </main>
  )
}
