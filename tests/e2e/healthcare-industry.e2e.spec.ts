import { test, expect } from '@playwright/test'

for (const width of [1440, 390]) {
  test(`industry header navigation reaches healthcare at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/industries', { waitUntil: 'domcontentloaded' })
    if (width < 700) {
      await page.getByRole('button', { name: 'Open navigation' }).click()
      const nav = page.getByRole('navigation', { name: 'Mobile navigation' })
      await nav.getByRole('button', { name: 'Industries', exact: true }).click()
      await nav.getByText('Core Industries', { exact: true }).click()
      await nav.getByRole('link', { name: 'Healthcare & Medical Publishing' }).click()
      await expect(page.getByRole('dialog', { name: 'Site navigation' })).not.toBeVisible()
    } else {
      await page.getByRole('button', { name: 'Industries', exact: true }).click()
      const nav = page.locator('[aria-label="Industries navigation"]')
      const link = nav.getByRole('link', { name: 'Healthcare & Medical Publishing' })
      await link.focus()
      await page.keyboard.press('Enter')
    }
    await expect(page).toHaveURL(/\/industries#healthcare-medical-publishing$/)
    await expect(page.locator('#healthcare-medical-publishing h3')).toBeInViewport()
  })
}

for (const width of [1440, 1100, 768, 700, 390, 360]) {
  test(`healthcare industry follows the existing layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/industries', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('main article')).toHaveCount(7)
    const card = page.locator('#healthcare-medical-publishing')
    await expect(card.getByRole('heading', { level: 3 })).toHaveText(
      'Healthcare & Medical Publishing',
    )
    await expect(card.getByRole('listitem')).toHaveCount(3)
    const nav = page.getByRole('navigation', { name: 'Find your industry' })
    await nav.getByRole('link', { name: 'Healthcare & Medical Publishing' }).click()
    await expect(page).toHaveURL(/#healthcare-medical-publishing$/)
    await expect(card.getByRole('heading', { level: 3 })).toBeInViewport()
    await expect(card.getByRole('img')).toBeVisible()
    await expect
      .poll(() => card.getByRole('img').evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0)
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true)
    await expect.poll(() => card.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
    const columns = await card.evaluate(
      (el) => getComputedStyle(el.parentElement!).gridTemplateColumns.split(' ').length,
    )
    expect(columns).toBe(width > 700 ? 2 : 1)
    await expect(card.getByRole('link')).toHaveCount(7)
    await expect(card.getByRole('link', { name: 'Explore related services' })).toHaveAttribute(
      'href',
      '/services#publishing-editorial',
    )
    const ids = await page.locator('[id]').evaluateAll((els) => els.map((el) => el.id))
    expect(new Set(ids).size).toBe(ids.length)
    await page.screenshot({ path: `artifacts/healthcare/industry-${width}.png`, fullPage: true })
  })
}

test('healthcare services resolve to existing service pages', async ({ page }) => {
  test.setTimeout(120000)
  await page.goto('/industries', { waitUntil: 'domcontentloaded' })
  const links = await page
    .locator('#healthcare-medical-publishing a')
    .evaluateAll((els) =>
      els.slice(0, 6).map((el) => ({ href: el.getAttribute('href')!, label: el.textContent! })),
    )
  expect(links).toHaveLength(6)
  for (const { href } of links) {
    const response = await page.goto(href, { waitUntil: 'domcontentloaded' })
    expect(response?.status(), href).toBe(200)
    await expect(page.locator('main h1')).toBeVisible()
  }
})
