'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Maximize2, Minus, Plus, X } from 'lucide-react'
import Link from '@/components/i18n/LocalizedLink'
import type { WorkSample } from '@/lib/portfolio'

const subscribeFullscreen = () => () => {}
const fullscreenSnapshot = () => Boolean(document.fullscreenEnabled)
const serverFullscreenSnapshot = () => false

export function SampleViewer({
  samples,
  index,
  onClose,
  onChange,
}: {
  samples: WorkSample[]
  index: number | null
  onClose: () => void
  onChange: (index: number) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const fullscreenSurface = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const fullscreenAvailable = useSyncExternalStore(
    subscribeFullscreen,
    fullscreenSnapshot,
    serverFullscreenSnapshot,
  )
  const [fullscreenError, setFullscreenError] = useState('')
  const isOpen = index !== null
  useEffect(() => {
    const element = dialog.current
    const surface = fullscreenSurface.current
    if (!element) return
    if (isOpen && !element.open) {
      trigger.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      element.showModal()
      const previous = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previous
        if (document.fullscreenElement === surface) void document.exitFullscreen().catch(() => {})
        element.close()
        trigger.current?.focus()
      }
    }
  }, [isOpen])
  // Keep the dialog mounted when changing samples; the active content resets its own controls.
  const sample = index === null ? null : samples[index]
  return (
    <dialog
      ref={dialog}
      className="wp-viewer"
      aria-labelledby="sample-viewer-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {sample && (
        <div ref={fullscreenSurface} className="wp-viewer-shell">
          <header className="wp-viewer-header">
            <div>
              <p className="wp-kicker">
                {sample.category} / {sample.kind}
              </p>
              <h2 id="sample-viewer-title">{sample.title}</h2>
            </div>
            <button
              className="wp-control wp-close"
              onClick={onClose}
              autoFocus
              aria-label="Close sample viewer"
            >
              Close <X size={18} aria-hidden="true" />
            </button>
          </header>
          <PreviewLoader key={sample.id} sample={sample} />
          <footer className="wp-viewer-footer">
            <div className="wp-controls">
              {samples.length > 1 && (
                <>
                  <button
                    className="wp-control"
                    disabled={index === 0}
                    onClick={() => onChange(index! - 1)}
                  >
                    <ArrowLeft size={16} aria-hidden="true" /> Previous sample
                  </button>
                  <button
                    className="wp-control"
                    disabled={index === samples.length - 1}
                    onClick={() => onChange(index! + 1)}
                  >
                    Next sample <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </>
              )}
              {fullscreenAvailable && (
                <button
                  className="wp-control"
                  onClick={async () => {
                    try {
                      if (document.fullscreenElement) await document.exitFullscreen()
                      else await fullscreenSurface.current?.requestFullscreen()
                    } catch {
                      setFullscreenError(
                        'Full-screen mode is unavailable in this browser. The viewer already fills the window.',
                      )
                    }
                  }}
                >
                  <Maximize2 size={16} aria-hidden="true" /> Full screen
                </button>
              )}
            </div>
            <Link className="wp-button" href={sample.quoteHref}>
              Request a Quote <span aria-hidden="true">↗</span>
            </Link>
          </footer>
          {fullscreenError && <p role="status">{fullscreenError}</p>}
        </div>
      )}
    </dialog>
  )
}

