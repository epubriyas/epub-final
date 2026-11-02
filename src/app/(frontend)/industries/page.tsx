import Image from 'next/image'
import { Check, ArrowUpRight } from 'lucide-react'
import Link from '@/components/i18n/LocalizedLink'
import { pageMetadata } from '@/lib/seo'
import { ArrowLink, ContentCTA } from '@/components/editorial/Primitives'
import styles from './industries.module.css'

export const dynamic = 'force-dynamic'

export const metadata = pageMetadata({
  title: { absolute: 'Industries We Support | Publishing & Localization | EPUBTRANS' },
  description:
    'Explore EPUBTRANS services for publishing, education, technology, business and media teams, including digital content production, localization and accessibility.',
  alternates: { canonical: '/industries' },
})

const industryGroups = [
  {
    number: '01',
    id: 'core-industries',
    title: 'Core Industries',
    description: 'Publishing, learning, technology and medical content prepared for print and digital use.',
    industries: [
      {
        number: '01',
        id: 'publishing-scholarly-communications',
        title: 'Publishing & Scholarly Communications',
        description:
          'Turn manuscripts into publication-ready books, journals and digital editions. We support publishers, scholarly societies and research teams with editorial preparation, typesetting, EPUB production and structured XML.',
        image: '/images/services/hero-typesetting.webp',
        imageAlt: 'A publication layout reviewed against printed book proofs',
        materials: ['Books and monographs', 'Journal articles', 'Reference publications'],
        approach:
          'Build a consistent reading experience across print and digital formats. The production brief brings together house style, heading hierarchy, tables, figures, citations and reference treatment. Agree proof stages and output specifications up front so editorial corrections can be carried through the commissioned editions.',
        services: [
          { label: 'Copyediting', href: '/copyediting-services' },
          { label: 'Typesetting', href: '/typesetting-services' },
          { label: 'eBook Creation', href: '/ebook-creation-services' },
          { label: 'SciELO XML Markup', href: '/scielo-xml-markup-services' },
        ],
        serviceHref: '/services#publishing-editorial',
      },
      {
        number: '02',
        id: 'education-elearning',
        title: 'Education & eLearning',
        description:
          'Prepare courses, training resources and learner materials for new languages and delivery formats. We help education providers and learning teams coordinate localized text, presentation layouts, narration and accessibility-related production.',
        image: '/images/services/hero-elearning-localization.webp',
        imageAlt: 'A multilingual content team reviewing learning material on a tablet',
        materials: ['Course and module scripts', 'Training presentations', 'Learner resources'],
        approach:
          'Plan the complete learning asset, from on-screen instructions to supporting handouts. Review editable source files, course terminology, text expansion, narration scripts and subtitle requirements together. Confirm the target platform, file formats and review stages before production so language and layout decisions support the intended learning experience.',
        services: [
          { label: 'eLearning Localization', href: '/elearning-localization-services' },
          { label: 'Translation', href: '/translation-services' },
          { label: 'Voiceover', href: '/voiceover-services' },
          { label: 'Accessibility', href: '/accessibility-services' },
        ],
        serviceHref: '/services#elearning-multimedia',
      },
      {
        number: '03',
        id: 'technology-digital-content',
        title: 'Technology & Digital Content',
        description:
          'Make technical information easier to maintain, translate and publish. We support technology teams with document conversion, multilingual formatting and production for user guides, product documentation and structured content collections.',
        image: '/images/services/hero-data-conversion.webp',
        imageAlt: 'Source documents being digitized and reviewed alongside their digital files',
        materials: [
          'User and technical guides',
          'Product documentation',
          'Structured document collections',
        ],
        approach:
          'Keep product terminology, navigation and document structure consistent across versions. Assess source quality, heading levels, tables, screenshots, cross-references and conversion rules before work begins. Agree how product names, interface text and subsequent revisions will be handled across the required languages and output formats.',
        services: [
          { label: 'Data Conversion', href: '/data-conversion-services' },
          { label: 'Translation', href: '/translation-services' },
          { label: 'Desktop Publishing', href: '/desktop-publishing-services' },
          { label: 'Proofreading', href: '/proofreading-services' },
        ],
        serviceHref: '/services#localization-dtp',
      },
      {
        number: '04',
        id: 'healthcare-medical-publishing',
        title: 'Healthcare & Medical Publishing',
        description:
          'For medical publishers, healthcare organizations, research institutions, and life sciences teams: professional document preparation, medical publishing production, translation, typesetting, and digital content services.',
        image: '/images/services/hero-healthcare-medical-publishing.webp',
        imageAlt:
          'Medical textbook and research journal proofs beside a laptop displaying a publication layout',
        materials: [
          'Medical books and textbooks',
          'Medical journal articles and research publications',
          'Healthcare educational and training materials',
        ],
        approach:
          'Support medical and healthcare content through structured editorial preparation, accurate document formatting, multilingual production, and digital publishing workflows. Define terminology, source requirements, formatting specifications, and review responsibilities before production begins. Include reference style, tables, figure captions and approved terminology in the brief, with subject-matter review responsibilities agreed with your team.',
        services: [
          { label: 'Typesetting', href: '/typesetting-services' },
          { label: 'Translation', href: '/translation-services' },
          { label: 'Desktop Publishing', href: '/desktop-publishing-services' },
          { label: 'Proofreading', href: '/proofreading-services' },
          { label: 'eBook Creation', href: '/ebook-creation-services' },
          { label: 'Accessibility', href: '/accessibility-services' },
        ],
        serviceHref: '/services#publishing-editorial',
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
        number: '05',
        id: 'corporate-business-communications',
        title: 'Corporate & Business Communications',
        description:
          'Present business information clearly across documents, presentations and language versions. We support corporate teams with translation, desktop publishing, graphic design and proofreading for internal and external communications.',
        image: '/images/services/hero-desktop-publishing.webp',
        imageAlt: 'A desktop publishing specialist checking a multilingual document layout',
        materials: [
          'Reports and presentations',
          'Employee communications',
          'Brand and business documents',
        ],
        approach:
          'Apply approved brand guidelines to typography, charts, tables and page layouts while allowing for translated text expansion. Establish the source version, terminology, editable-file requirements and approval contacts before production. Coordinate revisions across language versions so the delivery package reflects the agreed content and presentation.',
        services: [
          { label: 'Translation', href: '/translation-services' },
          { label: 'Desktop Publishing', href: '/desktop-publishing-services' },
          { label: 'Graphic Design', href: '/graphic-design-image-services' },
          { label: 'Proofreading', href: '/proofreading-services' },
        ],
        serviceHref: '/services#localization-dtp',
      },
      {
        number: '06',
        id: 'media-entertainment',
        title: 'Media & Entertainment',
        description:
          'Adapt interviews, video programmes and narrated content for wider audiences. We support media teams with transcription, translation, subtitling and voiceover production based on the source recording and intended release format.',
        image: '/images/services/hero-subtitling.webp',
        imageAlt: 'An audiovisual editor reviewing subtitles against a video timeline',
        materials: [
          'Video and interview content',
          'Narration scripts',
          'Audio and subtitle assets',
        ],
        approach:
          'Align the language workflow with the recording, script and delivery specification. Confirm speaker identification, timing, pronunciation guidance, subtitle treatment and audio requirements for the commissioned services. Review source quality and script readiness early, then agree linguistic and media review stages before final files are prepared.',
        services: [
          { label: 'Subtitling', href: '/subtitling-services' },
          { label: 'Transcription', href: '/transcription-services' },
          { label: 'Voiceover', href: '/voiceover-services' },
          { label: 'Translation', href: '/translation-services' },
        ],
        serviceHref: '/services#elearning-multimedia',
      },
      {
        number: '07',
        id: 'accessibility-inclusive-content',
        title: 'Accessibility & Inclusive Content',
        description:
          'Make document structure part of your publishing workflow. We support accessibility preparation and remediation for EPUB, PDF, Word, PowerPoint and InDesign-based projects, with requirements defined for each source format and deliverable.',
        image: '/images/services/hero-accessibility.webp',
        imageAlt: 'A specialist reviewing document structure and reading order on screen',
        materials: ['Digital publications', 'Reports and documents', 'Presentation materials'],
        approach:
          'Review heading structure, reading order, navigation, tables, links and image descriptions against the agreed project requirements. Assess the available source files before defining remediation tasks and format-specific checks. Confirm target criteria, assessment methods, content-owner input and any specialist validation separately, so the scope and review responsibilities are clear.',
        services: [
          { label: 'Accessibility', href: '/accessibility-services' },
          { label: 'eBook Creation', href: '/ebook-creation-services' },
          { label: 'Desktop Publishing', href: '/desktop-publishing-services' },
          { label: 'Data Conversion', href: '/data-conversion-services' },
        ],
        serviceHref: '/services#digital-accessibility',
      },
    ],
  },
] as const

