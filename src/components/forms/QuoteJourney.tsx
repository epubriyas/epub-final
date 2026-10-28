import { ArrowRight } from 'lucide-react'
import styles from './QuoteJourney.module.css'

const stages = [
  {
    title: 'Project assessment',
    description: 'We review your source material, volume, languages and required deliverables.',
    outcome: 'Requirements reviewed',
  },
  {
    title: 'Scope alignment',
    description:
      'We clarify specifications, reference files and delivery priorities with your team.',
    outcome: 'Scope defined together',
  },
  {
    title: 'Proposal & next steps',
    description:
      'We discuss the production approach, estimate and proposed schedule before you proceed.',
    outcome: 'A clear basis for your decision',
  },
]

export function QuoteJourney() {
  return (
    <section className={styles.journey} aria-labelledby="quote-next-heading">
      <header className={styles.intro}>
        <p className="et-label">AFTER YOUR ENQUIRY</p>
        <h2 id="quote-next-heading">
          From your brief
          <br />
          to a clear proposal.
        </h2>
        <p className={styles.lead}>
          A practical review of your requirements, before any production commitment.
        </p>
        <div className={styles.assurance}>
          <span className={styles.rule} aria-hidden="true" />
          <p>Estimates and delivery dates depend on the agreed scope and a review of your files.</p>
        </div>
      </header>
      <ol className={styles.stages}>
        {stages.map(({ title, description, outcome }, index) => (
          <li key={title} className={styles.stage}>
            <span className={styles.number} aria-hidden="true">
              0{index + 1}
            </span>
            <div className={styles.content}>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className={styles.outcome}>
                <ArrowRight size={14} aria-hidden="true" />
                {outcome}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
