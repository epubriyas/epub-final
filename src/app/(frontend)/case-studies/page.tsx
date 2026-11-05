import { pageMetadata } from '@/lib/seo'
import { listContent } from '@/lib/content'
import RichText from '@/components/RichText'
import { PageHero, ContentCTA } from '@/components/editorial/Primitives'
import { editorialCaseStudies } from '@/config/case-studies'
import { Fragment } from 'react'
import Link from '@/components/i18n/LocalizedLink'
import {
  ArrowDown,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  Check,
  FileText,
  Layers3,
} from 'lucide-react'
import styles from './case-studies.module.css'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'Case Studies',
  description:
    'Explore EPUBTRANS case studies across publishing, localization, learning and accessibility, together in one place.',
  alternates: { canonical: '/case-studies' },
})

export default async function CaseStudies() {
  const studies = (await listContent('case-studies')).filter(
    (study) =>
      study.permissionConfirmed &&
      (!study.workKind || study.workKind === 'case-study') &&
      !editorialCaseStudies.some((editorial) => editorial.slug === study.slug),
  )

  return (
    <main className={styles.page}>
      <PageHero
        eyebrow="OUR WORK"
        title="Case Studies"
        description="Behind every delivery is a production challenge. Explore how our teams bring languages, formats and content together."
      />
      <nav className={`et-container ${styles.projectIndex}`} aria-label="Explore our case studies">
        <div className={styles.indexHeading}>
          <p className="et-label">TWO PROJECTS. TWO PRODUCTION PERSPECTIVES.</p>
          <p>Explore the work, then follow the process.</p>
        </div>
        <div className={styles.cards}>
          {editorialCaseStudies.map((study, index) => (
            <Link key={study.slug} href={`#${study.slug}`} className={styles.card}>
              <div
                className={`${styles.diagram} ${index === 1 ? styles.bookDiagram : ''}`}
                aria-hidden="true"
              >
                <span className={styles.diagramLabel}>PRODUCTION NOTES / 0{index + 1}</span>
                <div className={styles.diagramFlow}>
                  <span className={styles.source}>
                    <FileText size={27} strokeWidth={1.3} />
                    <small>Source content</small>
                  </span>
                  <span className={styles.connector} />
                  <span className={styles.engine}>
                    {index === 0 ? (
                      <AudioLines size={42} strokeWidth={1.2} />
                    ) : (
                      <BookOpen size={42} strokeWidth={1.2} />
                    )}
                  </span>
                  <span className={styles.connector} />
                  <span className={styles.editions}>
                    <span>ES</span>
                    <span>FR</span>
                  </span>
                </div>
                <div className={styles.diagramFooter}>
                  <Layers3 size={14} />
                  {index === 0 ? 'Audio · Video · Interaction' : 'Content · Typesetting · Language'}
                </div>
              </div>
              <div className={styles.cardBody}>
                <p className="et-label">{study.category}</p>
                <h2>
                  {index === 0
                    ? 'Safety training, across languages.'
                    : 'Related titles. Multilingual editions.'}
                </h2>
                <p>{study.summary}</p>
                <div className={styles.cardResult}>
                  <Check size={15} aria-hidden="true" />
                  {study.result}
                </div>
                <span className={styles.readLink}>
                  Explore the project <ArrowDown size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
      {editorialCaseStudies.map((study, index) => (
        <section
          key={study.slug}
          id={study.slug}
          className={`et-container ${styles.story}`}
          aria-labelledby={`case-study-${study.slug}`}
        >
          <aside className={styles.context}>
            <p className="et-label">CASE STUDY / 0{index + 1}</p>
            <p className={styles.category}>{study.category}</p>
            <dl>
              <div>
                <dt>Industry & context</dt>
                <dd>{study.context}</dd>
              </div>
              <div>
                <dt>Languages</dt>
                <dd>Spanish & French</dd>
              </div>
              <div>
                <dt>Our contribution</dt>
                <dd>{study.services}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <Check size={14} aria-hidden="true" /> Completed · Client approved
                </dd>
              </div>
            </dl>
            <Link href="/get-a-quote" className={styles.readLink}>
              Discuss a similar project <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </aside>
          <div className={styles.storyBody}>
            <h2 id={`case-study-${study.slug}`}>{study.title}</h2>
            <p className="et-lead">{study.description}</p>
            <div className="et-copy">
              {study.sections.map((section) => (
                <Fragment key={section.title}>
                  <h3>{section.title}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {'points' in section && (
                    <ul>
                      {section.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  )}
                </Fragment>
              ))}
            </div>
            <div className={styles.outcomeHeading}>
              <p className="et-label">THE OUTCOME</p>
              <Check size={19} aria-hidden="true" />
            </div>
            <ul className={styles.outcomes}>
              {study.outcomes.map((outcome) => (
                <li key={outcome.title}>
                  <h3>{outcome.title}</h3>
                  <p>{outcome.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
      {studies.map((study) => (
        <section
          key={study.id}
          id={study.slug}
          className="et-container et-content-section"
          aria-labelledby={`case-study-${study.id}`}
        >
          <h2 id={`case-study-${study.id}`}>{study.title}</h2>
          {study.description && <p className="et-lead">{study.description}</p>}
          {study.content && <RichText data={study.content} enableGutter={false} />}
          {!!study.outcomes?.length && (
            <ul className="et-content-list">
              {study.outcomes.map((outcome, index) => (
                <li key={outcome.id || index}>
                  <h3>{outcome.title}</h3>
                  <p>{outcome.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <ContentCTA />
    </main>
  )
}
