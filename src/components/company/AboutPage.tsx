import type { Metadata } from 'next'
import Link from '@/components/i18n/LocalizedLink'
import { ArrowUpRight } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import { CompanyMotion } from './CompanyMotion'
import { CompanyPageNav } from './CompanyPageNav'
import styles from './about-page.module.css'

const seoTitle = 'About EPUBTRANS | Digital Publishing & Content Production'
const seoDescription =
  'Learn about EPUBTRANS, a digital publishing and content-transformation partner supporting publishers and localization providers with specialist production services.'
export const aboutMetadata: Metadata = {
  title: { absolute: seoTitle },
  description: seoDescription,
  alternates: { canonical: 'https://www.epubtrans.com/about-us' },
  openGraph: {
    type: 'website',
    siteName: 'EPUBTRANS',
    title: seoTitle,
    description: seoDescription,
    url: 'https://www.epubtrans.com/about-us',
  },
  twitter: { card: 'summary', title: seoTitle, description: seoDescription },
}

const audienceGroups = [
  {
    title: 'Publishers & Academic Publishing Organizations',
    paragraphs: [
      'Book publishers, academic publishers and journal publishing teams often manage manuscripts, figures, tables, references, structured content and multiple publication formats.',
      'EPUBTRANS supports relevant production activities, including editorial preparation, typesetting, XML markup, EPUB creation, document conversion and accessibility-related production.',
      'Our involvement can be tailored to a defined stage of the publishing workflow or a combination of related activities.',
    ],
    link: 'Explore Publishing Services',
    href: '/typesetting-services',
  },
  {
    title: 'Localization Service Providers & Translation Agencies',
    paragraphs: [
      'Localization projects frequently require production work beyond translation, particularly when source content includes complex layouts, non-editable documents, multilingual typography or eLearning materials.',
      'We support LSPs and translation agencies with document conversion, multilingual DTP, post-translation formatting and related localization production.',
      'Our role is to complement your existing workflow and client relationships, with the scope and handoff requirements agreed for each project.',
    ],
    link: 'Explore Localization Production Services',
    href: '/desktop-publishing-services',
  },
]

const capabilities = [
  {
    title: 'Publishing & Editorial Production',
    description:
      'Support for book and journal typesetting, page composition, manuscript editing, proofreading, graphics and related publishing-production activities.',
  },
  {
    title: 'eBook, XML & Structured Content',
    description:
      'Creation and conversion of digital publishing content, including EPUB production, XML conversion, JATS-based markup and SciELO-related structured-content workflows where applicable.',
    links: [
      { label: 'SciELO XML Markup', href: '/scielo-xml-markup-services' },
      { label: 'eBook Creation Services', href: '/ebook-creation-services' },
    ],
  },
  {
    title: 'Document & Data Conversion',
    description:
      'Transformation of documents into agreed formats, including editable document preparation, PDF conversion, OCR-assisted extraction and document reconstruction.',
    links: [{ label: 'Data Conversion Services', href: '/data-conversion-services' }],
  },
  {
    title: 'Localization & Multilingual Production',
    description:
      'Multilingual desktop publishing, post-translation formatting and related production support for content prepared for different languages and scripts.',
  },
  {
    title: 'eLearning & Multimedia',
    description:
      'Production and localization support for digital learning materials and associated multimedia elements, according to the supported file formats and project requirements.',
  },
  {
    title: 'Digital Accessibility',
    description:
      'Accessibility-related preparation and remediation of supported documents and digital publications, based on agreed specifications and applicable testing requirements.',
    links: [{ label: 'Accessibility Services', href: '/accessibility-services' }],
  },
]

const workflow = [
  {
    title: 'Understand the Project',
    description:
      'We review the available source files, project instructions, reference materials, target formats and delivery expectations.',
  },
  {
    title: 'Establish the Requirements',
    description:
      'We clarify the production activities, expected deliverables, volume, technical specifications, dependencies, revision requirements and schedule considerations.',
  },
  {
    title: 'Carry Out the Production Work',
    description:
      'The relevant editorial, publishing, conversion, accessibility or localization activities are performed according to the agreed project scope.',
  },
  {
    title: 'Review and Prepare Deliverables',
    description:
      'Applicable quality checks are performed according to the project requirements. Final files are prepared for handoff in the agreed formats and package structure.',
  },
]

