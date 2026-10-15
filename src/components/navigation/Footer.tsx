import Link from '@/components/i18n/LocalizedLink'
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { navigation } from '@/config/navigation'
import { Logo } from './Logo'
import { getSiteSettings } from '@/lib/content'
import { getLandingContent } from '@/lib/landing-content'
import { visibleDirectoryCategories } from '@/lib/landing-directory'
import styles from './footer.module.css'
const footerGroups = [
  {
    title: 'Explore',
    links: [
      ...navigation.filter((item) =>
        ['Solutions', 'Industries', 'Technology', 'Resources'].includes(item.label),
      ),
      { label: 'Our work', href: '/work' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About EPUBTRANS', href: '/about-us' },
      { label: 'Global Delivery & Collaboration', href: '/company/global-presence' },
      { label: 'Careers', href: '/company/careers' },
      { label: 'Contact us', href: '/contact-us' },
    ],
  },
]
export async function Footer() {
  const [settings, { directory }] = await Promise.all([getSiteSettings(), getLandingContent()])
  const groups = [
    {
      title: 'Capabilities',
      links: visibleDirectoryCategories(directory).map((category) => ({
        label: category.title,
        href: `/services#${category.anchorId}`,
      })),
    },
    ...footerGroups,
  ]
  const contactDetailsApproved = settings.contactDetailsApproved === true
  const email = contactDetailsApproved ? settings.email || '' : ''
  const phone = contactDetailsApproved ? settings.phone || '' : ''
  const location = settings.location || 'Chennai, India'
  return (
    <footer className={`et-footer ${styles.footer}`}>
      <div className="et-container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo />
            <p>
              From the first manuscript to the final market. Your partner in publishing,
              localization and digital content.
            </p>
            <Link className={styles.brandLink} href="/services">
              Discover our capabilities <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.contact}>
            <h3>Let’s connect</h3>
            <p>Tell us what you’re working on.</p>
            <Link className={styles.quote} href="/get-a-quote">
              Discuss your project <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <div className={styles.contactDetails}>
              {email && (
                <a href={`mailto:${email}`}>
                  <Mail size={15} aria-hidden="true" />
                  <span>{email}</span>
                </a>
              )}
              {phone && (
                <a href={`tel:${phone.replace(/[^+0-9]/g, '')}`}>
                  <Phone size={15} aria-hidden="true" />
                  <span>{phone}</span>
                </a>
              )}
              <span className={styles.location}>
                <MapPin size={15} aria-hidden="true" />
                <span>{location}</span>
              </span>
            </div>
          </div>
        </div>
        <div className={styles.navigation}>
          {groups.map((group, index) => (
            <nav
              key={group.title}
              className={index === 0 ? styles.capabilities : undefined}
              aria-label={`Footer ${group.title.toLowerCase()}`}
            >
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href!}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className={styles.base}>
          <span>© {new Date().getFullYear()} EPUBTRANS. All rights reserved.</span>
          <nav aria-label="Legal navigation">
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/accessibility">Accessibility</Link>
          </nav>
          <span>Content. In every dimension.</span>
        </div>
      </div>
    </footer>
  )
}
