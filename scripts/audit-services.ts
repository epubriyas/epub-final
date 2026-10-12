import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
const payload = await getPayload({ config })
const result = await payload.find({
  collection: 'services',
  pagination: false,
  depth: 1,
  sort: 'title',
})
console.log(
  JSON.stringify(
    result.docs.map(({ slug, status, features, workflow }) => ({
      slug,
      status,
      features: features?.map((x) => x.title.trim()),
      workflow: workflow?.map((x) => x.title.trim()),
    })),
  ),
)
await payload.destroy()
process.exit(0)
