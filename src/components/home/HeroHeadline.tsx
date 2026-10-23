import type { CSSProperties } from 'react'
import styles from './home-hero-layout.module.css'

/** Keep the complete title accessible while animating only its visual word groups. */
export function HeroHeadline({ title }: { title: string }) {
  const split = title.includes(',') ? title.indexOf(',') + 1 : title.lastIndexOf('&')
  const lines = split > 0 ? [title.slice(0, split), title.slice(split)] : [title]
  let order = 0
  return (
    <h1 aria-label={title} className={styles.headline}>
      {lines.map((line, index) => (
        <span key={index} className={styles.titleLine} aria-hidden="true">
          <span className={index === 1 ? styles.accentPhrase : undefined}>
            {line.split(/(\s+)/).map((token, i) => {
              if (!token.trim()) return token
              const position = order++
              return (
                <span key={i} className={styles.wordMask}>
                  <span
                    className={styles.word}
                    style={{ '--word-order': position } as CSSProperties}
                  >
                    {token}
                  </span>
                </span>
              )
            })}
          </span>
        </span>
      ))}
    </h1>
  )
}
