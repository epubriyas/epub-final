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
        { label: 'Typesetting Service', href: '/typesetting-services' },
        { label: 'Copyediting Service', href: '/copyediting-services' },
        { label: 'Proofreading Service', href: '/proofreading-services' },
        { label: 'Graphic Design & Image Service', href: '/graphic-design-image-services' },
        { label: 'Cover Page Design Service', href: '/cover-page-design-services' },
      ],
    },
    {
      title: 'eBook, XML & Structured Content',
      items: [
        { label: 'eBook Creation Service', href: '/ebook-creation-services' },
        { label: 'SciELO XML Markup Service', href: '/scielo-xml-markup-services' },
        { label: 'XML & JATS Conversion Service', href: '/xml-conversion-services' },
      ],
    },
    {
      title: 'Document & Data Conversion',
      items: [
        { label: 'Data Conversion Service', href: '/data-conversion-services' },
        { label: 'PDF Recreation Service', href: '/data-conversion-services' },
      ],
    },
    {
      title: 'Localization & Multilingual Production',
      items: [
        { label: 'Desktop Publishing Service', href: '/desktop-publishing-services' },
        { label: 'Translation Service', href: '/translation-services' },
      ],
    },
    {
      title: 'eLearning & Multimedia',
      items: [
        { label: 'eLearning Localization Service', href: '/elearning-localization-services' },
        { label: 'Subtitling Service', href: '/subtitling-services' },
        { label: 'Voiceover Service', href: '/voiceover-services' },
        { label: 'Transcription Service', href: '/transcription-services' },
      ],
    },
    {
      title: 'Digital Accessibility',
      items: [{ label: 'Accessibility Service', href: '/accessibility-services' }],
    },
  ],
}

export const headerNavigation: NavigationSection[] = [services, ...navigation.slice(1)]
