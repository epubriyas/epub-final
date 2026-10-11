'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from '@/components/i18n/LocalizedLink'
import { ArrowRight, ChevronDown, Globe2, Menu, X } from 'lucide-react'
import type { NavigationSection } from '@/types/navigation'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSelector } from '@/components/i18n/LanguageSelector'
import { useSiteLocale } from '@/components/i18n/LocaleProvider'
import { stripLanguage } from '@/config/languages'

export function HeaderClient({ navigation }: { navigation: NavigationSection[] }) {
  const pathname = usePathname()
  return <HeaderState key={pathname} pathname={stripLanguage(pathname)} navigation={navigation} />
}
function HeaderState({
  pathname,
  navigation,
}: {
  pathname: string
  navigation: NavigationSection[]
}) {
  const [open, setOpen] = useState<number | null>(null)
  const locale = useSiteLocale()
  const [scrolled, setScrolled] = useState(false)
  const header = useRef<HTMLElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const languageDialog = useRef<HTMLDialogElement>(null)
  const languageButton = useRef<HTMLButtonElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const [mobileSection, setMobileSection] = useState<number | null>(null)
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1200px)')
    const handleBreakpoint = () => {
      const navigationWasOpen = dialog.current?.open
      const languageWasOpen = languageDialog.current?.open
      const desktopMenu = header.current?.querySelector<HTMLButtonElement>(
        '.et-nav-link[aria-expanded="true"]',
      )
      setOpen(null)
      if (desktop.matches) {
        dialog.current?.close()
        languageDialog.current?.close()
        if (navigationWasOpen || languageWasOpen) {
          document.body.style.overflow = ''
          header.current
            ?.querySelector<HTMLButtonElement>(
              languageWasOpen ? '.et-header-actions button' : '.et-desktop-nav button',
            )
            ?.focus()
        }
      } else if (desktopMenu) {
        ;(desktopMenu.getAttribute('aria-controls') === 'language-options'
          ? languageButton.current
          : menuButton.current
        )?.focus()
      }
    }
    desktop.addEventListener('change', handleBreakpoint)
    return () => desktop.removeEventListener('change', handleBreakpoint)
  }, [])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    if (open === null) return
    const pointer = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(null)
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(null)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', pointer)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', pointer)
      document.removeEventListener('keydown', key)
    }
  }, [open])
  useEffect(
    () => () => {
      document.body.style.overflow = ''
    },
    [],
  )
  const closeMobile = () => {
    dialog.current?.close()
    document.body.style.overflow = ''
    menuButton.current?.focus()
  }
  const closeLanguage = () => {
    languageDialog.current?.close()
    document.body.style.overflow = ''
    languageButton.current?.focus()
  }
  return (
    <header
      ref={header}
      className="et-header"
      data-scrolled={scrolled}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(null)
      }}
    >
      <div className="et-container et-header-inner">
        <Logo />
        <nav className="et-desktop-nav" aria-label="Main navigation">
          {navigation.map((item, index) =>
            item.groups ? (
              <button
                key={item.label}
                className="et-nav-link"
                aria-expanded={open === index}
                aria-controls={`mega-${index}`}
                ref={(node) => {
                  if (open === index) trigger.current = node
                }}
                onClick={(event) => {
                  trigger.current = event.currentTarget
                  setOpen(open === index ? null : index)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    setOpen(index)
                    requestAnimationFrame(() =>
                      document.querySelector<HTMLElement>(`#mega-${index} a`)?.focus(),
                    )
                  }
                }}
              >
                {item.label}
                <ChevronDown size={12} className="et-chevron" />
              </button>
            ) : (
              <Link
                key={item.label}
                className="et-nav-link"
                href={item.href!}
                aria-current={pathname.startsWith(item.href!) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="et-header-actions">
          <button
            className="et-nav-link"
            aria-expanded={open === 99}
            aria-controls="language-options"
            onClick={(event) => {
              trigger.current = event.currentTarget
              setOpen(open === 99 ? null : 99)
            }}
          >
            <Globe2 size={15} />{' '}
            <span data-no-translate>{locale === 'zh-CN' ? 'ZH' : locale.toUpperCase()}</span>{' '}
            <ChevronDown size={12} />
          </button>
          <Link className="et-button" href="/get-a-quote">
            Get a Quote <ArrowRight size={16} className="et-arrow" />
          </Link>
          <ThemeToggle />
        </div>
        <button
          ref={languageButton}
          className="et-mobile-language-toggle"
          aria-label="Choose website language"
          aria-haspopup="dialog"
          onClick={() => {
            languageDialog.current?.showModal()
            document.body.style.overflow = 'hidden'
          }}
        >
          <Globe2 size={17} aria-hidden="true" />
          <span data-no-translate>{locale === 'zh-CN' ? 'ZH' : locale.toUpperCase()}</span>
        </button>
        <ThemeToggle compact />
        <button
          ref={menuButton}
          className="et-mobile-toggle"
          aria-label="Open navigation"
          aria-haspopup="dialog"
          onClick={() => {
            dialog.current?.showModal()
            document.body.style.overflow = 'hidden'
          }}
        >
          <Menu size={25} />
        </button>
      </div>
      {open !== null && (
        <button
          aria-label="Close navigation"
          className="et-menu-backdrop"
          tabIndex={-1}
          onClick={() => setOpen(null)}
        />
      )}
      {navigation.map(
        (item, index) =>
          open === index &&
          item.groups && (
            <div
              key={item.label}
              className={`et-mega${item.label === 'Company' ? ' et-mega-company' : item.label === 'What We Do' ? ' et-mega-services' : item.label === 'Resources' ? ' et-mega-resources' : item.label === 'Technology' ? ' et-mega-technology' : ''}`}
              id={`mega-${index}`}
            >
              <div className="et-container">
                <div className="et-mega-top">
                  <div>
                    {item.description && (
                      <p className="et-mega-eyebrow">{item.label.toUpperCase()} / EPUBTRANS</p>
                    )}
                    <Link className="et-mega-title" href={item.href!} onClick={() => setOpen(null)}>
                      {item.overviewLabel ?? `Explore ${item.label.toLowerCase()}`}{' '}
                      <ArrowRight className="et-arrow" size={25} style={{ display: 'inline' }} />
                    </Link>
                    {item.description && <p className="et-mega-description">{item.description}</p>}
                  </div>
                  <button
                    onClick={() => {
                      setOpen(null)
                      trigger.current?.focus()
                    }}
                    aria-label="Close menu"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="et-mega-groups">
                  {item.groups.map((group) => (
                    <div
                      key={group.title}
                      className={
                        item.label === 'What We Do' && group.items.length > 6
                          ? 'et-mega-group-wide'
                          : undefined
                      }
                    >
                      <h3>{group.title}</h3>
                      {group.description && (
                        <p className="et-mega-group-description">{group.description}</p>
                      )}
                      <ul>
                        {group.items.map((link) => (
                          <li key={link.label}>
                            <Link href={link.href!} onClick={() => setOpen(null)}>
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
      )}
      {open === 99 && (
        <div id="language-options" className="et-language">
          <LanguageSelector onSelect={() => setOpen(null)} />
        </div>
      )}
      <dialog
        ref={dialog}
        className="et-mobile-dialog"
        aria-label="Site navigation"
        onCancel={closeMobile}
      >
        <div className="et-mobile-top">
          <Logo />
          <button className="et-mobile-toggle" onClick={closeMobile} aria-label="Close navigation">
            <X size={25} />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {navigation.map((item, index) => (
            <div className="et-mobile-row" key={item.label}>
              {item.groups ? (
                <>
                  <button
                    aria-expanded={mobileSection === index}
                    aria-controls={`mobile-${index}`}
                    onClick={() => setMobileSection(mobileSection === index ? null : index)}
                  >
                    {item.label}
                    <span aria-hidden="true">{mobileSection === index ? '−' : '+'}</span>
                  </button>
                  {mobileSection === index && (
                    <div id={`mobile-${index}`}>
                      <Link href={item.href!} onClick={closeMobile}>
                        {item.overviewLabel ??
                          (item.label === 'What We Do'
                            ? 'Explore all services'
                            : 'Explore ' + item.label.toLowerCase())}{' '}
                        →
                      </Link>
                      {item.groups.map((group) => (
                        <details key={group.title}>
                          <summary>{group.title}</summary>
                          {group.description && (
                            <p className="et-mobile-group-description">{group.description}</p>
                          )}
                          <ul>
                            {group.items.map((link) => (
                              <li key={link.label}>
                                <Link href={link.href!} onClick={closeMobile}>
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.href!} onClick={closeMobile}>
                  {item.label}
                  <ArrowRight size={20} />
                </Link>
              )}
            </div>
          ))}
          <details className="et-language-inline">
            <summary>Choose your language</summary>
            <LanguageSelector onSelect={closeMobile} />
          </details>
          <Link className="et-button" href="/get-a-quote" onClick={closeMobile}>
            Get a Quote <ArrowRight size={18} />
          </Link>
        </nav>
      </dialog>
      <dialog
        ref={languageDialog}
        className="et-mobile-language-dialog"
        aria-label="Choose website language"
        onCancel={closeLanguage}
      >
        <div className="et-mobile-language-top">
          <Logo />
          <button type="button" onClick={closeLanguage} aria-label="Close language selection">
            <X size={24} />
          </button>
        </div>
        <div className="et-mobile-language-body">
          <LanguageSelector onSelect={closeLanguage} />
        </div>
      </dialog>
    </header>
  )
}
