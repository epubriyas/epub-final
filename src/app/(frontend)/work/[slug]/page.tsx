import { pageMetadata } from '@/lib/seo'
import { notFound } from 'next/navigation'
import { getContent } from '@/lib/content'
import { PageHero, ContentCTA } from '@/components/editorial/Primitives'
import RichText from '@/components/RichText'
import Image from 'next/image'
import Link from '@/components/i18n/LocalizedLink'
import { getWorkSamples } from '@/lib/portfolio'
import { SampleLauncher } from '@/components/work/WorkExplorer'
import '../work.css'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const doc = await getContent('case-studies', slug)
  if (!doc?.permissionConfirmed) notFound()
  return pageMetadata({
    title: doc.seo?.metaTitle || doc.title,
    description: doc.seo?.metaDescription || doc.description,
    alternates: { canonical: `/work/${slug}` },
  })
}
export default async function CaseStudy({ params }: Props) {
  const { slug } = await params
  const doc = await getContent('case-studies', slug)
  if (!doc?.permissionConfirmed) notFound()
  const sample = (await getWorkSamples()).find((item) => item.slug === slug)
  if (sample && doc.workKind && doc.workKind !== 'case-study')
    return (
      <main className="wp-work">
        <section className="wp-detail-hero et-container">
          <nav aria-label="Breadcrumb">
            <Link href="/work">Selected work</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{sample.title}</span>
          </nav>
          <div className="wp-detail-grid">
            <div>
              <p className="wp-kicker">
                {sample.category} / {sample.kind}
              </p>
              <h1>{sample.title}</h1>
              <p className="wp-hero-intro">{sample.description}</p>
              <div className="wp-hero-actions">
                <SampleLauncher sample={sample} />
                <Link className="wp-text-button" href={sample.quoteHref}>
                  Request a Quote ↗
                </Link>
              </div>
              <dl className="wp-facts">
                <div>
                  <dt>Deliverable</dt>
                  <dd>{sample.format || 'Content sample'}</dd>
                </div>
                <div>
                  <dt>Viewing format</dt>
                  <dd>{sample.sectionCount ? 'Reading excerpt' : 'Generated page preview'}</dd>
                </div>
                {sample.sourcePageCount && (
                  <div>
                    <dt>Source document</dt>
                    <dd>{sample.sourcePageCount} pages</dd>
                  </div>
                )}
              </dl>
              <p className="wp-preview-note">{sample.previewNote}</p>
            </div>
            {sample.thumbnail && (
              <div className="wp-detail-cover">
                <Image
                  unoptimized
                  src={sample.thumbnail.url}
                  alt={sample.thumbnail.alt}
                  width={sample.thumbnail.width}
                  height={sample.thumbnail.height}
                  loading="eager"
                />
              </div>
            )}
          </div>
        </section>
        {doc.content && (
          <section className="wp-detail-section et-container">
            <h2>About this sample</h2>
            <RichText data={doc.content} enableGutter={false} />
          </section>
        )}
        {!!doc.workflow?.length && (
          <section className="wp-detail-section et-container">
            <h2>Workflow</h2>
            <ol className="wp-workflow">
              {doc.workflow.map((step, i) => (
                <li key={step.id || i}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
        {sample.services.length > 0 && (
          <section className="wp-detail-section et-container">
            <p className="wp-kicker">Continue exploring</p>
            <h2>Relevant services.</h2>
            <div className="wp-related">
              {sample.services.map((service) => (
                <Link key={service.href} href={service.href}>
                  {service.title}
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </section>
        )}
        <section className="wp-final et-container">
          <p className="wp-kicker">Your next project</p>
          <div>
            <h2>
              Have a similar
              <br />
              project <em>in mind?</em>
            </h2>
            <div>
              <p>
                Tell us about your content and requirements. Our team can review your project needs.
              </p>
              <Link className="wp-button" href={sample.quoteHref}>
                Request a Quote ↗
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  return (
    <main>
      <PageHero eyebrow="OUR WORK" title={doc.title} description={doc.description || undefined} />
      <article className="et-container et-content-section">
        {doc.content && <RichText data={doc.content} enableGutter={false} />}
        <ul className="et-content-list">
          {doc.outcomes?.map((item) => (
            <li key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      </article>
      <ContentCTA />
    </main>
  )
}
