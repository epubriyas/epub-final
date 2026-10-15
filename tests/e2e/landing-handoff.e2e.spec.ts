import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'
import content from '../../src/config/landing-content.json'

test('document landing pages retain responsive UI, content, links and accessible interactions', async ({
  page,
}) => {
  test.setTimeout(180000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await mkdir('artifacts/landing-handoff', { recursive: true })
  for (const route of ['/', '/services']) {
    const data = route === '/' ? content.home : content.directory
    const response = await page.goto(route)
    expect(response?.status()).toBe(200)
    await expect(page.locator('main h1')).toHaveText(data.h1)
    await expect(page).toHaveTitle(data.seo.title)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      data.seo.description,
    )
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      data.seo.title,
    )
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      if ([390, 1440].includes(width)) {
        const results = await new AxeBuilder({ page })
          .include('main')
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze()
        expect(results.violations).toEqual([])
        await page.screenshot({
          path: `artifacts/landing-handoff/${route === '/' ? 'home' : 'services'}-${width}.png`,
          fullPage: true,
        })
      }
    }
  }
  await expect(page.locator('.sp-catalog-link')).toHaveCount(17)
  for (const group of content.directory.categories) {
    const link = page.locator('nav[aria-label="Service categories"] a', { hasText: group.title })
    await expect(link).toHaveAttribute('href', '#' + group.anchorId)
    await link.click()
    const offset = await page
      .locator('#' + group.anchorId)
      .evaluate((el) => el.getBoundingClientRect().top)
    expect(offset).toBeGreaterThanOrEqual(80)
  }
  const search = page.getByRole('searchbox', { name: 'Search services' })
  await search.fill('OCR')
  await expect(page.locator('.sp-catalog-link')).toHaveCount(1)
  await expect(page.getByRole('status')).toHaveText('1 matching services')
  await search.fill('no-results-for-this-query')
  await expect(page.locator('.sp-catalog-link')).toHaveCount(0)
  await search.fill('')
  await expect(page.locator('.sp-catalog-link')).toHaveCount(17)
  const faq = page.locator('.sp-faq summary').first()
  await faq.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.sp-faq details').first()).toHaveAttribute('open', '')
  const quoteLink = page
    .locator('.sp-catalog-link')
    .filter({ has: page.getByRole('heading', { name: 'XML & JATS Conversion' }) })
  await expect(quoteLink).toHaveAttribute('href', '/xml-conversion-services')
  await quoteLink.click()
  await expect(page).toHaveURL(/\/xml-conversion-services$/)
  await expect(page.locator('main h1')).toBeVisible()
  const destinations = [
    ...new Set(
      content.directory.categories.flatMap((category) =>
        category.services.map((card) => card.href),
      ),
    ),
  ]
  for (const href of [...destinations, '/ta/', '/ta/services']) {
    const response = await page.request.get(href)
    expect(response.status(), href).toBe(200)
  }
  expect(errors).toEqual([])
})
