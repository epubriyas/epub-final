'use client'
import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { getLanguage, stripLanguage } from '@/config/languages'
import NextLink from 'next/link'
import { fixedTranslation } from '@/lib/i18n/fixed-translations'
const LocaleContext = createContext('en')
export const useSiteLocale = () => useContext(LocaleContext)
const excluded =
  '[data-private], [data-no-translate], .notranslate, script, style, textarea, pre, code, [contenteditable], option'
const subscribe = () => () => {}
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
  const current = useSyncExternalStore(
    subscribe,
    () => getLanguage(window.location.pathname.split('/')[1])?.code || 'en',
    () => locale,
  )
  return (
    <LocaleContext.Provider value={current}>
      {children}
      <PageTranslation key={`${current}:${pathname}`} locale={current} configured={configured} />
    </LocaleContext.Provider>
  )
}
function PageTranslation({ locale, configured }: { locale: string; configured: boolean }) {
  const pathname = usePathname()
  const [status, setStatus] = useState<'idle' | 'working' | 'ready' | 'partial' | 'failed'>('idle')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (locale === 'en' || !configured) return
    const controller = new AbortController(),
      originals = new Map<Text, { source: string; translated?: string }>(),
      cache = new Map<string, string>(),
      seen = new Set<string>()
    const attributes = new Map<Element, Map<string, { source: string; translated?: string }>>()
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
        attributeFilter: ['aria-label', 'placeholder', 'title'],
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
        '[aria-label], [placeholder], [title]',
      )) {
        if (!allowed(element)) continue
        for (const name of ['aria-label', 'placeholder', 'title']) {
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
          }
        }
        for (const { element, name, text } of attributeNodes) {
          const value = cache.get(normalize(text)),
            record = attributes.get(element)?.get(name)
          if (value && record && element.isConnected && element.getAttribute(name) === text) {
            record.translated = value
            element.setAttribute(name, value)
          }
        }
        if (cache.size) {
          document.documentElement.lang = locale
          document.documentElement.dir = getLanguage(locale)?.direction || 'ltr'
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
            if (typeof result.translations[text] === 'string')
              cache.set(text, result.translations[text])
          }
          if (result.partial) incomplete = true
          if (!active) return
          applyTranslations()
        }
        if (!active) return
        if (!cache.size && unique.length) throw new Error('No translated content returned')
        setStatus(incomplete ? 'partial' : cache.size ? 'ready' : 'idle')
      } catch {
        if (active) {
          setStatus(cache.size ? 'partial' : 'failed')
          incomplete = true
          pending = false
          clearTimeout(timer)
          observer.disconnect()
          if (!cache.size) {
            document.documentElement.lang = 'en'
            document.documentElement.dir = 'ltr'
          }
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
      document.documentElement.lang = 'en'
      document.documentElement.dir = 'ltr'
    }
  }, [locale, configured, attempt])
  if (locale === 'en') return null
  const missing = !configured || status === 'failed'
  return (
    <aside className="et-translation-status" role="status" data-no-translate>
      <span lang={locale}>{getLanguage(locale)?.nativeName}</span>
      <span>
        {missing
          ? 'Translation unavailable. English content is shown.'
          : status === 'partial'
            ? 'Some text could not be translated and remains in English.'
            : status === 'working' || status === 'idle'
              ? 'Translating this page…'
              : 'Automatically translated. English is the original.'}
      </span>
      {configured && (status === 'failed' || status === 'partial') && (
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          Retry translation
        </button>
      )}
      <NextLink href={`/en${stripLanguage(pathname) === '/' ? '' : stripLanguage(pathname)}`}>
        English
      </NextLink>
    </aside>
  )
}
