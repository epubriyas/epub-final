import { navigation } from './navigation'
import type { NavigationSection } from '@/types/navigation'

// Header-only handoff from Website Revamp (2), sections 5–7.
// Keep the shared navigation export intact because the footer also consumes it.
const services: NavigationSection = {
  ...navigation[0],
  groups: [
    {
      title: 'Publishing & Editorial Services',
      items: [
        { label: 'Typesetting Services', href: '/typesetting-services' },
        { label: 'Copyediting Services', href: '/copyediting-services' },
        { label: 'Proofreading Services', href: '/proofreading-services' },
        { label: 'Graphic Design & Image Services', href: '/graphic-design-image-services' },
        { label: 'Cover Page Design Services', href: '/cover-page-design-services' },
      ],
    },
    {
      title: 'eBook, XML & Structured Content',
      items: [
        { label: 'eBook Creation Services', href: '/ebook-creation-services' },
        { label: 'SciELO XML Markup Services', href: '/scielo-xml-markup-services' },
        { label: 'XML & JATS Conversion Services', href: '/xml-conversion-services' },
      ],
    },
    {
      title: 'Document & Data Conversion',
      items: [
        { label: 'Data Conversion Services', href: '/data-conversion-services#pdf-to-word-ocr' },
        { label: 'PDF Recreation Services', href: '/data-conversion-services#pdf-recreation' },
      ],
    },
    {
      title: 'Localization & Multilingual Production',
      items: [
        { label: 'Desktop Publishing Services', href: '/desktop-publishing-services' },
        { label: 'Translation Services', href: '/translation-services' },
      ],
    },
    {
      title: 'eLearning & Multimedia',
      items: [
        { label: 'eLearning Localization Services', href: '/elearning-localization-services' },
        { label: 'Subtitling Services', href: '/subtitling-services' },
        { label: 'Voiceover Services', href: '/voiceover-services' },
        { label: 'Transcription Services', href: '/transcription-services' },
      ],
    },
    {
      title: 'Digital Accessibility',
      items: [{ label: 'Accessibility Services', href: '/accessibility-services' }],
    },
  ],
}

export const headerNavigation: NavigationSection[] = [services, ...navigation.slice(1)]
