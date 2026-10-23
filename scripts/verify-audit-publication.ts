import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config'
if (!['localhost', '127.0.0.1', '::1'].includes(new URL(process.env.DATABASE_URL!).hostname))
  throw new Error('Local verification only')
const p = await getPayload({ config })
let postId: number | undefined
let roleId: number | undefined
try {
  const slug = `audit-lifecycle-${randomUUID()}`
  const post = await p.create({
    collection: 'posts',
    context: { disableRevalidate: true },
    data: {
      title: 'Synthetic editorial lifecycle check',
      slug,
      _status: 'draft',
      content: {
        root: {
          type: 'root',
          version: 1,
          direction: 'ltr',
          format: '',
          indent: 0,
          children: [
            {
              type: 'paragraph',
              version: 1,
              direction: 'ltr',
              format: '',
              indent: 0,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Temporary local QA fixture.',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                },
              ],
            },
          ],
        },
      },
    },
  })
  postId = post.id
  const visible = () =>
    p.find({
      collection: 'search',
      overrideAccess: false,
      depth: 0,
      where: { slug: { equals: slug } },
    })
  assert.equal((await visible()).totalDocs, 0)
  await p.update({
    collection: 'posts',
    id: postId,
    context: { disableRevalidate: true },
    data: { _status: 'published' },
  })
  assert.equal((await visible()).totalDocs, 1, 'Published posts remain searchable')
  await p.update({
    collection: 'posts',
    id: postId,
    context: { disableRevalidate: true },
    data: { _status: 'draft' },
  })
  assert.equal((await visible()).totalDocs, 0, 'Unpublished posts are not searchable')
  const role = await p.create({
    collection: 'careers',
    data: { title: 'Synthetic local career check', slug, status: 'draft' },
  })
  roleId = role.id
  await assert.rejects(
    p.update({ collection: 'careers', id: roleId, data: { status: 'published' } }),
    /mailbox/,
  )
  await p.update({
    collection: 'careers',
    id: roleId,
    data: { status: 'published', applicationEmail: 'qa@example.invalid' },
  })
  assert.equal(
    (
      await p.find({
        collection: 'careers',
        overrideAccess: false,
        where: { slug: { equals: slug } },
      })
    ).totalDocs,
    1,
  )
  await p.update({ collection: 'careers', id: roleId, data: { status: 'draft' } })
  assert.equal(
    (
      await p.find({
        collection: 'careers',
        overrideAccess: false,
        where: { slug: { equals: slug } },
      })
    ).totalDocs,
    0,
  )
  console.log(
    'PASS: draft/publish/unpublish search visibility, career mailbox gate and vacancy privacy',
  )
} finally {
  if (postId)
    await p.delete({ collection: 'posts', id: postId, context: { disableRevalidate: true } })
  if (roleId) await p.delete({ collection: 'careers', id: roleId })
  await p.destroy()
}
process.exit(0)
