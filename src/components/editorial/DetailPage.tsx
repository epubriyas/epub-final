import Link from '@/components/i18n/LocalizedLink'
import type { Service, Solution, Industry } from '@/payload-types'
import RichText from '@/components/RichText'
import { ContentCTA, PageHero } from './Primitives'
type Detail = Service | Solution | Industry
export function DetailPage({
  document,
  section,
  route,
}: {
  document: Detail
  section: string
  route: string
}) {
  const capabilities =
    'features' in document
      ? document.features
      : 'capabilities' in document
        ? document.capabilities
        : 'services' in document
          ? document.services
          : undefined
  return (
    <main>
      <nav className="et-container et-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/${route}`}>{section}</Link>
        <span>/</span>
        <span aria-current="page">{document.title}</span>
      </nav>
      <PageHero
        eyebrow={document.hero?.eyebrow || section}
        title={document.hero?.headline || document.title}
        description={document.hero?.description || document.shortDescription || undefined}
      />
      {document.overview && (
        <section className="et-container et-detail-grid">
          <h2>Overview</h2>
          <RichText data={document.overview} enableGutter={false} />
        </section>
      )}
      {'challenges' in document && !!document.challenges?.length && (
        <section className="et-container et-content-section">
          <p className="et-label">CONTEXT</p>
          <h2>Project challenges</h2>
          <ul className="et-content-list">
            {document.challenges.map((item) => (
              <li key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!!capabilities?.length && (
        <section className="et-container et-content-section">
          <p className="et-label">CAPABILITIES</p>
          <h2>Capabilities</h2>
          <ul className="et-content-list">
            {capabilities.map((item) => (
              <li key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!!document.workflow?.length && (
        <section className="et-technology-home">
          <div className="et-container et-technology-grid">
            <div>
              <p className="et-label">THE PROCESS</p>
              <h2>
                From brief
                <br />
                to delivery.
              </h2>
            </div>
            <ol className="et-pipeline">
              {[...document.workflow]
                .sort((a, b) => a.step - b.step)
                .map((item) => (
                  <li key={item.id}>
                    <span className="et-label">{String(item.step).padStart(2, '0')}</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </li>
                ))}
            </ol>
          </div>
        </section>
      )}
      {!!document.faqs?.length && (
        <section className="et-container et-content-section">
          <h2>Questions, answered.</h2>
          {document.faqs.map((item) => (
            <details className="et-faq" key={item.id}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      )}
      <ContentCTA />
    </main>
  )
}

