import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'

test('directory search, category navigation, reset and contextual quote handoff', async ({
  page,
}) => {
  test.setTimeout(180000)
  await page.goto('/services')
  await expect(page.locator('main h1')).toHaveCount(1)
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /\/services$/)
  const total = await page.locator('.sp-catalog-link').count()
  expect(total).toBeGreaterThan(0)
  const search = page.getByRole('searchbox', { name: 'Search services' })
  await search.fill(' OCR ')
  await expect(page.locator('.sp-catalog-link')).toHaveCount(1)
  await expect(page.getByRole('status')).toHaveText('1 matching service')
  await expect(page.locator('#service-results section')).toHaveCount(1)
  const anchors = await page
    .getByRole('navigation', { name: 'Service categories' })
    .getByRole('link')
    .evaluateAll((a) => a.map((e) => e.getAttribute('href')))
  for (const href of anchors) await expect(page.locator(href!)).toHaveCount(1)
  await search.fill('pdf word')
  await expect(page.locator('.sp-catalog-link')).toHaveCount(2)
  await search.fill('unmatched-zzzz')
  await expect(page.getByRole('heading', { name: 'No services match your search.' })).toBeVisible()
  await expect(page.locator('#service-results section')).toHaveCount(0)
  await page.getByRole('button', { name: 'Show all services' }).click()
  await expect(search).toBeFocused()
  await expect(page.locator('.sp-catalog-link')).toHaveCount(total)
  await search.fill('OCR')
  await search.press('Escape')
  await expect(search).toHaveValue('')
  await page
    .getByRole('link', { name: 'Request a Quote for eBook Creation Services', exact: true })
    .click()
  await expect(page).toHaveURL(/\/get-a-quote\?service=ebook_xml/, { timeout: 60000 })
  await expect(page.locator('input[name=service_required][value=ebook_xml]')).toBeChecked({
    timeout: 30000,
  })
})

test('directory remains readable, accessible and responsive in both themes', async ({ page }) => {
  test.setTimeout(180000)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/services')
  await mkdir('artifacts/services-audit', { recursive: true })
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  for (const [theme, width] of [
    ['light', 1440],
    ['light', 390],
    ['dark', 1440],
  ] as const) {
    await page.setViewportSize({ width, height: 1000 })
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme)
    await page.waitForTimeout(350)
    const result = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(result.violations).toEqual([])
    await page.screenshot({
      path: `artifacts/services-audit/${theme}-${width}.png`,
      fullPage: true,
    })
  }
  await page.locator('.sp-faq summary').first().focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.sp-faq details').first()).toHaveAttribute('open', '')
  expect(errors).toEqual([])
})
