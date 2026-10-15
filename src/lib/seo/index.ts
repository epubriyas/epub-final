import type { Metadata } from 'next'
import { getServerSideURL } from '@/utilities/getURL'
export function pageMetadata(metadata: Metadata): Metadata {
  const title =
    typeof metadata.title === 'string'
      ? metadata.title
      : metadata.title && 'absolute' in metadata.title
        ? metadata.title.absolute
        : 'EPUBTRANS'
  const description =
    metadata.description ||
    'Publishing, translation, localization and digital content services from EPUBTRANS.'
  return {
    ...metadata,
    description,
    openGraph: {
      type: 'website',
      siteName: 'EPUBTRANS',
      title:
        typeof metadata.title === 'object' && metadata.title && 'absolute' in metadata.title
          ? metadata.title
          : title,
      description,
      url: metadata.alternates?.canonical
        ? new URL(String(metadata.alternates.canonical), getServerSideURL()).href
        : undefined,
    },
    twitter: {
      card: 'summary',
      title:
        typeof metadata.title === 'object' && metadata.title && 'absolute' in metadata.title
          ? metadata.title
          : title,
      description,
    },
  }
}
