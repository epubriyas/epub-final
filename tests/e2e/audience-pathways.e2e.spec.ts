import { expect, test } from '@playwright/test'

test('publisher and localization CTAs reach distinct, usable service pathways', async ({ page }) => {
  test.setTimeout(120000)
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const [label, anchor] of [
      ['Explore Publishing Services', 'for-publishers'],
      ['Explore Localization Production', 'for-localization-providers'],
    ] as const) {
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      const link = page.locator('#possibilities').getByRole('link', { name: label })
      await expect(link).toHaveAttribute('href', `/services#${anchor}`)
      await link.focus()
      await expect(link).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(new RegExp(`/services#${anchor}$`))
      const target = page.locator(`#${anchor}`)
      await expect(target).toBeVisible()
      await expect(target.locator('h3')).toBeInViewport()
      const top = await target.evaluate((element) => element.getBoundingClientRect().top)
      expect(top).toBeGreaterThanOrEqual(width <= 600 ? 75 : 88)
      expect(top).toBeLessThan(180)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await page.goBack({ waitUntil: 'domcontentloaded' })
      await expect(page).toHaveURL(/\/$/)
    }
  }
  await page.goto('/services#for-publishers', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#for-publishers h3')).toBeInViewport()
  await page.goto('/services#for-localization-providers', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#for-localization-providers h3')).toBeInViewport()
  await expect(page.locator('.sp-catalog-link')).toHaveCount(17)
  await expect(page.locator('nav[aria-label="Service categories"] a')).toHaveCount(6)
  await expect(page.locator('#for-publishers a[href="/xml-conversion-services"]')).toBeVisible()
  await expect(page.locator('#for-localization-providers a[href="/data-conversion-services"]')).toBeVisible()
  await expect(page.locator('#for-publishers a[href="/get-a-quote"]')).toBeVisible()
  await expect(page.locator('#for-localization-providers a[href="/get-a-quote"]')).toBeVisible()
})

test('localized audience links retain their route, fragment and destinations', async ({ page }) => {
  test.setTimeout(60000)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/ta/', { waitUntil: 'domcontentloaded' })
  await expect(
    page.locator('#possibilities a[href="/ta/services#for-publishers"]'),
  ).toBeVisible()
  await page.locator('#possibilities a[href="/ta/services#for-localization-providers"]').click()
  await expect(page).toHaveURL(/\/ta\/services#for-localization-providers$/)
  await expect(page.locator('#for-localization-providers h3')).toBeInViewport()
  await expect(
    page.locator('#for-localization-providers a[href="/ta/get-a-quote"]'),
  ).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('curated service and quote links work with keyboard and reduced motion', async ({ page }) => {
  test.setTimeout(120000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  for (const [anchor, service] of [
    ['for-publishers', '/xml-conversion-services'],
    ['for-localization-providers', '/desktop-publishing-services'],
  ] as const) {
    await page.goto(`/services#${anchor}`, { waitUntil: 'domcontentloaded' })
    const link = page.locator(`#${anchor} a[href="${service}"]`)
    await link.focus()
    await expect(link).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(new RegExp(`${service}$`))
    await page.goBack({ waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(new RegExp(`/services#${anchor}$`))
    const quote = page.locator(`#${anchor} a[href="/get-a-quote"]`)
    await quote.focus()
    await expect(quote).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/get-a-quote$/)
  }
})
