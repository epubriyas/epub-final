import { test, expect } from '@playwright/test'
import { legacyRedirects } from '../../src/config/redirects'
test('legacy paths return 301 and published sitemap excludes drafts', async ({ request }) => {
  for (const [source, destination] of Object.entries(legacyRedirects)) {
    const response = await request.get(source, { maxRedirects: 0 })
    expect(response.status(), source).toBe(301)
    expect(new URL(response.headers().location, 'http://localhost:3001').pathname).toBe(destination)
  }
  const sitemap = await request.get('/pages-sitemap.xml')
  expect(sitemap.status()).toBe(200)
  const text = await sitemap.text()
  expect(text).toContain('/copyediting-services')
  expect(text).toContain('/accessibility-services')
  expect(text).toContain('/proofreading-services')
  expect(text).toContain('/subtitling-services')
  const health = await request.get('/api/health')
  expect(health.status()).toBe(200)
  const privateFile = await request.get(
    '/api/quote-files/1/11111111-1111-1111-1111-111111111111.txt',
  )
  expect(privateFile.status()).toBe(401)
})
