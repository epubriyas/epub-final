import tamil from './ta.json'

const normalize = (source: string) => source.replace(/\s+/g, ' ').trim()
const tamilCopy = new Map(
  Object.entries(tamil).map(([source, translation]) => [normalize(source), translation]),
)
const tamilFolded = new Map<string, string>()
for (const [source, translation] of tamilCopy)
  if (!tamilFolded.has(source.toLowerCase())) tamilFolded.set(source.toLowerCase(), translation)
const unchanged = new Set(['Aa', 'XML', 'EPUB', 'PDF', 'Mobi', 'EPUBTRANS', 'SciELO'])

// Explicit public copy takes precedence over old machine translations in the cache.
export function fixedTranslation(source: string, locale: string): string | undefined {
  const text = normalize(source)
  if (unchanged.has(text)) return text
  return locale === 'ta' ? tamilCopy.get(text) || tamilFolded.get(text.toLowerCase()) : undefined
}
