import { pageMetadata } from '@/lib/seo'
import Link from '@/components/i18n/LocalizedLink'
import { listContent } from '@/lib/content'
import { ContentCTA, PageHero } from '@/components/editorial/Primitives'
export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'Solutions',
  description: 'Explore connected digital publishing solutions from EPUBTRANS.',
  alternates: { canonical: '/solutions' },
})

export default async function SolutionsPage() {
  const documents = await listContent('solutions')
  return (
    <main>
      <PageHero
        eyebrow="SOLUTIONS"
        title="Publishing and localization solutions"
        description="Explore connected production services for your publication, file formats and target audiences."
      />
      {documents.length > 0 && (
        <section className="et-container et-content-section">
          {documents.map((doc) => (
            <Link key={doc.id} className="et-content-row" href={`/solutions/${doc.slug}`}>
              <div>
                <p className="et-label">SOLUTION</p>
                <h3>{doc.title}</h3>
                <p>{doc.shortDescription}</p>
              </div>
              <span>Explore ↗</span>
            </Link>
          ))}
        </section>
      )}
      <ContentCTA />
    </main>
  )
}
