import type { Service } from '@/payload-types'
import { quoteServices } from '@/lib/validation/quote'

export type VisualKind =
  | 'layout'
  | 'xml'
  | 'reader'
  | 'editing'
  | 'language'
  | 'accessibility'
  | 'conversion'
  | 'audio'
  | 'subtitles'
  | 'learning'
  | 'design'
  | 'index'
export interface ServiceDesign {
  kind: VisualKind
  layout: 'editorial' | 'technical' | 'publication'
  headline?: string
  introduction: string
  source: string
  output: string
  related: string[]
  photo?: { src: string; alt: string }
}

// Presentation copy describes capabilities already present in the Services collection.
// Diagrams are illustrative examples, never customer work or evidence of compliance.
const designs: Record<string, ServiceDesign> = {
  'xml-jats': {
    kind: 'xml',
    layout: 'technical',
    introduction: 'Structured XML for Journal Publishing',
    source: 'Manuscript & Metadata',
    output: 'XML Delivery Package',
    related: [
      'scielo-xml-markup',
      'typesetting',
      'data-conversion',
      'ebook-creation',
      'accessibility',
    ],
  },
  typesetting: {
    kind: 'layout',
    layout: 'publication',
    headline: 'Give every page a considered shape.',
    introduction: 'Where content becomes a publication.',
    source: 'Source manuscript',
    output: 'Publication layout',
    related: ['desktop-publishing', 'proofreading', 'ebook-creation'],
  },
  'desktop-publishing': {
    kind: 'layout',
    layout: 'publication',
    headline: 'Your content. A layout that fits.',
    introduction: 'Keep language and layout working together.',
    source: 'Source document',
    output: 'Formatted publication',
    related: ['typesetting', 'translation', 'graphic-design-image-services'],
  },
  'scielo-xml-markup': {
    kind: 'xml',
    layout: 'technical',
    headline: 'Structure that gives scholarly content a next chapter.',
    introduction: 'Make publication content machine-readable.',
    source: 'Scholarly publication',
    output: 'Structured XML',
    related: ['data-conversion', 'typesetting', 'ebook-creation'],
  },
  'data-conversion': {
    kind: 'conversion',
    layout: 'technical',
    headline: 'Move content into the format you need.',
    introduction: 'A new format. A clear content structure.',
    source: 'Source files',
    output: 'Agreed output format',
    related: ['scielo-xml-markup', 'ebook-creation', 'desktop-publishing'],
  },
  'ebook-creation': {
    kind: 'reader',
    layout: 'publication',
    headline: 'Prepare your next edition for digital reading.',
    introduction: 'From publication content to a digital edition.',
    source: 'Publication source',
    output: 'Digital edition',
    related: ['typesetting', 'scielo-xml-markup', 'data-conversion'],
  },
  copyediting: {
    kind: 'editing',
    layout: 'editorial',
    headline: 'Clarity in every sentence. Consistency across the whole.',
    introduction: 'Care for the detail. Preserve the meaning.',
    source: 'Original manuscript',
    output: 'Reviewed copy',
    related: ['proofreading', 'typesetting'],
    photo: {
      src: '/industries/publishing.jpg',
      alt: 'A fountain pen on manuscript paper, representing editorial attention to detail',
    },
  },
  proofreading: {
    kind: 'editing',
    layout: 'editorial',
    headline: 'A considered final look before publication.',
    introduction: 'Bring the final details into focus.',
    source: 'Publication proof',
    output: 'Reviewed proof',
    related: ['copyediting', 'typesetting'],
  },
  translation: {
    kind: 'language',
    layout: 'editorial',
    headline: 'Carry your meaning into another language.',
    introduction: 'Language shaped by content and context.',
    source: 'Source-language content',
    output: 'Target-language content',
    related: ['desktop-publishing', 'elearning-localization', 'voiceover'],
  },
  accessibility: {
    kind: 'accessibility',
    layout: 'editorial',
    headline: 'Content with more ways to be read.',
    introduction: 'Build accessibility into the content structure.',
    source: 'Digital content',
    output: 'Reviewed content structure',
    related: ['ebook-creation', 'data-conversion'],
    photo: {
      src: '/industries/accessibility.jpg',
      alt: 'People reviewing digital content together on a laptop',
    },
  },
  transcription: {
    kind: 'audio',
    layout: 'technical',
    headline: 'Turn spoken content into useful written text.',
    introduction: 'From a recording to a structured transcript.',
    source: 'Source recording',
    output: 'Formatted transcript',
    related: ['voiceover', 'translation', 'subtitling'],
  },
  voiceover: {
    kind: 'audio',
    layout: 'editorial',
    headline: 'Give your content a spoken dimension.',
    introduction: 'A script prepared for sound.',
    source: 'Reviewed script',
    output: 'Voiceover audio',
    related: ['translation', 'elearning-localization', 'transcription'],
    photo: {
      src: '/industries/media.jpg',
      alt: 'A production clapperboard in use, representing multimedia production',
    },
  },
  subtitling: {
    kind: 'subtitles',
    layout: 'editorial',
    headline: 'Bring language, timing and picture together.',
    introduction: 'Written language that follows the scene.',
    source: 'Source video',
    output: 'Timed subtitle content',
    related: ['translation', 'transcription', 'voiceover'],
    photo: {
      src: '/industries/media.jpg',
      alt: 'A film production clapperboard, representing video and subtitle production',
    },
  },
  'elearning-localization': {
    kind: 'learning',
    layout: 'editorial',
    headline: 'Learning content prepared for another audience.',
    introduction: 'Consider language, format and the learning experience.',
    source: 'Learning content',
    output: 'Localized learning content',
    related: ['translation', 'voiceover', 'desktop-publishing'],
    photo: {
      src: '/industries/education.jpg',
      alt: 'Books and learning materials arranged in a classroom setting',
    },
  },
  'cover-page-design': {
    kind: 'design',
    layout: 'publication',
    headline: 'Give your publication its opening impression.',
    introduction: 'A cover shaped by the publication.',
    source: 'Publication brief',
    output: 'Cover artwork',
    related: ['typesetting', 'graphic-design-image-services', 'ebook-creation'],
  },
  'graphic-design-image-services': {
    kind: 'design',
    layout: 'publication',
    headline: 'Visual assets with a place in your content.',
    introduction: 'Design and image preparation for the final format.',
    source: 'Design requirements',
    output: 'Prepared visual assets',
    related: ['cover-page-design', 'desktop-publishing', 'typesetting'],
  },
  indexing: {
    kind: 'index',
    layout: 'technical',
    headline: 'Make the right detail easier to find.',
    introduction: 'Connect a publication’s topics to its pages.',
    source: 'Source publication',
    output: 'Organized index',
    related: ['copyediting', 'typesetting', 'ebook-creation'],
  },
}

