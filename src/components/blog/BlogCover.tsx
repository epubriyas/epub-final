'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import type { Media } from '@/payload-types'
import styles from './blog.module.css'

export function BlogCover({
  image,
  sizes = '(max-width: 650px) 100vw, 50vw',
}: {
  image?: Media | null
  sizes?: string
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const url = image?.url
  if (url && failedUrl !== url)
    return (
      <Image
        src={url}
        alt={image.alt || ''}
        width={image.width || 1200}
        height={image.height || 750}
        sizes={sizes}
        onError={() => setFailedUrl(url)}
      />
    )
  return (
    <div className={styles.coverArt} aria-hidden="true">
      <span className={styles.coverOrbit} />
      <BookOpen size={60} strokeWidth={1} />
      <span className={styles.coverLines}>
        <i />
        <i />
        <i />
      </span>
      <span className={styles.coverCaption}>WORDS / CULTURE / FORMAT</span>
    </div>
  )
}
