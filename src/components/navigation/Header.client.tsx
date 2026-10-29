'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from '@/components/i18n/LocalizedLink'
import { ArrowRight, ChevronDown, Globe2, Menu, X } from 'lucide-react'
import type { NavigationSection } from '@/types/navigation'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSelector } from '@/components/i18n/LanguageSelector'
import { useSiteLocale } from '@/components/i18n/LocaleProvider'
import { getLanguage, stripLanguage } from '@/config/languages'
import handoffStyles from './header-handoff.module.css'

export function HeaderClient({ navigation }: { navigation: NavigationSection[] }) {
  const pathname = usePathname()
  const restoreLanguageFocus = useRef(false)
  useEffect(() => {
    if (!restoreLanguageFocus.current) return
    restoreLanguageFocus.current = false
    document
      .querySelector<HTMLButtonElement>(
        window.matchMedia('(min-width: 1200px)').matches
          ? '.et-header-actions [aria-controls="language-options"]'
          : '.et-mobile-language-toggle',
      )
      ?.focus({ preventScroll: true })
  }, [pathname])
  return (
    <HeaderState
      key={pathname}
      pathname={stripLanguage(pathname)}
      navigation={navigation}
      onLanguageSelected={() => {
        restoreLanguageFocus.current = true
      }}
    />
  )
}
function HeaderState({
  pathname,
  navigation,
  onLanguageSelected,
}: {
  pathname: string
  navigation: NavigationSection[]
  onLanguageSelected: () => void
}) {
  const [open, setOpen] = useState<number | null>(null)
  const locale = useSiteLocale()
  const languageDescriptionId = useId()
  const [scrolled, setScrolled] = useState(false)
  const header = useRef<HTMLElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const languageDialog = useRef<HTMLDialogElement>(null)
  const languageButton = useRef<HTMLButtonElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const hoverClose = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelHoverClose = () => {
    if (hoverClose.current) clearTimeout(hoverClose.current)
    hoverClose.current = null
  }
  const scheduleHoverClose = () => {
    cancelHoverClose()
    hoverClose.current = setTimeout(() => {
      // Keep a menu available while a keyboard user is working inside it.
      if (document.activeElement?.closest('.et-mega, .et-language')) return
      setOpen(null)
    }, 180)
  }
  const canHover = (pointerType: string) =>
    pointerType === 'mouse' && window.matchMedia('(hover: hover)').matches
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
      } else if (desktopMenu || (document.activeElement === document.body && trigger.current)) {
        // Hiding the focused desktop control can fire blur before matchMedia's
        // change event. Keep its trigger available to restore visible focus.
        const mobileTrigger =
          (desktopMenu || trigger.current)?.getAttribute('aria-controls') === 'language-options'
            ? languageButton.current
            : menuButton.current
        requestAnimationFrame(() => mobileTrigger?.focus())
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
    const previousOverflow = document.body.style.overflow
    const previousRootOverflow = document.documentElement.style.overflow
    // SiteMotion also observes this lock and stops any smooth-scroll momentum.
    // Unlike hidden, clip does not create a scroll container that breaks sticky headers.
    document.body.style.overflow = 'clip'
    document.documentElement.style.overflow = 'hidden'
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
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overflow = previousRootOverflow
      document.removeEventListener('pointerdown', pointer)
      document.removeEventListener('keydown', key)
    }
  }, [open])
  useEffect(
    () => () => {
      document.body.style.overflow = ''
      if (hoverClose.current) clearTimeout(hoverClose.current)
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
      data-locale={locale}
      className={`et-header ${handoffStyles.header}`}
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
              <div
                key={item.label}
                className={handoffStyles.disclosure}
                onPointerEnter={(event) => {
                  if (!canHover(event.pointerType)) return
                  cancelHoverClose()
                  trigger.current = event.currentTarget.querySelector('button')
                  setOpen(index)
                }}
                onPointerLeave={(event) => {
                  if (canHover(event.pointerType)) scheduleHoverClose()
                }}
              >
                {item.label === 'What We Do' && (
                  <Link
                    className="et-nav-link"
                    href={item.href!}
                    onClick={() => setOpen(null)}
                    aria-current={pathname === '/services' ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                )}
                <button
                  aria-label={item.label}
                  className={`et-nav-link${item.label === 'What We Do' ? ` ${handoffStyles.toggle}` : ''}`}
                  aria-expanded={open === index}
                  aria-controls={`mega-${index}`}
                  ref={(node) => {
                    if (node && open === index) trigger.current = node
                  }}
                  onClick={(event) => {
                    trigger.current = event.currentTarget
                    cancelHoverClose()
                    setOpen(
                      event.detail > 0 && window.matchMedia('(hover: hover)').matches
                        ? index
                        : open === index
                          ? null
                          : index,
                    )
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
                  {item.label !== 'What We Do' && item.label}
                  <ChevronDown size={12} className="et-chevron" aria-hidden="true" />
                </button>
              </div>
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
            aria-label="Choose website language"
            aria-describedby={languageDescriptionId}
            data-no-translate
            lang="en"
            dir="ltr"
            onKeyDown={(event) => {
              if (event.key !== 'ArrowDown') return
              event.preventDefault()
              trigger.current = event.currentTarget
              setOpen(99)
              requestAnimationFrame(() =>
                document
                  .querySelector<HTMLButtonElement>('#language-options button[aria-pressed="true"]')
                  ?.focus(),
              )
            }}
            onPointerEnter={(event) => {
              if (!canHover(event.pointerType)) return
              cancelHoverClose()
              trigger.current = event.currentTarget
              setOpen(99)
            }}
            onPointerLeave={(event) => {
              if (canHover(event.pointerType)) scheduleHoverClose()
            }}
            onClick={(event) => {
              trigger.current = event.currentTarget
              cancelHoverClose()
              setOpen(
                event.detail > 0 && window.matchMedia('(hover: hover)').matches
                  ? 99
                  : open === 99
                    ? null
                    : 99,
              )
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
          aria-describedby={languageDescriptionId}
          data-no-translate
          lang="en"
          dir="ltr"
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
      <span id={languageDescriptionId} className="sr-only" data-no-translate lang="en">
        Current selection: {getLanguage(locale)?.name || 'English'}
      </span>
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
              aria-label={`${item.label} navigation`}
              id={`mega-${index}`}
              onPointerEnter={cancelHoverClose}
              onPointerLeave={(event) => {
                if (canHover(event.pointerType)) scheduleHoverClose()
              }}
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
        <div
          id="language-options"
          className="et-language"
          data-native-scroll
          onPointerEnter={cancelHoverClose}
          onPointerLeave={(event) => {
            if (canHover(event.pointerType)) scheduleHoverClose()
          }}
        >
          <LanguageSelector
            onSelect={(changed) => {
              setOpen(null)
              trigger.current?.focus()
              if (changed) onLanguageSelected()
            }}
          />
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
                  <div className={handoffStyles.mobileDisclosure}>
                    {item.label === 'What We Do' && (
                      <Link href={item.href!} onClick={closeMobile}>
                        {item.label}
                      </Link>
                    )}
                    <button
                      aria-label={item.label}
                      aria-expanded={mobileSection === index}
                      aria-controls={`mobile-${index}`}
                      onClick={() => setMobileSection(mobileSection === index ? null : index)}
                    >
                      {item.label !== 'What We Do' && item.label}
                      <span aria-hidden="true">{mobileSection === index ? '−' : '+'}</span>
                    </button>
                  </div>
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
          <LanguageSelector
            onSelect={(changed) => {
              closeLanguage()
              if (changed) onLanguageSelected()
            }}
          />
        </div>
      </dialog>
    </header>
  )
}
