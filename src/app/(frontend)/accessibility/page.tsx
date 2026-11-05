import { pageMetadata } from '@/lib/seo'
import { PageHero } from '@/components/editorial/Primitives'
import { COMPANY_EMAIL } from '@/config/contact'
export const metadata = pageMetadata({ title: 'Accessibility' })

export default function Accessibility() {
  return (
    <main>
      <PageHero
        eyebrow="ACCESSIBILITY"
        title="Content should be within reach."
        description="This preview supports keyboard navigation, visible focus, reduced motion preferences and labelled form controls."
      />
      <section className="et-container et-content-section">
        <h2>Tell us about a barrier.</h2>
        <p className="et-lead">
          If a page or interaction prevents you from accessing information, email{' '}
          <a className="et-text-link" href={`mailto:${COMPANY_EMAIL}`}>
            {COMPANY_EMAIL}
          </a>
          . Include the page and the difficulty you encountered.
        </p>
        <p>
          This is a design target and implementation statement, not a claim of independent WCAG
          certification.
        </p>
      </section>
    </main>
  )
}
