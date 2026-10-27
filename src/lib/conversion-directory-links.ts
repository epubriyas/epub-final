import type { ServicesLandingContent } from './landing-schema'

/** Upgrade only known legacy destinations; keep custom CMS links and copy intact. */
export function upgradeConversionDirectoryLinks(
  directory: ServicesLandingContent,
): ServicesLandingContent {
  const destination = (label: string, href: string) => {
    if (href !== '/data-conversion-services') return href
    if (label === 'Data Conversion Services') return `${href}#pdf-to-word-ocr`
    if (label === 'PDF Recreation & Document Preparation') return `${href}#pdf-recreation`
    return href
  }
  return {
    ...directory,
    categories: directory.categories.map((category) => ({
      ...category,
      services: category.services.map((card) => ({
        ...card,
        href: destination(card.title, card.href),
      })),
    })),
    audience: {
      ...directory.audience,
      cards: directory.audience.cards.map((card) => ({
        ...card,
        services: card.services.map((service) => ({
          ...service,
          href: destination(service.label, service.href),
        })),
      })),
    },
  }
}
