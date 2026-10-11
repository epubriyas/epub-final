import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { translateWithMyMemory } from './mymemory'
import { fixedTranslation } from './fixed-translations'
const memory = new Map<string, string>()
let day = new Date().toISOString().slice(0, 10),
  characters = 0
const decode = (text: string) =>
  text
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi, (_, number) => String.fromCodePoint(parseInt(number, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
export async function translatePublicText(
  texts: string[],
  locale: string,
): Promise<(string | undefined)[]> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY
  const directory = path.resolve(process.env.TRANSLATION_CACHE_DIR || '.translation-cache')
  const ids = texts.map((text) => createHash('sha256').update(`${locale}\0${text}`).digest('hex'))
  const values = await Promise.all(
    ids.map(async (id, index) => {
      const fixed = fixedTranslation(texts[index], locale)
      if (fixed) return fixed
      if (memory.has(id)) return memory.get(id)
      try {
        const text = await readFile(path.join(directory, id + '.txt'), 'utf8')
        memory.set(id, text)
        return text
      } catch {
        return undefined
      }
    }),
  )
  const missing = texts
    .map((text, index) => ({ text, index }))
    .filter((item) => values[item.index] === undefined)
  if (missing.length) {
    const currentDay = new Date().toISOString().slice(0, 10)
    if (currentDay !== day) {
      day = currentDay
      characters = 0
    }
    const count = missing.reduce((sum, item) => sum + item.text.length, 0)
    const configuredLimit = Number(process.env.TRANSLATION_DAILY_CHARACTER_LIMIT || 250000)
    const limit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 250000
    if (characters + count > limit) throw new Error('Translation usage limit reached')
    characters += count
    let translated: { translatedText: string }[]
    if (!key) {
      translated = new Array(missing.length)
      let next = 0
      let failure: unknown
      await Promise.all(
        Array.from({ length: Math.min(4, missing.length) }, async () => {
          while (next < missing.length && !failure) {
            const index = next++
            try {
              const value = await translateWithMyMemory(missing[index].text, locale)
              const text = decode(value)
              translated[index] = { translatedText: value }
              values[missing[index].index] = text
              // Persist each successful segment so retries do not spend quota again.
              await mkdir(directory, { recursive: true })
              memory.set(ids[missing[index].index], text)
              await writeFile(path.join(directory, ids[missing[index].index] + '.txt'), text, {
                mode: 0o600,
              })
            } catch (error) {
              failure = error
            }
          }
        }),
      )
      // A failed segment must not discard the successfully translated segments.
      if (failure && values.every((value) => value === undefined)) throw failure
    } else {
      const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key },
        body: JSON.stringify({
          q: missing.map((item) => item.text),
          source: 'en',
          target: locale,
          format: 'text',
        }),
        signal: AbortSignal.timeout(20000),
      })
      if (!response.ok) throw new Error('Translation provider unavailable')
      const result = (await response.json()) as {
        data?: { translations?: { translatedText: string }[] }
      }
      const values = result.data?.translations
      if (
        !values ||
        values.length !== missing.length ||
        values.some(
          (item) => typeof item.translatedText !== 'string' || item.translatedText.length > 20000,
        )
      )
        throw new Error('Invalid translation response')
      translated = values
    }
    await mkdir(directory, { recursive: true })
    await Promise.all(
      missing.map(async (item, index) => {
        if (!translated[index]) return
        const text = decode(translated[index].translatedText)
        values[item.index] = text
        memory.set(ids[item.index], text)
        await writeFile(path.join(directory, ids[item.index] + '.txt'), text, { mode: 0o600 })
      }),
    )
    if (memory.size > 20000) memory.clear()
  }
  return values
}
