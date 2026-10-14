import type { Metadata } from 'next'
import Link from '@/components/i18n/LocalizedLink'
import { ArrowRight } from 'lucide-react'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { quoteServices } from '@/lib/validation/quote'

const indexingApproved =
  process.env.VERCEL_ENV === 'production' && process.env.EPUBTRANS_INDEXING_APPROVED === 'true'

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
        <section className="qp-next" aria-labelledby="quote-next-heading">
          <div className="qp-next-heading">
            <p className="et-label">AFTER YOUR ENQUIRY</p>
            <h2 id="quote-next-heading">From brief to next steps.</h2>
          </div>
          <div className="qp-next-grid">
            <article>
              <span>01</span>
              <h3>Review your requirements</h3>
              <p>We review your service, source formats, deliverables and preferred timeline.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Clarify the scope</h3>
              <p>
                Where needed, we discuss specifications, representative files and production
                requirements.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Discuss the project</h3>
              <p>With the scope understood, we can assess the work and discuss the next steps.</p>
            </article>
          </div>
          <p className="qp-estimate-note">
            Estimates and delivery commitments depend on reviewing your project details.
          </p>
        </section>
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
