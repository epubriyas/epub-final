import { NextRequest } from 'next/server'
import { afterEach, expect, it, vi } from 'vitest'
import { POST } from '@/app/(frontend)/api/translate/route'

const { translate } = vi.hoisted(() => ({ translate: vi.fn() }))
vi.mock('@/lib/i18n/catalog', () => ({
  normalizeText: (text: string) => text.replace(/\s+/g, ' ').trim(),
  getPublicTranslationCatalog: async () => new Set(['Your content.', 'A wider world.']),
}))
vi.mock('@/lib/i18n/translate', () => ({ translatePublicText: translate }))
afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

it('returns successful translations with partial status while excluding private text', async () => {
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'http://localhost:3000')
  translate.mockResolvedValue(['உங்கள் உள்ளடக்கம்.', undefined])
  const request = new NextRequest('http://localhost:3000/api/translate', {
    method: 'POST',
    headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
    body: JSON.stringify({
      locale: 'ta',
      texts: ['Your content.', 'A wider world.', 'Private customer project'],
    }),
  })
  const response = await POST(request)
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({
    translations: { 'Your content.': 'உங்கள் உள்ளடக்கம்.' },
    partial: true,
  })
  expect(translate).toHaveBeenCalledWith(['Your content.', 'A wider world.'], 'ta')
})

it('reports omitted non-catalogue strings as partial even when allowed strings succeed', async () => {
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'http://localhost:3000')
  translate.mockResolvedValue(['உங்கள் உள்ளடக்கம்.'])
  const response = await POST(
    new NextRequest('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
      body: JSON.stringify({ locale: 'ta', texts: ['Your content.', 'Not in public catalogue'] }),
    }),
  )
  expect((await response.json()).partial).toBe(true)
  expect(translate).toHaveBeenCalledWith(['Your content.'], 'ta')
})
