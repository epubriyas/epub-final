import 'dotenv/config'
import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from '../src/payload.config'
const payload = await getPayload({ config })
let id: number | undefined
try {
  const { docs: catalog } = await payload.find({
    collection: 'services',
    pagination: false,
    depth: 0,
    where: { status: { equals: 'published' } },
  })
  const doc = await payload.create({
    collection: 'services',
    data: {
      title: 'Service schema verification',
      slug: `service-schema-verification-${Date.now()}`,
      category: 'publishing',
      status: 'draft',
      hero: { layout: 'technical' },
      visualExplanation: {
        title: 'Verified visual title',
        sourceLabel: 'Source content',
        outputLabel: 'Output content',
      },
      quality: [{ title: 'Review', description: 'Schema test content.' }],
      useCases: [{ title: 'Publication', description: 'Schema test content.' }],
      relatedServices: [catalog[0].id],
      faqs: [{ question: 'Schema test question?', answer: 'Schema test answer.' }],
    },
  })
  id = doc.id
  const read = await payload.findByID({ collection: 'services', id, depth: 1 })
  assert.equal(read.hero?.layout, 'technical')
  assert.equal(read.quality?.[0].title, 'Review')
  assert.equal(read.useCases?.[0].title, 'Publication')
  assert.equal(read.visualExplanation?.sourceLabel, 'Source content')
  assert.equal(read.faqs?.[0].answer, 'Schema test answer.')
  assert.equal(typeof read.relatedServices?.[0], 'object')
  const publicRead = await payload.find({
    collection: 'services',
    overrideAccess: false,
    where: { slug: { equals: doc.slug } },
  })
  assert.equal(publicRead.totalDocs, 0)
  const migrations = await payload.find({
    collection: 'payload-migrations',
    where: { name: { equals: '20261011_111342_services_premium' } },
  })
  assert.equal(migrations.totalDocs, 1)
  console.log(
    'CMS optional fields, populated service relationships, draft access and migration registration verified.',
  )
} finally {
  if (id) {
    await payload.delete({ collection: 'services', id })
    console.log('Temporary schema verification draft removed.')
  }
  await payload.destroy()
}
process.exit(0)
