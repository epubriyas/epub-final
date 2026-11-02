import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { translateWithoutKey } from './free'
import { translateWithGoogle } from './google'
import { fixedTranslation } from './fixed-translations'
import bundled from './bundled.json'
const bundledCopy: Record<string, Record<string, string>> = bundled
const memory = new Map<string, string>()
async function saveTranslation(directory: string, id: string, text: string) {
  memory.set(id, text)
  try {
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, id + '.txt'), text, { mode: 0o600 })
  } catch {
    // Read-only hosts can still serve successful translations from memory.
    // Bundled translations provide persistence across deployments.
  }
}
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
  const useCloud = process.env.TRANSLATION_PROVIDER === 'google-cloud'
  const directory = path.resolve(process.env.TRANSLATION_CACHE_DIR || '.translation-cache')
  const ids = texts.map((text) =>
    createHash('sha256')
      .update(`${useCloud ? 'google-v1' : 'free-google-v1'}\0${locale}\0${text}`)
      .digest('hex'),
  )
  const values = await Promise.all(
    ids.map(async (id, index) => {
      const fixed = fixedTranslation(texts[index], locale)
      if (fixed) return fixed
      const saved = bundledCopy[locale]?.[texts[index]]
      if (saved) return saved
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
    if (!useCloud) {
      translated = new Array(missing.length)
      let next = 0
      let failure: unknown
      await Promise.all(
        Array.from({ length: Math.min(4, missing.length) }, async () => {
          while (next < missing.length) {
            const index = next++
            try {
              const value = await translateWithoutKey(missing[index].text, locale)
              const text = decode(value)
              translated[index] = { translatedText: value }
              values[missing[index].index] = text
              // Persist each successful segment so retries do not spend quota again.
              await saveTranslation(directory, ids[missing[index].index], text)
            } catch (error) {
              failure = error
            }
          }
        }),
      )
      // A failed segment must not discard the successfully translated segments.
      if (failure && values.every((value) => value === undefined)) throw failure
    } else {
      translated = (
        await translateWithGoogle(
          missing.map((item) => item.text),
          locale,
        )
      ).map((translatedText) => ({ translatedText }))
    }
    await Promise.all(
      missing.map(async (item, index) => {
        if (!translated[index] || values[item.index] !== undefined) return
        const text = decode(translated[index].translatedText)
        values[item.index] = text
        await saveTranslation(directory, ids[item.index], text)
      }),
    )
    if (memory.size > 20000) memory.clear()
  }
  return values
}
