import Image from 'next/image'
import Link from '@/components/i18n/LocalizedLink'
import { pageMetadata } from '@/lib/seo'
import { getWorkSamples } from '@/lib/portfolio'
import { WorkExplorer } from '@/components/work/WorkExplorer'
import './work.css'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'Portfolio & Selected Work',
  description:
    'Inspect selected EPUBTRANS publishing, layout and digital content samples in an on-site viewing experience.',
  alternates: { canonical: '/work' },
})

export default async function Work({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>
}) {
  const samples = await getWorkSamples()
  const requested = (await searchParams).category
  const initialCategory =
    typeof requested === 'string'
      ? samples.find((sample) => sample.category === requested || sample.categoryKey === requested)
          ?.category || ''
      : ''
  const heroes = samples.filter((sample) => sample.featured && sample.thumbnail).slice(0, 2)
  return (
    <main className="wp-work">
      <section className="wp-hero et-container">
        <div className="wp-hero-copy">
          <p className="wp-kicker">EPUBTRANS / Selected work</p>
          <h1>
            Selected publishing <br />
            and content <em>samples.</em>
          </h1>
          <p className="wp-hero-intro">
            A closer look at the craft. Explore selected{' '}
            {samples.length
              ? [...new Set(samples.map((sample) => sample.category.toLowerCase()))].join(', ')
              : 'content'}{' '}
            samples, from the page to the digital edition.
          </p>
          <div className="wp-hero-actions">
            <a className="wp-button" href="#explore-work">
              Explore Our Work <span aria-hidden="true">↓</span>
            </a>
            <Link className="wp-text-button" href="/get-a-quote">
              Request a Quote ↗
            </Link>
          </div>
          <p className="wp-hero-footnote">Actual sample excerpts. Viewed here, on our site.</p>
        </div>
        <div className="wp-hero-composition" aria-label="Selected sample previews">
          {heroes.length ? (
            heroes.map((sample, i) => (
              <figure className={`wp-hero-sheet wp-hero-sheet-${i + 1}`} key={sample.id}>
                <Image
                  unoptimized
                  src={sample.thumbnail!.url}
                  alt={sample.thumbnail!.alt}
                  width={sample.thumbnail!.width}
                  height={sample.thumbnail!.height}
                  loading="eager"
                />
                <figcaption>
                  {sample.category}
                  <span>{sample.format} / Preview</span>
                </figcaption>
              </figure>
            ))
          ) : (
            <div className="wp-placeholder">
              <span>Selected work</span>
              <p>
                Approved previews
                <br />
                are being prepared.
              </p>
            </div>
          )}
          <span className="wp-edition-mark" aria-hidden="true">
            THE WORK
            <br />
            IN DETAIL
          </span>
        </div>
      </section>
      <WorkExplorer samples={samples} initialCategory={initialCategory} />
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
            <Link className="wp-button" href="/get-a-quote">
              Request a Quote ↗
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
