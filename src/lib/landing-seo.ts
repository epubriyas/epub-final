import { pageMetadata } from '@/lib/seo'
import { getServerSideURL } from '@/utilities/getURL'
import type { HomeLandingContent } from '@/lib/landing-schema'

export function landingMetadata(seo: HomeLandingContent['seo']) {
  const host = new URL(getServerSideURL()).hostname
  const staging =
    process.env.VERCEL_ENV === 'preview' ||
    process.env.SITE_NOINDEX === 'true' ||
    ['localhost', '127.0.0.1', '::1', '[::1]'].includes(host)
  return pageMetadata({
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl },
    ...(seo.noIndex || staging ? { robots: { index: false, follow: false } } : {}),
  })
}
