'use client'
import { useId } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowUpRight, Check, Globe2 } from 'lucide-react'
import { getLanguage, languagePath, stripLanguage, type SiteLanguage } from '@/config/languages'
import { useSiteLocale } from './LocaleProvider'
import { saveLanguagePreference } from '@/lib/i18n/preference'

const indianCodes = ['hi', 'ta', 'te', 'bn']
const globalCodes = ['fr', 'es', 'de', 'ar', 'zh-CN', 'ja']
export function LanguageSelector({ onSelect }: { onSelect?: () => void }) {
  const id = useId(),
    locale = useSiteLocale(),
    pathname = usePathname(),
    router = useRouter()
  const choose = (code: string) => {
    saveLanguagePreference(code)
    onSelect?.()
    router.push(languagePath(stripLanguage(pathname), code) + location.search + location.hash, {
      scroll: false,
    })
  }
  const option = (language: SiteLanguage) => {
    const selected = locale === language.code
    return (
      <button
        key={language.code}
        type="button"
        className="et-locale-option"
        aria-pressed={selected}
        aria-label={`${language.name}${selected ? ', selected' : ''}`}
        onClick={() => choose(language.code)}
      >
        <span className="et-locale-code" aria-hidden="true">
          {language.code === 'zh-CN' ? 'ZH' : language.code.toUpperCase()}
        </span>
        <span className="et-locale-name">
          <span lang={language.code} dir="auto">
            {language.nativeName}
          </span>
          <small>{language.name}</small>
        </span>
        {selected ? (
          <Check size={17} aria-hidden="true" />
        ) : (
          <ArrowUpRight size={17} className="et-locale-direction" aria-hidden="true" />
        )}
      </button>
    )
  }
  return (
    <section className="et-language-selector" aria-labelledby={`${id}-title`} data-no-translate>
      <div className="et-locale-heading">
        <p className="et-label">
          <Globe2 size={14} aria-hidden="true" /> LANGUAGE
        </p>
        <h2 id={`${id}-title`}>
          Choose your language.
        </h2>
        <p>Choose how you’d like to explore EPUBTRANS.</p>
      </div>
      <button
        type="button"
        className="et-locale-default"
        aria-pressed={locale === 'en'}
        aria-label="English, default language"
        onClick={() => choose('en')}
      >
        <span className="et-locale-code" aria-hidden="true">
          EN
        </span>
        <span className="et-locale-name">
          <span>English</span>
          <small>Original website language</small>
        </span>
        <span className="et-locale-default-end">
          <span className="et-locale-badge">{locale === 'en' ? 'Selected' : 'Default'}</span>
          {locale === 'en' ? (
            <Check size={18} aria-hidden="true" />
          ) : (
            <ArrowUpRight size={18} aria-hidden="true" />
          )}
        </span>
      </button>
      <div className="et-locale-groups">
        {[
          { title: 'Indian languages', codes: indianCodes },
          { title: 'Global languages', codes: globalCodes },
        ].map((group) => (
          <div className="et-locale-group" role="group" aria-label={group.title} key={group.title}>
            <h3>
              {group.title}
              <span aria-hidden="true">{String(group.codes.length).padStart(2, '0')}</span>
            </h3>
            <div>
              {group.codes.map((code) => {
                const language = getLanguage(code)
                return language ? option(language) : null
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="et-locale-note">
        <span className="et-locale-dot" aria-hidden="true" />
        <p>Your choice follows you as you explore.</p>
      </div>
    </section>
  )
}
