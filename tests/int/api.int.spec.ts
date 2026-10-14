import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { validateQuote, type QuoteData } from '@/lib/validation/quote'

let payload: Payload

describe('Published content and private enquiries', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
  })
  afterAll(async () => {
    await payload?.destroy()
  })
  it('anonymous service queries return only published records', async () => {
    const services = await payload.find({
      collection: 'services',
      overrideAccess: false,
      limit: 100,
    })
    expect(services.docs.every((service) => service.status === 'published')).toBe(true)
  })
  it('anonymous readers cannot list private enquiries', async () => {
    await expect(
      payload.find({ collection: 'quote-requests', overrideAccess: false }),
    ).rejects.toThrow()
    await expect(
      payload.find({ collection: 'enquiries', overrideAccess: false }),
    ).rejects.toThrow()
  })
  it('a malformed email and missing required quote fields prevent submission', () => {
    const data: QuoteData = {
      service: 'publishing_editorial',
      name: 'Example Reader',
      email: 'bad-address',
      details: 'A publishing project with several chapters.',
      sourceLanguage: '',
      targetLanguages: '',
      languages: '',
      countryRegion: '',
      sourceFileFormat: '',
      targetOutputFormat: '',
      approximateVolume: '',
      additionalRequirements: '',
      deadline: '',
      company: '',
      website: '',
    }
    expect(validateQuote(data)).toMatchObject({
      email: expect.any(String),
      company: expect.any(String),
    })
  })
})
