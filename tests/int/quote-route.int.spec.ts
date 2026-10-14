import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/(frontend)/api/quote/route'

const { create, find, notify, store, remove } = vi.hoisted(() => ({
  create: vi.fn(),
  find: vi.fn(),
  notify: vi.fn(),
  store: vi.fn(),
  remove: vi.fn(),
}))
vi.mock('@/lib/content', () => ({ contentPayload: async () => ({ create, find }) }))
vi.mock('@/lib/quote-email', () => ({ notifyQuote: notify }))
vi.mock('@/lib/private-files', () => ({ storePrivateFile: store, removePrivateFile: remove }))

const brief = '  Please preserve this exact brief.\r\nSecond line & <special> தமிழ்.\n  '
const key = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
function request(
  overrides: Record<string, string | undefined> = {},
  attachment: boolean | File = false,
) {
  const form = new FormData()
  for (const [name, value] of Object.entries({
    full_name: 'Test Customer',
    business_email: 'customer@example.com',
    organization: 'Example',
    service_required: 'publishing_editorial',
    project_description: brief,
    submission_key: key,
    ...overrides,
  }))
    if (value !== undefined) form.set(name, value)
  form.set('project_description', JSON.stringify(form.get('project_description')))
  form.set('detailsEncoding', 'json')
  if (attachment)
    form.append(
      'files',
      attachment instanceof File ? attachment : new File(['Sample brief'], 'brief.txt'),
    )
  return new Request('http://localhost:3001/api/quote', {
    method: 'POST',
    headers: { origin: 'http://localhost:3001' },
    body: form,
  })
}
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'http://localhost:3001')
  find.mockResolvedValue({ docs: [] })
  create.mockResolvedValue({ id: 123 })
  notify.mockResolvedValue('unavailable')
})
afterEach(() => vi.unstubAllEnvs())

describe('Quote save and notification flow', () => {
  it('persists the complete approved field set before notifying', async () => {
    const response = await POST(
      request({
        country_region: 'India',
        source_file_format: 'DOCX',
        target_output_format: 'EPUB',
        approximate_volume: '100 pages',
        languages: 'English to Tamil',
        additional_requirements: 'Use the supplied style guide.',
      }),
    )
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ reference: '123', notification: 'unavailable' })
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'quote-requests',
        data: expect.objectContaining({
          submissionKey: key,
          details: brief,
          consent: false,
          attachments: [],
          countryRegion: 'India',
          sourceFileFormat: 'DOCX',
          targetOutputFormat: 'EPUB',
          approximateVolume: '100 pages',
          languages: 'English to Tamil',
          additionalRequirements: 'Use the supplied style guide.',
          sourcePage: '/get-a-quote',
        }),
      }),
    )
    expect(notify).toHaveBeenCalledOnce()
  })
  it('returns the existing lead for a duplicate retry', async () => {
    find.mockResolvedValue({ docs: [{ id: 987 }] })
    const response = await POST(request())
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ reference: '987', notification: 'unavailable' })
    expect(create).not.toHaveBeenCalled()
    expect(notify).not.toHaveBeenCalled()
  })
  it('stores attachments privately and records them on the enquiry', async () => {
    expect((await POST(request({}, true))).status).toBe(201)
    expect(store).toHaveBeenCalledOnce()
    expect(create.mock.calls[0][0].data.attachments).toEqual([
      expect.objectContaining({
        originalName: 'brief.txt',
        size: 12,
        path: expect.stringMatching(/\.txt$/),
      }),
    ])
    expect(notify.mock.calls[0][2]).toHaveLength(1)
  })
  it('removes uploaded files when enquiry persistence fails', async () => {
    create.mockRejectedValueOnce(new Error('Storage failed'))
    expect((await POST(request({}, true))).status).toBe(503)
    expect(remove).toHaveBeenCalledOnce()
    expect(notify).not.toHaveBeenCalled()
  })
  it('does not store attachments again on a duplicate retry', async () => {
    find.mockResolvedValue({ docs: [{ id: 987 }] })
    expect((await POST(request({}, true))).status).toBe(201)
    expect(store).not.toHaveBeenCalled()
  })
  it('rejects a file with a misleading PDF extension before storage', async () => {
    expect((await POST(request({}, new File(['Not a PDF'], 'brief.pdf')))).status).toBe(422)
    expect(store).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })
  it.each([
    { business_email: 'invalid' },
    { project_description: ' ' },
    { organization: '' },
    { full_name: '' },
    { service_required: 'unapproved_service' },
    { submission_key: 'invalid' },
  ])('rejects invalid input before storage: %j', async (input) => {
    expect((await POST(request(input))).status).toBe(input.submission_key ? 400 : 422)
    expect(create).not.toHaveBeenCalled()
    expect(notify).not.toHaveBeenCalled()
  })
  it('rejects honeypot submissions', async () => {
    expect((await POST(request({ website: 'spam' }))).status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })
})
