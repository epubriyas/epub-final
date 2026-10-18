import { Search, FileText, Send, BookOpen, Languages, Layers, ArrowUpRight } from 'lucide-react'
import Link from '@/components/i18n/LocalizedLink'
import styles from '@/app/(frontend)/company/careers/careers-listing.module.css'

const steps = [
  {
    icon: Search,
    title: 'Find your fit',
    text: 'Explore the opening and the kind of work involved.',
  },
  {
    icon: FileText,
    title: 'Prepare your introduction',
    text: 'Bring relevant experience, skills and work samples.',
  },
  {
    icon: Send,
    title: 'Contact the team',
    text: 'Use the role’s application link and include your availability.',
  },
]
export function CareerInfographic() {
  return (
    <figure className={styles.process} data-blog-motion>
      <figcaption>
        <p className="et-label">THREE STEPS TO GET STARTED</p>
      </figcaption>
      <ol>
        {steps.map(({ icon: Icon, title, text }, index) => (
          <li key={title}>
            <span className={styles.stepIcon}>
              <Icon size={24} strokeWidth={1.4} aria-hidden="true" />
            </span>
            <span className={styles.stepNumber}>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
      <p className={styles.processNote}>
        The requirements and selection process are confirmed for each role.
      </p>
    </figure>
  )
}

export function CareerDisciplines() {
  return (
    <div className={styles.disciplines}>
      {[
        {
          icon: BookOpen,
          title: 'Editorial & publishing',
          text: 'Copyediting, typesetting, indexing and eBook production.',
        },
        {
          icon: Languages,
          title: 'Language & localization',
          text: 'Translation, multilingual layouts and learning content.',
        },
        {
          icon: Layers,
          title: 'Digital & media',
          text: 'Structured content, XML, graphics and multimedia production.',
        },
      ].map(({ icon: Icon, title, text }, index) => (
        <article key={title} data-blog-motion>
          <Link href="/services" className={styles.disciplineLink}>
            <div className={styles.disciplineTop}>
              <Icon size={28} strokeWidth={1.3} aria-hidden="true" />
              <span>0{index + 1}</span>
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
            <span className={styles.disciplineAction}>
              Explore this work <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </Link>
        </article>
      ))}
    </div>
  )
}
