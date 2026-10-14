import type { Metadata } from 'next'
const indexingApproved =
  process.env.VERCEL_ENV === 'production' && process.env.EPUBTRANS_INDEXING_APPROVED === 'true'
export { default } from '../contact/page'

export const metadata: Metadata = {
  title: { absolute: 'Contact EPUBTRANS | Publishing & Content Services' },
  description:
    'Contact EPUBTRANS to discuss digital publishing, document conversion, XML, accessibility, multilingual DTP and localization production requirements.',
  ...(indexingApproved ? { alternates: { canonical: '/contact-us' } } : {}),
  ...(indexingApproved ? {} : { robots: { index: false, follow: false } }),
}
