import Link from '@/components/i18n/LocalizedLink'
import { ArrowRight, ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { PageHero } from '@/components/editorial/Primitives'
import { companyOffices, companyWhatsApp } from '@/config/contact'
import { getSiteSettings } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Contact Us',
  description:
    'Connect with EPUBTRANS for publishing, localization and digital content enquiries. Find our email, phone and WhatsApp details.',
  alternates: { canonical: '/contact' },
})

export default async function Contact() {
  const settings = await getSiteSettings()
  const email = settings.email || 'info@epubtrans.com'
  const phone = settings.phone || '+91 44 3136 3907'
  const location = settings.location || 'Chennai, India'
  const channels = [
    {
      title: 'Email our team',
      description: 'For questions, partnerships and general enquiries.',
      value: email,
      href: `mailto:${email}`,
      icon: Mail,
      action: 'Write to us',
    },
    {
      title: 'Give us a call',
      description: 'Speak with our team about how we can help.',
      value: phone,
      href: `tel:${phone.replace(/[^+0-9]/g, '')}`,
      icon: Phone,
      action: 'Call the team',
    },
    {
      title: 'Connect on WhatsApp',
      description: 'Start a conversation from wherever you are.',
      value: companyWhatsApp.number,
      href: companyWhatsApp.href,
      icon: MessageCircle,
      action: 'Open WhatsApp',
    },
  ]

  return (
    <main className="et-contact-page">
      <PageHero
        eyebrow="CONTACT US"
        title="Good work starts with a conversation."
        description="A question, an idea, a new collaboration. Wherever you are in your journey, we’d love to hear from you."
      />
      <section className="et-container et-contact-section" aria-labelledby="contact-heading">
        <div className="et-contact-intro">
          <p className="et-label">LET’S CONNECT</p>
          <h2 id="contact-heading">Find your way to us.</h2>
          <p>Choose the way that works for you. Our team is here to help you take the next step.</p>
        </div>
        <div className="et-contact-grid">
          <div className="et-contact-channels">
            {channels.map(({ title, description, value, href, icon: Icon, action }) => (
              <a className="et-contact-channel" href={href} key={title}>
                <span className="et-contact-icon">
                  <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div className="et-contact-channel-copy">
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="et-contact-value">{value}</span>
                  <span className="et-contact-action">
                    {action} <ArrowUpRight size={17} aria-hidden="true" />
                  </span>
                </div>
              </a>
            ))}
            <div className="et-contact-location">
              <span className="et-contact-icon">
                <MapPin size={24} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div className="et-contact-channel-copy">
                <h3>Rooted in Chennai.</h3>
                <p>Publishing and language expertise, connected to a wider world.</p>
                <address className="et-contact-value">{location}</address>
                <span className="et-contact-location-note">Content. In every dimension.</span>
              </div>
            </div>
          </div>
          <aside className="et-contact-project" aria-labelledby="contact-project-heading">
            <p className="et-label">HAVE A PROJECT IN MIND?</p>
            <span className="et-contact-project-mark" aria-hidden="true">
              <ArrowUpRight size={64} strokeWidth={1} />
            </span>
            <h2 id="contact-project-heading">Your next chapter starts here.</h2>
            <p>
              Ready to bring your content to life? Share your requirements through our dedicated
              quote form.
            </p>
            <ul>
              <li>Tell us about your project and service needs.</li>
              <li>Include your languages, scope and timeline.</li>
              <li>Share files to help us understand your brief.</li>
            </ul>
            <Link className="et-button" href="/get-a-quote">
              Get a Quote <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <span className="et-contact-project-note">
              Publishing. Localization. Digital content.
            </span>
          </aside>
        </div>
        <div className="et-contact-offices" aria-labelledby="contact-offices-heading">
          <div className="et-contact-intro">
            <p className="et-label">OUR LOCATIONS</p>
            <h2 id="contact-offices-heading">At home in Chennai.</h2>
          </div>
          <div className="et-contact-offices-grid">
            {companyOffices.map((office, index) => (
              <div className="et-contact-office" key={office.title}>
                <div className="et-contact-office-top">
                  <span className="et-contact-icon">
                    <MapPin size={24} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span className="et-contact-office-number" aria-hidden="true">
                    0{index + 1}
                  </span>
                </div>
                <p className="et-label et-contact-office-area">{office.area}</p>
                <h3>{office.title}</h3>
                <address>
                  {office.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </address>
                <a
                  className="et-contact-office-map"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.lines.join(' '))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${office.title} on Google Maps (opens in a new tab)`}
                >
                  View on Google Maps <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="et-container et-contact-more" aria-labelledby="contact-more-heading">
        <div>
          <p className="et-label">OTHER WAYS TO CONNECT</p>
          <h2 id="contact-more-heading">There’s more to explore.</h2>
        </div>
        <Link href="/company/careers" className="et-contact-more-link">
          <span>
            <strong>Build your next chapter with us.</strong>
            <span>Explore careers at EPUBTRANS.</span>
          </span>
          <ArrowUpRight size={24} aria-hidden="true" />
        </Link>
        <Link href="/services" className="et-contact-more-link">
          <span>
            <strong>Find the right expertise.</strong>
            <span>Discover our publishing and language services.</span>
          </span>
          <ArrowUpRight size={24} aria-hidden="true" />
        </Link>
      </section>
    </main>
  )
}
