import { TransformationVisual } from './TransformationVisual'
import styles from './home-infographics.module.css'
import type { HomeLandingContent } from '@/lib/landing-schema'

const workflowStages = [
  ['01', 'Prepare', 'Manuscripts, media and source files'],
  ['02', 'Transform', 'Editorial, language and production'],
  ['03', 'Review', 'Format, content and project requirements'],
  ['04', 'Deliver', 'Your audience. Your chosen formats.'],
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

export function ContentTransformationInfographic({
  content,
}: {
  content?: HomeLandingContent['transformation']
}) {
  return (
    <TransformationVisual
      formats={
        content ? ['PDF', 'EPUB', 'XML', 'LOCALIZED LAYOUTS'] : ['PRINT', 'EPUB', 'XML', 'DIGITAL']
      }
    />
  )
}
