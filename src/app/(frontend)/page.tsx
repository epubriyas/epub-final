import { landingMetadata } from '@/lib/landing-seo'
import Link from '@/components/i18n/LocalizedLink'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { ArrowLink } from '@/components/editorial/Primitives'
import { Reveal } from '@/components/shared/Reveal'
import { contentPayload } from '@/lib/content'
import { getLandingContent } from '@/lib/landing-content'
import { getWorkSamples } from '@/lib/portfolio'
import { HomeMotion } from '@/components/home/HomeMotion'
import { HomeHeroFilm } from '@/components/home/HomeHeroFilm'
import { HeroHeadline } from '@/components/home/HeroHeadline'
import { PremiumWorkflow } from '@/components/home/PremiumWorkflow'
import { ContentTransformationInfographic } from '@/components/home/HomeInfographics'
import heroStyles from '@/components/home/home-hero-layout.module.css'
export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const {
    home: { seo },
  } = await getLandingContent()
  return landingMetadata(seo)
}

export default async function HomePage() {
  const [{ home: content, directory }, work, payload] = await Promise.all([
    getLandingContent(),
    getWorkSamples(),
    contentPayload(),
  ])
  const { docs: articles } = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    where: { _status: { equals: 'published' } },
    pagination: false,
    select: { title: true, slug: true, categories: true, meta: { description: true } },
    depth: 1,
    sort: '-publishedAt',
  })
  const resources = articles
    .filter((article) =>
      /\b(publishing|typesetting|localization|xml|epub|accessibility|conversion|multilingual|formatting|proofreading|copyediting|elearning)\b/i.test(
        [
          article.title,
          article.meta?.description,
          ...(article.categories ?? []).map((category) =>
            typeof category === 'object' ? category.title : '',
          ),
        ].join(' '),
      ),
    )
    .slice(0, 3)
  const samples = work
    .filter((sample) => sample.thumbnail || sample.pageCount || sample.sectionCount)
    .slice(0, 3)
  const priorityServices = directory.categories
    .flatMap((category) => category.services)
    .filter(
      (card) =>
        card.status === 'active' &&
        [
          '/typesetting-services',
          '/scielo-xml-markup-services',
          '/desktop-publishing-services',
        ].includes(card.href),
    )
  return (
    <HomeMotion>
      <section className={`et-hero ${heroStyles.hero}`} data-home-motion="hero">
        <div className="et-container">
          <div className={heroStyles.stage} data-hero-stage>
            <HomeHeroFilm />
            <div className={`et-hero-meta ${heroStyles.meta}`}>
              <span className="et-label">EPUBTRANS / PUBLISHING &amp; LANGUAGE PRODUCTION</span>
              <span className="et-label et-hero-index">A NEW CHAPTER / EPUBTRANS</span>
            </div>
            <div className={`et-hero-layout ${heroStyles.layout}`}>
              <div className={`et-hero-copy ${heroStyles.copy}`}>
                <HeroHeadline title="Digital Publishing, Content Transformation & Localization" />
                <p data-hero-paragraph>
                  From books and journals to XML, EPUB and multilingual production, EPUBTRANS helps
                  publishers and localization teams prepare content for print, digital and global
                  audiences.
                </p>
                <div className="sp-actions">
                  <Link
                    className={`et-button ${heroStyles.solidButton}`}
                    href={content.primaryCTA.href}
                  >
                    {content.primaryCTA.label} <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                  <Link className={heroStyles.glassButton} href={content.secondaryCTA.href}>
                    {content.secondaryCTA.label} <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </div>
                <nav
                  className={heroStyles.capabilities}
                  aria-label="Explore our production capabilities"
                >
                  <Link href="/typesetting-services">Publishing &amp; typesetting</Link>
                  <Link href="/scielo-xml-markup-services">XML &amp; digital content</Link>
                  <Link href="/desktop-publishing-services">Multilingual production</Link>
                </nav>
              </div>
            </div>
            <a href="#possibilities" className={heroStyles.explore}>
              Discover the possibilities <ArrowDown size={14} aria-hidden="true" />
            </a>
          </div>
          <div className={heroStyles.details}>
            {content.intro.slice(1).map((paragraph) => (
              <p key={paragraph} data-hero-paragraph>
                {paragraph}
              </p>
            ))}
          </div>
          <div className="et-hero-bottom">
            <a href="#possibilities">
              Discover the possibilities <ArrowDown size={16} aria-hidden="true" />
            </a>
            <span>Human expertise. Digital possibilities.</span>
          </div>
        </div>
      </section>
      <section id="possibilities" className="et-intro et-container">
        <Reveal>
          <p className="et-label">ONE CONNECTED CONTENT PARTNER</p>
          <div className="et-intro-grid">
            <div className="et-copy">
              <h2>{content.audience.title}</h2>
              <p className="et-lead">{content.audience.intro}</p>
            </div>
            <div className="et-copy">
              {content.audience.cards.map((card) => (
                <article className="et-copy" key={card.title}>
                  <h3>{card.title}</h3>
                  {card.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  <ArrowLink href={card.cta.href}>{card.cta.label}</ArrowLink>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
      <section className="et-services-section">
        <div className="et-container">
          <div className="et-section-head">
            <div>
              <p className="et-label">WHAT WE DO</p>
              <h2>{content.services.title}</h2>
            </div>
            <ArrowLink href={content.services.cta.href}>{content.services.cta.label}</ArrowLink>
          </div>
          <p className="et-lead">{content.services.intro}</p>
          <div className="et-service-rows" data-home-motion="services">
            {content.services.categories.map((category, i) => (
              <Link
                key={category.title}
                href={category.cta.href}
                className="et-service-row"
                aria-label={category.cta.label}
              >
                <span className="et-label">{String(i + 1).padStart(2, '0')}</span>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <ArrowUpRight className="et-arrow" size={30} aria-hidden="true" />
              </Link>
            ))}
          </div>
          <nav className="sp-actions" aria-label="Priority production services">
            {priorityServices.map((card) => (
              <ArrowLink href={card.href} key={card.href}>
                {card.linkLabel}
              </ArrowLink>
            ))}
          </nav>
        </div>
      </section>
      <section className="et-feature">
        <div className="et-container et-feature-grid">
          <ContentTransformationInfographic content={content.transformation} />
          <div className="et-feature-copy et-copy">
            <p className="et-label">{content.transformation.title}</p>
            <h2>{content.transformation.subtitle}</h2>
            {content.transformation.paragraphs.map((paragraph, i) => (
              <p className={i === 0 ? 'et-lead' : undefined} key={paragraph}>
                {paragraph}
              </p>
            ))}
            <h3>{content.transformation.sourceTitle}</h3>
            <p>{content.transformation.source}</p>
            <h3>{content.transformation.outputTitle}</h3>
            <p>{content.transformation.output}</p>
            <p>{content.transformation.note}</p>
          </div>
        </div>
      </section>
      <section className="et-technology-home">
        <div className="et-container et-technology-grid">
          <div>
            <p className="et-label">HUMAN EXPERTISE. DIGITAL WORKFLOWS.</p>
            <h2>{content.workflow.title}</h2>
          </div>
          <PremiumWorkflow steps={content.workflow.steps} />
        </div>
      </section>
      <section className="et-intro et-container">
        <div className="et-section-head">
          <h2>{content.values.title}</h2>
        </div>
        <div className="et-service-rows">
          {content.values.items.map((item, i) => (
            <div className="et-service-row" key={item.title}>
              <span className="et-label">{String(i + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>
      {samples.length > 0 && (
        <section className="et-work-home et-container">
          <div className="et-section-head">
            <div>
              <p className="et-label">CONTENT IN PRACTICE</p>
              <h2>{content.portfolio.title}</h2>
            </div>
            <ArrowLink href={content.portfolio.cta.href}>{content.portfolio.cta.label}</ArrowLink>
          </div>
          <p className="et-lead">{content.portfolio.intro}</p>
          <p>{content.portfolio.note}</p>
          <div className="et-work-layout" data-home-motion="work">
            <Link href={content.portfolio.cta.href} className="et-work-primary">
              <div className="et-work-art" aria-hidden="true">
                <div>
                  <small>FORM & LANGUAGE</small>
                  <b>
                    The art
                    <br />
                    of a page.
                  </b>
                  <span>EPUBTRANS / TYPESETTING</span>
                </div>
                <div>
                  <small>CONTENT & STRUCTURE</small>
                  <b>
                    क<br />
                    Aa
                  </b>
                  <span>PRINT TO DIGITAL</span>
                </div>
              </div>
              <p className="et-label">{samples[0].category}</p>
              <h3>{samples[0].title}</h3>
              <p>{samples[0].description}</p>
              <span className="et-text-link">
                {content.portfolio.cta.label} <ArrowUpRight size={22} aria-hidden="true" />
              </span>
            </Link>
            <div className="et-work-secondary">
              {samples.slice(1).map((sample) => (
                <div key={sample.id}>
                  <p className="et-label">{sample.category}</p>
                  <h3>{sample.title}</h3>
                  <p>{sample.description}</p>
                  <ArrowLink href={content.portfolio.cta.href}>
                    {content.portfolio.cta.label}
                  </ArrowLink>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {resources.length > 0 && (
        <section className="et-work-home et-container">
          <div className="et-section-head">
            <div>
              <p className="et-label">RESOURCES</p>
              <h2>{content.resources.title}</h2>
            </div>
            <ArrowLink href={content.resources.cta.href}>{content.resources.cta.label}</ArrowLink>
          </div>
          <p className="et-lead">{content.resources.intro}</p>
          <div className="et-service-rows">
            {resources.map((article, i) => (
              <Link className="et-service-row" href={'/blog/' + article.slug} key={article.id}>
                <span className="et-label">{String(i + 1).padStart(2, '0')}</span>
                <h3>{article.title}</h3>
                <p>{article.meta?.description}</p>
                <ArrowUpRight size={25} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="et-company-home" data-home-motion="company">
        <div className="et-container">
          <p className="et-label">LET’S TALK ABOUT YOUR CONTENT</p>
          <h2>{content.enquiry.title}</h2>
          <div>
            <div className="et-copy">
              {content.enquiry.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <ArrowLink href={content.enquiry.primaryCTA.href}>
              {content.enquiry.primaryCTA.label}
            </ArrowLink>
            <ArrowLink href={content.enquiry.secondaryCTA.href}>
              {content.enquiry.secondaryCTA.label}
            </ArrowLink>
          </div>
        </div>
      </section>
    </HomeMotion>
  )
}
