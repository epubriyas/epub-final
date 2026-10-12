'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { RotateCcw } from 'lucide-react'

const lines = [
  '<article>',
  '  <title>A clear structure.</title>',
  '  <body>',
  '    <section>',
  '      <heading>Introduction</heading>',
  '      <p>Publication content.</p>',
  '    </section>',
  '  </body>',
  '</article>',
]

export function XmlConversionVisual() {
  const root = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [run, setRun] = useState(0)
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      setReducedMotion(preference.matches)
      if (preference.matches) setPlaying(false)
    }
    sync()
    preference.addEventListener('change', sync)
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setReady(true)
        if (!preference.matches) setPlaying(true)
        observer.disconnect()
      },
      { threshold: 0.25 },
    )
    if (root.current) observer.observe(root.current)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', sync)
    }
  }, [])

  return (
    <div ref={root} className="sv-xml-animation">
      <div key={run} className="sv-xml" data-playing={playing ? 'true' : 'false'}>
        <div className="sv-document">
          <span className="sv-meta">SOURCE ARTICLE</span>
          <h3>
            A clear
            <br />
            structure.
          </h3>
          <p>Title, authors and publication content.</p>
          <div className="sv-source-lines" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <i key={index} style={{ '--line': index } as CSSProperties} />
            ))}
          </div>
          <span className="sv-transfer" aria-hidden="true">
            →
          </span>
        </div>
        <div className="sv-code">
          <span className="sv-meta">ILLUSTRATIVE XML</span>
          <pre>
            <code>
              {lines.map((line, index) => (
                <span
                  className="sv-xml-line"
                  key={line}
                  style={{ '--line': index } as CSSProperties}
                >
                  {line}
                  {index < lines.length - 1 ? '\n' : ''}
                </span>
              ))}
            </code>
          </pre>
          <span className="sv-code-caption">Content with explicit relationships</span>
          <span
            className="sv-xml-progress"
            aria-hidden="true"
            onAnimationEnd={(event) => {
              if (event.animationName === 'sv-xml-progress') setPlaying(false)
            }}
          />
        </div>
      </div>
      {ready && !reducedMotion && (
        <button
          className="sv-replay"
          type="button"
          disabled={playing}
          onClick={() => {
            setRun((current) => current + 1)
            setPlaying(true)
          }}
        >
          <RotateCcw size={14} aria-hidden="true" />
          Replay transformation
        </button>
      )}
    </div>
  )
}
