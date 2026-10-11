import Image from 'next/image'
import Link from '@/components/i18n/LocalizedLink'
import { pageMetadata } from '@/lib/seo'
import { ArrowLink, ContentCTA } from '@/components/editorial/Primitives'
import styles from './industries.module.css'

export const dynamic = 'force-dynamic'

export const metadata = pageMetadata({
  title: 'Industries',
  description:
    'Publishing, localization and accessible digital content for specialized industries.',
  alternates: { canonical: '/industries' },
})

const industryGroups = [
  {
    number: '01',
    id: 'core-industries',
    title: 'Core Industries',
    description: 'Publishing, education and technology content prepared for readers and users.',
    industries: [
      {
        number: '01',
        id: 'publishing-scholarly-communications',
        title: 'Publishing & Scholarly Communications',
        description:
          'For publishers, research & academia teams, and scholarly journals: eBook production, XML conversion, editing, typesetting and digital publishing.',
        image: '/industries/publishing.jpg',
        imageAlt: 'Editorial notes being prepared for publication',
        serviceHref: '/services#publishing',
      },
      {
        number: '02',
        id: 'education-elearning',
        title: 'Education & eLearning',
        description:
          'For education and learning teams: eLearning production, course localization, multilingual learning content and accessible educational materials.',
        image: '/industries/education.jpg',
        imageAlt: 'Books and learning materials in a bright classroom setting',
        serviceHref: '/services#learning',
      },
      {
        number: '03',
        id: 'technology-digital-content',
        title: 'Technology & Digital Content',
        description:
          'For technology teams: technical documentation, digital content conversion and localization for multilingual software-related content.',
        image: '/industries/technology.jpg',
        imageAlt: 'Detailed view of a digital circuit board',
        serviceHref: '/services#language',
      },
    ],
  },
  {
    number: '02',
    id: 'specialized-markets',
    title: 'Specialized Markets',
    description: 'Business, media and accessible content shaped for wider audiences.',
    industries: [
      {
        number: '04',
        id: 'corporate-business-communications',
        title: 'Corporate & Business Communications',
        description:
          'Prepare business reports, corporate presentations and business documents for multilingual communication.',
        image: '/industries/corporate.jpg',
        imageAlt: 'Business performance dashboard open on a laptop',
        serviceHref: '/services#language',
      },
      {
        number: '05',
        id: 'media-entertainment',
        title: 'Media & Entertainment',
        description:
          'Make audiovisual content ready for more audiences with subtitling, transcription, voiceover, multimedia localization and accessibility.',
        image: '/industries/media.jpg',
        imageAlt: 'Film production slate held on a location shoot',
        serviceHref: '/services#media',
      },
      {
        number: '06',
        id: 'accessibility-inclusive-content',
        title: 'Accessibility & Inclusive Content',
        description:
          'Prepare EPUB, PDF, Word, PowerPoint and InDesign documents for accessible, inclusive digital publishing.',
        image: '/industries/accessibility.jpg',
        imageAlt: 'Colleagues reviewing digital content together on a laptop',
        serviceHref: '/services#accessibility',
      },
    ],
  },
] as const

export default function IndustriesPage() {
  return (
    <main>
      <section className={styles.hero} aria-labelledby="industries-title">
        <div className={`et-container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className="et-label">EPUBTRANS / INDUSTRIES</p>
            <h1 id="industries-title">Content support shaped around your industry.</h1>
            <p className={styles.heroDescription}>
              Publishing, localization and accessible digital content for specialized industries.
              Explore the areas we support and the services that may fit your project.
            </p>
            <div className={styles.heroActions}>
              <ArrowLink href="#core-industries">Explore industries</ArrowLink>
              <ArrowLink href="/get-a-quote">Discuss your project</ArrowLink>
            </div>
          </div>

          <div
            className={styles.heroVisual}
            role="img"
            aria-label="Images representing publishing, education and accessible digital content"
          >
            <div className={styles.heroMainImage}>
              <Image
                alt=""
                fill
                priority
                sizes="(max-width: 800px) 100vw, 50vw"
                src="/industries/publishing.jpg"
              />
            </div>
            <div className={styles.heroSideImages}>
              <div className={styles.heroSideImage}>
                <Image
                  alt=""
                  fill
                  sizes="(max-width: 800px) 34vw, 18vw"
                  src="/industries/education.jpg"
                />
              </div>
              <div className={styles.heroSideImage}>
                <Image
                  alt=""
                  fill
                  sizes="(max-width: 800px) 34vw, 18vw"
                  src="/industries/accessibility.jpg"
                />
              </div>
            </div>
            <div className={styles.heroCaption} aria-hidden="true">
              <span>One content partner</span>
              <span>Publishing · Language · Access</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.directory}>
        {industryGroups.map((group) => (
          <section
            aria-labelledby={`industry-group-${group.number}`}
            className={styles.group}
            id={group.id}
            key={group.number}
          >
            <div className={styles.groupHeading}>
              <p className={`et-label ${styles.groupLabel}`}>
                <span>{group.number}</span> / INDUSTRIES
              </p>
              <div className={styles.groupTitle}>
                <h2 id={`industry-group-${group.number}`}>{group.title}</h2>
                <p>{group.description}</p>
              </div>
            </div>

            <div className={styles.grid}>
              {group.industries.map((industry) => (
                <article className={styles.card} id={industry.id} key={industry.number}>
                  <div className={styles.imageFrame}>
                    <Image
                      alt={industry.imageAlt}
                      className={styles.image}
                      fill
                      priority={industry.number === '01'}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      src={industry.image}
                    />
                    <span className={styles.imageNumber} aria-hidden="true">
                      {industry.number}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardLabel}>
                      {group.number === '01' ? 'CORE INDUSTRY' : 'SPECIALIZED MARKET'}
                    </p>
                    <h3>{industry.title}</h3>
                    <p className={styles.description}>{industry.description}</p>
                    <Link className={styles.serviceLink} href={industry.serviceHref}>
                      Explore related services <span aria-hidden="true">↗</span>
                    </Link>
                    <span className={styles.cardIndex} aria-hidden="true">
                      {industry.number} <span>—</span> {group.title}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <ContentCTA />
    </main>
  )
}
