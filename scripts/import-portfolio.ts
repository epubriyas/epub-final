import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import config from '../src/payload.config'

if (!process.argv.includes('--approved-on-site-only'))
  throw new Error(
    'Import requires confirmed owner permission for on-site display. No source downloads are enabled.',
  )
interface PreparedSample {
  title: string
  slug: string
  sampleCategory: string
  serviceSlug: string
  fileType: 'pdf' | 'epub'
  thumbnail: string
  sourcePageCount?: number
  previewNote: string
  pages: { path: string; sourcePage: number; text: string }[]
  sections?: { title: string; text: string }[]
}
const samples: PreparedSample[] = JSON.parse(
  await readFile('private-uploads/portfolio-prepared/manifest.json', 'utf8'),
)
const payload = await getPayload({ config })
const featuredSlugs = ['complex-1-typesetting-sample', 'french-document-layout']
let featuredEpub = false
try {
  const { docs: services } = await payload.find({
    collection: 'services',
    pagination: false,
    depth: 0,
    where: { status: { equals: 'published' } },
  })
  for (const [order, sample] of samples.entries()) {
    const exists = await payload.find({
      collection: 'case-studies',
      limit: 1,
      where: { slug: { equals: sample.slug } },
    })
    if (
      exists.docs.length &&
      !(process.argv.includes('--refresh-conversion') && sample.serviceSlug === 'data-conversion')
    ) {
      console.log(`Preserved: ${sample.slug}`)
      continue
    }
    const service = services.find((item) => item.slug === sample.serviceSlug)
    if (!service) throw new Error(`No published service: ${sample.serviceSlug}`)
    const contacts = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(
      [
        ...sample.pages.map((page) => page.text),
        ...(sample.sections ?? []).map((section) => section.text),
      ].join('\n'),
    )
    const upload = async (file: string, alt: string) => {
      if (
        !path
          .resolve(file)
          .startsWith(path.resolve('private-uploads/portfolio-prepared') + path.sep)
      )
        throw new Error('Preview path must stay inside prepared asset directory.')
      return payload.create({ collection: 'portfolio-previews', data: { alt }, filePath: file })
    }
    const previewPages = []
    for (const page of sample.pages) {
      const asset = await upload(page.path, `${sample.title}, source page ${page.sourcePage}`)
      previewPages.push({
        asset: asset.id,
        sourcePage: page.sourcePage,
        text: page.text.replaceAll('\u0000', ''),
      })
    }
    const thumbnail =
      previewPages[0]?.asset ?? (await upload(sample.thumbnail, `${sample.title}, source cover`)).id
    const featured =
      featuredSlugs.includes(sample.slug) || (sample.fileType === 'epub' && !featuredEpub)
    if (sample.fileType === 'epub' && featured) featuredEpub = true
    const data: RequiredDataFromCollectionSlug<'case-studies'> = {
      title: sample.title,
      slug: sample.slug,
      workKind: 'sample',
      description:
        sample.fileType === 'epub'
          ? 'A reading excerpt from the supplied digital edition. Explore its text and selected sections on site.'
          : sample.serviceSlug === 'data-conversion'
            ? 'A document excerpt from the supplied PDF-to-InDesign sample package. View the source or output pages in detail.'
            : sample.serviceSlug === 'desktop-publishing'
              ? 'A multilingual document-layout excerpt from the supplied DTP samples. View the typography and page composition in detail.'
              : 'A publication-layout excerpt from the supplied typesetting samples. Explore the page structure, typography and content treatment.',
      category: sample.serviceSlug === 'desktop-publishing' ? 'localization' : 'publishing',
      sampleCategory: sample.sampleCategory,
      fileType: sample.fileType,
      services: [service.id],
      thumbnail,
      previewPages,
      readerSections: (sample.sections || []).map((section) => ({
        ...section,
        text: section.text.replaceAll('\u0000', ''),
      })),
      sourcePageCount: sample.sourcePageCount,
      featured: !contacts && featured,
      displayOrder: featured
        ? featuredSlugs.indexOf(sample.slug) >= 0
          ? featuredSlugs.indexOf(sample.slug)
          : 2
        : order + 10,
      previewNote: sample.previewNote,
      source: contacts
        ? 'Owner approved on-site display on 11 October 2026. Draft held for contact-detail review before publication.'
        : 'Owner approved on-site display on 11 October 2026. Original downloads are not authorized.',
      permissionConfirmed: !contacts,
      status: contacts ? 'draft' : 'published',
      seo: {
        metaTitle: sample.title,
        metaDescription: `Inspect ${sample.title.toLowerCase()} in the EPUBTRANS portfolio. ${sample.fileType === 'epub' ? 'On-site reading excerpt.' : 'On-site page previews.'}`,
      },
    }
    if (exists.docs[0])
      await payload.update({ collection: 'case-studies', id: exists.docs[0].id, data })
    else await payload.create({ collection: 'case-studies', data })
    console.log(
      `${contacts ? 'Private draft for review' : 'Published viewing excerpt'}: ${sample.slug}`,
    )
  }
  const result = await payload.find({
    collection: 'case-studies',
    pagination: false,
    depth: 0,
    where: { workKind: { equals: 'sample' } },
  })
  console.log(
    JSON.stringify({
      samples: result.totalDocs,
      published: result.docs.filter((doc) => doc.status === 'published').length,
      drafts: result.docs.filter((doc) => doc.status === 'draft').length,
    }),
  )
} finally {
  await payload.destroy()
}
process.exit(0)
