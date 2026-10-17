import { createHash, randomUUID } from 'node:crypto'
import { isTrustedOrigin } from '@/lib/request-origin'
import { NextResponse } from 'next/server'
import { contentPayload } from '@/lib/content'
import { notifyQuote } from '@/lib/quote-email'
import { getQuoteData, validateQuote } from '@/lib/validation/quote'

import { storePrivateFile, removePrivateFile } from '@/lib/private-files'
import { validateQuoteFiles, quoteUploadLimit, quoteUploadCount } from '@/lib/quote-uploads'

export const runtime = 'nodejs'
const attempts = new Map<string, { count: number; reset: number }>()
const maxFormBytes = quoteUploadLimit * quoteUploadCount + 128 * 1024

function rateLimit(request: Request) {
  const ip =
    process.env.TRUST_NGINX_PROXY === 'true'
      ? request.headers.get('x-real-ip') || 'unknown'
      : 'local'
  const key = createHash('sha256').update(ip).digest('hex')
  const now = Date.now()
  for (const [attemptKey, value] of attempts) if (value.reset < now) attempts.delete(attemptKey)
  if (attempts.size > 10_000) return false
  const item = attempts.get(key) || { count: 0, reset: now + 60 * 60 * 1000 }
  item.count += 1
  attempts.set(key, item)
  return item.count <= 30
}

async function readBounded(request: Request) {
  const reader = request.body?.getReader()
  if (!reader) throw new Error('Empty request')
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxFormBytes) {
      await reader.cancel()
      throw new Error('too-large')
    }
    chunks.push(value)
  }
  return Buffer.concat(chunks)
}

async function findExisting(submissionKey: string) {
  const payload = await contentPayload()
  const result = await payload.find({
    collection: 'quote-requests',
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
  if (Number(request.headers.get('content-length') || 0) > maxFormBytes)
    return NextResponse.json({ error: 'The form data is too large to submit.' }, { status: 413 })

  let form: FormData
  try {
    const body = await readBounded(request)
    form = await new Request(request.url, {
      method: 'POST',
      headers: { 'content-type': request.headers.get('content-type') || '' },
      body,
    }).formData()
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === 'too-large'
            ? 'The form data is too large to submit.'
            : 'The form could not be read.',
      },
      { status: 400 },
    )
  }

  const data = getQuoteData(form)
  const submissionKey =
    typeof form.get('submission_key') === 'string' ? String(form.get('submission_key')) : ''
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionKey))
    return NextResponse.json({ error: 'Please refresh the page and try again.' }, { status: 400 })
  if (data.website)
    return NextResponse.json({ error: 'The request could not be accepted.' }, { status: 400 })
  const files = form
    .getAll('files')
    .filter((entry): entry is File => typeof entry !== 'string' && entry.size > 0)
  const uploadError = validateQuoteFiles(files)
  if (uploadError) return NextResponse.json({ error: uploadError }, { status: 422 })
  const uploads: { originalName: string; bytes: Buffer; extension: string }[] = []
  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer())
    const extension = file.name.split('.').pop()!.toLowerCase()
    const valid =
      extension === 'pdf'
        ? bytes.subarray(0, 5).toString() === '%PDF-'
        : extension === 'docx'
          ? bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) &&
            bytes.includes(Buffer.from('word/document.xml'))
          : !bytes.includes(0) && !bytes.toString('utf8').includes('\ufffd')
    if (!valid)
      return NextResponse.json(
        { error: 'A file does not match its format. Upload a valid PDF, DOCX or TXT file.' },
        { status: 422 },
      )
    uploads.push({
      originalName: file.name
        .split(/[\\/]/)
        .pop()!
        .replace(/[\x00-\x1f\x7f]/g, '')
        .slice(0, 200),
      bytes,
      extension,
    })
  }
  const errors = validateQuote(data)
  if (Object.keys(errors).length)
    return NextResponse.json(
      { error: 'Please check the highlighted fields.', errors },
      { status: 422 },
    )

  let existing
  try {
    existing = await findExisting(submissionKey)
  } catch {
    console.error('Quote idempotency lookup failed.')
    return NextResponse.json(
      { error: "We couldn't submit your enquiry. Please try again." },
      { status: 503 },
    )
  }
  if (existing)
    return NextResponse.json(
      { reference: String(existing.id), notification: 'unavailable' },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    )

  const attachments: { originalName: string; path: string; size: number }[] = []
  let reference: string
  try {
    const payload = await contentPayload()
    for (const upload of uploads) {
      const filename = `${randomUUID()}.${upload.extension}`
      await storePrivateFile(filename, upload.bytes)
      attachments.push({
        originalName: upload.originalName,
        path: filename,
        size: upload.bytes.length,
      })
    }
    const result = await payload.create({
      collection: 'quote-requests',
      overrideAccess: true,
      data: {
        submissionKey,
        name: data.name,
        email: data.email,
        company: data.company,
        service: data.service,
        sourceLanguage: data.sourceLanguage,
        targetLanguages: data.targetLanguages,
        languages: data.languages,
        countryRegion: data.countryRegion,
        sourceFileFormat: data.sourceFileFormat,
        targetOutputFormat: data.targetOutputFormat,
        approximateVolume: data.approximateVolume,
        additionalRequirements: data.additionalRequirements,
        details: data.details,
        deadline: data.deadline
          ? new Date(`${data.deadline}T00:00:00.000Z`).toISOString()
          : undefined,
        consent: false,
        attachments,
        sourcePage: '/get-a-quote',
        status: 'new',
      },
    })
    reference = String(result.id)
  } catch {
    await Promise.allSettled(attachments.map((file) => removePrivateFile(file.path)))
    try {
      const duplicate = await findExisting(submissionKey)
      if (duplicate)
        return NextResponse.json(
          { reference: String(duplicate.id), notification: 'unavailable' },
          { status: 201, headers: { 'Cache-Control': 'no-store' } },
        )
    } catch {
      // Keep database details out of the public response.
    }
    console.error('Quote persistence failed.')
    return NextResponse.json(
      { error: "We couldn't submit your enquiry. Please try again." },
      { status: 503 },
    )
  }

  let notification: 'sent' | 'unavailable' | 'failed' = 'unavailable'
  try {
    notification = await notifyQuote(reference, data, attachments)
  } catch {
    console.error('Quote notification failed; request remains saved in the admin panel.')
  }
  return NextResponse.json(
    { reference, notification },
    { status: 201, headers: { 'Cache-Control': 'no-store' } },
  )
}
