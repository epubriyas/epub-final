import Link from '@/components/i18n/LocalizedLink'
import { ArrowLink, ContentCTA, PageHero } from '@/components/editorial/Primitives'
import { developmentSteps, productionOS } from '@/config/technology'
import { technologyGuides } from '@/config/technology-guides'
import { TechnologyRelatedLinks } from '@/components/technology/TechnologyContent'
import { pageMetadata } from '@/lib/seo'
import styles from './production-os.module.css'
import { ArrowRight, ChevronDown } from 'lucide-react'

export const metadata = pageMetadata({
  title: productionOS.title,
  description: productionOS.description,
  alternates: { canonical: '/technology/production-os' },
})

const guide = technologyGuides['production-os']

const sections = [
  ['overview', 'Overview'],
  ['focus-areas', 'Focus areas'],
  ['concept-workflow', 'Concept workflow'],
  ['development-approach', 'Development approach'],
  ['questions', 'Questions'],
] as const

export default function ProductionOSPage() {
  return (
    <main className={styles.page}>
      <div className="et-container et-tech-breadcrumb">
        <ArrowLink href="/technology">Technology overview</ArrowLink>
      </div>

      <PageHero
        eyebrow="INTERNAL INITIATIVE · IN DEVELOPMENT"
        title={productionOS.title}
        description="An internal initiative exploring how production workflow information, task coordination and support could come together for EPUBTRANS teams."
      />

      <nav className={`et-container ${styles.sectionNav}`} aria-label="On this page">
        <span className="et-label">ON THIS PAGE</span>
        {sections.map(([id, label]) => (
          <Link href={`#${id}`} key={id}>
            {label}
          </Link>
        ))}
      </nav>

      <section
        className={`et-container ${styles.overview}`}
        id="overview"
        aria-labelledby="production-os-overview"
      >
        <div className={styles.overviewCopy}>
          <p className="et-label">WHAT IT IS</p>
          <h2 id="production-os-overview">An internal idea, shaped around real production work.</h2>
          <div className={styles.overviewText}>
            {guide.explanation.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <aside className={styles.statusCard} aria-label="Production OS status">
          <p className="et-label">CURRENT STATUS</p>
          <strong>In development</strong>
          <dl>
            <div>
              <dt>Initiative</dt>
              <dd>Internal to EPUBTRANS</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>Not offered as a customer product</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section
        className={`et-container ${styles.focus}`}
        id="focus-areas"
        aria-labelledby="production-os-focus"
      >
        <div className={styles.sectionHeading}>
          <p className="et-label">AREAS BEING EXPLORED</p>
          <h2 id="production-os-focus">Four connected parts of production.</h2>
          <p>
            These focus areas describe the initiative’s direction while the team explores needs and
            possible approaches.
          </p>
        </div>
        <div className={styles.focusGrid}>
          {productionOS.areas.map((area, index) => (
            <article className={styles.focusCard} key={area.title}>
              <span className={styles.cardNumber} aria-hidden="true">
                0{index + 1}
              </span>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={styles.workflow}
        id="concept-workflow"
        aria-labelledby="production-os-workflow"
      >
        <div className={`et-container ${styles.workflowInner}`}>
          <div className={styles.workflowHeading}>
            <p className="et-label">ILLUSTRATIVE · CONCEPT ONLY</p>
            <h2 id="production-os-workflow">How production work could connect.</h2>
            <p>{guide.example.text}</p>
          </div>
          <ol className={styles.workflowSteps}>
            {productionOS.stages.map((stage, index) => (
              <li className={styles.workflowStep} key={stage}>
                <span className={styles.workflowNode} aria-hidden="true">
                  0{index + 1}
                </span>
                <div>
                  <h3>{stage}</h3>
                  <p>{guide.example.steps[index]}</p>
                </div>
                {index < productionOS.stages.length - 1 && (
                  <ArrowRight className={styles.workflowArrow} size={18} aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
          <p className={styles.workflowNote}>
            Production OS is under development. This sequence illustrates the current direction, not
            released features.
          </p>
        </div>
      </section>

      <section
        className={`et-container ${styles.development}`}
        id="development-approach"
        aria-labelledby="production-os-development"
      >
        <div className={styles.sectionHeading}>
          <p className="et-label">HOW THE IDEA DEVELOPS</p>
          <h2 id="production-os-development">Learn, test, refine.</h2>
          <p>
            The development approach starts with production specialists and moves forward through
            feedback at each stage.
          </p>
        </div>
        <ol className={styles.developmentSteps}>
          {developmentSteps.map((step, index) => (
            <li className={styles.developmentStep} key={step.title}>
              <span className="et-label">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={`et-container ${styles.questions}`}
        id="questions"
        aria-labelledby="production-os-questions"
      >
        <div className={styles.sectionHeading}>
          <p className="et-label">CLEAR ANSWERS</p>
          <h2 id="production-os-questions">Common questions.</h2>
        </div>
        <div className={styles.questionList}>
          {guide.questions.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <TechnologyRelatedLinks current="production-os" />
      <ContentCTA />
    </main>
  )
}
