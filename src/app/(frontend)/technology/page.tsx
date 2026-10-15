import { pageMetadata } from '@/lib/seo'
import { PageHero, ContentCTA } from '@/components/editorial/Primitives'
import { listContent } from '@/lib/content'
import RichText from '@/components/RichText'
import { TechnologyCards, ProductionOSFeature } from '@/components/technology/TechnologyContent'
export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'Technology',
  description:
    'Explore production technologies, workflow automation and in-house development at EPUBTRANS.',
  alternates: { canonical: '/technology' },
})

export default async function Technology() {
  const technologies = await listContent('technologies')
  return (
    <main>
      <PageHero
        eyebrow="TECHNOLOGY"
        title="Technology, grounded in production."
        description="We combine publishing and localization expertise with practical technology. From established production tools to internal development, our focus is on the real work behind your content."
      />
      <TechnologyCards />
      <ProductionOSFeature />
      <section className="et-container et-content-section">
        <h2>Publishing formats and production workflows</h2>
        <ul className="et-content-list">
          <li>
            <h3>Structured content & XML</h3>
            <p>
              XML and data conversion prepare content for different systems and publishing
              requirements. Discuss document structure, metadata and the formats your project needs.
            </p>
          </li>
          <li>
            <h3>Digital editions & eBooks</h3>
            <p>
              Transform manuscripts into editions designed for digital reading, with layout and
              format requirements considered from the start.
            </p>
          </li>
          <li>
            <h3>Language & production workflows</h3>
            <p>
              Connect translation, desktop publishing and multimedia requirements within a defined
              content production scope.
            </p>
          </li>
        </ul>
      </section>
      {technologies.map((doc) => (
        <section key={doc.id} className="et-container et-content-section">
          <p className="et-label">TECHNOLOGY</p>
          <h2>{doc.title}</h2>
          <p className="et-lead">{doc.description}</p>
          {doc.content && <RichText data={doc.content} enableGutter={false} />}
        </section>
      ))}
      <section className="et-technology-home">
        <div className="et-container et-technology-grid">
          <div>
            <p className="et-label">DEFINE BEFORE DELIVERY</p>
            <h2>
              Start with
              <br />
              the requirements.
            </h2>
            <p>
              Discuss your formats, review criteria, integrations and confidentiality requirements
              with the project team. AI or automation requirements are assessed within the project
              scope.
            </p>
          </div>
          <ol className="et-pipeline">
            {[
              'Source content',
              'Production specification',
              'Content transformation',
              'Review & delivery',
            ].map((item, i) => (
              <li key={item}>
                <span className="et-label">0{i + 1}</span>
                <h3>{item}</h3>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <ContentCTA />
    </main>
  )
}