const servicePhotoThemes: Record<VisualKind, NonNullable<ServiceDesign['photo']>> = {
  layout: {
    src: '/images/services/publishing-production.webp',
    alt: 'Illustrative publishing studio scene: a specialist reviews a printed book layout beside its digital edition.',
  },
  xml: {
    src: '/images/services/publishing-production.webp',
    alt: 'Illustrative production studio scene: an editor reviews print and digital publication materials.',
  },
  reader: {
    src: '/images/services/publishing-production.webp',
    alt: 'Illustrative publishing studio scene: a printed publication and tablet edition are reviewed together.',
  },
  editing: {
    src: '/images/services/editorial.webp',
    alt: 'Illustrative editorial studio scene: a copy editor reviews manuscript pages at a workstation.',
  },
  language: {
    src: '/images/services/localization.webp',
    alt: 'Illustrative localization studio scene: specialists review publication layouts together.',
  },
  accessibility: {
    src: '/industries/accessibility.jpg',
    alt: 'Colleagues reviewing digital content together on a laptop.',
  },
  conversion: {
    src: '/images/services/publishing-production.webp',
    alt: 'Illustrative publishing production scene with materials reviewed across print and digital formats.',
  },
  audio: {
    src: '/images/services/audio-production.webp',
    alt: 'Illustrative voiceover studio scene: a presenter records a script at a microphone.',
  },
  subtitles: {
    src: '/industries/media.jpg',
    alt: 'Film production setup representing video and subtitling work.',
  },
  learning: {
    src: '/images/services/localization.webp',
    alt: 'Illustrative learning localization scene: specialists review a publication and its localized layouts.',
  },
  design: {
    src: '/images/services/publishing-production.webp',
    alt: 'Illustrative book design scene: a designer reviews print and digital publication artwork.',
  },
  index: {
    src: '/images/services/editorial.webp',
    alt: 'Illustrative publishing studio scene: an editor reviews structured manuscript pages.',
  },
}

