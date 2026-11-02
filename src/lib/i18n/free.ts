import { translate } from '@vitalets/google-translate-api'
import { translateWithMyMemory } from './mymemory'

// Serialize anonymous requests across visitors rather than flooding the public
// service with every label on a page. Share simultaneous identical requests.
let queue: Promise<unknown> = Promise.resolve()
const pending = new Map<string, Promise<string>>()

export function translateWithoutKey(text: string, locale: string): Promise<string> {
  const id = `${locale}\0${text}`
  const existing = pending.get(id)
  if (existing) return existing
  const request = queue.then(async () => {
    try {
      const result = await translate(text, {
        from: 'en',
        to: locale,
        fetchOptions: { signal: AbortSignal.timeout(12000) },
      })
      if (typeof result.text !== 'string' || !result.text.trim() || result.text.length > 20000)
        throw new Error('Invalid translation response')
      return result.text
    } catch {
      return translateWithMyMemory(text, locale)
    }
  })
  queue = request.catch(() => {})
  pending.set(id, request)
  void request.finally(() => pending.delete(id)).catch(() => {})
  return request
}
