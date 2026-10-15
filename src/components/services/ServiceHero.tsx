import Link from '@/components/i18n/LocalizedLink'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import type { Service } from '@/payload-types'
import { serviceDesign, serviceQuoteHref } from '@/config/service-design'
import { ServiceVisual } from './ServiceVisual'
import { ServiceImage } from './ServiceImage'
import type { ServiceHandoff } from '@/lib/service-handoff'

export function ServiceHero({ service, handoff }: { service: Service; handoff?: ServiceHandoff }) {
  const design = serviceDesign(service)
  const media = service.hero?.image
  const image =
    media && typeof media === 'object' && media.mimeType?.startsWith('image/') && media.url
      ? media
      : null
  const fallback = <ServiceVisual design={design} slug={service.slug} />
  return (
    <section className={`sp-hero sp-hero-${design.layout}`} data-motion="hero">
      <div className="et-container">
        <nav className="sp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/services">What We Do</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{handoff?.hero.title || service.title}</span>
        </nav>
        <div className="sp-hero-grid">
          <div className="sp-hero-copy">
            <div className="sp-hero-copy-head">
              <p className="sp-eyebrow">{service.hero?.eyebrow || service.title}</p>
              <h1>{handoff?.hero.title || service.title}</h1>
              <p className="sp-lead">
                {handoff?.hero.lead || service.hero?.description || service.shortDescription}
              </p>
            </div>
            {handoff && (
              <div className="sp-hero-copy-body sp-richtext">
                {handoff.hero.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )}
            <div className="sp-actions sp-hero-actions">
              {handoff ? (
                handoff.hero.actions.map(
                  (action, index) =>
                    action.kind === 'link' && (
                      <Link
                        key={index}
                        className={action.primary ? 'sp-button' : 'sp-text-link'}
                        href={action.href}
                      >
                        {action.text} <ArrowUpRight size={19} aria-hidden="true" />
                      </Link>
                    ),
                )
              ) : (
                <>
                  <Link className="sp-button" href={serviceQuoteHref(service)}>
                    Request a Quote <ArrowUpRight size={19} aria-hidden="true" />
                  </Link>
                  {!!service.workflow?.length && (
                    <Link className="sp-text-link" href="#process">
                      Explore Our Process <ArrowDown size={17} aria-hidden="true" />
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="sp-hero-art">
            {design.photo ? (
              <ServiceImage {...design.photo} hero>
                {fallback}
              </ServiceImage>
            ) : image ? (
              <ServiceImage
                src={image.url!}
                alt={image.alt || service.title}
                focalPoint={`${image.focalX ?? 50}% ${image.focalY ?? 50}%`}
                hero
              >
                {fallback}
              </ServiceImage>
            ) : (
              fallback
            )}
          </div>
        </div>
        <div className="sp-hero-foot">
          <span>{service.title}</span>
          <span>Content / Craft / Delivery</span>
        </div>
      </div>
    </section>
  )
}
