import { NextRequest } from 'next/server'
import { isTrustedOrigin } from '@/lib/request-origin'
import { getLanguage } from '@/config/languages'
import { getPublicTranslationCatalog, normalizeText } from '@/lib/i18n/catalog'
import { translatePublicText } from '@/lib/i18n/translate'
export const runtime = 'nodejs'
const requests = new Map<string, { time: number; count: number }>()
export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request))
    return Response.json({ error: 'Origin not allowed' }, { status: 403 })
  const address =
    process.env.TRUST_NGINX_PROXY === 'true'
      ? request.headers.get('x-real-ip') || 'unknown'
      : 'local'
  const now = Date.now(),
    entry = requests.get(address)
  if (entry && now - entry.time < 60000) {
    if (entry.count >= 40)
      return Response.json({ error: 'Please wait before retrying' }, { status: 429 })
    entry.count++
  } else requests.set(address, { time: now, count: 1 })
  if (requests.size > 10000)
    for (const [id, item] of requests) if (now - item.time > 60000) requests.delete(id)
  if (Number(request.headers.get('content-length')) > 40000)
    return Response.json({ error: 'Request too large' }, { status: 413 })
  let body: { locale?: unknown; texts?: unknown }
  try {
    const reader = request.body?.getReader()
    if (!reader) return Response.json({ error: 'Missing body' }, { status: 400 })
    const chunks: Uint8Array[] = []
    let total = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.length
      if (total > 40000) {
        await reader.cancel()
        return Response.json({ error: 'Request too large' }, { status: 413 })
      }
      chunks.push(value)
    }
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (
    typeof body.locale !== 'string' ||
    !getLanguage(body.locale) ||
    body.locale === 'en' ||
    !Array.isArray(body.texts) ||
    !body.texts.length ||
    body.texts.length > 32 ||
    body.texts.some((text) => typeof text !== 'string' || text.length > 5000) ||
    body.texts.join('').length > 8000
  )
    return Response.json({ error: 'Invalid language or text batch' }, { status: 400 })
  try {
    const texts = (body.texts as string[]).map(normalizeText),
      catalog = await getPublicTranslationCatalog()
    const allowed = texts.filter((text) => catalog.has(text))
    // Only registered public UI and anonymously readable CMS copy may leave this server.
    const values = allowed.length
      ? await translatePublicText([...new Set(allowed)], body.locale)
      : []
    const translated = Object.fromEntries(
      [...new Set(allowed)].flatMap((text, index) =>
        typeof values[index] === 'string' ? [[text, values[index]]] : [],
      ),
    )
    return Response.json(
      { translations: translated, partial: values.some((value) => value === undefined) },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return Response.json({ error: 'Translation is temporarily unavailable' }, { status: 503 })
  }
}
