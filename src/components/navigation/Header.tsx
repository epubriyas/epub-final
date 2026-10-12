import { navigation } from '@/config/navigation'
import { listContent } from '@/lib/content'
import { HeaderClient } from './Header.client'
import { servicePath, serviceSlugForPath } from '@/config/service-paths'
export async function Header() {
  const services = await listContent('services')
  const published = new Set(services.map((service) => servicePath(service.slug)))
  const resolved = navigation.map((section) => ({
    ...section,
    groups: section.groups?.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        href:
          item.href &&
          (serviceSlugForPath(item.href) || item.href.startsWith('/services/')) &&
          !published.has(item.href)
            ? '/services#' +
              (group.title === 'Accessibility'
                ? 'accessibility'
                : group.title === 'Media'
                  ? 'media'
                  : 'publishing')
            : item.href,
      })),
    })),
  }))
  return <HeaderClient navigation={resolved} />
}
