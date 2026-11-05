import { pageMetadata } from '@/lib/seo'
import { PageHero } from '@/components/editorial/Primitives'
import { COMPANY_EMAIL } from '@/config/contact'
export const metadata = pageMetadata({
  title: 'Privacy information',
  robots: { index: false, follow: true },
})

export default function Privacy() {
  return (
    <main>
      <PageHero
        eyebrow="PRIVACY INFORMATION"
        title="Your project information."
        description="Quote requests collect the information you provide so EPUBTRANS can review and respond to your project."
      />
      <section className="et-container et-content-section">
        <h2>What the form collects</h2>
        <p>
          The quote form records your name, email, company if provided, requested service, language
          requirements, project description, optional deadline and uploaded project files.
        </p>
        <h2>Questions about your information</h2>
        <p>
          Contact{' '}
          <a className="et-text-link" href={`mailto:${COMPANY_EMAIL}`}>
            {COMPANY_EMAIL}
          </a>{' '}
          to ask about your request or the information you submitted.
        </p>
        <div className="et-empty">
          <h2>Full privacy policy awaiting review.</h2>
          <p>
            Data retention, legal basis and regional rights must be reviewed and published by
            EPUBTRANS before this site launches publicly.
          </p>
        </div>
      </section>
    </main>
  )
}
