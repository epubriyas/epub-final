import { pageMetadata } from '@/lib/seo'
import { listContent } from '@/lib/content'
import RichText from '@/components/RichText'
import { TechnologyExperience } from '@/components/technology/TechnologyExperience'
export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'Technology & Production OS',
  description:
    'Explore EPUBTRANS production technologies, practical automation and in-house development, including the Production OS initiative and our approach to quality.',
  alternates: { canonical: '/technology' },
})

export default async function Technology() {
  const technologies = await listContent('technologies')
  return (
    <TechnologyExperience>
      {technologies.map((doc) => (
        <section key={doc.id} className="et-container et-content-section">
          <p className="et-label">MORE FROM OUR TEAM</p>
          <h2>{doc.title}</h2>
          <p className="et-lead">{doc.description}</p>
          {doc.content && <RichText data={doc.content} enableGutter={false} />}
        </section>
      ))}
    </TechnologyExperience>
  )
}
