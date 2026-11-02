import type { ReactNode } from 'react'
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Braces,
  Check,
  Code2,
  FileText,
  Globe2,
  Layers3,
  ScanLine,
  ShieldCheck,
  Workflow,
} from 'lucide-react'
import Link from '@/components/i18n/LocalizedLink'
import { Reveal } from '@/components/shared/Reveal'
import { ProductionConsole } from './ProductionConsole'
import styles from './technology-premium.module.css'

const capabilities = [
  {
    icon: BookOpen,
    number: '01',
    title: 'Publishing, built on structure.',
    text: 'Prepare content for print and digital reading with structure, typography and navigation considered together. The production specification guides the format and the checks.',
    tags: ['EPUB & HTML5', 'Print layouts', 'Accessible content'],
  },
  {
    icon: Braces,
    number: '02',
    title: 'Content that moves between systems.',
    text: 'Transform source documents into structured outputs with attention to metadata, references and content relationships. XML requirements are defined around the destination.',
    tags: ['JATS & SciELO XML', 'Document conversion', 'Metadata'],
  },
  {
    icon: Globe2,
    number: '03',
    title: 'Ready for another audience.',
    text: 'Connect translated content with the realities of production: text expansion, language-specific typography, multimedia timing and the learning environment.',
    tags: ['Multilingual DTP', 'eLearning', 'Media localization'],
  },
]

const quality = [
  {
    icon: FileText,
    title: 'Start with the specification',
    text: 'Agree source material, target formats, languages and acceptance criteria before production. A shared brief gives every review a clear reference point.',
  },
  {
    icon: ScanLine,
    title: 'Check the details that matter',
    text: 'Review content completeness, structure, layout and navigation. Define accessibility and format validation requirements for the intended reading environment.',
  },
  {
    icon: ShieldCheck,
    title: 'Keep judgment with specialists',
    text: 'Automated checks surface issues. Production specialists assess context, resolve exceptions and review deliverables against the agreed requirements.',
  },
]

