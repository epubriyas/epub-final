import 'server-only'
import { contentPayload } from '@/lib/content'
import publicUITexts from './public-ui-texts.json'
import tamil from './ta.json'
import { technologyTopics, productionOS, developmentSteps } from '@/config/technology'
import { technologyGuides } from '@/config/technology-guides'
export const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim()
let catalog: { expires: number; texts: Set<string> } | undefined
let building: Promise<Set<string>> | undefined
export async function getPublicTranslationCatalog(): Promise<Set<string>> {
  if (catalog && catalog.expires > Date.now()) return catalog.texts
  if (building) return building
  building = (async () => {
    const texts = new Set([...publicUITexts, ...Object.keys(tamil)].map(normalizeText))
    const payload = await contentPayload()
    function collect(value: unknown) {
      if (typeof value === 'string') {
        const text = normalizeText(value)
        if (text.length <= 5000) texts.add(text)
      } else if (Array.isArray(value)) value.forEach(collect)
      else if (value && typeof value === 'object')
        for (const [key, item] of Object.entries(value)) {
          if (
            ![
              'password',
              'email',
              'phone',
              'path',
              'url',
              'filename',
              'updatedAt',
              'createdAt',
              'id',
              'source',
              'applicationEmail',
            ].includes(key)
          )
            collect(item)
        }
    }
    collect(technologyTopics)
    collect(productionOS)
    collect(developmentSteps)
    collect(technologyGuides)
    for (const collection of [
      'services',
      'solutions',
      'industries',
      'technologies',
      'resources',
      'careers',
      'case-studies',
      'categories',
      'pages',
      'posts',
    ] as const) {
      const result = await payload.find({
        collection,
        overrideAccess: false,
        pagination: false,
        depth: 0,
      })
      result.docs.forEach(collect)
    }
    catalog = { expires: Date.now() + 60000, texts }
    return texts
  })()
  try {
    return await building
  } finally {
    building = undefined
  }
}
