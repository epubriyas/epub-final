import Link from '@/components/i18n/LocalizedLink'
import Image from 'next/image'
import { BriefcaseBusiness, MapPin, Clock3, ArrowUpRight, ArrowDown, Mail } from 'lucide-react'
import { pageMetadata } from '@/lib/seo'
import { listContent, getSiteSettings } from '@/lib/content'
import { ArrowLink } from '@/components/editorial/Primitives'
import { CompanyPageNav } from '@/components/company/CompanyPageNav'
import { CareerInfographic, CareerDisciplines } from '@/components/company/CareerInfographic'
import { BlogMotion as CareersMotion } from '@/components/blog/BlogMotion'
import { employmentLabel, applicationHref, roleSummary } from '@/lib/careers'
import styles from './careers-listing.module.css'

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
      <header className={styles.hero}>
        <div className={`et-container ${styles.heroInner}`}>
          <div className={styles.heroCopy} data-blog-motion>
            <p className={styles.heroEyebrow}>
              <span /> CAREERS AT EPUBTRANS
            </p>
            <h1>
              Build a career
              <br />
              in <em>content.</em>
            </h1>
            <p className={styles.heroIntro}>
              Bring your expertise to the work that connects words, languages and people. Explore
              your next opportunity in publishing and digital production.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/company/careers#open-roles">
                Explore open roles <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
              <Link className={styles.heroSecondary} href="/company/careers#application-process">
                How to apply <ArrowDown size={16} aria-hidden="true" />
              </Link>
            </div>
            <p className={styles.heroFootnote}>
              PUBLISHING <span /> LANGUAGE <span /> DIGITAL PRODUCTION
            </p>
          </div>
          <figure className={styles.heroVisual} data-blog-motion>
            <div className={styles.heroImage}>
              <Image
                src="/images/insights/collaboration.jpg"
                alt="People collaborating around a table with laptops and project materials"
                fill
                priority
                sizes="(max-width: 850px) 100vw, 48vw"
              />
            </div>
            <figcaption>
              <span>DIFFERENT SKILLS. SHARED PURPOSE.</span>
              <p>
                Thoughtful people.
                <br />
                Meaningful work.
              </p>
              <ArrowUpRight size={30} strokeWidth={1.2} aria-hidden="true" />
            </figcaption>
          </figure>
        </div>
      </header>
      <CompanyPageNav current="careers" />
      <section id="life-at-epubtrans" className={`et-container ${styles.section}`}>
        <div className={styles.sectionIntro} data-blog-motion>
          <div>
            <p className="et-label">FIND YOUR AREA OF EXPERTISE</p>
            <h2>
              Different disciplines.
              <br />
              One connected world of work.
            </h2>
          </div>
          <div>
            <p className={styles.intro}>
              Behind every publication is a team of people who care about getting the details right.
              Discover where your skills connect with our work.
            </p>
            <ArrowLink href="/services">Discover our work</ArrowLink>
          </div>
        </div>
        <CareerDisciplines />
      </section>
      <section id="open-roles" className={styles.openings}>
        <div className={`et-container ${styles.section}`}>
          <div className={styles.sectionTop} data-blog-motion>
            <div>
              <p className="et-label">CURRENT OPPORTUNITIES</p>
              <h2>Find your next opportunity.</h2>
              <p className={styles.openingsIntro}>
                Explore published roles and the expertise we’re looking for.
              </p>
            </div>
            <p>
              {careers.length} {careers.length === 1 ? 'open role' : 'open roles'}
            </p>
          </div>
          {careers.length ? (
            <div className={styles.roles}>
              {careers.map((role, index) => (
                <article key={role.id} className={styles.roleCard} data-blog-motion>
                  <span className={styles.roleNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <div className={styles.roleDetails}>
                    <span className="et-label">OPEN ROLE</span>
                    <h3>{role.title}</h3>
                    {role.description && <p>{roleSummary(role.description)}</p>}
                  </div>
                  <div className={styles.roleMeta}>
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
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.empty} data-blog-motion>
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
          <div className={styles.talentNote} data-blog-motion>
            <div>
              <Mail size={22} strokeWidth={1.4} aria-hidden="true" />
              <div>
                <h3>Don’t see the right fit?</h3>
                <p>Introduce your skills and area of interest for future opportunities.</p>
              </div>
            </div>
            <a
              href={`mailto:${email}?subject=${encodeURIComponent('Future career opportunities at EPUBTRANS')}`}
            >
              Contact the team <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
      <section id="application-process" className={`et-container ${styles.section}`}>
        <div className={styles.sectionIntro} data-blog-motion>
          <div>
            <p className="et-label">APPLICATION PROCESS</p>
            <h2>
              A clear path
              <br />
              to your introduction.
            </h2>
          </div>
          <div>
            <p className={styles.intro}>
              Start with the role requirements. Tell us about your relevant experience, your skills
              and the work you want to do next. Each opening has its own application instructions.
            </p>
          </div>
        </div>
        <CareerInfographic />
        <div className={styles.checklist} data-blog-motion>
          <h3>What to include</h3>
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
      <section className={styles.closing} data-blog-motion>
        <div className={`et-container ${styles.closingInner}`}>
          <div>
            <p className={styles.heroEyebrow}>YOUR SKILLS. OUR NEXT CHAPTER.</p>
            <h2>Let’s do good work together.</h2>
          </div>
          <Link className={styles.primaryButton} href="/company/careers#open-roles">
            Explore opportunities <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </CareersMotion>
  )
}
