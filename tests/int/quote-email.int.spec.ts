import { afterEach, describe, expect, it, vi } from 'vitest'
import { notifyQuote, quoteEmail } from '@/lib/quote-email'
import { getQuoteData, type QuoteData } from '@/lib/validation/quote'

const { sendMail, send } = vi.hoisted(() => ({ sendMail: vi.fn(), send: vi.fn() }))
vi.mock('nodemailer', () => ({ default: { createTransport: () => ({ sendMail }) } }))
vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))
const data: QuoteData = {
  name: 'Test Customer',
  email: 'customer@example.com',
  company: 'Example',
  service: 'Translation & localization',
  sourceLanguage: 'English',
  targetLanguages: 'Tamil',
  details: 'Translate our <script>alert(1)</script> project brief.',
  deadline: '2026-11-01',
  consent: true,
  website: '',
}
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})
function configure() {
  vi.stubEnv('RESEND_API_KEY', '')
  vi.stubEnv('SMTP_PORT', '465')
  for (const key of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'])
    vi.stubEnv(key, 'test')
}
describe('Quote email notifications', () => {
  it('sends through Resend with the manager recipient and customer reply address', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    vi.stubEnv('MANAGER_EMAIL', 'riyastech001@gmail.com')
    vi.stubEnv('RESEND_FROM_EMAIL', 'EPUBTRANS <notifications@epubtrans.com>')
    send.mockResolvedValue({ data: { id: 'email-123' }, error: null })
    expect(await notifyQuote('123', data, [])).toBe('sent')
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'EPUBTRANS <notifications@epubtrans.com>',
        to: ['riyastech001@gmail.com'],
        replyTo: data.email,
        text: expect.stringContaining(data.details),
      }),
      expect.objectContaining({ idempotencyKey: 'quote-123' }),
    )
    expect(sendMail).not.toHaveBeenCalled()
  })
  it('handles Resend rejection without losing the saved request or falling back to another send', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    send.mockResolvedValue({ data: null, error: { message: 'Rejected' } })
    expect(await notifyQuote('123', data, [])).toBe('failed')
    expect(sendMail).not.toHaveBeenCalled()
  })
  it('uses the configured recipient, customer reply address, and escaped full brief', () => {
    vi.stubEnv('MANAGER_EMAIL', 'riyastech001@gmail.com')
    const message = quoteEmail('123', data, [{ originalName: 'brief.txt', size: 120 }])
    expect(message.to).toBe('riyastech001@gmail.com')
    expect(message.replyTo.address).toBe('customer@example.com')
    expect(message.text).toContain(data.details)
    expect(message.text).toContain('brief.txt (120 bytes)')
    expect(message.text).toContain('/admin/collections/quote-requests/123')
    expect(message.html).not.toContain('<script>')
    expect(message.html).toContain('&lt;script&gt;')
  })
  it('does not attempt delivery without SMTP configuration', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('SMTP_PASSWORD', '')
    expect(await notifyQuote('123', data, [])).toBe('unavailable')
    expect(sendMail).not.toHaveBeenCalled()
  })
  it('confirms SMTP acceptance of the intended recipient', async () => {
    configure()
    vi.stubEnv('MANAGER_EMAIL', 'riyastech001@gmail.com')
    sendMail.mockResolvedValue({ accepted: ['riyastech001@gmail.com'] })
    expect(await notifyQuote('123', data, [])).toBe('sent')
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'riyastech001@gmail.com' }))
  })
  it('uses the authenticated account when SMTP_FROM is omitted', async () => {
    configure()
    vi.stubEnv('SMTP_FROM', '')
    vi.stubEnv('SMTP_USER', 'sender@epubtrans.com')
    vi.stubEnv('MANAGER_EMAIL', 'riyastech001@gmail.com')
    sendMail.mockResolvedValue({ accepted: ['riyastech001@gmail.com'] })
    expect(await notifyQuote('123', data, [])).toBe('sent')
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: 'sender@epubtrans.com' }))
  })
  it('rejects an invalid SMTP port before attempting delivery', async () => {
    configure()
    vi.stubEnv('SMTP_PORT', 'invalid')
    expect(await notifyQuote('123', data, [])).toBe('failed')
    expect(sendMail).not.toHaveBeenCalled()
  })
  it('returns a failure without throwing when SMTP fails or rejects the recipient', async () => {
    configure()
    sendMail.mockRejectedValueOnce(new Error('SMTP failed'))
    expect(await notifyQuote('123', data, [])).toBe('failed')
    sendMail.mockResolvedValueOnce({ accepted: [] })
    expect(await notifyQuote('123', data, [])).toBe('failed')
  })
  it('preserves leading/trailing whitespace, line breaks, Unicode and special characters', () => {
    const details = '  Original brief & <tags> "quotes"\r\nதமிழ் — second line\n\n  '
    const form = new FormData()
    form.set('details', details)
    const parsed = getQuoteData(form)
    expect(parsed.details).toBe(details)
    const message = quoteEmail('123', { ...data, details: parsed.details }, [])
    expect(message.text).toContain(details)
    expect(message.html).toContain(
      '  Original brief &amp; &lt;tags&gt; &quot;quotes&quot;\r\nதமிழ் — second line\n\n  ',
    )
    expect(message.html).toContain('white-space:pre-wrap')
  })
  it('allows the manager mailbox to be changed through server configuration', () => {
    vi.stubEnv('MANAGER_EMAIL', 'another-manager@example.com')
    expect(quoteEmail('123', data, []).to).toBe('another-manager@example.com')
  })
  it('handles network failures and missing provider confirmation', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    send.mockRejectedValueOnce(new Error('Network error'))
    expect(await notifyQuote('123', data, [])).toBe('failed')
    send.mockResolvedValueOnce({ data: {}, error: null })
    expect(await notifyQuote('123', data, [])).toBe('failed')
  })
})
