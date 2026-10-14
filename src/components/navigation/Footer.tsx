import Link from '@/components/i18n/LocalizedLink'
import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { navigation } from '@/config/navigation'
import { Logo } from './Logo'
import { getSiteSettings } from '@/lib/content'
const footerGroups = [
  {
    title: 'Capabilities',
    links: [
      { label: 'Publishing & content', href: '/services' },
      { label: 'Translation & localization', href: '/translation-services' },
      { label: 'Subtitling', href: '/subtitling-services' },
      { label: 'eLearning localization', href: '/elearning-localization-services' },
      { label: 'Accessibility', href: '/accessibility-services' },
    ],
  },
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
      { label: 'Global Presence', href: '/company/global-presence' },
      { label: 'Careers', href: '/company/careers' },
      { label: 'Open opportunities', href: '/company/careers#open-roles' },
      { label: 'Contact us', href: '/contact-us' },
    ],
  },
]
export async function Footer() {
  const settings = await getSiteSettings()
  const contactDetailsApproved = settings.contactDetailsApproved === true
  const email = contactDetailsApproved ? settings.email || '' : ''
  const phone = contactDetailsApproved ? settings.phone || '' : ''
  const location = settings.location || 'Chennai, India'
  return (
    <footer className="et-footer">
      <div className="et-container">
        <div className="et-footer-cta">
          <div>
            <p className="et-label">YOUR NEXT CHAPTER STARTS HERE</p>
            <h2>
              Content built for
              <br />a wider world.
            </h2>
            <p className="et-footer-cta-copy">
              Publishing expertise. Language precision. Digital possibilities.
            </p>
          </div>
          <Link className="et-button et-button-light" href="/get-a-quote">
            Discuss your project <ArrowRight className="et-arrow" size={18} />
          </Link>
        </div>
        <div className="et-footer-grid">
          <div className="et-footer-brand">
            <Logo />
            <p>
              From the first manuscript to the final market. Your partner in publishing,
              localization and digital content.
            </p>
            <Link className="et-footer-brand-link" href="/services">
              Discover our capabilities <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {footerGroups.map((group) => (
            <nav
              key={group.title}
              className="et-footer-nav"
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
          <div className="et-footer-contact">
            <h3>Let’s connect</h3>
            <p>Tell us what you’re working on.</p>
            {email && <a href={`mailto:${email}`}><Mail size={15} aria-hidden="true" /><span>{email}</span></a>}
            {phone && <a href={`tel:${phone.replace(/[^+0-9]/g, '')}`}><Phone size={15} aria-hidden="true" /><span>{phone}</span></a>}
            <span className="et-footer-location">
              <MapPin size={15} aria-hidden="true" />
              <span>{location}</span>
            </span>
          </div>
        </div>
        <div className="et-footer-base">
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
