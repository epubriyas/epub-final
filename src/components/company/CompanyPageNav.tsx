import Link from '@/components/i18n/LocalizedLink'
import styles from './company-page-nav.module.css'

const pages = [
  { key: 'about', label: 'About EPUBTRANS', href: '/about-us' },
  { key: 'global', label: 'Global Delivery & Collaboration', href: '/company/global-presence' },
  { key: 'careers', label: 'Careers', href: '/company/careers' },
] as const

export function CompanyPageNav({ current }: { current: (typeof pages)[number]['key'] }) {
  return (
    <nav className={`et-container ${styles.nav}`} aria-label="Company pages">
      {pages.map((page) => (
        <Link
          key={page.key}
          href={page.href}
          aria-current={current === page.key ? 'page' : undefined}
        >
          {page.label}
        </Link>
      ))}
    </nav>
  )
}
