import { test, expect } from '@playwright/test'

test('Public contact and career links use the main company mailbox', async ({ page }) => {
  test.setTimeout(90000)
  for (const path of ['/company/careers', '/contact-us', '/privacy-policy', '/accessibility']) {
    expect((await page.goto(path))?.status()).toBe(200)
    const addresses = await page
      .locator('a[href^="mailto:"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')!.split('?')[0]))
    expect(addresses.length).toBeGreaterThan(0)
    expect(addresses.every((address) => address === 'mailto:info@epubtrans.com')).toBe(true)
    if (path === '/company/careers') {
      await expect(
        page.locator('main').getByRole('link', { name: 'info@epubtrans.com' }),
      ).toBeVisible()
    }
  }
})
