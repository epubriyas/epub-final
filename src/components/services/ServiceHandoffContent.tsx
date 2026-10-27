import Link from '@/components/i18n/LocalizedLink'
import { ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import {
  limitWorkflowToFour,
  type HandoffBlock,
  type HandoffSection,
  type ServiceHandoff,
} from '@/lib/service-handoff'
import type { Service } from '@/payload-types'
import { ServiceExplanation } from './ServiceSections'

function Blocks({ blocks }: { blocks: HandoffBlock[] }) {
  return blocks.map((block, index) => {
    if (block.kind === 'subheading')
      return (
        <h4 key={index} className="sp-workflow-subheading">
          {block.text}
        </h4>
      )
    if (block.kind === 'linked-paragraph')
      return (
        <p key={index}>
          {block.before}
          <Link className="sp-inline-link" href={block.href}>
            {block.text}
          </Link>
          {block.after}
        </p>
      )
    if (block.kind === 'list')
      return (
        <ul key={index} className="sp-detail-list">
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{item}</li>
          ))}
        </ul>
      )
    if (block.kind === 'link')
      return (
        <Link
          key={index}
          className={block.primary ? 'sp-button' : 'sp-text-link'}
          href={block.href}
        >
          {block.text} <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      )
    return <p key={index}>{block.text}</p>
  })
}

function Heading({
  section,
  eyebrow,
  showLead = true,
}: {
  section: HandoffSection
  eyebrow: string
  showLead?: boolean
}) {
  return (
    <div className="sp-section-heading">
      <p className="sp-eyebrow">{eyebrow}</p>
      <h2
        id={section.anchorId}
        tabIndex={section.anchorId ? -1 : undefined}
        style={section.anchorId ? { scrollMarginTop: '112px' } : undefined}
      >
        {section.title}
      </h2>
      {showLead && (
        <div className="sp-richtext">
          <Blocks blocks={section.lead} />
        </div>
      )}
    </div>
  )
}

