import type { Metadata } from 'next'
import Link from '@/components/i18n/LocalizedLink'
import {
  ArrowRight,
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Handshake,
  Check,
  MessagesSquare,
} from 'lucide-react'
import { ContactForm } from '@/components/forms/ContactForm'
import { companyOffices } from '@/config/contact'

const indexingApproved =
  process.env.VERCEL_ENV === 'production' && process.env.EPUBTRANS_INDEXING_APPROVED === 'true'

export const metadata: Metadata = {
  title: { absolute: 'Contact EPUBTRANS | Publishing & Content Services' },
  description:
    'Contact EPUBTRANS to discuss digital publishing, document conversion, XML, accessibility, multilingual DTP and localization production requirements.',
  ...(indexingApproved ? { alternates: { canonical: '/contact-us' } } : {}),
  robots: { index: false, follow: true },
}

export default function Contact() {
  const email = 'info@epubtrans.com'
  const phone = '+91 4431363907'
  return (
    <main className="et-contact-page contact-premium">
      <div className="et-container cp-wrap">
        <header className="cp-intro">
          <p className="et-label">LET’S CONNECT</p>
          <h1>Find your way to us.</h1>
          <p>Publishing, localization or a new collaboration. Let’s find the right next step.</p>
        </header>

        <section className="cp-connect" aria-label="Ways to contact EPUBTRANS">
          <div className="cp-channels">
            <article className="cp-card">
              <span className="cp-icon">
                <Mail size={20} aria-hidden="true" />
              </span>
              <h2>Email our team</h2>
              <p>For service questions, business enquiries and production support.</p>
              {email && (
                <a className="cp-value" href={`mailto:${email}`}>
                  {email}
                </a>
              )}
              <a className="cp-link" href={`mailto:${email}`}>
                Write to us <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </article>
            <article className="cp-card">
              <span className="cp-icon">
                <Phone size={20} aria-hidden="true" />
              </span>
              <h2>Start a conversation</h2>
              <p>Discuss your requirements and the support your team needs.</p>
              {phone && (
                <a className="cp-value" href={`tel:${phone.replace(/[^+0-9]/g, '')}`}>
                  {phone}
                </a>
              )}
              <a className="cp-link" href={`tel:${phone.replace(/[^+0-9]/g, '')}`}>
                Call our team <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </article>
            <article className="cp-card">
              <span className="cp-icon">
                <Handshake size={20} aria-hidden="true" />
              </span>
              <h2>Build a partnership</h2>
              <p>Explore production support for your publishing or localization workflow.</p>
              <a className="cp-link" href="#send-message">
                Discuss a collaboration <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </article>
          </div>
          <aside className="cp-project" aria-labelledby="project-heading">
            <p className="et-label">HAVE A PROJECT IN MIND?</p>
            <span className="cp-project-icon">
              <ArrowUpRight size={32} aria-hidden="true" />
            </span>
            <h2 id="project-heading">
              Your next chapter
              <br />
              starts here.
            </h2>
            <p>
              Share the details that matter. Our project enquiry form brings your requirements
              together in one place.
            </p>
            <ul>
              <li>
                <Check size={16} aria-hidden="true" /> Source formats and target deliverables
              </li>
              <li>
                <Check size={16} aria-hidden="true" /> Page counts, languages and specifications
              </li>
              <li>
                <Check size={16} aria-hidden="true" /> Preferred timelines and project context
              </li>
            </ul>
            <Link className="et-button cp-quote" href="/get-a-quote">
              Get a Quote <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <span className="cp-project-note">Publishing. Localization. Digital content.</span>
          </aside>
        </section>

        <section className="cp-message" id="send-message" aria-labelledby="message-heading">
          <div className="cp-message-copy">
            <p className="et-label">A CONVERSATION STARTS HERE</p>
            <h2 id="message-heading">
              Tell us what
              <br />
              you have in mind.
            </h2>
            <p>
              Ask a question, outline a production need or introduce your organization. Include a
              little context so we can understand your enquiry.
            </p>
            <div className="cp-message-guide">
              <span className="cp-icon">
                <MessagesSquare size={20} aria-hidden="true" />
              </span>
              <p>
                For a detailed estimate, use our <Link href="/get-a-quote">project quote form</Link>{' '}
                to share formats, volume and delivery requirements.
              </p>
            </div>
            <Link className="cp-link" href="/services">
              Explore our services <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <div id="project-assistant-dock" className="et-assistant-dock" data-no-translate />
          </div>
          <div className="cp-form-panel">
            <h3>Send us a message</h3>
            <p className="cp-form-note">Fields marked * are required.</p>
            <ContactForm />
          </div>
        </section>

        <section className="cp-location" id="our-location" aria-labelledby="location-heading">
          <div>
            <p className="et-label">OUR LOCATIONS</p>
            <h2 id="location-heading">
              At home in Chennai.
              <br />
              <span>Connected to your team.</span>
            </h2>
          </div>
          <div className="cp-office-grid">
            {companyOffices.map((office, index) => (
              <article className="cp-location-detail cp-office-card" key={office.title}>
                <div className="cp-office-top">
                  <span className="cp-icon">
                    <MapPin size={22} aria-hidden="true" />
                  </span>
                  <span className="cp-office-number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="et-label cp-office-area">{office.area}</p>
                <h3>{office.title}</h3>
                <address>
                  {office.lines.map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                </address>
                <a
                  className="cp-link"
                  href={
                    'mapsHref' in office
                      ? office.mapsHref
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.lines.join(' '))}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${office.title} on Google Maps (opens in a new tab)`}
                >
                  View on Google Maps <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