const projectSteps = [
  {
    title: 'Share the source',
    text: 'Provide representative files, the intended audience, languages and required delivery formats.',
  },
  {
    title: 'Define the scope',
    text: 'Confirm the services, technical requirements, review stages and any dependencies before production.',
  },
  {
    title: 'Produce and review',
    text: 'Prepare the agreed content and assess it against the approved brief, style guidance and review criteria.',
  },
  {
    title: 'Prepare delivery',
    text: 'Resolve agreed feedback and organize the commissioned files for your next publishing or communication step.',
  },
]

const questions = [
  {
    title: 'Can a project combine several services?',
    text: 'Yes. A brief may bring together editorial, layout, conversion, language or accessibility work. The proposal should identify which services are included, their sequence and who reviews each output.',
  },
  {
    title: 'What should we send for an initial assessment?',
    text: 'Share a representative source file or sample, approximate volume, target languages, required formats, style guidance and preferred schedule. Tell us about any platform or accessibility requirements that may affect production.',
  },
  {
    title: 'How are languages, formats and technical requirements confirmed?',
    text: 'Availability is assessed for the individual assignment. Language coverage, subtitle formats, voice talent, software compatibility, media processing and platform integration require confirmation before they form part of the agreed scope.',
  },
  {
    title: 'How are quality expectations agreed?',
    text: 'The brief establishes the editing depth, layout checks, technical criteria and review responsibilities relevant to the commissioned work. Accessibility targets and specialist validation are agreed separately where applicable; outcomes depend on the source materials and approved scope.',
  },
]