function PreviewLoader({ sample }: { sample: WorkSample }) {
  const [content, setContent] = useState<WorkSample | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const abort = new AbortController()
    fetch(`/api/work/${encodeURIComponent(sample.slug)}/preview`, {
      cache: 'no-store',
      signal: abort.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Preview unavailable')
        return response.json() as Promise<WorkSample>
      })
      .then((value) => {
        setContent(value)
        setError(false)
      })
      .catch(() => {
        if (!abort.signal.aborted) setError(true)
      })
    return () => abort.abort()
  }, [sample.slug, attempt])
  if (error)
    return (
      <div className="wp-preview-area">
        <div className="wp-preview-status" role="alert">
          <h3>This preview is unavailable.</h3>
          <p>The sample may have been withdrawn, or the connection interrupted.</p>
          <button
            className="wp-control"
            onClick={() => {
              setError(false)
              setAttempt(attempt + 1)
            }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  if (!content)
    return (
      <div className="wp-preview-area">
        <p className="wp-preview-status" role="status">
          Opening sample…
        </p>
      </div>
    )
  return <PreviewContent sample={content} />
}

function PreviewContent({ sample }: { sample: WorkSample }) {
  const [page, setPage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const area = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [aspectRatio, setAspectRatio] = useState(1700 / 2200)
  useEffect(() => {
    const element = area.current
    if (!element) return
    const observer = new ResizeObserver(() => {
      const style = getComputedStyle(element)
      setViewport({
        width: element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
        height:
          element.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
      })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const reader = sample.sections.length > 0
  const count = reader ? sample.sections.length : sample.pages.length
  const active = sample.pages[page]
  const textView = reader
  const changePage = (next: number) => {
    setPage(next)
    setError(false)
    setLoaded(false)
    setZoom(1)
    if (area.current) area.current.scrollTo({ top: 0, left: 0 })
  }
  return (
    <>
      <div className="wp-toolbar" aria-label="Preview controls">
        {count > 1 && (
          <div className="wp-toolbar-group wp-page-controls">
            <button
              className="wp-control"
              disabled={page === 0}
              onClick={() => changePage(page - 1)}
              aria-label={reader ? 'Previous section' : 'Previous page'}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <label className="wp-page-select">
              {reader ? 'Section' : 'Page'}{' '}
              <select value={page} onChange={(event) => changePage(Number(event.target.value))}>
                {Array.from({ length: count }, (_, i) => (
                  <option value={i} key={i}>
                    {reader ? i + 1 : sample.pages[i].sourcePage}
                  </option>
                ))}
              </select>{' '}
              of {count}
            </label>
            <button
              className="wp-control"
              disabled={page === count - 1}
              onClick={() => changePage(page + 1)}
              aria-label={reader ? 'Next section' : 'Next page'}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}
        {(reader || active) && (
          <div className="wp-toolbar-group wp-zoom-controls">
            <button
              className="wp-control"
              disabled={zoom <= 1}
              aria-label={textView ? 'Smaller text' : 'Zoom out'}
              onClick={() => setZoom(Math.max(1, zoom - 0.25))}
            >
              <Minus size={18} aria-hidden="true" />
            </button>
            <span className="wp-zoom" aria-live="polite">
              {Math.round(zoom * 100)}%
            </span>
            <button
              className="wp-control"
              disabled={zoom >= (textView ? 2 : 3)}
              aria-label={textView ? 'Larger text' : 'Zoom in'}
              onClick={() => setZoom(zoom + 0.25)}
            >
              <Plus size={18} aria-hidden="true" />
            </button>
            <button className="wp-control" onClick={() => setZoom(1)}>
              {textView ? 'Reset text' : 'Fit'}
            </button>
          </div>
        )}
      </div>
      <div className="wp-preview-area" ref={area} tabIndex={0} role="region" aria-label="Sample preview">
        {reader ? (
          <article className="wp-reading" style={{ fontSize: `${zoom}rem` }}>
            <p className="wp-kicker">Reading excerpt / Section {page + 1}</p>
            <h3>{sample.sections[page].title}</h3>
            {sample.sections[page].text.split(/\n\s*\n/).map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </article>
        ) : active ? (
          <div
            className="wp-image-stage"
            data-zoomed={zoom > 1}
            style={{
              width: viewport.width
                ? `${Math.min(viewport.width, viewport.height * aspectRatio) * zoom}px`
                : '100%',
              minHeight: '100%',
            }}
          >
            {!loaded && !error && (
              <p className="wp-preview-status wp-page-loading" role="status">
                Loading page…
              </p>
            )}
            {error ? (
              <div className="wp-preview-status" role="alert">
                <p>This page could not be loaded.</p>
                <button
                  className="wp-control"
                  onClick={() => {
                    setError(false)
                    setLoaded(false)
                  }}
                >
                  Try again
                </button>
              </div>
            ) : (
              <Image
                key={active.url}
                unoptimized
                loading="eager"
                src={active.url}
                alt={active.alt}
                width={1700}
                height={2200}
                className="wp-page-image"
                onLoad={(event) => {
                  const image = event.currentTarget
                  setAspectRatio(image.naturalWidth / image.naturalHeight)
                  setLoaded(true)
                }}
                onError={() => setError(true)}
              />
            )}
          </div>
        ) : (
          <div className="wp-preview-status">
            <h3>Preview is being prepared</h3>
            <p>Explore the sample details or discuss your requirements with our team.</p>
          </div>
        )}
      </div>
      {sample.previewNote && <p className="wp-preview-note">{sample.previewNote}</p>}
      <p className="sr-only" aria-live="polite">
        {reader
          ? `Section ${page + 1} of ${count}`
          : active
            ? `Source page ${active.sourcePage}, preview ${page + 1} of ${count}`
            : 'No preview available'}
      </p>
    </>
  )
}
