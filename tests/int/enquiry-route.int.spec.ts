import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/(frontend)/api/enquiry/route'

const { create, find } = vi.hoisted(() => ({ create: vi.fn(), find: vi.fn() }))
vi.mock('@/lib/content', () => ({ contentPayload: async () => ({ create, find }) }))
const submissionKey = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
function request(values: Record<string, unknown> = {}) {
  return new Request('http://localhost:3001/api/enquiry', {
    method: 'POST',
    headers: { origin: 'http://localhost:3001', 'content-type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Test Customer',
      business_email: 'customer@example.com',
      organization: 'Example',
      inquiry_type: 'partnership',
      message: 'Please discuss a production partnership.',
      submission_key: submissionKey,
      ...values,
    }),
  })
}
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'http://localhost:3001')
  find.mockResolvedValue({ docs: [] })
  create.mockResolvedValue({ id: 21 })
})
afterEach(() => vi.unstubAllEnvs())

describe('General enquiry persistence', () => {
  it('stores general enquiries separately with an allowlisted enquiry type', async () => {
    const response = await POST(request())
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ enquiryId: '21' })
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'enquiries',
      overrideAccess: true,
      data: expect.objectContaining({
        submissionKey,
        name: 'Test Customer',
        email: 'customer@example.com',
        inquiryType: 'partnership',
        sourcePage: '/contact-us',
      }),
    }))
  })
  it.each([
    { full_name: '' },
    { business_email: 'invalid' },
    { inquiry_type: 'not-approved' },
    { message: '  ' },
  ])('rejects invalid required data without storing: %j', async (data) => {
    expect((await POST(request(data))).status).toBe(422)
    expect(create).not.toHaveBeenCalled()
  })
  it('returns the saved enquiry ID after an idempotent retry', async () => {
    find.mockResolvedValue({ docs: [{ id: 72 }] })
    const response = await POST(request())
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ enquiryId: '72' })
    expect(create).not.toHaveBeenCalled()
  })
  it('rejects a request from an untrusted origin', async () => {
    const badRequest = new Request('http://localhost:3001/api/enquiry', {
      method: 'POST', headers: { origin: 'https://attacker.example' }, body: '{}',
    })
    expect((await POST(badRequest)).status).toBe(403)
    expect(create).not.toHaveBeenCalled()
  })
})
