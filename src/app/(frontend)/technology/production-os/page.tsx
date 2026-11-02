import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import Link from '@/components/i18n/LocalizedLink'
import { ProductionConsole } from '@/components/technology/ProductionConsole'
import { productionOS } from '@/config/technology'
import { pageMetadata } from '@/lib/seo'
import styles from '@/components/technology/technology-premium.module.css'

export const metadata = pageMetadata({
  title: 'EPUBTRANS Production OS',
  description:
    'Inside our Production OS initiative: an interactive concept for connected production information, clearer handoffs and specialist review.',
  alternates: { canonical: '/technology/production-os' },
})

export default function ProductionOSPage() {
  return (
    <main className={styles.page}>
      <section className={styles.osHero} aria-labelledby="production-os-page-title">
        <div className={styles.wrap}>
          <Link className={styles.back} href="/technology#production-os">
            <ArrowLeft size={15} aria-hidden="true" /> Back to Technology
          </Link>
          <div className={styles.osHeroTitle}>
            <span className={styles.status}>
              <span /> INTERNAL INITIATIVE · IN DEVELOPMENT
            </span>
            <h1 id="production-os-page-title">
              Production OS.
              <br />
              <span>The work, connected.</span>
            </h1>
            <p>
              An internal initiative shaped around a simple idea: production works better when the
              context, the task and the people stay connected.
            </p>
          </div>
          <ProductionConsole />
          <p className={styles.osCaption}>
            Explore the stages in this illustrative concept. Production OS is in development; this
            is not a live application or a customer product.
          </p>
        </div>
      </section>
      <section className={`${styles.wrap} ${styles.section}`} aria-labelledby="os-direction">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>THE DIRECTION</p>
            <h2 id="os-direction">
              Less fragmented work.
              <br />
              <span>More shared context.</span>
            </h2>
          </div>
          <p>
            A production project carries requirements, files, decisions and review responsibilities.
            Production OS explores how that information could stay connected as work moves between
            teams.
          </p>
        </div>
        <div className={styles.qualityGrid}>
          {productionOS.areas.slice(0, 3).map((area, index) => (
            <article key={area.title}>
              <p className={styles.eyebrow}>0{index + 1} / DEVELOPMENT FOCUS</p>
              <h3 style={{ marginTop: 18 }}>{area.title}</h3>
              <p>{area.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.quality}>
        <div className={`${styles.wrap} ${styles.section} ${styles.development}`}>
          <div>
            <p className={styles.eyebrow}>DESIGNED WITH PRODUCTION TEAMS</p>
            <h2>
              Start with a need.
              <br />
              <span>Learn from the work.</span>
            </h2>
            <p>
              The initiative develops through conversations with production specialists, focused
              prototypes and review of real operational requirements.
            </p>
          </div>
          <ol>
            {[
              {
                title: 'Requirements before features',
                text: 'Clarify where context is lost, which handoffs need support and what information matters.',
              },
              {
                title: 'Focused concepts',
                text: 'Explore a defined task or workflow before expanding the scope.',
              },
              {
                title: 'Specialist feedback',
                text: 'Evaluate behavior, exceptions and practical usefulness with the teams doing the work.',
              },
            ].map((item, index) => (
              <li key={item.title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className={`${styles.wrap} ${styles.questions}`} aria-labelledby="os-questions">
        <p className={styles.eyebrow}>ABOUT THE INITIATIVE</p>
        <h2 id="os-questions" style={{ marginTop: 20 }}>
          A clear view of where we are.
        </h2>
        {[
          {
            q: 'Is Production OS available to customers?',
            a: 'Production OS is an internal EPUBTRANS initiative currently in development. It is not offered as a customer product.',
          },
          {
            q: 'What does the interactive workflow show?',
            a: 'The interface illustrates how requirements, production tasks, review and delivery readiness could connect. The files and statuses are examples, not live project data or a confirmed feature list.',
          },
          {
            q: 'Has a launch date been announced?',
            a: 'No launch date has been announced. Priorities continue to be shaped by production needs, validation and specialist feedback.',
          },
        ].map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
      <section className={`${styles.wrap} ${styles.closing}`}>
        <div>
          <p className={styles.eyebrow}>FROM THE IDEA TO YOUR PROJECT</p>
          <h2>
            Let’s talk
            <br />
            <span>production requirements.</span>
          </h2>
        </div>
        <Link className={styles.darkButton} href="/get-a-quote">
          Discuss your project <ArrowUpRight size={19} aria-hidden="true" />
        </Link>
      </section>
    </main>
  )
}
