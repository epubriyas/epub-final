import { expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { HeroHeadline } from '@/components/home/HeroHeadline'
import { decodeJSXText } from '@/lib/i18n/html-text'
import catalog from '@/lib/i18n/public-ui-texts.json'

vi.mock('@/components/i18n/LocaleProvider', () => ({ useSiteLocale: () => 'hi' }))

it('keeps a translated heading as one sentence rather than separate English words', () => {
  const title = 'Digital Publishing, Content Transformation & Localization'
  const markup = renderToStaticMarkup(<HeroHeadline title={title} />)
  expect(markup).toContain(`>${title.replace('&', '&amp;')}</span>`)
  expect(markup).not.toContain('>Digital</span>')
  expect(catalog).toContain(title)
})

it('registers browser text rather than JSX entity spellings', () => {
  expect(decodeJSXText('Publishing &amp; typesetting&nbsp;&#x2014; &#38; XML')).toBe(
    'Publishing & typesetting\u00a0— & XML',
  )
  expect(catalog).toContain('EPUBTRANS / PUBLISHING & LANGUAGE PRODUCTION')
  expect(catalog).toContain('Publishing & typesetting')
  expect(catalog).toContain('XML & digital content')
  expect(catalog).toContain('EDITORIAL & TYPESETTING')
  expect(catalog).toContain('PRINT & DIGITAL CONTENT')
})
