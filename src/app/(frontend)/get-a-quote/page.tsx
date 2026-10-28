import type { Metadata } from 'next'
import Link from '@/components/i18n/LocalizedLink'
import { ArrowRight } from 'lucide-react'
import { QuoteJourney } from '@/components/forms/QuoteJourney'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { quoteServices } from '@/lib/validation/quote'
import { getServerSideURL } from '@/utilities/getURL'
import { siteCanBeIndexed } from '@/lib/site-indexing.cjs'

const indexingApproved =
  siteCanBeIndexed(getServerSideURL(), process.env.VERCEL_ENV) &&
  process.env.EPUBTRANS_INDEXING_APPROVED === 'true'

export const metadata: Metadata = {
  title: { absolute: 'Request a Project Quote | EPUBTRANS' },
  description:
    'Request a project assessment from EPUBTRANS. Share your source files, output formats and requirements for publishing, conversion, accessibility or localization.',
  ...(indexingApproved ? { alternates: { canonical: '/get-a-quote' } } : {}),
  ...(indexingApproved ? {} : { robots: { index: false, follow: false } }),
}

export default async function Quote({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>
}) {
  const service = (await searchParams).service
  const initialService =
    typeof service === 'string' && quoteServices.some((value) => value === service) ? service : ''
  return (
    <main className="et-quote-page quote-premium">
      <div className="et-container qp-wrap">
        <header className="qp-intro">
          <p className="et-label">GET A QUOTE</p>
          <h1>A clear brief. A considered next step.</h1>
          <p>Tell us what you need. Share the details you have, and we can clarify the rest.</p>
        </header>
        <QuoteForm key={initialService} initialService={initialService} />
        <QuoteJourney />
        <div className="qp-support">
          <p>Still defining your requirements? We can start with a conversation.</p>
          <Link href="/contact-us">
            Contact our team <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  )
}
