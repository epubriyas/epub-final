import { pageMetadata } from '@/lib/seo'
import { PageHero, ContentCTA, ArrowLink } from '@/components/editorial/Primitives'
import styles from './company.module.css'
import { CompanyPageNav } from '@/components/company/CompanyPageNav'
import { CompanyMotion } from '@/components/company/CompanyMotion'
import { ExpertiseInfographic, JourneyInfographic } from '@/components/company/CompanyInfographics'

const companyTopics = [
  {
    label: 'ABOUT EPUBTRANS',
    title: 'The expertise behind your content.',
    items: [
      {
        id: 'why-epubtrans',
        title: 'Why EPUBTRANS',
        paragraphs: [
          'A publishing project rarely belongs to one discipline. An edited manuscript still needs a thoughtful layout. A translated document needs space for a different script. An eBook needs a structure that works beyond the printed page. EPUBTRANS brings these connected needs into one conversation, helping you plan the whole journey of your content.',
          'Our capabilities span editorial work, translation, typesetting, structured content and digital production. That breadth helps you consider decisions together: how terminology affects a translation, how a layout affects reading, and how a file format affects distribution.',
          'The value of a good partnership is practical. It means a brief that reflects your priorities, a shared understanding of the deliverables, and room to resolve questions before they become costly revisions. Bring us the challenge behind your project, as well as the files, so we can discuss an approach that fits.',
        ],
      },
      {
        id: 'leadership',
        title: 'Leadership',
        paragraphs: [
          'Good leadership makes complex work easier to understand. For a content project, that means giving people a clear brief, making thoughtful decisions when requirements compete, and keeping the final reader in view. These are the principles we want to bring to every publishing conversation.',
          'The people guiding a project need to understand both its creative intent and its production requirements. Editorial judgement, language knowledge and technical understanding each have a role. A question about tone deserves as much attention as a question about file structure or delivery.',
          'When discussing your project, ask us who will coordinate the work, how feedback will be handled and where to raise a decision that needs attention. A clear working relationship begins with knowing who to speak to and what happens next.',
        ],
      },
    ],
  },
  {
    label: 'TRUST',
    title: 'Confidence starts with clear expectations.',
    items: [
      {
        id: 'certifications',
        title: 'Certifications',
        paragraphs: [
          'Trust grows when evidence and expectations are clear. If your organization requires a particular certification, share that requirement during the initial conversation so our team can provide current documentation where available.',
          'The scope matters as much as the certificate itself. Confirm which services, processes or locations the documentation covers before making it part of your project requirements.',
        ],
      },
      {
        id: 'quality',
        title: 'Quality',
        paragraphs: [
          'Quality is found in the details a reader should never have to question: a consistent term, a clear sentence, a correctly placed heading, or a reading order that makes sense. Editorial review, language review and production checks each address a different part of that experience.',
          'We use the project brief to discuss what a finished result should look like. Your style guide, reference material, output specifications and acceptance criteria help turn a broad expectation of quality into a useful review plan.',
        ],
      },
      {
        id: 'security',
        title: 'Security',
        paragraphs: [
          'Unpublished manuscripts, learning materials and business documents can carry sensitive information. Responsible project planning includes a conversation about confidentiality and how the material should be shared.',
          'Tell us about your file transfer, access and retention requirements before sending sensitive content. Our team can review the proposed handling arrangements and any non-disclosure agreement with you before work begins.',
        ],
      },
      {
        id: 'compliance',
        title: 'Compliance',
        paragraphs: [
          'A publication needs to work in the environment where it will be used. Accessibility requirements, platform specifications and regional conventions can shape its structure, presentation and delivery format.',
          'Share the standards and submission requirements your project must meet. We can then discuss the relevant services, the checks needed and the evidence expected at handover, with the scope agreed before production.',
        ],
      },
      {
        id: 'partnerships',
        title: 'Partnerships',
        paragraphs: [
          'A useful publishing partner understands the work on either side of their own contribution. Your editors, designers, language teams and production teams need content they can pick up and use with confidence.',
          'Whether you need support for one stage or several connected disciplines, tell us how your current process works. Together, we can discuss inputs, review responsibilities and delivery formats that fit the way your team already operates.',
        ],
      },
    ],
  },
]
export const metadata = pageMetadata({
  title: 'About EPUBTRANS',
  description:
    'Meet EPUBTRANS, a publishing and localization company in Chennai bringing editorial care, language expertise and digital production to your content.',
  alternates: { canonical: '/company' },
})

