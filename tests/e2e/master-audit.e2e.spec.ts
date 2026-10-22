import { expect, test, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

test.setTimeout(120000)

async function checkFormLayout(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    await page
      .locator('.et-assistant-launcher')
      .evaluate((element) => getComputedStyle(element).position),
  ).toBe('static')
  const collisions = await page.evaluate(() => {
    const launcher = document.querySelector('.et-assistant-launcher')!.getBoundingClientRect()
    return [
      ...document.querySelectorAll(
        '.et-quote-panel label, .et-quote-panel button, .et-quote-panel input:not([tabindex="-1"]), .et-quote-panel textarea',
      ),
    ].filter((element) => {
      const rect = element.getBoundingClientRect()
      return (
        Math.min(rect.right, launcher.right) > Math.max(rect.left, launcher.left) &&
        Math.min(rect.bottom, launcher.bottom) > Math.max(rect.top, launcher.top)
      )
    }).length
  })
  expect(collisions).toBe(0)
}

test('quote help stays outside all four steps at every required viewport', async ({ page }) => {
  test.setTimeout(180000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await mkdir('artifacts/master-audit/quote-steps', { recursive: true })
  let submissions = 0
  await page.route('**/api/quote', async (route) => {
    submissions++
    await route.fulfill({ json: { reference: 'SYNTHETIC-UI-AUDIT', notification: 'unavailable' } })
  })
  for (const width of [320, 390, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/get-a-quote', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#project-assistant-dock .et-assistant-launcher')).toHaveCount(1)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(
      page.getByText('Select a service or choose “Multiple Services / Not Sure”.', { exact: true }),
    ).toBeVisible()
    await expect(page.getByRole('radiogroup', { name: 'Service Required' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    await page.getByRole('radio').first().check()
    for (let step = 0; step < 4; step++) {
      await checkFormLayout(page)
      await page
        .locator('.et-quote-panel')
        .screenshot({ path: `artifacts/master-audit/quote-steps/${width}-step-${step + 1}.png` })
      if (step === 1)
        await page
          .locator('#quote-details')
          .fill(
            'Synthetic UI audit: typeset an approved example manuscript for layout verification.',
          )
      if (step === 2) {
        await page.locator('#quote-name').fill('UI Audit Example')
        await page.locator('#quote-email').fill('ui-audit@example.invalid')
        await page.locator('#quote-company').fill('Synthetic QA')
      }
      if (step < 3) await page.getByRole('button', { name: 'Continue', exact: true }).click()
    }
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await expect(page.locator('#quote-company')).toHaveValue('Synthetic QA')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.getByRole('button', { name: 'Submit Project Enquiry', exact: true }).click()
    await expect(
      page.getByText('Your project enquiry has been submitted.', { exact: true }),
    ).toBeVisible()
  }
  expect(submissions).toBe(7)
})

test('related typesetting cards share dimensions and center incomplete rows', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/typesetting-services', { waitUntil: 'domcontentloaded' })
    const grid = page.locator('.sp-related-grid')
    await grid.scrollIntoViewIfNeeded()
    await expect(grid.locator('> a')).toHaveCount(5)
    await expect(
      grid.getByRole('link', { name: /XML & Structured Content Services/ }),
    ).toHaveAttribute('href', '/xml-conversion-services')
    const rectangles = await grid.locator('> a').evaluateAll((elements) =>
      elements.map((element) => {
        const { x, y, width, height } = element.getBoundingClientRect()
        return { x, y, width, height }
      }),
    )
    expect(
      Math.max(...rectangles.map((rect) => rect.width)) -
        Math.min(...rectangles.map((rect) => rect.width)),
    ).toBeLessThan(2)
    if (width === 1440) {
      const bounds = await grid.boundingBox()
      const last = rectangles.slice(-2)
      expect(
        Math.abs((last[0].x + last[1].x + last[1].width) / 2 - (bounds!.x + bounds!.width / 2)),
      ).toBeLessThan(2)
    }
  }
})

test('staging directives and keyboard access preserve navigation and assistant focus', async ({
  page,
  request,
}) => {
  expect((await request.get('/')).headers()['x-robots-tag']).toContain('noindex')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#site-assistant-dock .et-assistant-launcher')).toBeVisible({ timeout: 30000 })
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
  const services = page
    .locator('.et-desktop-nav')
    .getByRole('button', { name: 'What We Do', exact: true })
  await services.focus()
  await page.keyboard.press('ArrowDown')
  await expect(services).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(services).toBeFocused()
  await expect(services).toHaveAttribute('aria-expanded', 'false')
  await page.setViewportSize({ width: 390, height: 900 })
  const mobile = page.getByRole('button', { name: 'Open navigation', exact: true })
  await mobile.click()
  await expect(page.getByRole('dialog', { name: 'Site navigation' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(mobile).toBeFocused()
  await page.goto('/contact-us', { waitUntil: 'domcontentloaded' })
  const assistant = page.getByRole('button', { name: 'Open EPUBTRANS assistant', exact: true })
  await assistant.click()
  await expect(page.locator('#epubtrans-assistant')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(assistant).toBeFocused()
})
