'use client'
import { useEffect, useRef, type ReactNode } from 'react'

export function BlogMotion({ children, className }: { children: ReactNode; className: string }) {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const container = root.current
    if (!container || !('IntersectionObserver' in window) || preference.matches) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.setAttribute('data-blog-visible', 'true')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.06, rootMargin: '0px 0px -24px 0px' },
    )
    container.querySelectorAll<HTMLElement>('[data-blog-motion]').forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight) {
        element.setAttribute('data-blog-visible', 'true')
      }
      observer.observe(element)
    })
    container.setAttribute('data-motion-ready', 'true')
    const revealAll = () => {
      if (preference.matches) container.removeAttribute('data-motion-ready')
    }
    preference.addEventListener('change', revealAll)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', revealAll)
      container.removeAttribute('data-motion-ready')
    }
  }, [])
  return (
    <main ref={root} className={className}>
      {children}
    </main>
  )
}
