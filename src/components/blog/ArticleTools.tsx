'use client'

import { useEffect, useState } from 'react'
import { Check, Link2 } from 'lucide-react'
import styles from './blog.module.css'

export function ArticleTools() {
  const [sections, setSections] = useState<{ id: string; title: string }[]>([])
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  useEffect(() => {
    const article = document.getElementById('article-content')
    if (!article) return
    const headings = Array.from(
      article.querySelectorAll<HTMLElement>('.payload-richtext h2, .payload-richtext h3'),
    )
    const sectionFrame = requestAnimationFrame(() =>
      setSections(
        headings
          .map((heading, index) => {
            if (!heading.id) heading.id = `article-section-${index + 1}`
            return { id: heading.id, title: heading.textContent || '' }
          })
          .filter((heading) => heading.title),
      ),
    )
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
      cancelAnimationFrame(sectionFrame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])
  return (
    <div className={styles.articleTools}>
      <div className={styles.readingProgress} aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      {sections.length > 0 && (
        <nav aria-label="On this page">
          <p className={styles.eyebrow}>ON THIS PAGE</p>
          <ol>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
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
    </div>
  )
}
