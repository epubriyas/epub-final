'use client'
import Image from 'next/image'
import { useState } from 'react'

export function ServiceImage({
  src,
  alt,
  focalPoint,
  children,
  hero = false,
}: {
  src: string
  alt: string
  focalPoint?: string
  children: React.ReactNode
  hero?: boolean
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return children
  return (
    <div className="sp-image">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 820px) 100vw, 50vw"
        preload={hero}
        style={{ objectFit: 'cover', objectPosition: focalPoint }}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
