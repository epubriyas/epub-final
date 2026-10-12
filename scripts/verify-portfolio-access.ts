import 'dotenv/config'
import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from '../src/payload.config'
const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const payload = await getPayload({ config })
let temporary: number | undefined
try {
  const all = await payload.find({
    collection: 'case-studies',
    pagination: false,
    depth: 1,
    where: { workKind: { equals: 'sample' } },
  })
  assert.equal(all.totalDocs, 25)
  const drafts = all.docs.filter((doc) => doc.status === 'draft')
  for (const doc of drafts) {
    assert.equal((await fetch(`${base}/work/${doc.slug}`)).status, 404)
    assert.equal((await fetch(`${base}/api/work/${doc.slug}/preview`)).status, 404)
    if (typeof doc.thumbnail === 'object' && doc.thumbnail?.url)
      assert.equal((await fetch(new URL(doc.thumbnail.url, base))).status, 403)
  }
  const published = all.docs.filter((doc) => doc.status === 'published')
  for (const doc of published) {
    const response = await fetch(`${base}/api/work/${doc.slug}/preview`)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
    const sample = await response.json()
    assert(!JSON.stringify(sample).includes('drive.google.com'))
    assert(!JSON.stringify(sample).includes('sourceName'))
    if (sample.pages[0]) {
      const image = await fetch(new URL(sample.pages[0].url, base))
      assert.equal(image.status, 200)
      assert.equal(image.headers.get('cache-control'), 'private, no-store')
    }
  }
  const first = published.find((doc) => doc.previewPages?.length)!
  const asset = first.previewPages![0].asset
  const privateDraft = await payload.create({
    collection: 'case-studies',
    data: {
      title: 'Temporary portfolio access check',
      slug: `portfolio-private-${Date.now()}`,
      status: 'published',
      permissionConfirmed: false,
      thumbnail: typeof asset === 'object' ? asset.id : asset,
    },
  })
  temporary = privateDraft.id
  const anonymous = await payload.find({
    collection: 'case-studies',
    overrideAccess: false,
    where: { slug: { equals: privateDraft.slug } },
  })
  assert.equal(anonymous.totalDocs, 0)
  assert.equal((await fetch(`${base}/work/${privateDraft.slug}`)).status, 404)
  assert.equal((await fetch(`${base}/api/work/${privateDraft.slug}/preview`)).status, 404)
  console.log(
    `PASS: ${published.length} published samples; ${drafts.length} private drafts; protected files, no-store headers, approval gates and source isolation.`,
  )
} finally {
  if (temporary) await payload.delete({ collection: 'case-studies', id: temporary })
  await payload.destroy()
}
process.exit(0)
