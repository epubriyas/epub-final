import { landingMetadata } from '@/lib/landing-seo'
import { getLandingContent } from '@/lib/landing-content'
import { ServicesDirectory } from '@/components/services/ServicesDirectory'
export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const {
    directory: { seo },
  } = await getLandingContent()
  return landingMetadata(seo)
}

export default async function ServicesPage() {
  const { directory } = await getLandingContent()
  return <ServicesDirectory content={directory} />
}
