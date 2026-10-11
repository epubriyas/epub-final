import { ArrowRight, FileText } from 'lucide-react'
import styles from './home-infographics.module.css'

const workflowStages = [
  ['01', 'Prepare', 'Manuscripts, media and source files'],
  ['02', 'Transform', 'Editorial, language and production'],
  ['03', 'Review', 'Format, content and project requirements'],
  ['04', 'Deliver', 'Your audience. Your chosen formats.'],
] as const

const outputFormats = [
  ['01', 'PRINT'],
  ['02', 'EPUB'],
  ['03', 'XML'],
  ['04', 'DIGITAL'],
] as const

export function WorkflowInfographic() {
  return (
    <ol className={styles.workflow} aria-label="Content production workflow">
      {workflowStages.map(([number, title, description]) => (
        <li className={styles.workflowStep} key={number}>
          <span className={styles.workflowMarker} aria-hidden="true">
            {number}
          </span>
          <div className={styles.workflowCopy}>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function ContentTransformationInfographic() {
  return (
    <figure className={styles.transformation} aria-labelledby="transformation-caption">
      <figcaption className={styles.transformationCaption} id="transformation-caption">
        <span className="et-label">CONTENT TRANSFORMATION</span>
        <span className={styles.captionRule} aria-hidden="true" />
        <span className={styles.captionNote}>SOURCE TO OUTPUT</span>
      </figcaption>

      <div className={styles.transformationFlow}>
        <div className={styles.sourceCard}>
          <span className={styles.panelLabel}>SOURCE</span>
          <FileText className={styles.sourceIcon} size={32} strokeWidth={1.35} aria-hidden="true" />
          <span className={styles.sourceTitle}>Content</span>
          <span className={styles.sourceDescription}>One idea. A clear starting point.</span>
          <span className={styles.sourceLines} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>

        <div className={styles.transformationLink}>
          <span>Editorial · Language · Production</span>
          <ArrowRight size={24} strokeWidth={1.5} aria-hidden="true" />
        </div>

        <div className={styles.outputs}>
          <span className={styles.panelLabel}>DELIVERY FORMATS</span>
          <ul>
            {outputFormats.map(([number, format]) => (
              <li key={format}>
                <span>{number}</span>
                <strong>{format}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className={styles.transformationFootnote}>
        Shape the content for the formats and audiences it needs to reach.
      </p>
    </figure>
  )
}