export default function Company() {
  return (
    <CompanyMotion className={styles.page}>
      <PageHero
        eyebrow="COMPANY / EPUBTRANS"
        title="Behind every edition, a human perspective."
        description="Your content carries someone’s knowledge, effort and point of view. We bring editorial care, language expertise and digital production together to help it reach the people it was created for."
      />
      <CompanyPageNav current="about" />
      <section
        id="about-us"
        className="et-container et-detail-grid et-company-section"
        data-company-motion="section"
      >
        <h2>About us</h2>
        <div>
          <p className="et-lead">
            EPUBTRANS is a publishing and localization company based in Chennai, India. We help
            publishers and content teams prepare their work for different formats, languages and
            audiences, with attention to both the message and the reading experience.
          </p>
          <p>
            Our capabilities connect copyediting, proofreading, typesetting, XML and data
            conversion, eBook production, translation and learning localization. Each discipline
            serves a shared purpose: helping content become clear, consistent and ready for its next
            use.
          </p>
          <p>
            A book, a training course and a multilingual document each have their own demands. We
            begin with those differences. Understanding what you are making, who it is for and how
            it will be delivered gives the work a clear direction from the start.
          </p>
          <ArrowLink href="/services">Explore our capabilities</ArrowLink>
        </div>
        <div className={styles.fullWidth}>
          <ExpertiseInfographic />
        </div>
      </section>
      <section
        id="our-story"
        className="et-container et-detail-grid et-company-section"
        data-company-motion="section"
      >
        <div>
          <p className="et-label">OUR STORY</p>
          <h2>Every format changes. The meaning matters.</h2>
        </div>
        <div>
          <p className="et-lead">
            Our story is rooted in the relationship between words, design and technology. Content
            moves through all three, and the choices made along the way shape what a reader
            ultimately understands.
          </p>
          <p>
            A manuscript becomes a designed page. That page becomes a digital edition. A learning
            module moves into another language. At every transition, something needs careful
            attention: the author’s voice, the structure of the information, or the way a new
            audience will experience it.
          </p>
          <p>
            EPUBTRANS brings these connected disciplines together. Our work spans publishing,
            websites, learning materials and multimedia, where language decisions and production
            decisions often meet. A longer translated sentence, for example, can change a layout; a
            heading structure can change how a digital publication is navigated.
          </p>
          <p>
            That connection shapes how we think about our role. The goal is to carry the purpose of
            the original into its next form, with care for the people who created it and the people
            who will read, watch or learn from it.
          </p>
        </div>
        <div className={styles.fullWidth}>
          <JourneyInfographic />
        </div>
      </section>
      <section
        id="mission-vision"
        className="et-company-home et-company-section"
        data-company-motion="section"
      >
        <div className="et-container">
          <p className="et-label">MISSION & VISION</p>
          <h2>
            Bring ideas to new formats.
            <br />
            <em>Bring cultures into conversation.</em>
          </h2>
          <div className={styles.purpose}>
            <article>
              <h3>Our mission</h3>
              <p>
                To help people publish and share content that is clear, carefully prepared and
                suited to its audience. We bring human judgement and production technology together
                to support the journey from source material to a usable final edition.
              </p>
              <p>
                In practice, that means keeping meaning, consistency and readability at the centre
                of the work, whether the task involves a single manuscript or several language and
                format requirements.
              </p>
            </article>
            <article>
              <h3>Our vision</h3>
              <p>
                A future where useful ideas can travel across languages, cultures and formats
                without losing the thought behind them. We want more people to encounter content
                they can understand, navigate and use with confidence.
              </p>
              <p>
                As publishing tools evolve, that ambition stays human: make knowledge easier to
                reach, respect different audiences and preserve the voice that makes each piece of
                content worth sharing.
              </p>
            </article>
          </div>
          <ArrowLink href="/get-a-quote">Work with EPUBTRANS</ArrowLink>
        </div>
      </section>
      {companyTopics.map((group) => (
        <section key={group.label} className="et-container et-content-section">
          <p className="et-label">{group.label}</p>
          <h2>{group.title}</h2>
          <div className="et-company-topics">
            {group.items.map((item) => (
              <article key={item.id} id={item.id} data-company-motion="section">
                <h3>{item.title}</h3>
                {item.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>
            ))}
          </div>
          <ArrowLink href="/get-a-quote">Discuss your requirements</ArrowLink>
        </section>
      ))}
      <section className="et-container et-content-section">
        <p className="et-label">LET’S CONNECT</p>
        <h2>Start a conversation.</h2>
        <p className="et-lead">Chennai, India</p>
        <p>
          <a href="mailto:info@epubtrans.com">info@epubtrans.com</a>
          <br />
          <a href="tel:+914431363907">+91 44 3136 3907</a>
        </p>
        <ArrowLink href="/company/careers">Explore careers</ArrowLink>
      </section>
      <ContentCTA />
    </CompanyMotion>
  )
}
