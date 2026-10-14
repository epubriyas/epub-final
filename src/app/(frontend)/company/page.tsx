import { AboutPage, aboutMetadata } from '@/components/company/AboutPage'

// Keep the existing staging and navigation route while production uses /about-us.
export const metadata = aboutMetadata

export default function Company() {
  return <AboutPage />
}
