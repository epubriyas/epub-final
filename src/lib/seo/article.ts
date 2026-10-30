import type { Metadata } from 'next'
import type { Post } from '@/payload-types'
import { articleImage, articleSummary } from '@/lib/blog'
import { getServerSideURL } from '@/utilities/getURL'

export function articleURL(post: Pick<Post, 'slug'>) {
  return new URL(`/blog/${encodeURIComponent(post.slug || '')}`, getServerSideURL()).href
}

export function articleMetadata(post: Post, draft = false): Metadata {
  const title = post.meta?.title || post.title
  const description = articleSummary(post) || post.title
  const url = articleURL(post)
  const metaImage = post.meta?.image
  const image =
    metaImage && typeof metaImage === 'object' && metaImage.url ? metaImage : articleImage(post)
  const images = image?.url
    ? [
        {
          url: new URL(image.url, getServerSideURL()).href,
          alt: image.alt || post.title,
          ...(image.width ? { width: image.width } : {}),
          ...(image.height ? { height: image.height } : {}),
        },
      ]
    : []
  return {
    // Payload's SEO generator may already include the site name.
    title: { absolute: /\|\s*EPUBTRANS$/i.test(title) ? title : `${title} | EPUBTRANS` },
    description,
    alternates: { canonical: url },
    ...(draft ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'article',
      siteName: 'EPUBTRANS',
      title,
      description,
      url,
      images,
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: images.length ? 'summary_large_image' : 'summary',
      title,
      description,
      images,
    },
  }
}

export function articleSchema(post: Post) {
  const image = articleImage(post)
  const authors = post.populatedAuthors?.filter((author) => author.name) || []
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: articleSummary(post) || post.title,
    url: articleURL(post),
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleURL(post) },
    ...(image?.url ? { image: new URL(image.url, getServerSideURL()).href } : {}),
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt,
    author: authors.length
      ? authors.map((author) => ({ '@type': 'Person', name: author.name }))
      : undefined,
    publisher: { '@type': 'Organization', name: 'EPUBTRANS', url: getServerSideURL() },
  }
}
