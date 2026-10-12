'use client'
import { useEffect, useRef, type ReactNode } from 'react'

export function BlogMotion({ children, className }: { children: ReactNode; className: string }) {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    if (!root.current || !('IntersectionObserver' in window) || preference.matches) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.setAttribute('data-blog-visible', 'true')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12 },
    )
    root.current
      .querySelectorAll('[data-blog-motion]')
      .forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
  return (
    <main ref={root} className={className}>
      {children}
    </main>
  )
}
