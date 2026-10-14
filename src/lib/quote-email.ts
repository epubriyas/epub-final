import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import type { QuoteData } from '@/lib/validation/quote'
import { quoteServiceOptions } from '@/lib/validation/quote'

const managerEmail = () => process.env.MANAGER_EMAIL?.trim() || ''
type Attachment = { originalName: string; size: number }

export function quoteEmail(reference: string, data: QuoteData, attachments: Attachment[]) {
  const origin = new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001').origin
  const adminURL = `${origin}/admin/collections/quote-requests/${encodeURIComponent(reference)}`
  const rows = [
    ['Reference', reference],
    ['Name', data.name],
    ['Email', data.email],
    ['Company', data.company || 'Not provided'],
    ['Country / Region', data.countryRegion || 'Not specified'],
    ['Service', quoteServiceOptions.find(({ value }) => value === data.service)?.label || data.service],
    ['Source and target languages', data.languages || 'Not specified'],
    ['Source file format', data.sourceFileFormat || 'Not specified'],
    ['Target output format', data.targetOutputFormat || 'Not specified'],
    ['Approximate volume', data.approximateVolume || 'Not specified'],
    ['Preferred delivery date', data.deadline || 'Not specified'],
    ['Project description', data.details],
    ['Additional requirements', data.additionalRequirements || 'Not specified'],
    [
      'Files',
      attachments.length
        ? attachments.map((file) => `${file.originalName} (${file.size} bytes)`).join('\n')
        : 'No files uploaded',
    ],
  ]
  const escape = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (character) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
    )
  return {
    to: managerEmail(),
    replyTo: { name: data.name, address: data.email },
    subject: `New Website Project Enquiry – ${quoteServiceOptions.find(({ value }) => value === data.service)?.label || 'EPUBTRANS'} (#${reference.replace(/[\r\n]/g, '')})`,
    text: `New EPUBTRANS quote request\n\n${rows.map(([label, value]) => `${label}: ${value}`).join('\n\n')}\n\nReview request and private files (admin login required): ${adminURL}`,
    html: `<div style="font-family:Arial,sans-serif;color:#102b2b;max-width:680px"><h1 style="font-size:24px">New quote request</h1><p>A visitor submitted a project enquiry on EPUBTRANS.</p><table style="border-collapse:collapse;width:100%">${rows.map(([label, value]) => `<tr><th style="text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid #ddd">${escape(label)}</th><td style="padding:12px;border-bottom:1px solid #ddd;white-space:pre-wrap">${escape(value)}</td></tr>`).join('')}</table><p><a href="${escape(adminURL)}">Review request and private files</a> (admin login required)</p></div>`,
  }
}

export async function notifyQuote(
  reference: string,
  data: QuoteData,
  attachments: Attachment[],
): Promise<'sent' | 'unavailable' | 'failed'> {
  if (process.env.ENQUIRY_RECIPIENT_APPROVED !== 'true' || !managerEmail()) {
    console.warn('Quote notification unavailable: the recipient approval gate is not enabled.')
    return 'unavailable'
  }
  if (process.env.RESEND_API_KEY) {
    const sender = process.env.RESEND_FROM_EMAIL?.trim() || process.env.QUOTE_EMAIL_FROM?.trim()
    if (!sender) return 'unavailable'
    try {
      const message = quoteEmail(reference, data, attachments)
      const resend = new Resend(process.env.RESEND_API_KEY)
      const { data: accepted, error } = await resend.emails.send(
        {
          from: sender,
          to: [message.to],
          replyTo: data.email,
          subject: message.subject,
          text: message.text,
          html: message.html,
        },
        { idempotencyKey: `quote-${reference}`, signal: AbortSignal.timeout(15000) },
      )
      if (error || !accepted?.id) throw new Error('Email not accepted')
      return 'sent'
    } catch {
      console.error(
        'Resend quote notification failed; check API key, verified sending domain and provider quota. Request remains saved.',
      )
      return 'failed'
    }
  }
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env
  const sender = process.env.SMTP_FROM?.trim() || SMTP_USER?.trim()
  if (!SMTP_HOST?.trim() || !SMTP_USER?.trim() || !SMTP_PASSWORD || !sender) {
    console.warn(
      'Quote email unavailable: configure RESEND_API_KEY or SMTP_HOST, SMTP_USER and SMTP_PASSWORD.',
    )
    return 'unavailable'
  }
  try {
    const port = Number(process.env.SMTP_PORT || 465)
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid SMTP port')
    const transport = nodemailer.createTransport({
      host: SMTP_HOST.trim(),
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user: SMTP_USER.trim(), pass: SMTP_PASSWORD },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      disableFileAccess: true,
      disableUrlAccess: true,
    })
    const result = await transport.sendMail({
      from: sender,
      ...quoteEmail(reference, data, attachments),
    })
    if (
      !result.accepted.some(
        (recipient: string | { address: string }) =>
          (typeof recipient === 'string' ? recipient : recipient.address) === managerEmail(),
      )
    )
      throw new Error('Recipient rejected')
    return 'sent'
  } catch {
    // Do not expose SMTP credentials or customer details in logs. The saved request remains intact.
    console.error('Quote email notification failed; request remains saved in the admin panel.')
    return 'failed'
  }
}
