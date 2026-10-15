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
        { label: 'Typesetting', href: '/typesetting-services' },
        { label: 'Copyediting', href: '/copyediting-services' },
        { label: 'Proofreading', href: '/proofreading-services' },
        { label: 'Graphic Design & Image', href: '/graphic-design-image-services' },
        { label: 'Cover Page Design', href: '/cover-page-design-services' },
      ],
    },
    {
      title: 'eBook, XML & Structured Content',
      items: [
        { label: 'eBook Creation', href: '/ebook-creation-services' },
        { label: 'SciELO XML Markup', href: '/scielo-xml-markup-services' },
        { label: 'XML & JATS Conversion', href: '/xml-conversion-services' },
      ],
    },
    {
      title: 'Document & Data Conversion',
      items: [
        { label: 'Data Conversion', href: '/data-conversion-services' },
        { label: 'PDF Recreation', href: '/data-conversion-services' },
      ],
    },
    {
      title: 'Localization & Multilingual Production',
      items: [
        { label: 'Desktop Publishing', href: '/desktop-publishing-services' },
        { label: 'Translation', href: '/translation-services' },
      ],
    },
    {
      title: 'eLearning & Multimedia',
      items: [
        { label: 'eLearning Localization', href: '/elearning-localization-services' },
        { label: 'Subtitling', href: '/subtitling-services' },
        { label: 'Voiceover', href: '/voiceover-services' },
        { label: 'Transcription', href: '/transcription-services' },
      ],
    },
    {
      title: 'Digital Accessibility',
      items: [{ label: 'Accessibility', href: '/accessibility-services' }],
    },
  ],
}

export const headerNavigation: NavigationSection[] = [services, ...navigation.slice(1)]
