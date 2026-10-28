import handoffTranscription from '@/config/service-handoffs/transcription.json'
import handoffTranslation from '@/config/service-handoffs/translation.json'
import handoffTypesetting from '@/config/service-handoffs/typesetting.json'
import handoffEbookCreation from '@/config/service-handoffs/ebook-creation.json'
import handoffDesktopPublishing from '@/config/service-handoffs/desktop-publishing.json'
import handoffDataConversion from '@/config/service-handoffs/data-conversion.json'
import handoffAccessibility from '@/config/service-handoffs/accessibility.json'
import handoffElearningLocalization from '@/config/service-handoffs/elearning-localization.json'
import handoffProofreading from '@/config/service-handoffs/proofreading.json'
import copyediting from '@/config/service-handoffs/copyediting.json'
import coverPageDesign from '@/config/service-handoffs/cover-page-design.json'
import voiceover from '@/config/service-handoffs/voiceover.json'
import subtitling from '@/config/service-handoffs/subtitling.json'
import graphicDesign from '@/config/service-handoffs/graphic-design-image-services.json'
import scieloXmlMarkup from '@/config/service-handoffs/scielo-xml-markup.json'
import xmlJats from '@/config/service-handoffs/xml-jats.json'

export type HandoffBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'subheading'; text: string }
  | { kind: 'linked-paragraph'; before: string; text: string; href: string; after?: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'link'; text: string; href: string; primary: boolean }

export interface HandoffGroup {
  title: string
  blocks: HandoffBlock[]
  href?: string | null
}

export function compactWorkflow<T>(
  steps: readonly T[],
  mergeSteps: (steps: readonly T[]) => T,
): T[] {
  // Keep short workflows intact. Longer workflows are grouped evenly in source order.
  if (steps.length <= 6) return [...steps]
  return Array.from({ length: 4 }, (_, index) => {
    const start = Math.ceil((index * steps.length) / 4)
    const end = Math.ceil(((index + 1) * steps.length) / 4)
    const group = steps.slice(start, end)
    return group.length === 1 ? group[0] : mergeSteps(group)
  })
}

export interface HandoffSection {
  anchorId?: string
  title: string
  kind: 'narrative' | 'capabilities' | 'workflow' | 'quality' | 'scope' | 'related' | 'faq' | 'cta'
  lead: HandoffBlock[]
  groups: HandoffGroup[]
}

export interface ServiceHandoff {
  sourceDocument: string
  slug: string
  sourceCopyBlockCount: number
  showTransformation?: boolean
  seo: { title: string; description: string }
  hero: { title: string; lead: string; paragraphs: string[]; actions: HandoffBlock[] }
  sections: HandoffSection[]
}

// Document copy is a separate, reviewable content layer; CMS identities and visual assets stay intact.
const handoffs: Record<string, ServiceHandoff> = {
  transcription: handoffTranscription as ServiceHandoff,
  translation: handoffTranslation as ServiceHandoff,
  typesetting: handoffTypesetting as ServiceHandoff,
  'ebook-creation': handoffEbookCreation as ServiceHandoff,
  'desktop-publishing': handoffDesktopPublishing as ServiceHandoff,
  'data-conversion': handoffDataConversion as ServiceHandoff,
  accessibility: handoffAccessibility as ServiceHandoff,
  'elearning-localization': handoffElearningLocalization as ServiceHandoff,
  proofreading: handoffProofreading as ServiceHandoff,
  copyediting: copyediting as ServiceHandoff,
  'cover-page-design': coverPageDesign as ServiceHandoff,
  voiceover: voiceover as ServiceHandoff,
  subtitling: subtitling as ServiceHandoff,
  'graphic-design-image-services': graphicDesign as ServiceHandoff,
  'scielo-xml-markup': scieloXmlMarkup as ServiceHandoff,
  'xml-jats': xmlJats as ServiceHandoff,
}

export function getServiceHandoff(slug: string): ServiceHandoff | undefined {
  return Object.hasOwn(handoffs, slug) ? handoffs[slug] : undefined
}