const principles = [
  {
    title: 'Understanding the Content',
    paragraphs: [
      'Different materials require different production methods. A scholarly journal article, an illustrated book, a scanned PDF and a multilingual eLearning course present distinct technical requirements.',
      'We consider the source content and its intended use when assessing a project.',
    ],
  },
  {
    title: 'Working With Defined Specifications',
    paragraphs: [
      'Publisher styles, source-file structures, target formats, layout references, language requirements and validation instructions help determine how production should be carried out.',
      'We use these requirements to establish the appropriate project scope.',
    ],
  },
  {
    title: 'Connecting Related Production Activities',
    paragraphs: [
      'Some projects require more than one service. Typesetting may be followed by EPUB production, while document conversion may precede multilingual DTP.',
      'EPUBTRANS can review connected production requirements and identify the activities needed for the intended deliverables.',
    ],
  },
  {
    title: 'Collaborating With Client Teams',
    paragraphs: [
      'We work within agreed production instructions, review cycles and delivery arrangements.',
      "For publishers and localization service providers, this means supporting the production work while respecting the client's existing editorial, project-management and customer relationships.",
    ],
  },
]

const existingMission =
  'To support publishers, localization service providers and content organizations with practical publishing-production and content-transformation services that help prepare content for its intended formats, languages and delivery environments.'
const existingVision =
  'To develop EPUBTRANS as a capable international production partner by combining publishing knowledge, technical workflows, responsible use of technology and collaborative project delivery.'

function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <header className={styles.sectionHeading}>
      {eyebrow && <p className="et-label">{eyebrow}</p>}
      <h2>{title}</h2>
    </header>
  )
}

