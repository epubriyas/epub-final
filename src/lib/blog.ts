import type { Media, Post } from '@/payload-types'

export function articleImage(post: Pick<Post, 'heroImage' | 'meta'>) {
  return [post.heroImage, post.meta?.image].find(
    (image): image is Media => Boolean(image && typeof image === 'object' && image.url),
  )
}

export function articleText(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  const node = content as { text?: unknown; root?: unknown; children?: unknown[] }
  return [
    typeof node.text === 'string' ? node.text : '',
    articleText(node.root),
    ...(node.children || []).map(articleText),
  ]
    .filter(Boolean)
    .join(' ')
}

export function readingTime(post: Pick<Post, 'content'>): number {
  return Math.max(1, Math.ceil(articleText(post.content).split(/\s+/).filter(Boolean).length / 220))
}

export function articleSummary(post: Post): string {
  if (post.meta?.description) return post.meta.description
  const text = articleText(post.content)
  return text.length > 170 ? `${text.slice(0, 167).trimEnd()}…` : text
}

export function articleDate(date?: string | null): string {
  return date
    ? new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      })
    : ''
}
