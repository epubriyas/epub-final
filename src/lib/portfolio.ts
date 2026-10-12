import { cache } from 'react'
import type { CaseStudy, PortfolioPreview, Service } from '@/payload-types'
import { contentPayload } from '@/lib/content'
import { serviceQuoteHref } from '@/config/service-design'

export interface WorkSample {
  id: number
  slug: string
  title: string
  description: string
  category: string
  categoryKey: string
  kind: string
  format: string
  featured: boolean
  thumbnail: { url: string; alt: string; width: number; height: number } | null
  pages: { url: string; alt: string; sourcePage: number; text: string }[]
  pageCount: number
  sectionCount: number
  sections: { title: string; text: string }[]
  previewNote: string
  sourcePageCount: number | null
  services: { title: string; href: string }[]
  quoteHref: string
}

function preview(value: number | PortfolioPreview | null | undefined) {
  return value && typeof value === 'object' && value.url ? value : null
}

type WorkDocument = Pick<
  CaseStudy,
  | 'id'
  | 'title'
  | 'slug'
  | 'description'
  | 'category'
  | 'sampleCategory'
  | 'workKind'
  | 'fileType'
  | 'featured'
  | 'thumbnail'
  | 'services'
  | 'previewNote'
  | 'sourcePageCount'
> & {
  previewPages?:
    { asset?: number | PortfolioPreview; sourcePage: number; text?: string | null }[] | null
  readerSections?: { title: string; text?: string | null }[] | null
}

export function toWorkSample(doc: WorkDocument, catalog: Service[]): WorkSample {
  const thumbnail = preview(doc.thumbnail)
  const ids = new Set(
    (doc.services ?? []).map((value) => (typeof value === 'object' ? value.id : value)),
  )
  const services = catalog.filter(
    (service) => ids.has(service.id) && service.status === 'published',
  )
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    description: doc.description || '',
    category:
      doc.sampleCategory ||
      (doc.category
        ? doc.category.charAt(0).toUpperCase() + doc.category.slice(1)
        : 'Selected work'),
    categoryKey: doc.category || '',
    kind:
      doc.workKind === 'demonstration'
        ? 'Internal demonstration'
        : doc.workKind === 'sample'
          ? 'Sample'
          : 'Case study',
    format: doc.fileType?.toUpperCase() || '',
    featured: Boolean(doc.featured),
    thumbnail: thumbnail
      ? {
          url: thumbnail.sizes?.thumbnail?.url || thumbnail.url!,
          alt: thumbnail.alt,
          width: thumbnail.width || 560,
          height: thumbnail.height || 720,
        }
      : null,
    pages: (doc.previewPages ?? []).flatMap((page) => {
      const asset = preview(page.asset)
      return asset
        ? [{ url: asset.url!, alt: asset.alt, sourcePage: page.sourcePage, text: page.text || '' }]
        : []
    }),
    sections: (doc.readerSections ?? []).map(({ title, text }) => ({ title, text: text || '' })),
    pageCount: doc.previewPages?.length || 0,
    sectionCount: doc.readerSections?.length || 0,
    previewNote: doc.previewNote || '',
    sourcePageCount: doc.sourcePageCount || null,
    services: services.map(({ title, slug }) => ({ title, href: `/services/${slug}` })),
    quoteHref: services[0] ? serviceQuoteHref(services[0]) : '/get-a-quote',
  }
}

export const getWorkSamples = cache(async () => {
  const payload = await contentPayload()
  const [work, services] = await Promise.all([
    payload.find({
      collection: 'case-studies',
      overrideAccess: false,
      pagination: false,
      depth: 1,
      sort: ['displayOrder', 'title'],
      select: {
        title: true,
        slug: true,
        description: true,
        category: true,
        sampleCategory: true,
        workKind: true,
        fileType: true,
        featured: true,
        thumbnail: true,
        services: true,
        previewNote: true,
        sourcePageCount: true,
        previewPages: { sourcePage: true },
        readerSections: { title: true },
      },
      where: {
        and: [{ status: { equals: 'published' } }, { permissionConfirmed: { equals: true } }],
      },
    }),
    payload.find({
      collection: 'services',
      overrideAccess: false,
      pagination: false,
      depth: 0,
      where: { status: { equals: 'published' } },
    }),
  ])
  return work.docs.map((doc) => ({ ...toWorkSample(doc, services.docs), pages: [], sections: [] }))
})

export async function getWorkPreview(slug: string) {
  const payload = await contentPayload()
  const [work, services] = await Promise.all([
    payload.find({
      collection: 'case-studies',
      overrideAccess: false,
      depth: 1,
      limit: 1,
      where: {
        and: [
          { slug: { equals: slug } },
          { status: { equals: 'published' } },
          { permissionConfirmed: { equals: true } },
        ],
      },
    }),
    payload.find({
      collection: 'services',
      overrideAccess: false,
      pagination: false,
      depth: 0,
      where: { status: { equals: 'published' } },
    }),
  ])
  return work.docs[0] ? toWorkSample(work.docs[0], services.docs) : null
}
