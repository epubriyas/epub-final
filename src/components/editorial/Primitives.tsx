import Link from '@/components/i18n/LocalizedLink'
import { ArrowRight } from 'lucide-react'
export function ArrowLink({
  href,
  children,
  light = false,
}: {
  href: string
  children: React.ReactNode
  light?: boolean
}) {
  return (
    <Link href={href} className={`et-text-link ${light ? 'et-text-link-light' : ''}`}>
      {children}
      <ArrowRight className="et-arrow" size={20} />
    </Link>
  )
}
export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <section className="et-page-hero">
      <div className="et-container">
        <p className="et-label">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="et-lead">{description}</p>}
      </div>
    </section>
  )
}
export function ContentCTA() {
  return (
    <section className="et-inline-cta et-container">
      <h2>Discuss your project requirements</h2>
      <ArrowLink href="/get-a-quote">Request a quote</ArrowLink>
    </section>
  )
}

