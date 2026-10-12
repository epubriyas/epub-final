import type { BlogInfographicBlock } from '@/payload-types'
import styles from '@/components/blog/blog.module.css'

export function BlogInfographic({
  title,
  description,
  layout,
  items,
  source,
}: BlogInfographicBlock) {
  return (
    <figure
      className={`not-prose ${styles.infographic} ${layout === 'steps' ? styles.steps : ''}`}
      data-blog-motion
    >
      <figcaption>
        <span className={styles.eyebrow}>AT A GLANCE</span>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </figcaption>
      <ol className={styles.infoItems}>
        {items.map((item, index) => (
          <li key={item.id || index}>
            <span className={styles.infoValue}>
              {layout === 'metrics' && item.value ? item.value : String(index + 1).padStart(2, '0')}
            </span>
            <h4>{item.label}</h4>
            {item.description && <p>{item.description}</p>}
          </li>
        ))}
      </ol>
      {source && <p className={styles.source}>{source}</p>}
    </figure>
  )
}
