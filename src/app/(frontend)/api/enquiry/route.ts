import { createHash } from 'node:crypto'
import { isTrustedOrigin } from '@/lib/request-origin'
import { requestAddress } from '@/lib/request-address'
import { NextResponse } from 'next/server'
import { contentPayload } from '@/lib/content'
import { getContactData, validateContact } from '@/lib/validation/quote'

export const runtime = 'nodejs'
const attempts = new Map<string, { count: number; reset: number }>()
const maxBodyBytes = 24 * 1024

function rateLimit(request: Request) {
  const ip = requestAddress(request)
  const key = createHash('sha256').update(ip).digest('hex')
  const now = Date.now()
  for (const [attemptKey, value] of attempts) if (value.reset < now) attempts.delete(attemptKey)
  if (attempts.size > 10_000) return false
  const item = attempts.get(key) || { count: 0, reset: now + 60 * 60 * 1000 }
  item.count += 1
  attempts.set(key, item)
  return item.count <= 30
}

async function findExisting(submissionKey: string) {
  const payload = await contentPayload()
  const result = await payload.find({
    collection: 'enquiries',
    overrideAccess: true,
    limit: 1,
    where: { submissionKey: { equals: submissionKey } },
  })
  return result.docs[0]
}

export async function POST(request: Request) {
  if (!isTrustedOrigin(request))
    return NextResponse.json(
      { error: 'This request must come from the EPUBTRANS website.' },
      { status: 403 },
    )
  if (!rateLimit(request))
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '3600' } },
    )
  const length = Number(request.headers.get('content-length') || 0)
  if (length > maxBodyBytes)
    return NextResponse.json({ error: 'Your enquiry is too large to submit.' }, { status: 413 })
  let raw: unknown
  try {
    const reader = request.body?.getReader()
    if (!reader) throw new Error('Empty request')
    const chunks: Uint8Array[] = []
    let size = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBodyBytes) {
        await reader.cancel()
        throw new Error('too-large')
      }
      chunks.push(value)
    }
    raw = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return NextResponse.json({ error: 'The form could not be read.' }, { status: 400 })
  }
  const value = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const submissionKey = typeof value.submission_key === 'string' ? value.submission_key : ''
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionKey))
    return NextResponse.json({ error: 'Please refresh the page and try again.' }, { status: 400 })
  const data = getContactData(raw)
  if (data.website)
    return NextResponse.json({ error: 'The request could not be accepted.' }, { status: 400 })
  const errors = validateContact(data)
  if (Object.keys(errors).length)
    return NextResponse.json(
      { error: 'Please check the highlighted fields.', errors },
      { status: 422 },
    )
  try {
    const existing = await findExisting(submissionKey)
    if (existing)
      return NextResponse.json(
        { enquiryId: String(existing.id) },
        { status: 201, headers: { 'Cache-Control': 'no-store' } },
      )
    const payload = await contentPayload()
    const created = await payload.create({
      collection: 'enquiries',
      overrideAccess: true,
      data: {
        submissionKey,
        name: data.name,
        email: data.email,
        organization: data.organization,
        inquiryType: data.inquiryType as
          'general' | 'services' | 'partnership' | 'existing_project' | 'other',
        message: data.message,
        sourcePage: '/contact-us',
        status: 'new',
      },
    })
    return NextResponse.json(
      { enquiryId: String(created.id) },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    try {
      const existing = await findExisting(submissionKey)
      if (existing)
        return NextResponse.json(
          { enquiryId: String(existing.id) },
          { status: 201, headers: { 'Cache-Control': 'no-store' } },
        )
    } catch {
      // Keep storage and schema details out of the public response.
    }
    console.error('General enquiry persistence failed.')
    return NextResponse.json(
      { error: "We couldn't submit your enquiry. Please try again." },
      { status: 503 },
    )
  }
}
