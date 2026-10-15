import Link from '@/components/i18n/LocalizedLink'
import { BriefcaseBusiness, MapPin, Clock3, ArrowUpRight, Mail } from 'lucide-react'
import { pageMetadata } from '@/lib/seo'
import { listContent, getSiteSettings } from '@/lib/content'
import { ArrowLink } from '@/components/editorial/Primitives'
import { CompanyPageNav } from '@/components/company/CompanyPageNav'
import { CareerInfographic, CareerDisciplines } from '@/components/company/CareerInfographic'
import { BlogMotion as CareersMotion } from '@/components/blog/BlogMotion'
import { employmentLabel, applicationHref, roleSummary } from '@/lib/careers'
import styles from './careers.module.css'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'Careers',
  description:
    'Explore publishing, localization and digital content careers at EPUBTRANS. Read current role requirements and introduce your skills to our team.',
  alternates: { canonical: '/company/careers' },
})
export default async function Careers() {
  const [careers, settings] = await Promise.all([listContent('careers'), getSiteSettings()])
  const email = settings.email || 'info@epubtrans.com'
  return (
    <CareersMotion className={styles.page}>
      <header className={`et-container ${styles.hero}`}>
        <div>
          <p className="et-label">COMPANY / CAREERS</p>
          <h1>Careers at EPUBTRANS</h1>
          <p>
            Bring your care for words, languages and digital content to the work behind every
            edition. Explore the opportunities that fit your experience and ambitions.
          </p>
          <Link className="et-button" href="/company/careers#open-roles">
            Explore open roles <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <CareerInfographic />
      </header>
      <CompanyPageNav current="careers" />
      <section id="life-at-epubtrans" className={`et-container ${styles.section}`}>
        <p className="et-label">AREAS OF WORK</p>
        <h2>Areas of Work</h2>
        <p className={styles.intro}>
          Publishing brings together people who care about clarity, design and detail. Our work
          connects editorial judgement, language knowledge and digital production to help content
          reach its next audience.
        </p>
        <CareerDisciplines />
        <ArrowLink href="/services">Discover the work behind our services</ArrowLink>
      </section>
      <section id="open-roles" className={`et-container ${styles.section} ${styles.openings}`}>
        <div className={styles.sectionTop}>
          <div>
            <p className="et-label">CURRENT OPPORTUNITIES</p>
            <h2>Current Opportunities</h2>
          </div>
          <p>
            {careers.length} {careers.length === 1 ? 'open role' : 'open roles'}
          </p>
        </div>
        {careers.length ? (
          <div className={styles.roles}>
            {careers.map((role) => (
              <article key={role.id} className={styles.roleCard}>
                <span className="et-label">OPEN ROLE</span>
                <h3>{role.title}</h3>
                {role.description && <p>{roleSummary(role.description)}</p>}
                <div className={styles.facts}>
                  {role.location && (
                    <span>
                      <MapPin size={16} aria-hidden="true" />
                      {role.location}
                    </span>
                  )}
                  {role.employmentType && (
                    <span>
                      <Clock3 size={16} aria-hidden="true" />
                      {employmentLabel(role.employmentType)}
                    </span>
                  )}
                </div>
                <div className={styles.roleActions}>
                  <Link href={`/company/careers/${encodeURIComponent(role.slug)}`}>
                    View role & requirements <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                  <a href={applicationHref(role, email)}>
                    Apply by email <Mail size={16} aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <BriefcaseBusiness size={36} strokeWidth={1.3} aria-hidden="true" />
            <h3>No open roles published at the moment.</h3>
            <p>
              Check back for new opportunities. You can also introduce your skills and area of
              interest to our team to ask about future openings.
            </p>
            <div className={styles.roleActions}>
              <a
                href={`mailto:${email}?subject=${encodeURIComponent('Future career opportunities at EPUBTRANS')}`}
              >
                Introduce yourself <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </section>
      <section id="application-process" className={`et-container ${styles.section} ${styles.internship}`}>
        <div>
          <p className="et-label">APPLICATION PROCESS</p>
          <h2>Applying for a role</h2>
          <p className={styles.intro}>
            Review the requirements and application instructions in the relevant opening. Prepare an
            introduction explaining your experience, skills and availability, with relevant work
            samples where requested.
          </p>
          <div className={styles.roleActions}>
            <Link href="/company/careers#open-roles">
              View current opportunities <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className={styles.checklist}>
          <h3>A clear introduction helps.</h3>
          <ul>
            {[
              'Your course of study or relevant experience',
              'Your skills and area of interest',
              'Your location and preferred dates',
              'Relevant work samples or a portfolio link',
            ].map((text, index) => (
              <li key={text}>
                <span>0{index + 1}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </CareersMotion>
  )
}
