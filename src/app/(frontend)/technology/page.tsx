import { pageMetadata } from '@/lib/seo'
import { PageHero, ContentCTA } from '@/components/editorial/Primitives'
import { listContent } from '@/lib/content'
import RichText from '@/components/RichText'
import {
  TechnologyCards,
  ProductionOSFeature,
  DevelopmentProcess,
} from '@/components/technology/TechnologyContent'
import { technologyTopics } from '@/config/technology'
export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'Technology',
  description:
    'Publishing tools, structured content, workflow automation and in-house development: see how EPUBTRANS approaches content production and quality review.',
  alternates: { canonical: '/technology' },
})

export default async function Technology() {
  const technologies = await listContent('technologies')
  return (
    <main>
      <PageHero
        eyebrow="TECHNOLOGY"
        title="Technology that supports better content."
        description="Every publishing project has its own source files, languages and delivery requirements. We bring production expertise, established software and internal development together to prepare content for its next audience."
      />
      <TechnologyCards />
      {technologyTopics.map((topic) => (
        <section
          key={topic.slug}
          id={topic.slug}
          className="et-container et-tech-section et-tech-topic"
          aria-labelledby={`${topic.slug}-title`}
        >
          <p className="et-label">{topic.eyebrow}</p>
          <h2 id={`${topic.slug}-title`}>{topic.title}</h2>
          <p className="et-lead">{topic.description}</p>
          <div className="et-tech-capabilities">
            {topic.sections.map((section) => (
              <article key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </article>
            ))}
          </div>
          <p className="et-lead">{topic.note}</p>
        </section>
      ))}
      <DevelopmentProcess />
      <ProductionOSFeature expanded />
      <section
        className="et-container et-content-section"
        aria-labelledby="technology-quality-title"
      >
        <p className="et-label">QUALITY THROUGHOUT PRODUCTION</p>
        <h2 id="technology-quality-title">Define the checks before the work begins.</h2>
        <p className="et-lead">
          Quality depends on a shared specification and careful review. Before production, we
          discuss the source material, required outputs and acceptance criteria with your team.
          These requirements guide both automated checks and specialist review.
        </p>
        <ul className="et-content-list">
          <li>
            <h3>Content and structure</h3>
            <p>
              Check completeness, headings, tables, references and metadata against the source and
              the agreed publishing specification.
            </p>
          </li>
          <li>
            <h3>Layout, language and reading experience</h3>
            <p>
              Review typography, text flow, navigation and language-specific presentation.
              Accessibility requirements and reading-system checks are defined for each project.
            </p>
          </li>
          <li>
            <h3>Exceptions and final delivery</h3>
            <p>
              Resolve flagged issues with the appropriate specialists and review the agreed
              deliverables before handoff. Automation supports these decisions; people remain
              responsible for judging the output.
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
            <p className="et-label">FROM SOURCE TO DELIVERY</p>
            <h2>A clear process for your content.</h2>
            <p>
              Share your source files, target formats, languages and review requirements. Together,
              we define a production approach, confirm any software or integration needs, and agree
              how outputs will be checked. Proposed AI use and confidentiality requirements are
              discussed as part of that scope.
            </p>
          </div>
          <ol className="et-pipeline">
            {[
              'Review source content',
              'Agree the production specification',
              'Produce and validate outputs',
              'Complete specialist review and delivery',
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
