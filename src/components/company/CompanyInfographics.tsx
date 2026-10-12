import {
  BookOpen,
  FileText,
  Languages,
  Monitor,
  PencilLine,
  ScanLine,
  Send,
  Globe2,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import styles from './company-infographics.module.css'

const disciplines = [
  {
    icon: PencilLine,
    title: 'Editorial care',
    detail: 'Clarity, consistency and the author’s voice.',
    label: 'WORDS',
  },
  {
    icon: Languages,
    title: 'Language expertise',
    detail: 'Meaning and context for a new audience.',
    label: 'CULTURE',
  },
  {
    icon: Monitor,
    title: 'Digital production',
    detail: 'Structure and design for the final format.',
    label: 'FORMAT',
  },
]

export function ExpertiseInfographic() {
  return (
    <figure className={`${styles.figure} ${styles.expertise}`} data-company-motion="infographic">
      <figcaption>
        <p className="et-label">CONNECTED EXPERTISE</p>
        <h3>Three disciplines. One considered result.</h3>
      </figcaption>
      <div className={styles.hub} aria-hidden="true">
        <span className={styles.hubMark}>
          <BookOpen size={26} strokeWidth={1.5} />
        </span>
        <span>YOUR CONTENT</span>
      </div>
      <svg
        className={styles.branch}
        viewBox="0 0 900 70"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path className={styles.track} d="M450 0V28 M150 70V28H750V70 M450 28V70" />
        <path className={styles.draw} pathLength="1" d="M450 0V28 M150 70V28H750V70 M450 28V70" />
      </svg>
      <ul className={styles.disciplines}>
        {disciplines.map(({ icon: Icon, title, detail, label }, index) => (
          <li key={title} className={styles.card} style={{ '--step': index } as CSSProperties}>
            <span className={styles.icon}>
              <Icon size={26} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <p className={styles.kicker}>{label}</p>
            <h4>{title}</h4>
            <p>{detail}</p>
          </li>
        ))}
      </ul>
      <p className={styles.foot}>
        Connected decisions help preserve the purpose behind every edition.
      </p>
    </figure>
  )
}

const stages = [
  {
    icon: FileText,
    title: 'Understand',
    text: 'Start with the source, the audience and the brief.',
    detail: 'A clear direction',
  },
  {
    icon: PencilLine,
    title: 'Shape',
    text: 'Bring language, editorial care and production together.',
    detail: 'Thoughtful transformation',
  },
  {
    icon: ScanLine,
    title: 'Review',
    text: 'Check the content against the agreed requirements.',
    detail: 'Attention to detail',
  },
  {
    icon: Send,
    title: 'Deliver',
    text: 'Prepare the chosen formats for their next use.',
    detail: 'Ready for the reader',
  },
]

export function JourneyInfographic() {
  return (
    <figure className={`${styles.figure} ${styles.journey}`} data-company-motion="infographic">
      <figcaption>
        <p className="et-label">FROM SOURCE TO READER</p>
        <h3>A clear path through complex work.</h3>
        <p>
          Each project has its own scope. These connected stages show how the work comes together.
        </p>
      </figcaption>
      <ol className={styles.stages} aria-label="Publishing project stages">
        {stages.map(({ icon: Icon, title, text, detail }, index) => (
          <li key={title} className={styles.stage} style={{ '--step': index } as CSSProperties}>
            <div className={styles.stageHead}>
              <span className={styles.icon}>
                <Icon size={26} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <span className={styles.number}>0{index + 1}</span>
            </div>
            <h4>{title}</h4>
            <p>{text}</p>
            <span className={styles.stageDetail}>{detail}</span>
          </li>
        ))}
      </ol>
    </figure>
  )
}

export function AudienceInfographic() {
  return (
    <figure className={`${styles.figure} ${styles.audience}`} data-company-motion="infographic">
      <div className={styles.globe} aria-hidden="true">
        <svg viewBox="0 0 320 320" fill="none">
          <circle className={styles.orbit} cx="160" cy="160" r="147" strokeDasharray="3 12" />
          <circle cx="160" cy="160" r="112" />
          <ellipse cx="160" cy="160" rx="53" ry="112" />
          <ellipse cx="160" cy="160" rx="91" ry="112" />
          <path d="M48 160H272 M62 106H258 M62 214H258 M160 48V272" />
          <path className={styles.draw} pathLength="1" d="M57 202Q160 68 264 120" />
          <circle className={styles.point} cx="57" cy="202" r="7" />
          <circle className={styles.point} cx="264" cy="120" r="7" />
        </svg>
        <span className={styles.globeBadge}>
          <Globe2 size={17} /> CONTENT IN CONTEXT
        </span>
      </div>
      <div>
        <figcaption>
          <p className="et-label">BUILT AROUND YOUR AUDIENCE</p>
          <h3>Meaning travels through the details.</h3>
          <p>
            Language, presentation and local context work together to make content easier to
            understand.
          </p>
        </figcaption>
        <ul className={styles.audienceList}>
          <li>
            <span>01</span>
            <div>
              <h4>Language & tone</h4>
              <p>Terminology and voice suited to the reader.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h4>Layout & format</h4>
              <p>Scripts, structure and a considered reading experience.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h4>Regional context</h4>
              <p>Relevant examples, conventions and reference material.</p>
            </div>
          </li>
        </ul>
      </div>
    </figure>
  )
}
