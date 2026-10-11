import { notFound } from 'next/navigation'
import { pageMetadata } from '@/lib/seo'
import { technologyTopics } from '@/config/technology'
import { technologyGuides } from '@/config/technology-guides'
import { ArrowLink, PageHero, ContentCTA } from '@/components/editorial/Primitives'
import {
  DevelopmentProcess,
  ProductionOSFeature,
  TechnologyRelatedLinks,
} from '@/components/technology/TechnologyContent'
import {
  TechnologyReadingNav,
  TechnologyIntroduction,
  TechnologyGuideContent,
} from '@/components/technology/TechnologyGuide'
import { Reveal } from '@/components/shared/Reveal'

type Props = { params: Promise<{ topic: string }> }
export function generateStaticParams() {
  return technologyTopics.map(({ slug }) => ({ topic: slug }))
}
export async function generateMetadata({ params }: Props) {
  const { topic } = await params
  const content = technologyTopics.find((item) => item.slug === topic)
  if (!content) return {}
  return pageMetadata({
    title: content.title,
    description: content.description,
    alternates: { canonical: `/technology/${content.slug}` },
  })
}
export default async function TechnologyDetail({ params }: Props) {
  const { topic } = await params
  const content = technologyTopics.find((item) => item.slug === topic)
  if (!content) notFound()
  const guide = technologyGuides[topic]
  return (
    <main>
      <div className="et-container et-tech-breadcrumb">
        <ArrowLink href="/technology">Technology overview</ArrowLink>
      </div>
      <PageHero eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <TechnologyReadingNav />
      <TechnologyIntroduction guide={guide} />
      <section id="capabilities" className="et-container et-tech-section">
        <p className="et-label">{content.title}</p>
        <h2>
          {topic === 'in-house-development'
            ? 'Development shaped by production.'
            : 'Capabilities with a purpose.'}
        </h2>
        <div className="et-tech-capabilities">
          {content.sections.map((section, index) => (
            <Reveal key={section.title}>
              <article>
                <span className="et-label">0{index + 1}</span>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <TechnologyGuideContent guide={guide} />
      {topic === 'in-house-development' && <ProductionOSFeature />}
      {topic === 'in-house-development' && <DevelopmentProcess />}
      <section id="approach" className="et-container et-tech-section et-tech-principle">
        <div>
          <p className="et-label">OUR APPROACH</p>
          <h2>{content.closing}</h2>
        </div>
        <div>
          <p className="et-lead">{content.note}</p>
          <ArrowLink href="/services">Explore our services</ArrowLink>
        </div>
      </section>
      <TechnologyRelatedLinks current={topic} />
      <ContentCTA />
    </main>
  )
}
