import type { Service } from '@/payload-types'
import type { CSSProperties } from 'react'
import { compactWorkflow } from '@/lib/service-handoff'

export function ServiceWorkflow({ service }: { service: Service }) {
  if (!service.workflow?.length) return null
  type WorkflowStep = NonNullable<Service['workflow']>[number]
  type WorkflowItem = WorkflowStep & { substeps?: WorkflowStep[] }
  const orderedWorkflow: WorkflowItem[] = [...service.workflow].sort((a, b) => a.step - b.step)
  const workflow = compactWorkflow<WorkflowItem>(orderedWorkflow, (finalSteps) => ({
    ...finalSteps[0],
    substeps: finalSteps.slice(1),
  }))
  return (
    <section className="sp-process" id="process" data-motion="process">
      <div className="et-container">
        <div className="sp-section-heading">
          <p className="sp-eyebrow">THE PROCESS</p>
          <h2>Project workflow</h2>
          <p>
            The workflow for {service.title.toLowerCase()}, from source review to the final handoff.
          </p>
        </div>
        <ol className="sp-timeline">
          {workflow.map((item, i) => (
            <li key={item.id || i} style={{ '--motion-index': i } as CSSProperties}>
              <span className="sp-step-number">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                {'substeps' in item &&
                  item.substeps?.map((substep) => (
                    <div className="sp-workflow-substep" key={substep.id || substep.step}>
                      <h4 className="sp-workflow-subheading">{substep.title}</h4>
                      <p>{substep.description}</p>
                    </div>
                  ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
