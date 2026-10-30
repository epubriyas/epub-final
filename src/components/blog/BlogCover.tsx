'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import type { Media } from '@/payload-types'
import styles from './blog.module.css'

export function BlogCover({
  image,
  sizes = '(max-width: 650px) 100vw, 50vw',
  fill = false,
  priority = false,
  fit = 'cover',
  alt,
}: {
  image?: Media | null
  sizes?: string
  fill?: boolean
  priority?: boolean
  fit?: 'cover' | 'contain'
  alt?: string
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const url = image?.url
  if (url && failedUrl !== url)
    return (
      <Image
        src={url}
        alt={image.alt || alt || image.filename || 'Article illustration'}
        fill={fill}
        width={fill ? undefined : image.width || 1200}
        height={fill ? undefined : image.height || 750}
        sizes={sizes}
        preload={priority}
        style={{
          objectFit: fit,
          objectPosition: `${image.focalX ?? 50}% ${image.focalY ?? 50}%`,
        }}
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
