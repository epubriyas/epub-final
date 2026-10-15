import { pageMetadata } from '@/lib/seo'
import { PageHero, ContentCTA, ArrowLink } from '@/components/editorial/Primitives'
import { CompanyMotion } from '@/components/company/CompanyMotion'
import { CompanyPageNav } from '@/components/company/CompanyPageNav'
import { AudienceInfographic } from '@/components/company/CompanyInfographics'
import { globalPresence } from '@/config/global-presence'
import styles from '../company.module.css'

export const metadata = pageMetadata({
  title: 'Global Delivery & Collaboration',
  description:
    'Explore Chennai-based production support, multilingual project requirements and international project communication and delivery with EPUBTRANS.',
  alternates: { canonical: '/company/global-presence' },
})

export default function GlobalPresence() {
  return (
    <CompanyMotion className={styles.page}>
      <PageHero
        eyebrow="COMPANY / GLOBAL DELIVERY"
        title="Global Delivery & Collaboration"
        description="Chennai-based production support for international publishing and localization workflows. Project scope, language requirements and delivery arrangements are agreed for each engagement."
      />
      <CompanyPageNav current="global" />
      <section className="et-container et-content-section">
        <p className="et-label">INTERNATIONAL PRODUCTION SUPPORT</p>
        <h2>Working across content, languages and locations.</h2>
        <AudienceInfographic />
        <div className="et-company-topics">
          {globalPresence.items.map((item) => (
            <article key={item.id} id={item.id} data-company-motion="section">
              <h3>{item.title}</h3>
              {item.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {item.id === 'locations' && (
                <ArrowLink href="/contact-us">Connect with our Chennai team</ArrowLink>
              )}
            </article>
          ))}
        </div>
        <ArrowLink href="/translation-services">Explore translation and localization</ArrowLink>
      </section>
      <ContentCTA />
    </CompanyMotion>
  )
}
