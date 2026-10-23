'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import styles from './home-hero-film.module.css'

const source =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104036_bd6924f6-3c8e-417e-8465-6d03c8c2e9e6.mp4'
const poster =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/82e7eb75-c65f-490a-99b5-f3d1cad54200.webp'

export function HomeHeroFilm() {
  const host = useRef<HTMLDivElement>(null)
  const first = useRef<HTMLVideoElement>(null)
  const second = useRef<HTMLVideoElement>(null)
  const requestedPause = useRef(false)
  const configurePlayback = useRef<() => void>(() => {})
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    requestedPause.current = paused
    configurePlayback.current()
  }, [paused])

  useEffect(() => {
    const root = host.current,
      a = first.current,
      b = second.current
    if (!root || !a || !b) return
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const videos = [a, b]
    let visible = false,
      disposed = false,
      initialized = false,
      failed = false,
      swapping = false
    let current = a,
      next = b
    let timer: ReturnType<typeof setTimeout> | undefined
    let generation = 0
    const playable = () =>
      !disposed &&
      !failed &&
      visible &&
      !document.hidden &&
      !preference.matches &&
      !requestedPause.current
    const play = async (video: HTMLVideoElement) => {
      const version = generation
      try {
        await video.play()
        if (!playable() || version !== generation) {
          video.pause()
          return false
        }
        root.dataset.playback = 'playing'
        return true
      } catch {
        if (playable() && version === generation) root.dataset.playback = 'poster'
        return false
      }
    }
    const fallback = () => {
      failed = true
      generation++
      clearTimeout(timer)
      videos.forEach((video) => video.pause())
      root.dataset.videoReady = 'false'
      root.dataset.playback = 'unavailable'
    }
    const configure = () => {
      root.dataset.reduced = String(preference.matches)
      if (!playable()) {
        videos.forEach((video) => video.pause())
        if (!failed) root.dataset.playback = preference.matches ? 'still' : 'paused'
        if (preference.matches) {
          generation++
          clearTimeout(timer)
          swapping = false
          videos.forEach((video) => {
            video.style.opacity = '0'
            video.removeAttribute('src')
            video.load()
          })
          initialized = false
          current = a
          next = b
          root.dataset.videoReady = 'false'
          root.dataset.crossfade = 'false'
        }
        return
      }
      if (!initialized) {
        initialized = true
        root.dataset.playback = 'loading'
        videos.forEach((video) => {
          video.preload = 'auto'
          video.src = source
          video.load()
        })
      }
      void play(current).then((playing) => {
        if (playing) {
          current.style.opacity = '1'
          root.dataset.videoReady = 'true'
        }
      })
    }
    const tick = () => {
      if (
        !playable() ||
        swapping ||
        !Number.isFinite(current.duration) ||
        current.duration - current.currentTime > 0.95 ||
        next.readyState < 2
      )
        return
      swapping = true
      const version = generation
      const outgoing = current,
        incoming = next
      incoming.currentTime = 0
      incoming.style.zIndex = '2'
      outgoing.style.zIndex = '1'
      void play(incoming).then((playing) => {
        if (!playing || version !== generation) {
          swapping = false
          return
        }
        incoming.style.opacity = '1'
        root.dataset.crossfade = 'true'
        current = incoming
        next = outgoing
        timer = setTimeout(() => {
          outgoing.pause()
          outgoing.style.opacity = '0'
          outgoing.currentTime = 0
          outgoing.style.zIndex = '0'
          incoming.style.zIndex = '1'
          swapping = false
          root.dataset.crossfade = 'false'
        }, 1000)
      })
    }
    const ready = () => {
      if (playable()) {
        root.dataset.videoReady = 'true'
        root.dataset.playback = 'playing'
      }
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        configure()
      },
      { threshold: 0.01 },
    )
    observer.observe(root.parentElement!)
    configurePlayback.current = configure
    videos.forEach((video) => {
      video.addEventListener('timeupdate', tick)
      video.addEventListener('playing', ready)
      video.addEventListener('error', fallback)
    })
    document.addEventListener('visibilitychange', configure)
    preference.addEventListener('change', configure)
    configure()
    return () => {
      disposed = true
      generation++
      clearTimeout(timer)
      observer.disconnect()
      videos.forEach((video) => {
        video.pause()
        video.removeEventListener('timeupdate', tick)
        video.removeEventListener('playing', ready)
        video.removeEventListener('error', fallback)
        video.removeAttribute('src')
        video.load()
      })
      document.removeEventListener('visibilitychange', configure)
      preference.removeEventListener('change', configure)
      configurePlayback.current = () => {}
    }
  }, [])

  return (
    <div
      ref={host}
      className={styles.film}
      data-hero-film
      data-playback="poster"
      data-video-ready="false"
    >
      <div
        className={styles.media}
        aria-hidden="true"
        style={{ backgroundImage: `url("${poster}")` }}
      >
        <video
          ref={first}
          loop
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          tabIndex={-1}
        />
        <video
          ref={second}
          loop
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          tabIndex={-1}
        />
      </div>
      <div className={styles.tint} aria-hidden="true" />
      <div className={styles.fade} aria-hidden="true" />
      <button
        className={styles.control}
        type="button"
        aria-label={paused ? 'Resume hero background' : 'Pause hero background'}
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
        <span>{paused ? 'Resume motion' : 'Pause motion'}</span>
      </button>
    </div>
  )
}
