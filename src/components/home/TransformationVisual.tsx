'use client'

import { ArrowUpRight, RotateCcw, FileText, BookOpen, FileCode2, Languages } from 'lucide-react'
import Link from '@/components/i18n/LocalizedLink'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import styles from './transformation-visual.module.css'

const services = [
  { title: 'Print & page layout', href: '/typesetting-services', icon: FileText },
  { title: 'Digital publications', href: '/ebook-creation-services', icon: BookOpen },
  { title: 'Structured content', href: '/scielo-xml-markup-services', icon: FileCode2 },
  { title: 'Multilingual DTP', href: '/desktop-publishing-services', icon: Languages },
]

export function TransformationVisual({ formats }: { formats: readonly string[] }) {
  const root = useRef<HTMLElement>(null)
  const [run, setRun] = useState(0)
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(preference.matches)
    update()
    preference.addEventListener('change', update)
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setRun(1)
        observer.disconnect()
      },
      { threshold: 0.3 },
    )
    if (root.current) observer.observe(root.current)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', update)
    }
  }, [])

  return (
    <figure
      ref={root}
      className={styles.visual}
      aria-labelledby="transformation-caption"
      data-transformation-motion={reduced ? 'static' : run ? 'run' : 'idle'}
    >
      <figcaption className={styles.caption} id="transformation-caption">
        <span>CONTENT TRANSFORMATION</span>
        {!reduced && (
          <button
            type="button"
            className={styles.replay}
            onClick={() => setRun((value) => value + 1)}
            aria-label="Replay content transformation animation"
          >
            <RotateCcw size={15} aria-hidden="true" />
          </button>
        )}
      </figcaption>
      <div key={run}>
        <div className={styles.scene}>
          <div className={styles.stageHeader} aria-hidden="true">
            <span>MANUSCRIPT → PUBLICATION</span>
            <span>EPUBTRANS</span>
          </div>
          <div className={styles.composition} aria-hidden="true">
            <div className={styles.source}>
              <FileText size={19} strokeWidth={1.3} />
              <span>SOURCE FILE</span>
              <strong>Manuscript.docx</strong>
              <i />
              <i />
              <i />
            </div>
            <div className={styles.publication}>
              <div className={styles.paperHead}>
                <span>EDITORIAL &amp; TYPESETTING</span>
                <span>01</span>
              </div>
              <p className={styles.paperKicker}>PRINT &amp; DIGITAL CONTENT</p>
              <p className={styles.paperTitle}>
                Publishing
                <br />
                production.
              </p>
              <div className={styles.paperRule} />
              <div className={styles.columns}>
                <div>
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div>
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className={styles.paperFooter}>
                <span>CONTENT · STRUCTURE · DESIGN</span>
                <span>01 — 02</span>
              </div>
            </div>
            <div className={styles.xml}>
              <FileCode2 size={17} strokeWidth={1.4} />
              <span>STRUCTURED CONTENT</span>
              <code>
                &lt;article&gt;
                <br />
                &nbsp; &lt;title&gt;Ideas&lt;/title&gt;
                <br />
                &nbsp; &lt;body&gt;…&lt;/body&gt;
                <br />
                &lt;/article&gt;
              </code>
            </div>
          </div>
          <p className={styles.sampleNote}>Illustrative production view</p>
        </div>
        <div className={styles.details}>
          <div className={styles.journey}>ONE SOURCE. CONNECTED CAPABILITIES.</div>
          <ul className={styles.formats} aria-label="Content production services">
            {formats.map((format, index) => {
              const service = services[index % services.length]
              const Icon = service.icon
              return (
                <li key={format} style={{ '--format': index } as CSSProperties}>
                  <Link href={service.href}>
                    <Icon size={19} strokeWidth={1.4} aria-hidden="true" />
                    <span>
                      <span className={styles.formatLabel}>{format}</span>
                      <span className={styles.formatTitle}>{service.title}</span>
                    </span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </figure>
  )
}
