import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('About handoff preserves its canonical, crawlable copy and working destinations', async ({ page, request }) => {
  test.setTimeout(90_000)
  await page.goto('/about-us')
  await expect(page.locator('main h1')).toHaveText('About EPUBTRANS')
  await expect(page.locator('#mission-vision')).toContainText('To develop EPUBTRANS as a capable international production partner')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.epubtrans.com/about-us')
  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(schemas.map((schema) => JSON.parse(schema)).some((schema) => schema['@type'] === 'AboutPage')).toBe(true)
  const destinations = await page.locator('main a[href^="/"]').evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href')!.split('#')[0]))])
  for (const href of destinations) {
    const response = await request.get(href)
    expect(response.status(), href).toBe(200)
  }
  const alias = await request.get('/company')
  expect(alias.status()).toBe(200)
  expect(await alias.text()).toContain('To develop EPUBTRANS as a capable international production partner')
  const sitemap = await request.get('/pages-sitemap.xml')
  const xml = await sitemap.text()
  expect(xml).toContain('/about-us</loc>')
  expect(xml).not.toContain('/company</loc>')
})

test('company content remains accessible and fits mobile and desktop layouts', async ({ page }) => {
  test.setTimeout(90_000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['/about-us', '/company/global-presence', '/company/careers']) {
      await page.goto(path)
      await expect(page.locator('main h1')).toHaveCount(1)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} at ${width}`).toBe(true)
      if (width === 390 || width === 1440) {
        const audit = await new AxeBuilder({ page }).include('main').analyze()
        expect(audit.violations, `${path} at ${width}`).toEqual([])
      }
    }
  }
  await page.goto('/company/global-presence')
  await expect(page.locator('main h1')).toHaveText('Global Delivery & Collaboration')
  await expect(page.locator('.et-company-topics h3')).toHaveText([
    'Working With International Clients', 'Chennai-Based Production Support',
    'Multilingual Project Requirements', 'Project Communication & Delivery',
  ])
  for (const id of ['global-capabilities', 'locations', 'language-coverage', 'regional-expertise']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1)
  }
})
