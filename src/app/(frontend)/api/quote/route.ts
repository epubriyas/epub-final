import { NextResponse } from 'next/server'
import { mkdir, writeFile, unlink } from 'node:fs/promises'
import { randomUUID, createHash } from 'node:crypto'
import path from 'node:path'
import { contentPayload } from '@/lib/content'
import { notifyQuote } from '@/lib/quote-email'
import {
  getQuoteData,
  validateQuote,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
} from '@/lib/validation/quote'
export const runtime = 'nodejs'
const attempts = new Map<string, { count: number; reset: number }>()
function rateLimit(request: Request) {
  const ip =
    process.env.TRUST_NGINX_PROXY === 'true'
      ? request.headers.get('x-real-ip') || 'unknown'
      : 'local'
  const key = createHash('sha256').update(ip).digest('hex'),
    now = Date.now()
  for (const [key, value] of attempts) if (value.reset < now) attempts.delete(key)
  if (attempts.size > 10000) return false
  const item = attempts.get(key) || { count: 0, reset: now + 60 * 60 * 1000 }
  item.count++
  attempts.set(key, item)
  return item.count <= 30
}
async function readBounded(request: Request) {
  const reader = request.body?.getReader()
  if (!reader) throw new Error('Empty request')
  const chunks: Uint8Array[] = []
  let length = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    length += value.length
    if (length > MAX_TOTAL_BYTES + 1024 * 1024) {
      await reader.cancel()
      throw new Error('too-large')
    }
    chunks.push(value)
  }
  return Buffer.concat(chunks)
}
export async function POST(request: Request) {
  const trustedOrigin = process.env.NEXT_PUBLIC_SERVER_URL
  const origin = request.headers.get('origin')
  const localOrigin =
    process.env.NODE_ENV !== 'production' ? new URL(request.url).origin : undefined
  if (!origin || ![trustedOrigin, localOrigin].filter(Boolean).includes(origin))
    return NextResponse.json(
      { error: 'This request must come from the EPUBTRANS website.' },
      { status: 403 },
    )
  if (!rateLimit(request))
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '3600' } },
    )
  if (Number(request.headers.get('content-length')) > MAX_TOTAL_BYTES + 1024 * 1024)
    return NextResponse.json({ error: 'Files must total 20 MB or less.' }, { status: 413 })
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
            ? 'Files must total 20 MB or less.'
            : 'The form could not be read.',
      },
      { status: 400 },
    )
  }
  const data = getQuoteData(form)
  if (data.website)
    return NextResponse.json({ error: 'The request could not be accepted.' }, { status: 400 })
  const errors = validateQuote(data)
  if (Object.keys(errors).length)
    return NextResponse.json({ error: 'Check the highlighted fields.', errors }, { status: 422 })
  const files = form
    .getAll('files')
    .filter((entry): entry is File => typeof entry !== 'string' && entry.size > 0)
  if (files.length > 3 || files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_BYTES)
    return NextResponse.json(
      { error: 'Upload up to 3 files, totalling 20 MB or less.' },
      { status: 422 },
    )
  const prepared: { file: File; bytes: Buffer; extension: string }[] = []
  for (const file of files) {
    const extension = path.extname(file.name).toLowerCase()
    if (!['.pdf', '.txt', '.docx'].includes(extension) || file.size > MAX_FILE_BYTES)
      return NextResponse.json(
        { error: 'Use PDF, TXT or DOCX files, up to 10 MB each.' },
        { status: 422 },
      )
    const bytes = Buffer.from(await file.arrayBuffer())
    let valid =
      extension === '.pdf'
        ? bytes.subarray(0, 5).toString() === '%PDF-'
        : extension === '.docx'
          ? bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) &&
            bytes.includes(Buffer.from('[Content_Types].xml')) &&
            bytes.includes(Buffer.from('word/document.xml'))
          : !bytes.includes(0)
    if (extension === '.txt') {
      try {
        new TextDecoder('utf-8', { fatal: true }).decode(bytes)
      } catch {
        valid = false
      }
    }
    if (!valid)
      return NextResponse.json(
        { error: 'A file does not match its expected document format.' },
        { status: 422 },
      )
    prepared.push({ file, bytes, extension })
  }
  const root = path.resolve(process.env.PRIVATE_UPLOAD_DIR || 'private-uploads')
  const written: string[] = []
  const attachments: { originalName: string; path: string; size: number }[] = []
  let reference: string
  try {
    await mkdir(root, { recursive: true })
    for (const { file, bytes, extension } of prepared) {
      const filename = randomUUID() + extension
      const destination = path.join(root, filename)
      await writeFile(destination, bytes, { flag: 'wx', mode: 0o600 })
      written.push(destination)
      attachments.push({
        originalName: path.basename(file.name).slice(0, 200),
        path: filename,
        size: file.size,
      })
    }
    const payload = await contentPayload()
    // Intentional service operation after validation: public REST collection creation remains denied.
    const result = await payload.create({
      collection: 'quote-requests',
      overrideAccess: true,
      data: {
        name: data.name,
        email: data.email,
        company: data.company,
        service: data.service,
        sourceLanguage: data.sourceLanguage,
        targetLanguages: data.targetLanguages,
        details: data.details,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
        consent: true,
        attachments,
        status: 'new',
      },
    })
    reference = String(result.id)
  } catch {
    await Promise.allSettled(written.map((file) => unlink(file)))
    console.error('Quote persistence failed.')
    return NextResponse.json(
      { error: 'Your request could not be saved. Please try again or contact info@epubtrans.com.' },
      { status: 503 },
    )
  }
  // The create has committed. Notification failures must never remove saved uploads
  // or turn a saved enquiry into a retryable database error.
  let notification: 'sent' | 'unavailable' | 'failed' = 'failed'
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
