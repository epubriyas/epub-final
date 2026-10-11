import Link from '@/components/i18n/LocalizedLink'
import type { TechnologyGuide as Guide } from '@/config/technology-guides'

export function TechnologyReadingNav() {
  return (
    <nav className="et-container et-tech-reading-nav" aria-label="On this page">
      <span className="et-label">ON THIS PAGE</span>
      <Link href="#overview">Overview</Link>
      <Link href="#capabilities">Capabilities</Link>
      <Link href="#details">In detail</Link>
      <Link href="#example">Practical example</Link>
      <Link href="#questions">Common questions</Link>
    </nav>
  )
}

export function TechnologyIntroduction({ guide }: { guide: Guide }) {
  return (
    <section id="overview" className="et-container et-tech-section et-tech-reading-intro">
      <h2>{guide.introduction}</h2>
      <div>
        {guide.explanation.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  )
}

export function TechnologyGuideContent({ guide }: { guide: Guide }) {
  return (
    <>
      <section id="details" className="et-container et-tech-section">
        <p className="et-label">A CLOSER LOOK</p>
        <h2>Understand the approach.</h2>
        <div className="et-tech-detail-rows">
          {guide.details.map((detail, index) => (
            <article key={detail.title}>
              <div>
                <p className="et-label">0{index + 1}</p>
                <h3>{detail.title}</h3>
              </div>
              <div>
                <p>{detail.text}</p>
                <ul>
                  {detail.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="example" className="et-container et-tech-section et-tech-example">
        <p className="et-label">EXPLAINED STEP BY STEP</p>
        <h2>{guide.example.title}</h2>
        <p>{guide.example.text}</p>
        <ol>
          {guide.example.steps.map((step, index) => (
            <li key={step}>
              <span className="et-label">0{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>
      <section id="questions" className="et-container et-tech-section et-tech-questions">
        <p className="et-label">CLEAR ANSWERS</p>
        <h2>Common questions.</h2>
        {guide.questions.map((item) => (
          <article key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </section>
    </>
  )
}
