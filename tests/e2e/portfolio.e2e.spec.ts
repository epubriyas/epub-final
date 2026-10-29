import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'

const widths = [320, 375, 390, 414, 768, 1024, 1440, 1920]
test('real samples, filtering, lazy previews, accessible PDF viewer and responsive layouts', async ({
  page,
}) => {
  test.setTimeout(240000)
  const errors: string[] = []
  const previews: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => {
    if (request.url().includes('/preview')) previews.push(request.url())
  })
  expect((await page.goto('/work'))?.status()).toBe(200)
  await expect(page.locator('main h1')).toHaveText('Selected publishing and content samples.')
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /\/work$/)
  const rows = page.locator('.wp-work-row')
  expect(await rows.count()).toBeGreaterThanOrEqual(19)
  expect(previews).toHaveLength(0)
  expect(await page.locator('main a[href*="drive.google"]').count()).toBe(0)
  expect(await page.locator('main a[download]').count()).toBe(0)
  const routes = await rows
    .locator('h3 a')
    .evaluateAll((items) => items.map((item) => item.getAttribute('href')!))
  const filters = page.locator('.wp-filters button')
  expect(await filters.count()).toBe(5)
  await page.getByRole('button', { name: /Multilingual DTP/ }).click()
  await expect(rows).toHaveCount(2)
  await expect(page.getByRole('button', { name: /Multilingual DTP/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByLabel('Search work').fill('unmatched-example-xyz')
  await expect(page.getByText('No work matches this view.')).toBeVisible()
  await page.getByRole('button', { name: /Return to All Work/ }).click()
  await expect(rows).toHaveCount(routes.length)
  const trigger = rows
    .filter({ hasText: 'Physics textbook layout: work, energy and power' })
    .getByRole('button', { name: /View Sample/ })
  await trigger.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.wp-page-image')).toBeVisible()
  await expect(dialog.locator('.wp-page-image')).toHaveJSProperty('complete', true)
  expect(previews.length).toBeGreaterThan(0)
  await expect(dialog.getByRole('button', { name: 'Close sample viewer' })).toBeFocused()
  await dialog.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(dialog.getByRole('combobox')).toHaveValue('1')
  await dialog.getByRole('button', { name: 'Zoom in', exact: true }).click()
  await expect(dialog.locator('.wp-zoom')).toHaveText('125%')
  await expect(dialog.locator('.wp-image-stage')).toHaveAttribute('data-zoomed', 'true')
  await dialog.getByRole('button', { name: 'Fit', exact: true }).click()
  await expect(dialog.locator('.wp-zoom')).toHaveText('100%')
  await expect(dialog.getByRole('button', { name: 'Read page text' })).toHaveCount(0)
  await page.keyboard.press('Shift+Tab')
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog')))).toBe(true)
  const axe = await new AxeBuilder({ page })
    .include('dialog')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(axe.violations).toEqual([])
  if (await dialog.getByRole('button', { name: 'Full screen', exact: true }).count()) {
    await dialog.getByRole('button', { name: 'Full screen', exact: true }).click()
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true)
    await dialog.getByRole('button', { name: 'Full screen', exact: true }).click()
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false)
  }
  await dialog.getByRole('button', { name: 'Next sample', exact: true }).click()
  await expect(dialog.locator('#sample-viewer-title')).not.toHaveText(
    'Physics textbook layout: work, energy and power',
  )
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await mkdir('artifacts/portfolio/screens', { recursive: true })
  for (const width of widths) {
    await page.setViewportSize({ width, height: 950 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `work at ${width}`,
    ).toBe(true)
    await trigger.click()
    await expect(dialog.locator('.wp-page-image')).toBeVisible()
    expect(
      await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth),
      `viewer at ${width}`,
    ).toBe(true)
    if ([390, 1440].includes(width))
      await page.screenshot({ path: `artifacts/portfolio/screens/viewer-${width}.png` })
    await page.keyboard.press('Escape')
    await page.evaluate(() => window.scrollTo(0, 0))
    if ([390, 1440].includes(width))
      await page.screenshot({ path: `artifacts/portfolio/screens/work-${width}.png` })
  }
  const workAxe = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(workAxe.violations).toEqual([])
  for (const route of routes) {
    expect((await page.goto(route))?.status()).toBe(200)
    await expect(page.locator('main h1')).toHaveCount(1)
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      new RegExp(`${route}$`),
    )
    for (const href of await page
      .locator('.wp-related a')
      .evaluateAll((items) => items.map((item) => item.getAttribute('href')!)))
      expect((await page.request.get(href)).status()).toBe(200)
  }
  expect((await page.goto('/work/does-not-exist'))?.status()).toBe(404)
  expect(errors).toEqual([])
})

test('EPUB reading, quote preselection, preview errors and reduced motion', async ({ page }) => {
  await page.goto('/work?category=publishing')
  await page.getByRole('button', { name: /eBook & EPUB/ }).click()
  const row = page.locator('.wp-work-row').filter({ hasText: 'Rented Silence' })
  await row.getByRole('button', { name: /View Sample/ }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('.wp-reading')).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Zoom in', exact: true })).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Larger text' }).click()
  await expect(dialog.locator('.wp-zoom')).toHaveText('125%')
  await dialog.getByRole('button', { name: 'Next section' }).click()
  await expect(dialog.getByRole('combobox')).toHaveValue('1')
  const quote = await dialog.getByRole('link', { name: /Request a Quote/ }).getAttribute('href')
  await page.keyboard.press('Escape')
  await page.goto(quote!)
  await page.getByRole('button', { name: 'Return to Service step' }).click()
  await expect(
    page.getByRole('radio', { name: 'eBook, XML & Structured Content', exact: true }),
  ).toBeChecked()
  await page.goto('/work')
  await page.route('**/api/work/*/preview', (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
  )
  await page
    .locator('.wp-work-row')
    .first()
    .getByRole('button', { name: /View Sample/ })
    .click()
  await expect(dialog.getByText('This preview is unavailable.')).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Try again' })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(
    await page.locator('h1').evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none')
})

test('dark theme, detail layouts and editorial compositions', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('payload-theme', 'dark'))
  await page.goto('/work')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  const audit = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(audit.violations).toEqual([])
  await page.setViewportSize({ width: 1440, height: 950 })
  await page.screenshot({ path: 'artifacts/portfolio/screens/work-dark-1440.png' })
  await page.getByRole('region', { name: 'Selected portfolio previews' }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'artifacts/portfolio/screens/featured-1440.png' })
  await page.locator('.wp-explorer-heading').scrollIntoViewIfNeeded()
  await expect(page.locator('.wp-row-preview img').first()).toBeVisible()
  await expect
    .poll(() =>
      page
        .locator('.wp-row-preview img')
        .first()
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0)
  await page.screenshot({ path: 'artifacts/portfolio/screens/explorer-1440.png' })
  await page.goto('/work/complex-1-typesetting-sample')
  for (const width of widths) {
    await page.setViewportSize({ width, height: 950 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  const detailAudit = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(detailAudit.violations).toEqual([])
  await page.setViewportSize({ width: 390, height: 950 })
  await page.screenshot({ path: 'artifacts/portfolio/screens/detail-390.png' })
  await page.getByRole('button', { name: 'View Sample' }).click()
  await expect(page.getByRole('dialog').locator('.wp-page-image')).toBeVisible()
  await page.keyboard.press('Escape')
})
