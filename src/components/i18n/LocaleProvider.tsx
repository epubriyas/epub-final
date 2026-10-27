'use client'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getLanguage, languagePath, stripLanguage } from '@/config/languages'
import NextLink from 'next/link'
import { fixedTranslation } from '@/lib/i18n/fixed-translations'
import { saveLanguagePreference } from '@/lib/i18n/preference'
const LocaleContext = createContext('en')
const LocaleNavigationContext = createContext<(code: string) => void>(() => {})
export const useSiteLocale = () => useContext(LocaleContext)
export const useLocaleNavigation = () => useContext(LocaleNavigationContext)
const excluded =
  '[data-private], .qp-upload-list, [data-no-translate], .notranslate, script, style, textarea, pre, code, [contenteditable]'
const subscribe = (callback: () => void) => {
  const events = ['popstate', 'hashchange', 'epubtrans:locale-navigation']
  for (const event of events) window.addEventListener(event, callback)
  return () => {
    for (const event of events) window.removeEventListener(event, callback)
  }
}
export function LocaleProvider({
  locale,
  configured = true,
  children,
}: {
  locale: string
  configured?: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const pendingDestination = useRef<string | null>(null)
  const navigate = useCallback(
    (code: string) => {
      if (!getLanguage(code)) return
      saveLanguagePreference(code)
      const target = new URL(window.location.href)
      target.pathname = languagePath(target.pathname, code)
      const destination = target.pathname + target.search + target.hash
      if (destination === window.location.pathname + window.location.search + window.location.hash)
        return
      pendingDestination.current = destination
      router.push(destination, { scroll: false })
    },
    [router],
  )
  useEffect(() => {
    if (!pendingDestination.current) return
    const target = new URL(pendingDestination.current, window.location.origin)
    if (target.pathname !== window.location.pathname || target.search !== window.location.search)
      return
    pendingDestination.current = null
    // Next's cached initial canonical may already contain a fragment. Keep the
    // exact requested fragment instead of allowing the cache to append it twice.
    if (window.location.hash !== target.hash) {
      window.history.replaceState(
        null,
        '',
        target.pathname + target.search + target.hash,
      )
      window.dispatchEvent(new Event('epubtrans:locale-navigation'))
    }
  }, [pathname])
  const current = useSyncExternalStore(
    subscribe,
    () => getLanguage(window.location.pathname.split('/')[1])?.code || 'en',
    () => locale,
  )
  return (
    <LocaleContext.Provider value={current}>
      <LocaleNavigationContext.Provider value={navigate}>
        {children}
        <PageTranslation key={`${current}:${pathname}`} locale={current} configured={configured} />
      </LocaleNavigationContext.Provider>
    </LocaleContext.Provider>
  )
}
function PageTranslation({ locale, configured }: { locale: string; configured: boolean }) {
  const pathname = usePathname()
  const navigate = useLocaleNavigation()
  const suffix = useSyncExternalStore(
    subscribe,
    () => window.location.search + window.location.hash,
    () => '',
  )
  const [status, setStatus] = useState<'idle' | 'working' | 'ready' | 'partial' | 'failed'>('idle')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (locale === 'en' || !configured) return
    const controller = new AbortController(),
      originals = new Map<Text, { source: string; translated?: string }>(),
      cache = new Map<string, string>(),
      seen = new Set<string>()
    const attributes = new Map<Element, Map<string, { source: string; translated?: string }>>()
    const languageAttributes = new Map<Element, { lang: string | null; dir: string | null }>()
    const markLanguage = (element: Element | null) => {
      if (!element) return
      if (!languageAttributes.has(element))
        languageAttributes.set(element, {
          lang: element.getAttribute('lang'),
          dir: element.getAttribute('dir'),
        })
      element.setAttribute('lang', locale)
      element.setAttribute(
        'dir',
        element.matches('input[type="email"], input[type="url"], input[type="tel"]')
          ? 'ltr'
          : getLanguage(locale)?.direction || 'ltr',
      )
    }
    let timer: ReturnType<typeof setTimeout>,
      busy = false,
      pending = false,
      active = true,
      incomplete = false
    const normalize = (value: string) => value.replace(/\s+/g, ' ').trim()
    const allowed = (parent: Element | null) => parent && !parent.closest(excluded)
    const observer = new MutationObserver((changes) => {
      if (
        !changes.some(({ target }) =>
          allowed(target instanceof Element ? target : target.parentElement),
        )
      )
        return
      clearTimeout(timer)
      timer = setTimeout(() => void translate(), 150)
    })
    const watch = () =>
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['aria-label', 'placeholder', 'title', 'alt'],
      })
    async function translate() {
      if (!active) return
      if (busy) {
        pending = true
        return
      }
      busy = true
      pending = false
      const nodes: Text[] = []
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        const node = walker.currentNode as Text,
          parent = node.parentElement
        if (!allowed(parent)) continue
        const previous = originals.get(node)
        if (previous?.translated === node.data) continue
        const source = normalize(node.data)
        if (
          source.length < 2 ||
          source.length > 5000 ||
          !/[a-zA-Z]/.test(source) ||
          source === 'EPUBTRANS' ||
          /^[\d\s+·©→↗/-]+$/.test(source) ||
          source.includes('@')
        )
          continue
        originals.set(node, { source: node.data })
        nodes.push(node)
      }
      const attributeNodes: { element: Element; name: string; text: string }[] = []
      for (const element of document.body.querySelectorAll(
        '[aria-label], [placeholder], [title], [alt]',
      )) {
        if (!allowed(element)) continue
        for (const name of ['aria-label', 'placeholder', 'title', 'alt']) {
          const text = element.getAttribute(name)
          if (!text || !/[a-zA-Z]/.test(text)) continue
          const records =
            attributes.get(element) || new Map<string, { source: string; translated?: string }>()
          if (records.get(name)?.translated === text) continue
          records.set(name, { source: text })
          attributes.set(element, records)
          attributeNodes.push({ element, name, text })
        }
      }
      const sources = [
        ...new Set([
          ...nodes.map((node) => normalize(node.data)),
          ...attributeNodes.map((item) => normalize(item.text)),
        ]),
      ]
      for (const text of sources) {
        const fixed = fixedTranslation(text, locale)
        if (fixed) {
          cache.set(text, fixed)
          seen.add(text)
        }
      }
      const unique = sources.filter((text) => !seen.has(text))
      function applyTranslations() {
        observer.disconnect()
        for (const node of nodes) {
          const original = originals.get(node),
            value = cache.get(normalize(node.data))
          if (original && value && node.isConnected && node.data === original.source) {
            const whitespace = node.data.match(/^(\s*)[\s\S]*?(\s*)$/)
            original.translated = (whitespace?.[1] || '') + value + (whitespace?.[2] || '')
            node.data = original.translated
            if (normalize(value) !== normalize(original.source)) markLanguage(node.parentElement)
          }
        }
        for (const { element, name, text } of attributeNodes) {
          const value = cache.get(normalize(text)),
            record = attributes.get(element)?.get(name)
          if (value && record && element.isConnected && element.getAttribute(name) === text) {
            record.translated = value
            element.setAttribute(name, value)
            if (normalize(value) !== normalize(text)) markLanguage(element)
          }
        }
        for (const element of document.querySelectorAll(
          'input[type="email"], input[type="url"], input[type="tel"]',
        )) {
          if (!languageAttributes.has(element))
            languageAttributes.set(element, {
              lang: element.getAttribute('lang'),
              dir: element.getAttribute('dir'),
            })
          element.setAttribute('dir', 'ltr')
        }
        watch()
      }
      applyTranslations()
      try {
        if (unique.length) setStatus('working')
        for (let start = 0; start < unique.length;) {
          const batch: string[] = []
          let count = 0
          while (
            start < unique.length &&
            batch.length < 32 &&
            count + unique[start].length <= 8000
          ) {
            const text = unique[start++]
            batch.push(text)
            count += text.length
          }
          if (!batch.length) {
            start++
            continue
          }
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale, texts: batch }),
            signal: controller.signal,
          })
          if (!response.ok) throw new Error('Translation unavailable')
          const result = (await response.json()) as {
            translations?: Record<string, string>
            partial?: boolean
          }
          if (!result.translations || typeof result.translations !== 'object')
            throw new Error('Invalid translation response')
          for (const text of batch) {
            seen.add(text)
            const value = result.translations[text]
            if (
              typeof value === 'string' &&
              value.trim() &&
              (normalize(value) !== normalize(text) || fixedTranslation(text, locale) === value)
            )
              cache.set(text, value)
            else incomplete = true
          }
          if (result.partial) incomplete = true
          if (!active) return
          applyTranslations()
        }
        if (!active) return
        if (!cache.size && unique.length) throw new Error('No translated content returned')
        // A few translated navigation strings do not change the language of the
        // remaining English document. Translated elements carry their own lang/dir.
        const complete = !incomplete && sources.every((text) => cache.has(text))
        document.documentElement.lang = complete && cache.size ? locale : 'en'
        document.documentElement.dir =
          complete && cache.size ? getLanguage(locale)?.direction || 'ltr' : 'ltr'
        setStatus(incomplete ? 'partial' : cache.size ? 'ready' : 'idle')
      } catch {
        if (active) {
          setStatus(cache.size ? 'partial' : 'failed')
          incomplete = true
          pending = false
          clearTimeout(timer)
          observer.disconnect()
          document.documentElement.lang = 'en'
          document.documentElement.dir = 'ltr'
          // Continue observing new menus and form steps even after a provider outage.
          watch()
        }
      } finally {
        busy = false
        // Menus or form steps can appear while a translation request is in flight.
        // Run another pass so their text is not lost when the observer fires while busy.
        if (active && pending) {
          clearTimeout(timer)
          timer = setTimeout(() => void translate(), 0)
        }
      }
    }
    watch()
    void translate()
    return () => {
      active = false
      controller.abort()
      observer.disconnect()
      clearTimeout(timer)
      for (const [node, record] of originals)
        if (node.isConnected && node.data === record.translated) node.data = record.source
      for (const [element, records] of attributes)
        for (const [name, record] of records)
          if (element.isConnected && element.getAttribute(name) === record.translated)
            element.setAttribute(name, record.source)
      for (const [element, record] of languageAttributes) {
        if (!element.isConnected) continue
        for (const name of ['lang', 'dir'] as const) {
          if (record[name] === null) element.removeAttribute(name)
          else element.setAttribute(name, record[name])
        }
      }
      document.documentElement.lang = 'en'
      document.documentElement.dir = 'ltr'
    }
  }, [locale, configured, attempt])
  if (locale === 'en') return null
  const missing = !configured || status === 'failed'
  return (
    <aside className="et-translation-status" role="status" data-no-translate lang="en" dir="ltr">
      <span lang={locale}>{getLanguage(locale)?.nativeName}</span>
      <span>
        {missing
          ? 'Translation unavailable. English content is shown.'
          : status === 'partial'
            ? 'Some text could not be translated and remains in English.'
            : status === 'working' || status === 'idle'
              ? 'Translating this page…'
              : 'Automatic reading preview, not a reviewed translation. English is the original.'}
      </span>
      {configured && (status === 'failed' || status === 'partial') && (
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          Retry translation
        </button>
      )}
      <NextLink
        href={stripLanguage(pathname) + suffix}
        onClick={(event) => {
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
          )
            return
          event.preventDefault()
          navigate('en')
        }}
      >
        English
      </NextLink>
    </aside>
  )
}
