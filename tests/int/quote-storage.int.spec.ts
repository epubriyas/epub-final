import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { afterAll, beforeAll, expect, it } from 'vitest'

let payload: Payload
beforeAll(async () => {
  payload = await getPayload({ config })
}, 60000)
afterAll(async () => {
  await payload?.destroy()
})

it('stores and reads the exact original customer brief in private Quote Requests', async () => {
  const details = '  Automated notification QA only.\r\nSecond line & <tags> தமிழ்.\n  '
  const saved = await payload.create({
    collection: 'quote-requests',
    overrideAccess: true,
    data: {
      name: 'Notification QA',
      email: 'qa@example.invalid',
      service: 'Publishing & content',
      details,
      consent: true,
      status: 'new',
    },
  })
  try {
    const record = await payload.findByID({
      collection: 'quote-requests',
      id: saved.id,
      overrideAccess: true,
    })
    expect(record.details).toBe(details)
    await expect(
      payload.findByID({ collection: 'quote-requests', id: saved.id, overrideAccess: false }),
    ).rejects.toThrow()
  } finally {
    await payload.delete({ collection: 'quote-requests', id: saved.id, overrideAccess: true })
  }
}, 60000)
