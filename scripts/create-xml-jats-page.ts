import 'dotenv/config'
import { getPayload } from 'payload'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import config from '../src/payload.config'
import type { ServiceHandoff } from '../src/lib/service-handoff'
import type { ServicesLandingContent } from '../src/lib/landing-schema'

if (!['localhost', '127.0.0.1', '::1'].includes(new URL(process.env.DATABASE_URL!).hostname))
  throw new Error('Restricted to the local development database.')
const content = JSON.parse(
  await readFile('src/config/service-handoffs/xml-jats.json', 'utf8'),
) as ServiceHandoff
const payload = await getPayload({ config })
try {
  await mkdir('.local-backups', { recursive: true })
  if (process.argv.includes('--connect')) {
    const response = await fetch('http://localhost:3000/xml-conversion-services')
    if (response.status !== 200)
      throw new Error('XML/JATS destination must be available before linking.')
    const landing = await payload.findGlobal({ slug: 'landing-pages', depth: 0 })
    const directory = structuredClone(landing.servicesContent) as unknown as ServicesLandingContent
    const category = directory.categories.find((category) => category.anchorId === 'ebook-xml')
    const entry = category?.services.find((service) => service.title === 'XML & JATS Conversion')
    if (!entry)
      throw new Error(
        'Existing approved XML/JATS directory entry was not found; no content changed.',
      )
    if (entry.href !== '/xml-conversion-services') {
      await writeFile(
        `.local-backups/xml-jats-directory-before-${Date.now()}.json`,
        JSON.stringify(landing.servicesContent, null, 2),
      )
      entry.href = '/xml-conversion-services'
      await payload.updateGlobal({ slug: 'landing-pages', data: { servicesContent: directory } })
    }
    console.log(
      'Connected the existing XML/JATS directory entry to the verified local destination.',
    )
  } else {
    const existing = await payload.find({
      collection: 'services',
      where: { slug: { equals: 'xml-jats' } },
      depth: 0,
      limit: 1,
    })
    if (existing.docs.length) {
      console.log('Preserved existing XML/JATS service record; no overwrite performed.')
    } else {
      const workflow = content.sections.find((section) => section.kind === 'workflow')!.groups
      const data = {
        title: 'XML & JATS Conversion Services',
        slug: 'xml-jats',
        category: 'publishing' as const,
        shortDescription: content.hero.lead,
        hero: {
          eyebrow: 'eBook, XML & Structured Content',
          headline: content.hero.title,
          description: content.hero.lead,
          layout: 'technical' as const,
        },
        features: content.sections
          .find((section) => section.kind === 'capabilities')!
          .groups.map((group) => ({ title: group.title })),
        workflow: workflow
          .slice(0, 4)
          .map((group, index) => ({
            step: index + 1,
            title: group.title.replace(/^\d+\.\s*/, ''),
            description: (index === 3 ? workflow.slice(3) : [group])
              .flatMap((step) =>
                step.blocks
                  .filter((block) => block.kind === 'paragraph')
                  .map((block) => block.text),
              )
              .join(' '),
          })),
        faqs: content.sections
          .find((section) => section.kind === 'faq')!
          .groups.map((group) => ({
            question: group.title,
            answer: group.blocks
              .filter((block) => block.kind === 'paragraph')
              .map((block) => block.text)
              .join(' '),
          })),
        status: 'published' as const,
        seo: { metaTitle: content.seo.title, metaDescription: content.seo.description },
      }
      await writeFile(
        `.local-backups/xml-jats-before-create-${Date.now()}.json`,
        JSON.stringify({ existing: null, intended: data }, null, 2),
      )
      const created = await payload.create({ collection: 'services', data })
      console.log(
        `Created local XML/JATS service record ${created.id}; no external publication performed.`,
      )
    }
  }
} finally {
  await payload.destroy()
}
process.exit(0)