export default function IndustriesPage() {
  return (
    <main>
      <section className={styles.hero} aria-labelledby="industries-title">
        <div className={`et-container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className="et-label">EPUBTRANS / INDUSTRIES</p>
            <h1 id="industries-title">Digital Publishing & Localization Services by Industry</h1>
            <p className={styles.heroDescription}>
              Explore how EPUBTRANS supports publishing, education, technology, business and media
              teams with content production, conversion, multilingual formatting and
              accessibility-related services.
            </p>
            <div className={styles.heroActions}>
              <ArrowLink href="#core-industries">Explore industries</ArrowLink>
              <ArrowLink href="/get-a-quote">Discuss your project</ArrowLink>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroMainImage}>
              <Image
                alt="An editorial workspace with manuscripts and digital publication proofs"
                fill
                priority
                sizes="(max-width: 800px) 100vw, 50vw"
                src="/images/services/hero-copyediting.webp"
              />
            </div>
            <div className={styles.heroCaption} aria-hidden="true">
              <span>One content partner</span>
              <span>Publishing · Language · Access</span>
            </div>
          </div>
        </div>
      </section>

      <nav className={styles.industryNav} aria-label="Find your industry">
        <div className="et-container">
          <span className="et-label">FIND YOUR INDUSTRY</span>
          <div>
            {industryGroups.map((group) =>
              group.industries.map((industry) => (
                <Link href={`#${industry.id}`} key={industry.id}>
                  {industry.title}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              )),
            )}
          </div>
        </div>
      </nav>

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
                      sizes="(max-width: 700px) 100vw, 50vw"
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
                    <div className={styles.materials}>
                      <h4>Typical project materials</h4>
                      <ul>
                        {industry.materials.map((material) => (
                          <li key={material}>
                            <Check size={15} aria-hidden="true" />
                            {material}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className={styles.approach}>{industry.approach}</p>
                    <div className={styles.relatedServices}>
                      <h4>Relevant services</h4>
                      <div>
                        {industry.services.map((service) => (
                          <Link href={service.href} key={service.href}>
                            {service.label}
                            <ArrowUpRight size={13} aria-hidden="true" />
                          </Link>
                        ))}
                      </div>
                    </div>
                    <Link className={styles.serviceLink} href={industry.serviceHref}>
                      Explore related services <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className={styles.projectSection} aria-labelledby="industry-project-title">
        <div className="et-container">
          <div className={styles.sectionHeading}>
            <div>
              <p className="et-label">FROM BRIEF TO DELIVERY</p>
              <h2 id="industry-project-title">How We Assess Industry-Specific Content Projects</h2>
            </div>
            <p>
              Industry context informs the brief. Your source materials and intended outputs
              determine the work.
            </p>
          </div>
          <ol className={styles.process}>
            {projectSteps.map((step, index) => (
              <li key={step.title}>
                <span aria-hidden="true">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <p className={styles.scopeNote}>
            Project scope, supported languages, file compatibility, specialist requirements and
            schedules are confirmed after assessment.
          </p>
        </div>
      </section>

      <section
        className={`et-container ${styles.questions}`}
        aria-labelledby="industry-questions-title"
      >
        <div>
          <p className="et-label">PLANNING YOUR PROJECT</p>
          <h2 id="industry-questions-title">
            Frequently Asked Questions About Project Requirements
          </h2>
          <p>
            Start with your materials, audience and delivery requirements. We can then discuss the
            services relevant to your brief.
          </p>
          <ArrowLink href="/get-a-quote">Discuss your requirements</ArrowLink>
        </div>
        <div>
          {questions.map((question) => (
            <details key={question.title}>
              <summary>
                {question.title}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{question.text}</p>
            </details>
          ))}
        </div>
      </section>

      <ContentCTA />
    </main>
  )
}
