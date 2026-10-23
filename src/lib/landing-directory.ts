import { serviceSlugForPath } from '@/config/service-paths'
import type { ServicesLandingContent } from '@/lib/landing-schema'
import { quoteServices } from '@/lib/validation/quote'

export function visibleDirectoryCategories(directory: ServicesLandingContent) {
  return [...directory.categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      ...category,
      services: category.services
        .filter((card) => card.status !== 'hidden')
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .filter((category) => category.services.length > 0)
}

function searchable(value: string) {
  return value
    .replace(/\be[ -]?books?\b/gi, 'ebook')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

export function searchDirectoryCategories(
  categories: ReturnType<typeof visibleDirectoryCategories>,
  query: string,
) {
  const terms = searchable(query).split(' ').filter(Boolean)
  return categories
    .map((category) => ({
      ...category,
      services: category.services.filter((card) => {
        const text = searchable(
          [category.title, category.intro, card.title, ...card.paragraphs].join(' '),
        )
        return terms.every((term) => text.includes(term))
      }),
    }))
    .filter((category) => category.services.length > 0)
}

/** Use only values accepted by the quote form; keep custom CMS destinations intact. */
export function directoryQuoteHref(anchorId: string, quoteHref: string) {
  const service = quoteServices.find((value) => value === anchorId.replaceAll('-', '_'))
  const [destination, hash] = quoteHref.split('#')
  const [path, search] = destination.split('?')
  if (!service || path !== '/get-a-quote') return quoteHref
  const params = new URLSearchParams(search)
  params.set('service', service)
  return `${path}?${params.toString()}${hash ? `#${hash}` : ''}`
}

export function directoryCardHref(
  card: ServicesLandingContent['categories'][number]['services'][number],
  quoteHref: string,
) {
  return card.status === 'pendingApproval' && !serviceSlugForPath(card.href) ? quoteHref : card.href
}
