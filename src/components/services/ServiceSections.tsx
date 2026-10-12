import Link from '@/components/i18n/LocalizedLink'
import RichText from '@/components/RichText'
import { ArrowUpRight } from 'lucide-react'
import type { Service } from '@/payload-types'
import { serviceDesign, serviceQuoteHref } from '@/config/service-design'
import { TransformationDiagram } from './visuals/TransformationDiagram'
import { SubtitleStudy, AccessibilityStudy } from './visuals/ServiceStudy'
import type { CSSProperties } from 'react'

export function ServiceIntroduction({ service }: { service: Service }) {
  const design = serviceDesign(service)
  if (!service.overview) return null
  return (
    <section className="et-container sp-section sp-intro">
      <div>
        <p className="sp-eyebrow">THE CONTEXT</p>
        <h2>{design.introduction}</h2>
      </div>
      <div className="sp-richtext">
        <RichText data={service.overview} enableGutter={false} />
      </div>
    </section>
  )
}

export function ServiceCapabilities({ service }: { service: Service }) {
  if (!service.features?.length) return null
  return (
    <section className="sp-capabilities" data-motion="capabilities">
      <div className="et-container sp-section">
        <div className="sp-section-heading">
          <p className="sp-eyebrow">CAPABILITIES</p>
          <h2>
            The detail
            <br />
            behind the deliverable.
          </h2>
          <p>{service.shortDescription}</p>
        </div>
        <ul className="sp-capability-list">
          {service.features.map((item, i) => (
            <li key={item.id || i} style={{ '--motion-index': i } as CSSProperties}>
              <span className="sp-small-number">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function ServiceExplanation({ service }: { service: Service }) {
  const design = serviceDesign(service)
  const source = service.visualExplanation?.sourceLabel || design.source
  const output = service.visualExplanation?.outputLabel || design.output
  return (
    <section className="et-container sp-section sp-explanation">
      <div className="sp-section-heading">
        <p className="sp-eyebrow">THE TRANSFORMATION</p>
        <h2>{service.visualExplanation?.title || 'From source to possibility.'}</h2>
        {service.visualExplanation?.description && <p>{service.visualExplanation.description}</p>}
      </div>
      <div className="sp-explanation-grid">
        <div>
          {service.slug === 'subtitling' ? (
            <SubtitleStudy />
          ) : service.slug === 'accessibility' ? (
            <AccessibilityStudy />
          ) : (
            <TransformationDiagram design={{ ...design, source, output }} />
          )}
        </div>
        <div className="sp-handoff">
          <div>
            <span className="sp-eyebrow">01 / YOUR SOURCE</span>
            <h3>{source}</h3>
          </div>
          <span className="sp-handoff-arrow" aria-hidden="true">
            ↓
          </span>
          <div>
            <span className="sp-eyebrow">02 / THE WORK</span>
            <h3>{service.title}</h3>
            <p>
              {service.features
                ?.map((x) => x.title.trim())
                .slice(0, 3)
                .join(' · ') || service.shortDescription}
            </p>
          </div>
          <span className="sp-handoff-arrow" aria-hidden="true">
            ↓
          </span>
          <div>
            <span className="sp-eyebrow">03 / THE DELIVERABLE</span>
            <h3>{output}</h3>
            <p>Output specifications are agreed around your project requirements.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ServiceQuality({ service }: { service: Service }) {
  if (!service.quality?.length) return null
  return (
    <section className="sp-quality">
      <div className="et-container sp-section">
        <p className="sp-eyebrow">QUALITY &amp; TECHNICAL APPROACH</p>
        <h2>
          Attention where
          <br />
          it matters.
        </h2>
        <ul>
          {service.quality.map((item, i) => (
            <li key={item.id || i}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function ServiceUseCases({ service }: { service: Service }) {
  if (!service.useCases?.length) return null
  return (
    <section className="et-container sp-section">
      <p className="sp-eyebrow">APPLICATIONS</p>
      <h2>Where this work fits.</h2>
      <ul className="sp-use-cases">
        {service.useCases.map((item, i) => (
          <li key={item.id || i}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            {item.industry &&
              typeof item.industry === 'object' &&
              item.industry.status === 'published' && (
                <Link className="sp-text-link" href={`/industries/${item.industry.slug}`}>
                  Explore {item.industry.title} <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function RelatedServices({ services }: { services: Service[] }) {
  if (!services.length) return null
  return (
    <section className="et-container sp-section sp-related" data-motion="related">
      <p className="sp-eyebrow">CONNECTED CAPABILITIES</p>
      <h2>Consider the next step.</h2>
      <div className="sp-related-grid">
        {services.map((item, i) => (
          <Link
            key={item.id}
            href={`/services/${item.slug}`}
            style={{ '--fan': i - (services.length - 1) / 2 } as CSSProperties}
          >
            <span className="sp-small-number">0{i + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.shortDescription}</p>
            <span className="sp-text-link">
              Explore service <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function ServiceFAQ({ service }: { service: Service }) {
  if (!service.faqs?.length) return null
  return (
    <section className="et-container sp-section sp-faq">
      <div>
        <p className="sp-eyebrow">GOOD TO KNOW</p>
        <h2>
          Questions,
          <br />
          answered.
        </h2>
      </div>
      <div>
        {service.faqs.map((item, i) => (
          <details key={item.id || i}>
            <summary>
              {item.question}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export function ServiceCTA({ service }: { service?: Service }) {
  return (
    <section className="sp-cta" data-motion="cta">
      <div className="et-container">
        <p className="sp-eyebrow">LET’S TALK ABOUT YOUR CONTENT</p>
        <h2>
          Have a project
          <br />
          in mind?
        </h2>
        <div className="sp-cta-bottom">
          <p>
            Tell us about your content, requirements and expected deliverables. Our team can review
            your request.
          </p>
          <div className="sp-actions">
            <Link className="sp-button" href={service ? serviceQuoteHref(service) : '/get-a-quote'}>
              Request a Quote <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
            <Link className="sp-text-link" href="/contact">
              Contact Our Team <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
