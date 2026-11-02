import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { languages } from '../src/config/languages.ts'

// Ship cached PUBLIC translations with the app, including on read-only hosts.
// Do not export arbitrary cache entries or visitor-supplied text.
const texts = JSON.parse(readFileSync('src/lib/i18n/public-ui-texts.json', 'utf8'))
const output = 'src/lib/i18n/bundled.json'
const bundled = existsSync(output) ? JSON.parse(readFileSync(output, 'utf8')) : {}
const directory = process.env.TRANSLATION_CACHE_DIR || '.translation-cache'
for (const { code } of languages.filter(({ code }) => code !== 'en')) {
  for (const text of texts) {
    for (const prefix of ['google-v1\0', 'free-google-v1\0', '', 'mymemory\0']) {
      const id = createHash('sha256').update(`${prefix}${code}\0${text}`).digest('hex')
      const file = path.join(directory, `${id}.txt`)
      if (!existsSync(file)) continue
      const translated = readFileSync(file, 'utf8')
      if (translated.trim() && translated.length <= 20000) {
        bundled[code] ||= {}
        bundled[code][text] = translated
      }
      break
    }
  }
}
writeFileSync(output, JSON.stringify(bundled, null, 2) + '\n')
console.log('Saved public translations for', Object.keys(bundled).length, 'languages.')
