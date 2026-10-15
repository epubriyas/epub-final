import type { ServicesLandingContent } from '@/lib/landing-schema'

export function visibleDirectoryCategories(directory: ServicesLandingContent) {
  return [...directory.categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      ...category,
      services: category.services
        .filter((card) => card.status !== 'hidden')
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
}

export function directoryCardHref(
  card: ServicesLandingContent['categories'][number]['services'][number],
  quoteHref: string,
) {
  return card.status === 'pendingApproval' ? quoteHref : card.href
}
