import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/(frontend)/api/quote/route'

const { create, notify, mkdir, writeFile, unlink } = vi.hoisted(() => ({
  create: vi.fn(),
  notify: vi.fn(),
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
}))
vi.mock('@/lib/content', () => ({ contentPayload: async () => ({ create }) }))
vi.mock('@/lib/quote-email', () => ({ notifyQuote: notify }))
vi.mock('node:fs/promises', () => ({ mkdir, writeFile, unlink }))

const brief = '  Please preserve this exact brief.\r\nSecond line & <special> தமிழ்.\n  '
function request(overrides: Record<string, string | undefined> = {}, attachment = false) {
  const form = new FormData()
  for (const [key, value] of Object.entries({
    name: 'Test Customer',
    email: 'customer@example.com',
    company: 'Example',
    service: 'Publishing & content',
    details: brief,
    consent: 'true',
    ...overrides,
  }))
    if (value !== undefined) form.set(key, value)
  form.set('details', JSON.stringify(form.get('details')))
  form.set('detailsEncoding', 'json')
  if (attachment) form.append('files', new File(['Sample brief'], 'brief.txt'))
  return new Request('http://localhost:3001/api/quote', {
    method: 'POST',
    headers: { origin: 'http://localhost:3001' },
    body: form,
  })
}
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'http://localhost:3001')
  create.mockResolvedValue({ id: 123 })
  notify.mockResolvedValue('sent')
})
afterEach(() => vi.unstubAllEnvs())

describe('Quote save and notification flow', () => {
  it('creates one record before notifying, preserving the original brief', async () => {
    const response = await POST(request())
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ reference: '123', notification: 'sent' })
    expect(create).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'quote-requests',
        data: expect.objectContaining({ details: brief }),
      }),
    )
    expect(notify).toHaveBeenCalledTimes(1)
    expect(notify).toHaveBeenCalledWith('123', expect.objectContaining({ details: brief }), [])
    expect(create.mock.invocationCallOrder[0]).toBeLessThan(notify.mock.invocationCallOrder[0])
  })
  it.each(['failed', 'unavailable'])(
    'returns the saved reference when mail is %s',
    async (status) => {
      notify.mockResolvedValue(status)
      const response = await POST(request({}, true))
      expect(response.status).toBe(201)
      expect(await response.json()).toEqual({ reference: '123', notification: status })
      expect(create).toHaveBeenCalledTimes(1)
      expect(writeFile).toHaveBeenCalledTimes(1)
      expect(unlink).not.toHaveBeenCalled()
    },
  )
  it('retains the saved request and uploads even if notification unexpectedly throws', async () => {
    notify.mockRejectedValue(new Error('Unexpected failure'))
    const response = await POST(request({}, true))
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ reference: '123', notification: 'failed' })
    expect(unlink).not.toHaveBeenCalled()
  })
  it('does not notify when storage fails and cleans up uncommitted uploads', async () => {
    create.mockRejectedValue(new Error('Database unavailable'))
    const response = await POST(request({}, true))
    expect(response.status).toBe(503)
    expect(notify).not.toHaveBeenCalled()
    expect(unlink).toHaveBeenCalledTimes(1)
  })
  it.each([{ email: 'invalid' }, { details: ' ' }, { consent: 'false' }, { name: '' }])(
    'rejects invalid input before storage and email: %j',
    async (input) => {
      const response = await POST(request(input))
      expect(response.status).toBe(422)
      expect(create).not.toHaveBeenCalled()
      expect(notify).not.toHaveBeenCalled()
    },
  )
  it('rejects honeypot submissions', async () => {
    expect((await POST(request({ website: 'spam' }))).status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })
})
