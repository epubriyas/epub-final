import { pageMetadata } from '@/lib/seo'
import Link from '@/components/i18n/LocalizedLink'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { ArrowLink } from '@/components/editorial/Primitives'
import { Reveal } from '@/components/shared/Reveal'
import { getHomeContent, getPreviewAccess } from '@/lib/content'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { HomeMotion } from '@/components/home/HomeMotion'
import { PremiumWorkflow } from '@/components/home/PremiumWorkflow'
import { ContentTransformationInfographic } from '@/components/home/HomeInfographics'
export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({
  title: 'EPUBTRANS — Publishing, Localization & Digital Content',
  description:
    'Explore EPUBTRANS publishing, translation, eLearning localization, multimedia and accessibility services.',
  alternates: { canonical: '/' },
})

const services = [
  [
    '01',
    'Publishing & content',
    'Copyediting, typesetting, eBooks and structured content.',
    '/services#publishing',
  ],
  [
    '02',
    'Language & localization',
    'Translation and multilingual desktop publishing for new audiences.',
    '/services#language',
  ],
  [
    '03',
    'Media & multimedia',
    'Subtitling, voiceover and transcription for content that is seen and heard.',
    '/services#media',
  ],
  [
    '04',
    'Learning',
    'Adapt eLearning for different languages, cultures and audiences.',
    '/services#learning',
  ],
  [
    '05',
    'Accessibility',
    'Explore accessible document and digital content requirements.',
    '/services#accessibility',
  ],
]
export default async function HomePage() {
  const content = await getHomeContent()
  const { draft } = await getPreviewAccess()
  if (content?.layout?.length)
    return (
      <main>
        {draft && <LivePreviewListener />}
        <RenderBlocks blocks={content.layout} />
      </main>
    )
  return (
    <HomeMotion>
      <section className="et-hero" data-home-motion="hero">
        <div className="et-container">
          <div className="et-hero-meta">
            <span className="et-label">PUBLISHING · LOCALIZATION · DIGITAL CONTENT</span>
            <span className="et-label et-hero-index">A NEW CHAPTER / EPUBTRANS</span>
          </div>
          <div className="et-hero-layout">
            <div className="et-hero-copy">
              <h1>
                Your content.
                <br />
                <span>A wider world.</span>
              </h1>
              <p>
                Ideas deserve to travel. We bring publishing, language and digital content together
                to help yours reach its next audience.
              </p>
              <ArrowLink href="/services">Explore what we do</ArrowLink>
            </div>
            <div
              className="et-hero-art"
              role="img"
              aria-label="Original editorial composition of multilingual pages opening into a book"
            >
              <div className="et-art-rule" />
              <div className="et-paper et-paper-back">
                <span>CONTENT, CONNECTED.</span>
                <b>अ</b>
              </div>
              <div className="et-paper et-paper-mid">
                <span>
                  ANOTHER LANGUAGE.
                  <br />A NEW PERSPECTIVE.
                </span>
                <b>அ</b>
              </div>
              <div className="et-paper et-paper-front">
                <div className="et-paper-top">
                  EPUBTRANS <span>01 / EDITIONS</span>
                </div>
                <div className="et-paper-title">
                  Ideas
                  <br />
                  <em>in motion.</em>
                </div>
                <div className="et-paper-divider" />
                <p>
                  From the first word.
                  <br />
                  To the next world.
                </p>
                <div className="et-paper-bottom">
                  Aa <span>文</span> அ
                </div>
              </div>
              <span className="et-art-caption">WORDS BECOME WORLDS.</span>
            </div>
          </div>
          <div className="et-hero-bottom">
            <a href="#possibilities">
              Discover the possibilities <ArrowDown size={16} />
            </a>
            <span>Human expertise. Digital possibilities.</span>
          </div>
        </div>
      </section>
      <section id="possibilities" className="et-intro et-container">
        <Reveal>
          <p className="et-label">ONE CONNECTED CONTENT PARTNER</p>
          <div className="et-intro-grid">
            <h2>
              Different formats.
              <br />
              Different languages.
              <br />
              <em>The same intent.</em>
            </h2>
            <div>
              <p className="et-lead">
                A manuscript. A learning experience. A message that needs to cross cultures.
              </p>
              <p>
                EPUBTRANS brings together editorial production, translation and digital publishing.
                We help you shape content for the people, platforms and formats it needs to reach.
              </p>
              <ArrowLink href="/company">Get to know EPUBTRANS</ArrowLink>
            </div>
          </div>
        </Reveal>
      </section>
      <section className="et-services-section">
        <div className="et-container">
          <div className="et-section-head">
            <div>
              <p className="et-label">WHAT WE DO</p>
              <h2>
                Every word.
                <br />
                Every dimension.
              </h2>
            </div>
            <ArrowLink href="/services">All services</ArrowLink>
          </div>
          <div className="et-service-rows" data-home-motion="services">
            {services.map(([n, title, desc, href]) => (
              <Link key={n} href={href} className="et-service-row">
                <span className="et-label">{n}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
                <ArrowUpRight className="et-arrow" size={30} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="et-feature">
        <div className="et-container et-feature-grid">
          <ContentTransformationInfographic />
          <div className="et-feature-copy">
            <p className="et-label">SOLUTIONS / DIGITAL PUBLISHING</p>
            <h2>
              One idea.
              <br />
              Many ways
              <br />
              to experience it.
            </h2>
            <p className="et-lead">
              Your content is more than a file. Give it a life across print, eBooks and digital
              publishing platforms.
            </p>
            <ArrowLink href="/solutions/digital-publishing">Explore digital publishing</ArrowLink>
          </div>
        </div>
      </section>
      <section className="et-industries-home et-container">
        <div className="et-section-head">
          <div>
            <p className="et-label">BUILT AROUND YOUR CONTENT</p>
            <h2>
              Context makes
              <br />
              the difference.
            </h2>
          </div>
          <p className="et-lead">
            Academic publishers, journals and global brands each have a different story to tell.
            Start with the requirements that matter to yours.
          </p>
        </div>
        <div className="et-industry-links">
          {['Publishing', 'Education', 'Business content'].map((item, i) => (
            <Link href="/industries" key={item}>
              <span className="et-label">0{i + 1}</span>
              <h3>{item}</h3>
              <ArrowUpRight size={25} />
            </Link>
          ))}
        </div>
      </section>
      <section className="et-technology-home">
        <div className="et-container et-technology-grid">
          <div>
            <p className="et-label">HUMAN EXPERTISE. DIGITAL WORKFLOWS.</p>
            <h2>
              Precision behind
              <br />
              every page.
            </h2>
            <p>
              From XML conversion to digital editions, technology helps structure content. Editorial
              expertise gives it meaning.
            </p>
            <ArrowLink href="/technology" light>
              Explore our approach
            </ArrowLink>
          </div>
          <PremiumWorkflow />
        </div>
      </section>
      <section className="et-work-home et-container">
        <div className="et-section-head">
          <div>
            <p className="et-label">CONTENT IN PRACTICE</p>
            <h2>
              See the craft.
              <br />
              Explore the work.
            </h2>
          </div>
          <ArrowLink href="/work">Explore our portfolio</ArrowLink>
        </div>
        <div className="et-work-layout" data-home-motion="work">
          <Link href="/work" className="et-work-primary">
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
            <p className="et-label">PUBLISHING / CRAFT & PRODUCTION</p>
            <h3>Content, thoughtfully composed.</h3>
            <span className="et-text-link">
              Explore publishing samples <ArrowUpRight size={22} />
            </span>
          </Link>
          <div className="et-work-secondary">
            <div>
              <p className="et-label">LEARNING / LOCALIZATION</p>
              <h3>
                Learning that
                <br />
                crosses languages.
              </h3>
              <p>Explore the eLearning examples in our existing portfolio.</p>
              <ArrowLink href="/work">View learning samples</ArrowLink>
            </div>
            <div>
              <p className="et-label">RESOURCES</p>
              <h3>
                A practical start
                <br />
                for your next project.
              </h3>
              <p>
                Find project checklists, articles and resources for publishing, localization and
                accessible content.
              </p>
              <ArrowLink href="/resources">Explore resources</ArrowLink>
            </div>
          </div>
        </div>
      </section>
      <section className="et-company-home" data-home-motion="company">
        <div className="et-container">
          <p className="et-label">THE PEOPLE BEHIND THE CONTENT</p>
          <h2>
            Technology moves it.
            <br />
            <em>People make it matter.</em>
          </h2>
          <div>
            <p>
              EPUBTRANS combines publishing expertise with digital production. Get to know the
              company behind your next edition, localization or learning project.
            </p>
            <ArrowLink href="/company">Our story</ArrowLink>
          </div>
        </div>
      </section>
    </HomeMotion>
  )
}