export function TechnologyExperience({ children }: { children?: ReactNode }) {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="technology-title">
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.wrap}>
          <div className={styles.heroTop}>
            <span className={styles.eyebrow}>EPUBTRANS / TECHNOLOGY</span>
            <span className={styles.heroAnnotation}>
              Production expertise. Engineering mindset.
            </span>
          </div>
          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <h1 id="technology-title">
                Complex content.
                <br />
                <span>Considered systems.</span>
              </h1>
              <p>
                Behind every well-made publication is a connected process. We bring publishing
                expertise, practical automation and in-house development to the work that makes
                content ready.
              </p>
              <div className={styles.actions}>
                <Link className={styles.primaryButton} href="#production-os">
                  Discover Production OS <ArrowDown size={17} aria-hidden="true" />
                </Link>
                <Link className={styles.textLink} href="#production-technologies">
                  Explore our capabilities <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div
              className={styles.systemArt}
              role="img"
              aria-label="Source content connects through structure, production and review to print, digital and multilingual outputs."
            >
              <div className={styles.artLabel}>
                <span>THE CONTENT LIFECYCLE</span>
                <span>01 — 04</span>
              </div>
              <div className={styles.artOrbit} />
              <div className={styles.artOrbitInner} />
              <div className={styles.sourceNode}>
                <FileText size={19} />
                <span>Source content</span>
                <small>DOCX · PDF · XML</small>
              </div>
              <div className={styles.artCore}>
                <div className={styles.coreLogo}>
                  <Layers3 size={39} strokeWidth={1} />
                </div>
                <strong>
                  Content,
                  <br />
                  connected.
                </strong>
                <span>STRUCTURE / PRODUCE / REVIEW</span>
              </div>
              <div className={styles.outputNode}>
                <Check size={16} />
                <span>Ready for delivery</span>
              </div>
              <span className={styles.artTagOne}>Digital editions</span>
              <span className={styles.artTagTwo}>Print & layout</span>
              <span className={styles.artTagThree}>Multilingual content</span>
              <div className={styles.artFooter}>
                <span className={styles.signal} /> Technology guided by people
              </div>
            </div>
          </div>
          <div className={styles.heroFooter}>
            <span>Built around the work. Shaped by the people doing it.</span>
            <span>
              SCROLL TO EXPLORE <ArrowDown size={14} aria-hidden="true" />
            </span>
          </div>
        </div>
      </section>

      <nav className={styles.sectionNav} aria-label="Technology page sections">
        <div className={styles.wrap}>
          <span>IN THIS EXPERIENCE</span>
          <Link href="#production-technologies">Capabilities</Link>
          <Link href="#workflow-automation">Automation</Link>
          <Link href="#production-os">Production OS</Link>
          <Link href="#quality">Quality by design</Link>
        </div>
      </nav>

      <section
        id="production-technologies"
        className={`${styles.wrap} ${styles.section}`}
        aria-labelledby="capabilities-title"
      >
        <Reveal>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>01 / PRODUCTION TECHNOLOGIES</p>
              <h2 id="capabilities-title">
                One content journey.
                <br />
                <span>Many possibilities.</span>
              </h2>
            </div>
            <p>
              Good technology begins with understanding the destination. We select tools and
              workflows around your source files, publishing requirements and audience.
            </p>
          </div>
        </Reveal>
        <div className={styles.capabilities}>
          {capabilities.map(({ icon: Icon, ...item }) => (
            <Reveal key={item.number}>
              <article className={styles.capability}>
                <div className={styles.capabilityTop}>
                  <Icon size={26} strokeWidth={1.4} aria-hidden="true" />
                  <span>{item.number}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <ul className={styles.tags}>
                  {item.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
        <div className={styles.toolstrip}>
          <span>A PROJECT-SPECIFIC TOOLKIT</span>
          <p>
            Adobe InDesign <i /> FrameMaker <i /> Trados Studio <i /> Articulate Rise & Storyline
          </p>
          <small>Selected to suit the agreed production scope.</small>
        </div>
      </section>

      <section
        id="workflow-automation"
        className={styles.automation}
        aria-labelledby="automation-title"
      >
        <div className={`${styles.wrap} ${styles.split}`}>
          <Reveal>
            <div className={styles.automationVisual} aria-hidden="true">
              <div className={styles.visualTop}>
                <Workflow size={17} /> WORKFLOW DESIGN<span>ILLUSTRATIVE</span>
              </div>
              <div className={styles.flowInput}>A repeatable production task</div>
              <div className={styles.flowConnector} />
              <div className={styles.flowEngine}>
                <Code2 size={27} strokeWidth={1.4} />
                <div>
                  <strong>Focused automation</strong>
                  <span>Defined inputs. Visible exceptions.</span>
                </div>
              </div>
              <div className={styles.flowBranches}>
                <span>Routine output</span>
                <span>Exception flagged</span>
              </div>
              <div className={styles.flowReview}>
                <ShieldCheck size={19} /> Specialist review
              </div>
              <p>Clear checkpoints, from input to output.</p>
            </div>
          </Reveal>
          <Reveal>
            <div className={styles.automationCopy}>
              <p className={styles.eyebrow}>02 / AUTOMATION & APPLIED AI</p>
              <h2 id="automation-title">
                Make room for
                <br />
                <span>human expertise.</span>
              </h2>
              <p>
                Repeated preparation and coordination tasks can take attention away from the work
                that needs judgment. We explore focused scripts and internal utilities where the
                task, inputs and expected result can be clearly defined.
              </p>
              <ul className={styles.checklist}>
                <li>
                  <Check size={17} /> Map the workflow before choosing the technology.
                </li>
                <li>
                  <Check size={17} /> Keep exceptions visible and review responsibilities clear.
                </li>
                <li>
                  <Check size={17} /> Evaluate AI use against the project’s scope and requirements.
                </li>
              </ul>
              <p className={styles.smallNote}>
                Automation and AI are evaluated for each use case. Suitability, confidentiality
                requirements and human review are part of that discussion.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="production-os" className={styles.osSection} aria-labelledby="os-title">
        <div className={styles.wrap}>
          <Reveal>
            <div className={styles.osHeading}>
              <div>
                <p className={styles.eyebrow}>03 / THE NEXT CHAPTER</p>
                <h2 id="os-title">
                  EPUBTRANS
                  <br />
                  <span>Production OS.</span>
                </h2>
              </div>
              <div>
                <span className={styles.status}>
                  <span /> INTERNAL INITIATIVE · IN DEVELOPMENT
                </span>
                <p>
                  A more connected view of production. We’re exploring how requirements, task
                  context and specialist review could come together in one working environment.
                </p>
              </div>
            </div>
          </Reveal>
          <ProductionConsole />
          <div className={styles.osPrinciples}>
            <article>
              <span>01</span>
              <h3>Context travels with the work.</h3>
              <p>Bring requirements and source information closer to each production task.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Handoffs become clearer.</h3>
              <p>Explore a shared view of stages, responsibilities and items needing attention.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Review stays part of the process.</h3>
              <p>Keep specialist decisions connected to outputs and delivery readiness.</p>
            </article>
          </div>
          <div className={styles.osFootnote}>
            <p>
              Production OS is an internal initiative in development. This interactive concept
              illustrates the intended direction; it is not a live product or customer service.
            </p>
            <Link href="/technology/production-os">
              Inside the initiative <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="in-house-development"
        className={`${styles.wrap} ${styles.section} ${styles.development}`}
        aria-labelledby="development-title"
      >
        <Reveal>
          <div>
            <p className={styles.eyebrow}>04 / IN-HOUSE DEVELOPMENT</p>
            <h2 id="development-title">
              Built close
              <br />
              <span>to the work.</span>
            </h2>
            <p>
              Our development team works alongside production specialists. Real operational needs
              shape what we explore, what we prototype and what we improve.
            </p>
          </div>
        </Reveal>
        <ol>
          {[
            {
              title: 'Understand',
              text: 'Start with the task, its constraints and the people responsible for delivery.',
            },
            {
              title: 'Prototype',
              text: 'Build a focused concept around a defined production need.',
            },
            {
              title: 'Validate',
              text: 'Review outputs and exceptions with the specialists doing the work.',
            },
            {
              title: 'Refine',
              text: 'Use feedback to improve the approach and set the next priority.',
            },
          ].map((step, index) => (
            <li key={step.title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
              <ArrowUpRight size={19} aria-hidden="true" />
            </li>
          ))}
        </ol>
      </section>

      <section id="quality" className={styles.quality} aria-labelledby="quality-title">
        <div className={`${styles.wrap} ${styles.section}`}>
          <Reveal>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>05 / QUALITY BY DESIGN</p>
                <h2 id="quality-title">
                  A process is only as good
                  <br />
                  <span>as its review.</span>
                </h2>
              </div>
              <p>
                Quality is a sequence of informed decisions. From the first brief to the final
                package, the agreed specification remains the reference.
              </p>
            </div>
          </Reveal>
          <div className={styles.qualityGrid}>
            {quality.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      {children}
      <section className={`${styles.wrap} ${styles.closing}`}>
        <div>
          <p className={styles.eyebrow}>LET’S DEFINE WHAT COMES NEXT</p>
          <h2>
            Your content.
            <br />
            <span>A considered way forward.</span>
          </h2>
          <p>
            Bring us your formats, languages and production challenges.
            <br />
            We’ll help define the right approach.
          </p>
        </div>
        <Link className={styles.darkButton} href="/get-a-quote">
          Discuss your project <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </section>
    </main>
  )
}
