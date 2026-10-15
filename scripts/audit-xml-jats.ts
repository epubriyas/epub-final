import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
const payload = await getPayload({ config })
try {
  const services = await payload.find({ collection: 'services', pagination: false, depth: 0 })
  console.log(
    'services',
    services.docs.map((d) => ({ id: d.id, slug: d.slug, status: d.status })),
  )
  const pages = await payload.find({
    collection: 'pages',
    pagination: false,
    depth: 0,
    where: {
      slug: { in: ['xml-conversion-services', 'xml-jats-services', 'publishing-services'] },
    },
  })
  console.log(
    'matching pages',
    pages.docs.map((d) => ({ id: d.id, slug: d.slug })),
  )
  const redirects = await payload.find({ collection: 'redirects', pagination: false, depth: 0 })
  console.log(
    'XML redirects',
    redirects.docs.filter((d) => /xml|jats/i.test(JSON.stringify(d))),
  )
  const url = process.env.DATABASE_URL || ''
  console.log('database local', /localhost|127\.0\.0\.1/.test(url))
} finally {
  await payload.destroy()
}
process.exit(0)
