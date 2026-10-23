'use client'
import { useRef, useState } from 'react'
import Link from '@/components/i18n/LocalizedLink'
import { ArrowDown, ArrowUpRight, Check, Search, X } from 'lucide-react'
import type { ServicesLandingContent } from '@/lib/landing-schema'
import {
  directoryCardHref,
  directoryQuoteHref,
  searchDirectoryCategories,
  visibleDirectoryCategories,
} from '@/lib/landing-directory'
import styles from './services-directory.module.css'

export function ServicesDirectory({ content }: { content: ServicesLandingContent }) {
  const [search, setSearch] = useState('')
  const searchInput = useRef<HTMLInputElement>(null)
  const query = search.trim().toLocaleLowerCase()
  const categories = visibleDirectoryCategories(content)
  const groups = searchDirectoryCategories(categories, query)
  const count = groups.reduce((total, group) => total + group.services.length, 0)
  const total = categories.reduce((sum, group) => sum + group.services.length, 0)
  const clearSearch = () => {
    setSearch('')
    searchInput.current?.focus()
  }
  return (
    <main className={`sp-page ${styles.directory}`}>
      <section className="sp-index-hero">
        <div className="et-container">
          <p className="sp-eyebrow">{content.eyebrow}</p>
          <h1>{content.h1}</h1>
          <div className="sp-index-bottom">
            <div className="et-copy">
              {content.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="sp-actions">
                <Link className="sp-button" href={content.primaryCTA.href}>
                  {content.primaryCTA.label} <ArrowUpRight size={19} aria-hidden="true" />
                </Link>
                <a className="sp-text-link" href="#service-catalog">
                  Browse services <ArrowDown size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
            <aside className={styles.guide} aria-labelledby="service-guide-title">
              <p className="sp-eyebrow">A CLEAR STARTING POINT</p>
              <h2 id="service-guide-title">
                Your source. Your output. The right production support.
              </h2>
              <ul>
                <li>
                  <Check size={16} aria-hidden="true" />
                  <span>
                    <strong>Share what you have</strong>Manuscripts, PDFs, digital publications or
                    translated files.
                  </span>
                </li>
                <li>
                  <Check size={16} aria-hidden="true" />
                  <span>
                    <strong>Define what you need</strong>Target formats, languages, layouts and
                    technical specifications.
                  </span>
                </li>
                <li>
                  <Check size={16} aria-hidden="true" />
                  <span>
                    <strong>Agree the scope</strong>Confirm deliverables, review stages and the
                    production schedule.
                  </span>
                </li>
              </ul>
              <div className={styles.catalogFacts}>
                <span>
                  <strong>{total}</strong> service options
                </span>
                <span>
                  <strong>{categories.length}</strong> specialist categories
                </span>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <div id="service-catalog" className={`et-container sp-directory-search ${styles.search}`}>
        <div className="et-field">
          <label htmlFor="service-search" className="sp-eyebrow">
            Search services
          </label>
          <div className={styles.inputWrap}>
            <Search size={18} aria-hidden="true" />
            <input
              ref={searchInput}
              id="service-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="et-input"
              placeholder="Search by service, format or category"
              aria-controls="service-results"
              onKeyDown={(event) => {
                if (event.key === 'Escape') clearSearch()
              }}
            />
            {search && (
              <button type="button" onClick={clearSearch} aria-label="Clear search">
                <X size={17} aria-hidden="true" />
              </button>
            )}
          </div>
          <p role="status" aria-live="polite" aria-atomic="true">
            {query
              ? `${count} matching ${count === 1 ? 'service' : 'services'}`
              : `${total} services across ${categories.length} categories`}
          </p>
        </div>
      </div>
      {groups.length > 0 && (
        <nav
          className={`et-container sp-group-nav ${styles.categoryNav}`}
          aria-label="Service categories"
        >
          {groups.map((group) => (
            <Link key={group.anchorId} href={`#${group.anchorId}`}>
              {group.title}
              <span>{group.services.length}</span>
            </Link>
          ))}
        </nav>
      )}
      <div id="service-results">
        {count === 0 && (
          <div className={`et-container ${styles.empty}`}>
            <h2>No services match your search.</h2>
            <p>
              Try a format such as PDF, EPUB or XML, or a production task such as typesetting. If
              your project spans several services, we can help define the scope.
            </p>
            <div className="sp-actions">
              <button className="sp-button" type="button" onClick={clearSearch}>
                Show all services
              </button>
              <Link className="sp-text-link" href={content.primaryCTA.href}>
                Discuss your requirements <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
        {groups.map((group) => (
          <section
            className="et-container sp-section sp-catalog-group"
            id={group.anchorId}
            key={group.anchorId}
            aria-labelledby={`${group.anchorId}-heading`}
          >
            <div>
              <span className="sp-small-number">
                {String(
                  categories.findIndex((category) => category.anchorId === group.anchorId) + 1,
                ).padStart(2, '0')}{' '}
                / CAPABILITIES
              </span>
              <h2 id={`${group.anchorId}-heading`}>{group.title}</h2>
              <p>{group.intro}</p>
              <span className={styles.groupCount}>
                {group.services.length} {group.services.length === 1 ? 'service' : 'services'}
                {query ? ' matched' : ' in this category'}
              </span>
            </div>
            <div>
              {group.services.map((card) => (
                <article key={card.title} className="sp-directory-card">
                  <Link
                    className="sp-catalog-link"
                    href={directoryCardHref(
                      card,
                      directoryQuoteHref(group.anchorId, content.primaryCTA.href),
                    )}
                  >
                    <div>
                      <h3>{card.title}</h3>
                      {card.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      <span className="sp-text-link">
                        {directoryCardHref(
                          card,
                          directoryQuoteHref(group.anchorId, content.primaryCTA.href),
                        ) === directoryQuoteHref(group.anchorId, content.primaryCTA.href)
                          ? content.primaryCTA.label
                          : card.linkLabel}
                      </span>
                    </div>
                    <ArrowUpRight size={25} aria-hidden="true" />
                  </Link>
                  <Link
                    className="sp-text-link sp-directory-quote"
                    href={directoryQuoteHref(group.anchorId, content.primaryCTA.href)}
                    aria-label={`Request a Quote for ${card.title}`}
                  >
                    Request a Quote <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </article>
              ))}
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