export async function AboutPage() {
  const settings = await getSiteSettings()
  const about = settings.aboutPage
  const useManagedCopy = Boolean(
    about?.missionVisionApproved && about.mission?.trim() && about.vision?.trim(),
  )
  const mission = useManagedCopy ? about?.mission : existingMission
  const vision = useManagedCopy ? about?.vision : existingVision

  return (
    <CompanyMotion className={styles.page}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About EPUBTRANS',
            description: seoDescription,
            url: 'https://www.epubtrans.com/about-us',
            about: { '@type': 'Organization', name: 'EPUBTRANS' },
          }).replace(/</g, '\\u003c') }}
        />
        <section className="et-page-hero">
          <div className="et-container">
            <h1>About EPUBTRANS</h1>
            <p className="et-lead">A Digital Publishing, Content Transformation &amp; Localization Partner</p>
            <div className={styles.heroCopy}>
              <p>
                EPUBTRANS is a Chennai, India-based company providing digital publishing,
                content-transformation and localization-related production services to organizations
                worldwide.
              </p>
              <p>
                We support publishers, academic publishing organizations, localization service
                providers and translation agencies with the specialist work required to prepare,
                structure, format, convert and deliver content.
              </p>
              <p>
                Our services span publishing production, typesetting, XML conversion, EPUB creation,
                document conversion, digital accessibility, multilingual desktop publishing and
                eLearning localization.
              </p>
              <div className={styles.actions}>
                <Link className="et-button" href="/get-a-quote">
                  Discuss Your Project <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
                <Link className="et-text-link" href="/services">
                  Explore Our Services <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <CompanyPageNav current="about" />

        <section id="who-we-are" className={`et-container et-content-section ${styles.intro}`}>
          <SectionHeading eyebrow="WHO WE ARE" title="Who We Are" />
          <div className={styles.readingColumn}>
            <p>
              EPUBTRANS brings together publishing-production and content-transformation
              capabilities to support organizations working with complex documents, publications
              and multilingual content.
            </p>
            <p>
              Publishing and localization projects often involve more than creating or translating
              text. Content may need to be edited, typeset, structured, converted, adapted or
              prepared for specific delivery platforms.
            </p>
            <p>
              Our role is to support these production requirements through defined workflows,
              attention to technical specifications and appropriate quality checks.
            </p>
            <p>
              We can assist with an individual production activity or review a project involving
              multiple related services, depending on the source materials, required formats and
              agreed scope.
            </p>
          </div>
        </section>

        <section id="who-we-work-with" className={`et-content-section ${styles.audience}`}>
          <div className="et-container">
            <SectionHeading eyebrow="WHO WE WORK WITH" title="Who We Work With" />
            <p className={styles.sectionLead}>
              We support organizations that need specialist production services integrated into
              their existing publishing or localization workflows.
            </p>
            <div className={styles.audienceGrid}>
              {audienceGroups.map((group) => (
                <article key={group.title} className={styles.audienceCard}>
                  <h3>{group.title}</h3>
                  {group.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  <Link className="et-text-link" href={group.href}>
                    {group.link} <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="what-we-do" className="et-container et-content-section">
          <SectionHeading eyebrow="WHAT WE DO" title="What We Do" />
          <p className={styles.sectionLead}>
            EPUBTRANS provides services across connected areas of content preparation,
            transformation and delivery.
          </p>
          <ul className={styles.capabilityGrid}>
            {capabilities.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                {item.links && (
                  <div className={styles.capabilityLinks}>
                    {item.links.map((link) => (
                      <Link key={link.href} className="et-text-link" href={link.href}>
                        {link.label} <ArrowUpRight size={16} aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className={styles.sectionAction}>
            <Link className="et-text-link" href="/services">
              Explore All Services <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section id="our-approach" className={`${styles.approach} et-content-section`}>
          <div className="et-container">
            <SectionHeading eyebrow="OUR APPROACH TO CONTENT PRODUCTION" title="Our Approach to Content Production" />
            <p className={styles.sectionLead}>
              Every project begins with understanding what needs to be produced and how the final
              content will be used.
            </p>
            <ol className={styles.workflowGrid}>
              {workflow.map((item, index) => (
                <li key={item.title}>
                  <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </li>
              ))}
            </ol>
            <p className={styles.workflowNote}>
              This approach helps make responsibilities, expectations and deliverables clearer
              before and during production.
            </p>
          </div>
        </section>

        <section id="what-matters" className="et-container et-content-section">
          <SectionHeading eyebrow="WHAT MATTERS IN OUR WORK" title="What Matters in Our Work" />
          <div className={styles.principleGrid}>
            {principles.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </article>
            ))}
          </div>
        </section>

        <section id="mission-vision" className={`${styles.missionVision} et-content-section`}>
          <div className="et-container">
            <SectionHeading eyebrow="COMPANY DIRECTION" title="Mission & Vision" />
            <div className={styles.missionGrid}>
              <article>
                <h3>Our Mission</h3>
                <p>{mission}</p>
              </article>
              <article>
                <h3>Our Vision</h3>
                <p>{vision}</p>
              </article>
            </div>
          </div>
        </section>

        <section id="where-we-work" className={`et-container et-content-section ${styles.location}`}>
          <SectionHeading eyebrow="WHERE WE WORK" title="Based in India, Supporting International Content Workflows" />
          <div className={styles.readingColumn}>
            <p>
              EPUBTRANS is based in Chennai, Tamil Nadu, India, and works with organizations
              requiring publishing, document-transformation and localization-related production
              services.
            </p>
            <p>
              Our services are relevant to teams managing publications and content across different
              languages, file formats and delivery requirements.
            </p>
            <p>
              Project coordination, timelines, communication arrangements and supported technical
              requirements are determined through the agreed engagement.
            </p>
          </div>
        </section>

        <section className={`et-container et-content-section ${styles.explore}`}>
          <SectionHeading eyebrow="EXPLORE OUR SERVICES" title="Explore Our Services" />
          <div className={styles.readingColumn}>
            <p>
              Whether you are planning a new publishing project, converting existing documents or
              arranging specialist production support for multilingual content, our services can
              be assessed against your requirements.
            </p>
            <p>
              Explore the service directory to identify relevant capabilities and learn more about
              individual production activities.
            </p>
          </div>
          <Link className="et-text-link" href="/services">
            View All Services <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </section>

        <section className={`${styles.finalCta} et-content-section`}>
          <div className="et-container">
            <SectionHeading eyebrow="WORK WITH EPUBTRANS" title="Work With EPUBTRANS" />
            <p className={styles.sectionLead}>
              Looking for a production partner for publishing, digital-content conversion or
              localization-related work?
            </p>
            <p>
              Tell us about the content you are working with, the source files available, the
              deliverables required and the expected schedule.
            </p>
            <p>We can review your requirements and discuss the appropriate next steps.</p>
            <div className={styles.actions}>
              <Link className="et-button" href="/get-a-quote">
                Discuss Your Project <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link className="et-text-link" href="/get-a-quote">
                Request a Quote <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
    </CompanyMotion>
  )
}