const serviceHeroPhotos: Record<string, NonNullable<ServiceDesign['photo']>> = {
  typesetting: {
    src: '/images/services/hero-typesetting.webp',
    alt: 'A typesetting specialist reviewing an academic book proof and page layout.',
  },
  'desktop-publishing': {
    src: '/images/services/hero-desktop-publishing.webp',
    alt: 'A desktop publishing specialist checking a publication layout on screen and in print.',
  },
  'scielo-xml-markup': {
    src: '/images/services/hero-scielo-xml-markup.webp',
    alt: 'A scholarly journal production specialist reviewing structured article files and proofs.',
  },
  'data-conversion': {
    src: '/images/services/hero-data-conversion.webp',
    alt: 'An archival digitization specialist converting manuscript pages into digital files.',
  },
  'ebook-creation': {
    src: '/images/services/hero-ebook-creation.webp',
    alt: 'A publishing specialist comparing an open book with its digital reader edition.',
  },
  copyediting: {
    src: '/images/services/hero-copyediting.webp',
    alt: 'A copy editor marking a manuscript proof at a publishing studio desk.',
  },
  proofreading: {
    src: '/images/services/hero-proofreading.webp',
    alt: 'A proofreader comparing final page proofs with a printed book.',
  },
  translation: {
    src: '/images/services/hero-translation.webp',
    alt: 'Two language professionals reviewing translated publication layouts together.',
  },
  accessibility: {
    src: '/images/services/hero-accessibility.webp',
    alt: 'An accessibility specialist auditing a digital publication with keyboard and screen reader tools.',
  },
  transcription: {
    src: '/images/services/hero-transcription.webp',
    alt: 'A transcription specialist listening to a recording and preparing notes at a workstation.',
  },
  voiceover: {
    src: '/images/services/hero-voiceover.webp',
    alt: 'A voice talent recording narration in a professional audio studio.',
  },
  subtitling: {
    src: '/images/services/hero-subtitling.webp',
    alt: 'Training video with synchronized subtitle text and corresponding timecoded subtitle entries.',
  },
  'elearning-localization': {
    src: '/images/services/hero-elearning-localization.webp',
    alt: 'A learning content team reviewing localized course materials on screen and tablet.',
  },
  'cover-page-design': {
    src: '/images/services/hero-cover-page-design.webp',
    alt: 'A book cover designer arranging cover concepts, paper mockups and color swatches.',
  },
  'graphic-design-image-services': {
    src: '/images/services/hero-graphic-design-image-services.webp',
    alt: 'A publication designer reviewing prepared book illustrations and image proofs.',
  },
  indexing: {
    src: '/images/services/hero-indexing.webp',
    alt: 'A scholarly indexer cross-referencing annotated pages and subject index notes.',
  },
}

export function serviceDesign(service: Pick<Service, 'slug' | 'title' | 'hero'>): ServiceDesign {
  const design = designs[service.slug] ?? {
    kind: 'conversion',
    layout: 'editorial',
    introduction: 'Your content, prepared for its next destination.',
    source: 'Source content',
    output: 'Agreed deliverable',
    related: [],
  }
  return {
    ...design,
    layout: service.hero?.layout || design.layout,
    photo: serviceHeroPhotos[service.slug] || design.photo || servicePhotoThemes[design.kind],
  }
}

export const serviceGroups = [
  {
    id: 'publishing',
    title: 'Publishing & content',
    description: 'Editorial detail, publication design and structured digital editions.',
  },
  {
    id: 'language',
    title: 'Language & localization',
    description: 'Written content and layouts prepared for another audience.',
  },
  {
    id: 'media',
    title: 'Media & multimedia',
    description: 'Spoken, written and timed content for multimedia projects.',
  },
  {
    id: 'learning',
    title: 'Learning',
    description: 'Learning content adapted across languages and formats.',
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    description: 'Structure and presentation considered for accessible reading.',
  },
] as const

export function serviceGroup(
  service: Pick<Service, 'slug' | 'category'>,
): (typeof serviceGroups)[number]['id'] {
  if (service.category === 'accessibility') return 'accessibility'
  if (service.slug === 'elearning-localization') return 'learning'
  if (['voiceover', 'transcription', 'subtitling'].includes(service.slug)) return 'media'
  if (service.category === 'translation-localization') return 'language'
  return 'publishing'
}

export function serviceQuoteHref(service: Pick<Service, 'slug' | 'category'>) {
  if (['ebook-creation', 'scielo-xml-markup'].includes(service.slug)) {
    return `/get-a-quote?service=${encodeURIComponent(quoteServices[1])}`
  }
  if (service.slug === 'data-conversion') {
    return `/get-a-quote?service=${encodeURIComponent(quoteServices[2])}`
  }
  const mapping = {
    publishing: quoteServices[0],
    language: quoteServices[3],
    media: quoteServices[4],
    learning: quoteServices[4],
    accessibility: quoteServices[5],
  }
  return `/get-a-quote?service=${encodeURIComponent(mapping[serviceGroup(service)])}`
}

export function relatedPublishedServices(service: Service, catalog: Service[]) {
  const explicit =
    service.relatedServices?.map((value) => (typeof value === 'object' ? value.id : value)) ?? []
  const candidates = explicit.length
    ? explicit.map((id) => catalog.find((item) => item.id === id))
    : serviceDesign(service).related.map((slug) => catalog.find((item) => item.slug === slug))
  const seen = new Set<number>([service.id])
  return candidates
    .filter((item): item is Service => {
      if (!item || item.status !== 'published' || seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
    .slice(0, 3)
}
