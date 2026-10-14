import { pageMetadata } from '@/lib/seo'
import { PageHero, ContentCTA, ArrowLink } from '@/components/editorial/Primitives'
import { CompanyMotion } from '@/components/company/CompanyMotion'
import { CompanyPageNav } from '@/components/company/CompanyPageNav'
import { AudienceInfographic } from '@/components/company/CompanyInfographics'
import { globalPresence } from '@/config/global-presence'
import styles from '../company.module.css'

export const metadata = pageMetadata({
  title: 'Global Presence',
  description:
    'Explore EPUBTRANS’s global capabilities, Chennai location, language coverage and approach to regional localization.',
  alternates: { canonical: '/company/global-presence' },
})

export default function GlobalPresence() {
  return (
    <CompanyMotion className={styles.page}>
      <PageHero
        eyebrow="COMPANY / GLOBAL PRESENCE"
        title="New audiences. Carefully considered content."
        description="From Chennai to your next audience, connect language, layout and local context. Explore how EPUBTRANS helps prepare content for different markets and ways of reading."
      />
      <CompanyPageNav current="global" />
      <section className="et-container et-content-section">
        <p className="et-label">CONTENT ACROSS CULTURES</p>
        <h2>Built around the people you want to reach.</h2>
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
