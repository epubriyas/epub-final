import { pageMetadata } from '@/lib/seo'
import { listContent } from '@/lib/content'
import Link from '@/components/i18n/LocalizedLink'
import { ArrowUpRight } from 'lucide-react'
import { serviceGroups, serviceGroup } from '@/config/service-design'
import { ServiceCTA } from '@/components/services/ServiceSections'
import { servicePath } from '@/config/service-paths'
export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'What We Do',
  description: 'Explore publishing, localization, media, learning and accessible content services.',
  alternates: { canonical: '/services' },
})

export default async function ServicesPage() {
  const services = await listContent('services')
  return (
    <main className="sp-page">
      <section className="sp-index-hero">
        <div className="et-container">
          <p className="sp-eyebrow">WHAT WE DO / EPUBTRANS</p>
          <h1>Publishing, localization and content services</h1>
          <div className="sp-index-bottom">
            <p>
              From editorial detail to structured digital content. Find the publishing, language and
              production services your next project needs.
            </p>
            <div className="sp-actions">
              <Link className="sp-button" href="/get-a-quote">
                Discuss your project <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <nav className="et-container sp-group-nav" aria-label="Service categories">
        {serviceGroups.map((group) => (
          <Link key={group.id} href={`#${group.id}`}>
            {group.title}
          </Link>
        ))}
      </nav>
      {serviceGroups.map((group, i) => {
        const matches = services.filter((service) => serviceGroup(service) === group.id)
        return (
          <section
            className="et-container sp-section sp-catalog-group"
            id={group.id}
            key={group.id}
          >
            <div>
              <span className="sp-small-number">0{i + 1} / CAPABILITIES</span>
              <h2>{group.title}</h2>
              <p>{group.description}</p>
            </div>
            <div>
              {matches.length ? (
                matches.map((service) => (
                  <Link
                    className="sp-catalog-link"
                    key={service.id}
                    href={servicePath(service.slug)}
                  >
                    <div>
                      <h3>{service.title}</h3>
                      <p>{service.shortDescription}</p>
                    </div>
                    <ArrowUpRight size={25} aria-hidden="true" />
                  </Link>
                ))
              ) : (
                <div className="sp-catalog-empty">
                  <p>
                    Detailed service information is being prepared. Tell us about your content and
                    requirements.
                  </p>
                  <Link className="sp-text-link" href="/get-a-quote">
                    Discuss a project <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        )
      })}
      <ServiceCTA />
    </main>
  )
}