function Section({ section, index }: { section: HandoffSection; index: number }) {
  const id = section.kind === 'workflow' ? 'process' : `service-section-${index + 1}`
  if (section.kind === 'faq')
    return (
      <section id={id} className="et-container sp-section sp-faq">
        <Heading section={section} eyebrow="GOOD TO KNOW" />
        <div>
          {section.groups.map((group) => (
            <details key={group.title}>
              <summary>
                {group.title}
                <span aria-hidden="true">+</span>
              </summary>
              <Blocks blocks={group.blocks} />
            </details>
          ))}
        </div>
      </section>
    )
  if (section.kind === 'workflow') {
    const workflow = limitWorkflowToFour(section.groups, (finalSteps) => ({
      ...finalSteps[0],
      blocks: finalSteps.flatMap((step, index) => [
        ...(index > 0
          ? [{ kind: 'subheading' as const, text: step.title.replace(/^\d+\.\s*/, '') }]
          : []),
        ...step.blocks,
      ]),
    }))
    return (
      <section id={id} className="sp-process" data-motion="process">
        <div className="et-container">
          <Heading section={section} eyebrow="THE PROCESS" />
          <ol className="sp-timeline">
            {workflow.map((group, step) => (
              <li key={group.title} style={{ '--motion-index': step } as CSSProperties}>
                <span className="sp-step-number" aria-hidden="true">
                  {String(step + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{group.title.replace(/^\d+\.\s*/, '')}</h3>
                  <Blocks blocks={group.blocks} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }
  if (section.kind === 'cta')
    return (
      <section id={id} className="sp-cta" data-motion="cta">
        <div className="et-container">
          <p className="sp-eyebrow">LET’S TALK ABOUT YOUR CONTENT</p>
          <h2>{section.title}</h2>
          <div className="sp-cta-bottom">
            <div className="sp-richtext">
              <Blocks blocks={section.lead.filter((block) => block.kind !== 'link')} />
            </div>
            <div className="sp-actions">
              <Blocks blocks={section.lead.filter((block) => block.kind === 'link')} />
            </div>
          </div>
        </div>
      </section>
    )
  if (section.kind === 'capabilities')
    return (
      <section id={id} className="sp-capabilities" data-motion="capabilities">
        <div className="et-container sp-section">
          <Heading section={section} eyebrow="CAPABILITIES" />
          <ul className="sp-capability-list">
            {section.groups.map((group, itemIndex) => (
              <li key={group.title} style={{ '--motion-index': itemIndex } as CSSProperties}>
                <span className="sp-small-number">{String(itemIndex + 1).padStart(2, '0')}</span>
                <div className="sp-capability-title">
                  <h3>{group.title}</h3>
                </div>
                <div className="sp-capability-body">
                  <Blocks blocks={group.blocks} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  if (section.kind === 'related') {
    return (
      <section id={id} className="et-container sp-section sp-related" data-motion="related">
        <Heading section={section} eyebrow="CONNECTED CAPABILITIES" />
        <div className="sp-related-grid">
          {section.groups.map((group, itemIndex) => {
            const content = (
              <>
                <span className="sp-small-number">{String(itemIndex + 1).padStart(2, '0')}</span>
                <h3>{group.title}</h3>
                <Blocks blocks={group.blocks} />
                {group.href && (
                  <span className="sp-text-link">
                    Explore service <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                )}
              </>
            )
            const style = { '--fan': itemIndex - (section.groups.length - 1) / 2 } as CSSProperties
            return group.href ? (
              <Link key={group.title} href={group.href} style={style}>
                {content}
              </Link>
            ) : (
              <article key={group.title} style={style}>
                {content}
              </article>
            )
          })}
        </div>
      </section>
    )
  }
  if (section.kind === 'quality' && !section.groups.length)
    return (
      <section id={id} className="sp-quality">
        <div className="et-container sp-section">
          <Heading section={section} eyebrow="QUALITY & TECHNICAL APPROACH" />
        </div>
      </section>
    )
  if (['quality', 'scope'].includes(section.kind) && section.groups.length)
    return (
      <section id={id} className={section.kind === 'quality' ? 'sp-quality' : ''}>
        <div className="et-container sp-section">
          <Heading
            section={section}
            eyebrow={
              section.kind === 'quality' ? 'QUALITY & TECHNICAL APPROACH' : 'PROJECT REQUIREMENTS'
            }
          />
          <ul className="sp-use-cases">
            {section.groups.map((group) => (
              <li key={group.title}>
                <h3>{group.title}</h3>
                <Blocks blocks={group.blocks} />
                {group.href && (
                  <Link className="sp-text-link" href={group.href}>
                    Explore service <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  return (
    <section
      id={id}
      className={`et-container sp-section sp-intro${section.groups.length ? ' sp-structured-intro' : ''}`}
      data-content-groups={section.groups.length || undefined}
    >
      <Heading
        section={section}
        eyebrow={section.kind === 'quality' ? 'QUALITY & TECHNICAL APPROACH' : 'THE CONTEXT'}
        showLead={false}
      />
      <div className="sp-richtext">
        <Blocks blocks={section.lead} />
        {section.groups.length
          ? section.groups.map((group) => (
              <div key={group.title} className="prose max-w-none dark:prose-invert">
                <h3>{group.title}</h3>
                <Blocks blocks={group.blocks} />
              </div>
            ))
          : null}
      </div>
    </section>
  )
}

export function ServiceHandoffContent({
  handoff,
  service,
}: {
  handoff: ServiceHandoff
  service: Service
}) {
  const readingGuide = ['translation', 'voiceover'].includes(service.slug)
  const sections = readingGuide
    ? [
        ...handoff.sections.filter((section) => section === handoff.sections[0]),
        ...handoff.sections.filter((section) => /Deliverables$/.test(section.title)),
        ...handoff.sections.filter((section) => section.kind === 'capabilities'),
        ...handoff.sections.filter(
          (section) => section.title === 'Source Materials and Project Requirements',
        ),
        ...handoff.sections.filter(
          (section) =>
            section !== handoff.sections[0] &&
            !/Deliverables$/.test(section.title) &&
            section.kind !== 'capabilities' &&
            section.title !== 'Source Materials and Project Requirements',
        ),
      ]
    : handoff.sections
  const firstCapabilities =
    handoff.showTransformation === false
      ? -1
      : sections.findIndex((section) => section.kind === 'capabilities')
  return (
    <>
      {readingGuide && (
        <nav className="et-container sp-service-contents" aria-label="On this service page">
          <p className="sp-eyebrow">ON THIS PAGE</p>
          <ul>
            {sections
              .map((section, index) => ({ section, index }))
              .filter(
                ({ section }) =>
                  ['capabilities', 'faq', 'cta'].includes(section.kind) ||
                  /Deliverables$/.test(section.title) ||
                  section.title === 'Source Materials and Project Requirements',
              )
              .map(({ section, index }) => (
                <li key={section.title}>
                  <Link
                    href={
                      section.kind === 'workflow' ? '#process' : `#service-section-${index + 1}`
                    }
                  >
                    {section.title}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      )}
      {sections.map((section, index) => (
        <div key={section.title}>
          <Section section={section} index={index} />
          {index === firstCapabilities && <ServiceExplanation service={service} />}
        </div>
      ))}
    </>
  )
}
