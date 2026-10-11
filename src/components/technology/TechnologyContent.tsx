import Link from '@/components/i18n/LocalizedLink'
import { ArrowUpRight, Layers3, Workflow, Code2 } from 'lucide-react'
import { ArrowLink } from '@/components/editorial/Primitives'
import { Reveal } from '@/components/shared/Reveal'
import { technologyTopics, productionOS, developmentSteps } from '@/config/technology'

const icons = [Layers3, Workflow, Code2]

export function TechnologyCards() {
  return (
    <section className="et-container et-tech-section" aria-labelledby="technology-areas">
      <p className="et-label">OUR TECHNOLOGY APPROACH</p>
      <h2 id="technology-areas">
        Practical technology.
        <br />
        Production expertise.
      </h2>
      <div className="et-tech-cards">
        {technologyTopics.map((topic, index) => {
          const Icon = icons[index]
          return (
            <Reveal key={topic.slug}>
              <Link href={`/technology/${topic.slug}`} className="et-tech-card">
                <div className="et-tech-card-top">
                  <Icon size={28} aria-hidden="true" />
                  <span className="et-label">0{index + 1}</span>
                </div>
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
                <span className="et-tech-card-link">
                  Explore capabilities <ArrowUpRight size={20} aria-hidden="true" />
                </span>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

export function ProductionOSFeature({ expanded = false }: { expanded?: boolean }) {
  return (
    <section id="production-os" className="et-tech-os" aria-labelledby="production-os-title">
      <div className="et-container">
        <div className="et-tech-os-grid">
          <Reveal>
            <div>
              <p className="et-tech-status">{productionOS.status}</p>
              <p className="et-label">{productionOS.title}</p>
              <h2 id="production-os-title">{productionOS.headline}</h2>
              <p className="et-tech-os-description">{productionOS.description}</p>
              {!expanded && (
                <ArrowLink light href="/technology/production-os">
                  Explore the initiative
                </ArrowLink>
              )}
            </div>
          </Reveal>
          <Reveal>
            <div className="et-tech-blueprint">
              <div className="et-tech-blueprint-header">
                <Layers3 aria-hidden="true" size={24} />
                <span>Production OS</span>
                <span className="et-label">CONCEPT</span>
              </div>
              <p>A connected production workflow</p>
              <ol>
                {productionOS.stages.map((stage, index) => (
                  <li key={stage}>
                    <span className="et-tech-node">0{index + 1}</span>
                    <span>{stage}</span>
                  </li>
                ))}
              </ol>
              <div className="et-tech-blueprint-footer">
                People, tools and review at every stage
              </div>
            </div>
          </Reveal>
        </div>
        {expanded && (
          <div className="et-tech-os-areas">
            {productionOS.areas.map((area) => (
              <div key={area.title}>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
              </div>
            ))}
          </div>
        )}
        <p className="et-tech-os-note">{productionOS.note}</p>
      </div>
    </section>
  )
}

export function TechnologyRelatedLinks({ current }: { current: string }) {
  const pages = [...technologyTopics, { slug: 'production-os', title: productionOS.title }]
  return (
    <nav className="et-container et-tech-related" aria-label="Related technology pages">
      <p className="et-label">EXPLORE TECHNOLOGY</p>
      {pages
        .filter((page) => page.slug !== current)
        .map((page) => (
          <ArrowLink key={page.slug} href={`/technology/${page.slug}`}>
            {page.title}
          </ArrowLink>
        ))}
    </nav>
  )
}

export function DevelopmentProcess() {
  return (
    <section id="development-process" className="et-container et-tech-section">
      <p className="et-label">HOW WE DEVELOP</p>
      <h2>
        From a real need
        <br />
        to a useful next step.
      </h2>
      <ol className="et-tech-process">
        {developmentSteps.map((step, index) => (
          <li key={step.title}>
            <span className="et-label">0{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
