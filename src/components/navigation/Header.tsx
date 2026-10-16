import { headerNavigation as navigation } from '@/config/header-navigation'
import { listContent } from '@/lib/content'
import { HeaderClient } from './Header.client'
import { servicePath, serviceSlugForPath } from '@/config/service-paths'
export async function Header() {
  const [services, solutions] = await Promise.all([
    listContent('services'),
    listContent('solutions'),
  ])
  const published = new Set(services.map((service) => servicePath(service.slug)))
  const publishedSolutions = new Set(solutions.map((solution) => `/solutions/${solution.slug}`))
  const resolved = navigation.map((section) => ({
    ...section,
    groups: section.groups?.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        href:
          item.href?.startsWith('/solutions/') && !publishedSolutions.has(item.href)
            ? '/solutions'
            : item.href &&
                (serviceSlugForPath(item.href) || item.href.startsWith('/services/')) &&
                !published.has(item.href)
              ? '/services#' +
                (group.title === 'Digital Accessibility'
                  ? 'digital-accessibility'
                  : group.title === 'eLearning & Multimedia '
                    ? 'elearning-multimedia'
                    : group.title === 'Localization & Multilingual Production'
                      ? 'localization-dtp'
                      : group.title === 'eBook, XML & Structured Content '
                        ? 'ebook-xml'
                        : group.title === 'Document & Data Conversion'
                          ? 'document-conversion'
                          : 'publishing-editorial')
              : item.href,
      })),
    })),
  }))
  return <HeaderClient navigation={resolved} />
}
