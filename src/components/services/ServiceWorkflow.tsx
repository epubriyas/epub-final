import type { Service } from '@/payload-types'
import type { CSSProperties } from 'react'

export function ServiceWorkflow({ service }: { service: Service }) {
  if (!service.workflow?.length) return null
  return (
    <section className="sp-process" id="process" data-motion="process">
      <div className="et-container">
        <div className="sp-section-heading">
          <p className="sp-eyebrow">THE PROCESS</p>
          <h2>
            A clear path.
            <br />
            At every stage.
          </h2>
          <p>
            The workflow for {service.title.toLowerCase()}, from source review to the final handoff.
          </p>
        </div>
        <ol className="sp-timeline">
          {[...service.workflow]
            .sort((a, b) => a.step - b.step)
            .map((item, i) => (
              <li key={item.id || i} style={{ '--motion-index': i } as CSSProperties}>
                <span className="sp-step-number">{String(item.step).padStart(2, '0')}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
        </ol>
      </div>
    </section>
  )
}
