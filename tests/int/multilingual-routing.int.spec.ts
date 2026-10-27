import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { languages, languagePath, stripLanguage } from '@/config/languages'
import { proxy } from '@/proxy'

describe('English source and locale reading previews', () => {
  it('honors explicit English URLs instead of a saved language preference', () => {
    for (const path of ['/', '/typesetting-services', '/get-a-quote?service=ebook_xml']) {
      const response = proxy(
        new NextRequest('https://www.epubtrans.com' + path, {
          headers: { cookie: 'epubtrans-language=fr', 'Accept-Language': 'ar' },
        }),
      )
      expect(response.status).toBe(200)
      expect(response.headers.get('location')).toBeNull()
      expect(response.headers.get('x-robots-tag')).toBeNull()
    }
  })

  it('keeps every existing locale preview non-indexable without inventing alternate pages', () => {
    for (const language of languages.filter((language) => language.code !== 'en')) {
      const response = proxy(
        new NextRequest(`https://www.epubtrans.com/${language.code}/get-a-quote?service=ebook_xml`),
      )
      expect(response.headers.get('x-robots-tag')).toBe('noindex, follow')
      expect(response.headers.get('x-middleware-rewrite')).toBe(
        'https://www.epubtrans.com/get-a-quote?service=ebook_xml',
      )
      expect(response.headers.get('link')).toBeNull()
    }
  })

  it('preserves query, fragments, English paths and the established Simplified Chinese tag', () => {
    expect(languagePath('/ta/get-a-quote?service=ebook_xml#brief', 'fr')).toBe(
      '/fr/get-a-quote?service=ebook_xml#brief',
    )
    expect(languagePath('/ar/data-conversion-services#pdf-recreation', 'en')).toBe(
      '/data-conversion-services#pdf-recreation',
    )
    expect(languagePath('/ta?source=header#top', 'fr')).toBe('/fr?source=header#top')
    expect(languagePath('/services', 'zh-CN')).toBe('/zh-CN/services')
    expect(languagePath('/services', 'xx')).toBe('/services')
    expect(stripLanguage('/ta?source=header')).toBe('/?source=header')
    expect(languagePath('/api/quote?source=form', 'ar')).toBe('/api/quote?source=form')
    expect(languagePath('mailto:info@epubtrans.com', 'fr')).toBe('mailto:info@epubtrans.com')
  })

  it('does not expose localized admin/API paths or change legacy service destinations', () => {
    expect(proxy(new NextRequest('https://www.epubtrans.com/ar/admin')).status).toBe(404)
    const response = proxy(
      new NextRequest('https://www.epubtrans.com/fr/services/typesetting?source=old'),
    )
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe(
      'https://www.epubtrans.com/fr/typesetting-services?source=old',
    )
  })
})
