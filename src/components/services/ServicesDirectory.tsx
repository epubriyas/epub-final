'use client'
import { useState } from 'react'
import Link from '@/components/i18n/LocalizedLink'
import { ArrowUpRight } from 'lucide-react'
import type { ServicesLandingContent } from '@/lib/landing-schema'
import { directoryCardHref, visibleDirectoryCategories } from '@/lib/landing-directory'

export function ServicesDirectory({ content }: { content: ServicesLandingContent }) {
  const [search, setSearch] = useState('')
  const query = search.trim().toLocaleLowerCase()
  const groups = visibleDirectoryCategories(content).map((group) => ({
    ...group,
    services: group.services.filter((card) =>
      [group.title, card.title, ...card.paragraphs].join(' ').toLocaleLowerCase().includes(query),
    ),
  }))
  const count = groups.reduce((total, group) => total + group.services.length, 0)
  return (
    <main className="sp-page">
      <section className="sp-index-hero">
        <div className="et-container">
          <p className="sp-eyebrow">{content.eyebrow}</p>
          <h1>{content.h1}</h1>
          <div className="sp-index-bottom">
            <div className="et-copy">
              {content.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="sp-actions">
              <Link className="sp-button" href={content.primaryCTA.href}>
                {content.primaryCTA.label} <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <nav className="et-container sp-group-nav" aria-label="Service categories">
        {groups.map((group) => (
          <Link key={group.anchorId} href={`#${group.anchorId}`}>
            {group.title}
          </Link>
        ))}
      </nav>
      <div className="et-container sp-directory-search">
        <div className="et-field">
          <label htmlFor="service-search" className="sp-eyebrow">
            Search services
          </label>
          <input
            id="service-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="et-input"
            placeholder="Search by service, format or category"
            aria-controls="service-results"
          />
          <p role="status" aria-live="polite">
            {query ? `${count} matching services` : ''}
          </p>
        </div>
      </div>
      <div id="service-results">
        {groups.map((group, i) => (
          <section
            className="et-container sp-section sp-catalog-group"
            id={group.anchorId}
            key={group.anchorId}
          >
            <div>
              <span className="sp-small-number">0{i + 1} / CAPABILITIES</span>
              <h2>{group.title}</h2>
              <p>{group.intro}</p>
            </div>
            <div>
              {group.services.map((card) => (
                <article key={card.title} className="sp-directory-card">
                  <Link
                    className="sp-catalog-link"
                    href={directoryCardHref(card, content.primaryCTA.href)}
                  >
                    <div>
                      <h3>{card.title}</h3>
                      {card.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      <span className="sp-text-link">
                        {directoryCardHref(card, content.primaryCTA.href) ===
                        content.primaryCTA.href
                          ? content.primaryCTA.label
                          : card.linkLabel}
                      </span>
                    </div>
                    <ArrowUpRight size={25} aria-hidden="true" />
                  </Link>
                  <Link
                    className="sp-text-link sp-directory-quote"
                    href={content.primaryCTA.href}
                    aria-label={`Request a Quote for ${card.title}`}
                  >
                    Request a Quote <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </article>
              ))}
              {query && group.services.length === 0 && (
                <p>No matching services in this category.</p>
              )}
            </div>
          </section>
        ))}
      </div>
      <section className="et-container sp-section sp-catalog-group">
        <div>
          <p className="sp-eyebrow">YOUR PRODUCTION TEAM</p>
          <h2>{content.audience.title}</h2>
        </div>
        <div className="et-copy">
          {content.audience.cards.map((card) => (
            <article className="et-copy" key={card.title}>
              <h3>{card.title}</h3>
              {card.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>
      </section>
      <section className="et-container sp-section sp-catalog-group">
        <div>
          <p className="sp-eyebrow">PROJECT REQUIREMENTS</p>
          <h2>{content.guidance.title}</h2>
        </div>
        <div className="et-copy">
          <p>{content.guidance.intro}</p>
          <ul>
            {content.guidance.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{content.guidance.note}</p>
        </div>
      </section>
      <section className="et-container sp-section sp-faq">
        <div>
          <p className="sp-eyebrow">GOOD TO KNOW</p>
          <h2>{content.faq.title}</h2>
        </div>
        <div>
          {content.faq.items.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="sp-cta" data-motion="cta">
        <div className="et-container">
          <p className="sp-eyebrow">LET’S TALK ABOUT YOUR CONTENT</p>
          <h2>{content.enquiry.title}</h2>
          <div className="sp-cta-bottom">
            <div className="et-copy">
              {content.enquiry.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="sp-actions">
              <Link className="sp-button" href={content.enquiry.primaryCTA.href}>
                {content.enquiry.primaryCTA.label} <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
