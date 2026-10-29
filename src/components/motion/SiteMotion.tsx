'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import type Lenis from 'lenis'

// Existing illustrated sequences keep their own choreography.
const ownedMotion =
  '[data-home-motion], [data-motion], [data-company-motion], [data-blog-motion], [data-transformation-motion]'
const nativeScroll =
  'dialog, [role="dialog"], .et-mega, .et-assistant, .wp-reading, textarea, select, iframe, [data-native-scroll]'

export function SiteMotion() {
  const pathname = usePathname()

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false
    let smooth: Lenis | undefined
    let generation = 0
    const lock = () => {
      if (!smooth) return
      const locked =
        ['hidden', 'clip'].includes(getComputedStyle(document.body).overflowY) ||
        !!document.querySelector('dialog:modal')
      if (locked) smooth.stop()
      else smooth.start()
    }
    const configure = async () => {
      const current = ++generation
      smooth?.destroy()
      smooth = undefined
      delete document.documentElement.dataset.scrollMotion
      if (preference.matches || document.hidden) return
      const { default: Lenis } = await import('lenis')
      if (disposed || current !== generation) return
      smooth = new Lenis({
        autoRaf: true,
        // A duration curve gives wheel input a fluid tail with a definite stop.
        // Keep touch momentum native instead of smoothing it a second time.
        lerp: 0,
        duration: 1.25,
        easing: (progress) => Math.min(1, 1.001 - Math.pow(2, -10 * progress)),
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        // Known readers and overlays opt out below; avoid walking computed
        // overflow styles up the DOM tree on every wheel event.
        allowNestedScroll: false,
        stopInertiaOnNavigate: true,
        prevent: (node) => !!node.closest(nativeScroll),
      })
      document.documentElement.dataset.scrollMotion = 'fluid'
      lock()
    }
    // Browser anchors retain their native focus, URL and scroll-margin behavior.
    const interrupt = (event: Event) => {
      if (
        event instanceof KeyboardEvent &&
        !['Tab', 'Home', 'End', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', ' '].includes(
          event.key,
        )
      )
        return
      if (event instanceof MouseEvent && !(event.target as Element)?.closest('a[href]')) return
      smooth?.scrollTo(window.scrollY, { immediate: true })
    }
    const locks = new MutationObserver(lock)
    locks.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] })
    document.addEventListener('toggle', lock, true)
    document.addEventListener('keydown', interrupt, true)
    document.addEventListener('click', interrupt, true)
    preference.addEventListener('change', configure)
    document.addEventListener('visibilitychange', configure)
    void configure()
    return () => {
      disposed = true
      generation++
      smooth?.destroy()
      delete document.documentElement.dataset.scrollMotion
      locks.disconnect()
      document.removeEventListener('toggle', lock, true)
      document.removeEventListener('keydown', interrupt, true)
      document.removeEventListener('click', interrupt, true)
      preference.removeEventListener('change', configure)
      document.removeEventListener('visibilitychange', configure)
    }
  }, [pathname])

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const content = document.getElementById('main-content')
    if (!content || !('IntersectionObserver' in window)) return
    let seen = new WeakSet<Element>()
    const parallaxSeen = new WeakSet<Element>()
    const animations = new Set<Animation>()
    let scanFrame = 0
    const compact = matchMedia('(max-width: 700px)')
    const observer = new IntersectionObserver(
      (entries) => {
        let stagger = 0
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          observer.unobserve(entry.target)
          if (preference.matches) return
          const element = entry.target as HTMLElement
          // Focused and live form content must never move away from the user.
          if (element.contains(document.activeElement)) return
          const image = element.hasAttribute('data-site-image-reveal')
          const animation = element.animate(
            image
              ? [
                  { opacity: 0.75, scale: '1.025' },
                  { opacity: 1, scale: '1' },
                ]
              : [{ translate: compact.matches ? '0 12px' : '0 18px' }, { translate: '0 0' }],
            {
              duration: image ? 950 : compact.matches ? 600 : 800,
              delay: Math.min(stagger++ * 60, 180),
              easing: 'cubic-bezier(.22,1,.36,1)',
            },
          )
          animations.add(animation)
          animation.finished
            .then(() => animations.delete(animation))
            .catch(() => animations.delete(animation))
        })
      },
      { threshold: 0.04, rootMargin: '0px 0px -2% 0px' },
    )
    const scan = () => {
      content
        .querySelectorAll<HTMLElement>('main [class*="imageFrame"], main [class*="heroVisual"]')
        .forEach((element) => {
          if (
            seen.has(element) ||
            element.closest(ownedMotion) ||
            element.querySelector('canvas') ||
            !element.querySelector('img')
          )
            return
          element.dataset.siteImageReveal = 'true'
          if (!preference.matches) {
            seen.add(element)
            observer.observe(element)
          }
        })
      content
        .querySelectorAll<HTMLElement>(
          'main h1, main h2, main .et-lead, main article, main .et-content-row, main .sp-catalog-link, main .et-industry-card, main .et-resource-guides > article',
        )
        .forEach((element) => {
          if (
            seen.has(element) ||
            element.closest(ownedMotion) ||
            element.closest('form, dialog, [role="dialog"], [aria-live], .wp-reading')
          )
            return
          // Animate a card as a single unit instead of animating its nested headings too.
          if (element.parentElement?.closest('article, .et-content-row, .sp-catalog-link')) return
          element.dataset.siteReveal = 'true'
          if (!preference.matches) {
            seen.add(element)
            observer.observe(element)
          }
        })
      content
        .querySelectorAll<HTMLImageElement>('main figure img, main [class*="heroMainImage"] img')
        .forEach((image) => {
          if (parallaxSeen.has(image)) return
          if (image.closest(ownedMotion) || image.closest(nativeScroll)) return
          parallaxSeen.add(image)
          const parent = image.parentElement
          if (parent && ['hidden', 'clip'].includes(getComputedStyle(parent).overflowY))
            image.dataset.siteParallax = 'true'
        })
    }
    // Streaming and interactive content can produce many mutations in a frame.
    // Batch discovery so they never trigger repeated full-page style reads.
    const scheduleScan = () => {
      if (scanFrame) return
      scanFrame = requestAnimationFrame(() => {
        scanFrame = 0
        scan()
      })
    }
    const stop = () => {
      if (preference.matches) {
        observer.disconnect()
        animations.forEach((animation) => animation.cancel())
        animations.clear()
        seen = new WeakSet<Element>()
      } else scan()
    }
    const focus = (event: FocusEvent) => {
      animations.forEach((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target
        if (
          target instanceof Element &&
          event.target instanceof Node &&
          target.contains(event.target)
        )
          animation.cancel()
      })
    }
    scan()
    const mutations = new MutationObserver(scheduleScan)
    mutations.observe(content, { childList: true, subtree: true })
    preference.addEventListener('change', stop)
    content.addEventListener('focusin', focus)
    return () => {
      observer.disconnect()
      mutations.disconnect()
      cancelAnimationFrame(scanFrame)
      animations.forEach((animation) => animation.cancel())
      preference.removeEventListener('change', stop)
      content.removeEventListener('focusin', focus)
    }
  }, [pathname])

  return null
}
