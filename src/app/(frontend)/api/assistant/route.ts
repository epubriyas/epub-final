import { NextRequest } from 'next/server'
import { getSiteSettings } from '@/lib/content'
import {
  assistantInstructions,
  responseEvents,
  validateChatMessages,
  type ChatMessage,
} from '@/lib/assistant-ai'
export const runtime = 'nodejs'
const requests = new Map<string, { time: number; count: number }>()
let day = '',
  used = 0,
  active = 0
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (
    !origin ||
    !(
      origin === process.env.NEXT_PUBLIC_SERVER_URL ||
      (process.env.NODE_ENV !== 'production' && origin === request.nextUrl.origin)
    )
  )
    return Response.json({ error: 'Origin not allowed' }, { status: 403 })
  if (!process.env.GEMINI_API_KEY)
    return Response.json(
      { error: 'AI replies are not available yet. Please contact our team.' },
      { status: 503 },
    )
  const address =
    process.env.TRUST_NGINX_PROXY === 'true'
      ? request.headers.get('x-real-ip') || 'unknown'
      : 'local'
  const now = Date.now(),
    entry = requests.get(address)
  if (entry && now - entry.time < 60000) {
    if (entry.count >= 10)
      return Response.json(
        { error: 'Please wait a moment before sending another message.' },
        { status: 429 },
      )
    entry.count++
  } else requests.set(address, { time: now, count: 1 })
  if (requests.size > 1000)
    for (const [key, value] of requests) if (now - value.time >= 60000) requests.delete(key)
  const today = new Date().toISOString().slice(0, 10)
  if (day !== today) {
    day = today
    used = 0
  }
  const configuredLimit = Number(process.env.ASSISTANT_DAILY_REQUEST_LIMIT || 300)
  const limit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 300
  if (used >= limit || active >= 4)
    return Response.json(
      { error: 'The assistant is busy. Please try again later or contact our team.' },
      { status: 429 },
    )
  let body: { messages?: unknown }
  try {
    const reader = request.body?.getReader()
    if (!reader) throw new Error('Missing body')
    const chunks: Uint8Array[] = []
    let bytes = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.length
      if (bytes > 48000) {
        await reader.cancel()
        return Response.json({ error: 'Message history is too large.' }, { status: 413 })
      }
      chunks.push(value)
    }
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (!body || !validateChatMessages(body.messages)) throw new Error('Invalid messages')
  } catch {
    return Response.json({ error: 'Please send a valid message.' }, { status: 400 })
  }
  const controller = new AbortController()
  const signal = AbortSignal.any([controller.signal, request.signal, AbortSignal.timeout(45000)])
  active++
  used++
  try {
    const settings = await getSiteSettings()
    const model = process.env.GEMINI_ASSISTANT_MODEL || 'gemini-3.5-flash-lite'
    if (!/^gemini-[a-z0-9.-]+$/.test(model)) throw new Error('Invalid model')
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': process.env.GEMINI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: assistantInstructions(
                  settings.contactDetailsApproved === true ? settings.email || '' : '',
                  settings.contactDetailsApproved === true ? settings.phone || '' : '',
                  settings.location || 'Chennai, India',
                ),
              },
            ],
          },
          contents: (body.messages as ChatMessage[]).map((message) => ({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.content }],
          })),
          generationConfig: { maxOutputTokens: 1200 },
        }),
        signal,
      },
    )
    if (!upstream.ok || !upstream.body) throw new Error('Provider unavailable')
    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(output) {
        const emit = (value: unknown) =>
          output.enqueue(encoder.encode(JSON.stringify(value) + '\n'))
        let complete = false
        try {
          for await (const event of responseEvents(upstream.body!)) {
            if (signal.aborted) throw new Error('Aborted')
            if (event.error || event.promptFeedback?.blockReason)
              throw new Error('Blocked response')
            const candidate = event.candidates?.[0]
            for (const part of candidate?.content?.parts || [])
              if (!part.thought && typeof part.text === 'string')
                emit({ type: 'delta', text: part.text })
            if (candidate?.finishReason === 'STOP') {
              complete = true
              emit({ type: 'done' })
              break
            }
            if (candidate?.finishReason) throw new Error('Incomplete response')
          }
          if (!complete) throw new Error('Incomplete response')
        } catch {
          if (!signal.aborted)
            emit({ type: 'error', error: 'The reply was interrupted. Please try again.' })
        } finally {
          active--
          if (!controller.signal.aborted) output.close()
        }
      },
      cancel() {
        controller.abort()
      },
    })
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch {
    active--
    return Response.json(
      { error: 'AI replies are temporarily unavailable. Please try again.' },
      { status: 503 },
    )
  }
}
