import { FileText, Languages, ScanLine, Send, ArrowDownRight } from 'lucide-react'
import type { CSSProperties } from 'react'

const stages = [
  {
    title: 'Prepare',
    caption: 'A clear starting point',
    icon: FileText,
    details: ['Manuscripts, media and source files', 'Your audience and output requirements'],
  },
  {
    title: 'Transform',
    caption: 'Expertise in motion',
    icon: Languages,
    details: ['Editorial and language expertise', 'Publishing and digital production'],
  },
  {
    title: 'Review',
    caption: 'Attention to the details',
    icon: ScanLine,
    details: ['Content and format review', 'Agreed project requirements'],
  },
  {
    title: 'Deliver',
    caption: 'Ready for the next chapter',
    icon: Send,
    details: ['Your chosen delivery formats', 'Content for its next audience'],
  },
]

export function PremiumWorkflow() {
  return (
    <div className="hp-process" data-home-motion="process">
      <div className="hp-process-label">
        <ArrowDownRight size={18} aria-hidden="true" /> FROM SOURCE TO AUDIENCE
      </div>
      <svg
        className="hp-process-route"
        viewBox="0 0 1000 660"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          className="hp-route-base"
          d="M270 70 C430 -15 530 155 730 70 C990 -30 990 465 730 370 C530 280 470 460 270 370"
        />
        <path
          className="hp-route-progress"
          pathLength="100"
          d="M270 70 C430 -15 530 155 730 70 C990 -30 990 465 730 370 C530 280 470 460 270 370"
        />
      </svg>
      <div className="hp-checkpoints" aria-hidden="true">
        {stages.map((stage, i) => (
          <span
            key={stage.title}
            className="hp-checkpoint"
            style={{ '--stage': i } as CSSProperties}
          />
        ))}
      </div>
      <ol className="hp-process-cards" aria-label="Content production workflow">
        {stages.map(({ title, caption, icon: Icon, details }, i) => (
          <li
            key={title}
            className="hp-process-card"
            data-home-motion="stage"
            style={{ '--stage': i } as CSSProperties}
          >
            <span className="hp-stage-icon">
              <Icon size={24} strokeWidth={1.4} aria-hidden="true" />
            </span>
            <h3>{title}</h3>
            <p className="hp-stage-caption">{caption}</p>
            <ul>
              {details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
            <span className="hp-stage-number" aria-hidden="true">
              0{i + 1}
            </span>
          </li>
        ))}
      </ol>
      <p className="hp-process-foot">
        One connected workflow. <span>Shaped around your content.</span>
      </p>
    </div>
  )
}
