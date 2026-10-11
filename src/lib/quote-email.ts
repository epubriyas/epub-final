import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import type { QuoteData } from '@/lib/validation/quote'

const managerEmail = () => process.env.MANAGER_EMAIL?.trim() || 'riyastech001@gmail.com'
type Attachment = { originalName: string; size: number }

export function quoteEmail(reference: string, data: QuoteData, attachments: Attachment[]) {
  const origin = new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001').origin
  const adminURL = `${origin}/admin/collections/quote-requests/${encodeURIComponent(reference)}`
  const rows = [
    ['Reference', reference],
    ['Name', data.name],
    ['Email', data.email],
    ['Company', data.company || 'Not provided'],
    ['Service', data.service],
    ['Source language', data.sourceLanguage || 'Not specified'],
    ['Target languages', data.targetLanguages || 'Not specified'],
    ['Project deadline', data.deadline || 'Not specified'],
    ['Project brief', data.details],
    [
      'Files',
      attachments.length
        ? attachments.map((file) => `${file.originalName} (${file.size} bytes)`).join('\n')
        : 'No files uploaded',
    ],
    ['Consent', 'Customer agreed to be contacted about this request'],
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
    subject: `New Website Enquiry – ${data.service.replace(/[\r\n]/g, '')} (#${reference.replace(/[\r\n]/g, '')})`,
    text: `New EPUBTRANS quote request\n\n${rows.map(([label, value]) => `${label}: ${value}`).join('\n\n')}\n\nReview request and private files (admin login required): ${adminURL}`,
    html: `<div style="font-family:Arial,sans-serif;color:#102b2b;max-width:680px"><h1 style="font-size:24px">New quote request</h1><p>A visitor submitted a project enquiry on EPUBTRANS.</p><table style="border-collapse:collapse;width:100%">${rows.map(([label, value]) => `<tr><th style="text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid #ddd">${escape(label)}</th><td style="padding:12px;border-bottom:1px solid #ddd;white-space:pre-wrap">${escape(value)}</td></tr>`).join('')}</table><p><a href="${escape(adminURL)}">Review request and private files</a> (admin login required)</p></div>`,
  }
}

export async function notifyQuote(
  reference: string,
  data: QuoteData,
  attachments: Attachment[],
): Promise<'sent' | 'unavailable' | 'failed'> {
  if (process.env.RESEND_API_KEY) {
    try {
      const message = quoteEmail(reference, data, attachments)
      const resend = new Resend(process.env.RESEND_API_KEY)
      const { data: accepted, error } = await resend.emails.send(
        {
          from:
            process.env.RESEND_FROM_EMAIL ||
            process.env.QUOTE_EMAIL_FROM ||
            'EPUBTRANS <info@epubtrans.com>',
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
