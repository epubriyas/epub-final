'use client'

import { useEffect, useState } from 'react'
import { Check, Link2, Printer } from 'lucide-react'
import styles from './blog.module.css'

import type { ArticleSection } from '@/lib/seo/article-content'

export function ArticleTools({
  sections = [],
  url,
  title = '',
}: {
  sections?: ArticleSection[]
  url?: string
  title?: string
}) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  useEffect(() => {
    const article = document.getElementById('article-content')
    if (!article) return
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const bounds = article.getBoundingClientRect()
        const distance = Math.max(1, bounds.height - window.innerHeight * 0.4)
        setProgress(
          Math.min(100, Math.max(0, ((window.innerHeight * 0.35 - bounds.top) / distance) * 100)),
        )
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])
  return (
    <div className={styles.articleTools}>
      <p className={styles.eyebrow}>READING PROGRESS · {Math.round(progress)}%</p>
      <div className={styles.readingProgress} aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      {sections.length > 0 && (
        <nav aria-label="On this page">
          <p className={styles.eyebrow}>ON THIS PAGE</p>
          <ol>
            {sections.map((section) => (
              <li key={section.id} data-level={section.level}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      {url && (
        <nav aria-label="Share article">
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener"
          >
            Share on LinkedIn
          </a>
          {' · '}
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener"
          >
            Share on X
          </a>
        </nav>
      )}
      <button
        className={styles.copyLink}
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href.split('#')[0])
            setStatus('Link copied')
          } catch {
            setStatus('Unable to copy. Copy the address from your browser.')
          }
        }}
      >
        {status === 'Link copied' ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <Link2 size={16} aria-hidden="true" />
        )}{' '}
        Copy article link
      </button>
      <p className={styles.copyStatus} role="status">
        {status}
      </p>
      <button className={styles.copyLink} type="button" onClick={() => window.print()}>
        <Printer size={16} aria-hidden="true" /> Print article
      </button>
    </div>
  )
}
