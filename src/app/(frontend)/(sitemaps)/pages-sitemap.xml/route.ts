import { getServerSideSitemap } from 'next-sitemap'
import { contentPayload } from '@/lib/content'
import { getServerSideURL } from '@/utilities/getURL'
import { servicePath } from '@/config/service-paths'
export const dynamic = 'force-dynamic'
export async function GET() {
  const payload = await contentPayload()
  const base = getServerSideURL()
  const sitemap = [
    '/',
    '/services',
    '/solutions',
    '/industries',
    '/technology',
    '/technology/production-technologies',
    '/technology/workflow-automation',
    '/technology/in-house-development',
    '/technology/production-os',
    '/resources',
    '/blog',
    '/about-us',
    '/company/global-presence',
    '/company/careers',
    '/work',
    '/get-a-quote',
    '/contact-us',
    '/accessibility',
  ].map((route) => ({ loc: base + route }))
  for (const collection of [
    'services',
    'solutions',
    'industries',
    'case-studies',
    'careers',
  ] as const) {
    const records = await payload.find({
      collection,
      overrideAccess: false,
      depth: 0,
      pagination: false,
      where: { status: { equals: 'published' } },
    })
    for (const doc of records.docs) {
      if ('permissionConfirmed' in doc && !doc.permissionConfirmed) continue
      sitemap.push({
        loc:
          collection === 'services'
            ? `${base}${servicePath(doc.slug)}`
            : `${base}/${collection === 'case-studies' ? 'work' : collection === 'careers' ? 'company/careers' : collection}/${doc.slug}`,
      })
    }
  }
  const pages = await payload.find({
    collection: 'pages',
    overrideAccess: false,
    draft: false,
    pagination: false,
    depth: 0,
    where: { _status: { equals: 'published' } },
  })
  for (const page of pages.docs)
    if (page.slug && page.slug !== 'home') sitemap.push({ loc: `${base}/${page.slug}` })
  return getServerSideSitemap(sitemap)
}
