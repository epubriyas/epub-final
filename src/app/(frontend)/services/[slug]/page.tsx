import { pageMetadata } from '@/lib/seo'
import { notFound } from 'next/navigation'
import { getContent, listContent } from '@/lib/content'
import { ServiceDetail } from '@/components/services/ServiceDetail'
import { relatedPublishedServices } from '@/config/service-design'
import { getServerSideURL } from '@/utilities/getURL'
type Props = { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic'
export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const doc = await getContent('services', slug)
  if (!doc) notFound()
  const metadata = pageMetadata({
    title:
      doc?.seo?.metaTitle?.replace(/\s*\|\s*EPUBTRANS\s*$/i, '').trim() || doc?.title || 'Service',
    description: doc?.seo?.metaDescription || doc?.shortDescription,
    alternates: { canonical: `/services/${slug}` },
  })
  const image = doc.hero?.image
  if (image && typeof image === 'object' && image.url && image.mimeType?.startsWith('image/')) {
    const url = new URL(image.url, getServerSideURL()).href
    metadata.openGraph = { ...metadata.openGraph, images: [{ url, alt: image.alt || doc.title }] }
    metadata.twitter = { ...metadata.twitter, card: 'summary_large_image', images: [url] }
  }
  return metadata
}
export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const document = await getContent('services', slug)
  if (!document) notFound()
  const catalog = await listContent('services')
  const base = getServerSideURL()
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: base },
      { '@type': 'ListItem', position: 2, name: 'What We Do', item: `${base}/services` },
      {
        '@type': 'ListItem',
        position: 3,
        name: document.title,
        item: `${base}/services/${document.slug}`,
      },
    ],
  }
  return (
    <>
      <ServiceDetail service={document} related={relatedPublishedServices(document, catalog)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }}
      />
    </>
  )
}
