import { describe, it, expect } from 'vitest'
import {
  serviceDesign,
  serviceGroup,
  serviceQuoteHref,
  relatedPublishedServices,
} from '@/config/service-design'
import type { Service } from '@/payload-types'
import { quoteServices } from '@/lib/validation/quote'
const record = (id: number, slug: string, status: Service['status'] = 'published'): Service => ({
  id,
  slug,
  title: slug,
  category: 'publishing',
  status,
  createdAt: '',
  updatedAt: '',
})
describe('service presentation and relationships', () => {
  it('excludes self, duplicate, draft and unresolved relationships while preserving CMS order', () => {
    const service = { ...record(1, 'typesetting'), relatedServices: [1, 3, 3, 2, 99, 4] }
    expect(
      relatedPublishedServices(service, [
        service,
        record(2, 'proofreading', 'draft'),
        record(3, 'ebook-creation'),
        record(4, 'desktop-publishing'),
      ]).map((x) => x.id),
    ).toEqual([3, 4])
  })
  it('resolves suggested related slugs against the published catalog only', () => {
    const service = record(1, 'typesetting')
    expect(
      relatedPublishedServices(service, [
        service,
        record(2, 'desktop-publishing'),
        record(3, 'proofreading', 'draft'),
      ]).map((x) => x.slug),
    ).toEqual(['desktop-publishing'])
  })
  it('supports missing optional fields and an unknown service slug', () => {
    expect(serviceDesign(record(1, 'new-service')).kind).toBe('conversion')
    expect(relatedPublishedServices(record(1, 'new-service'), [])).toEqual([])
  })
  it('honors the CMS hero layout override', () => {
    expect(
      serviceDesign({ ...record(1, 'typesetting'), hero: { layout: 'technical' } }).layout,
    ).toBe('technical')
  })
  it.each(['typesetting', 'translation', 'voiceover', 'elearning-localization', 'accessibility'])(
    'passes an allowlisted quote category for %s',
    (slug) => {
      const service = {
        ...record(1, slug),
        category: (slug === 'accessibility'
          ? 'accessibility'
          : 'translation-localization') as Service['category'],
      }
      expect(quoteServices).toContain(
        new URL(serviceQuoteHref(service), 'https://example.test').searchParams.get('service'),
      )
    },
  )
  it('groups Desktop Publishing only under language', () => {
    expect(
      serviceGroup({ ...record(1, 'desktop-publishing'), category: 'translation-localization' }),
    ).toBe('language')
  })
})
