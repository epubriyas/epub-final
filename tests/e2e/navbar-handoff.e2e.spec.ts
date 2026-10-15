import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
const order = [
  'What We Do',
  'Industries',
  'Technology',
  'Resources',
  'Company',
  'Contact',
]
test('document navigation order, direct directory link, quote and language controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const header = page.locator('header.et-header')
  const nav = header.getByRole('navigation', { name: 'Main navigation', exact: true })
  const labels = await nav
    .locator(':scope > a, :scope > div')
    .evaluateAll((nodes) => nodes.map((n) => n.textContent?.trim()))
  expect(labels).toEqual(order)
  await expect(nav.getByRole('link', { name: 'What We Do', exact: true })).toHaveAttribute(
    'href',
    '/services',
  )
  await expect(nav.getByRole('link', { name: 'Solutions', exact: true })).toHaveCount(0)
  await expect(
    header.locator('.et-header-actions').getByRole('link', { name: 'Get a Quote' }),
  ).toHaveAttribute('href', '/get-a-quote')
  await header.locator('.et-header-actions > button').click()
  await expect(header.locator('#language-options')).toBeVisible()
  await expect(
    header.getByRole('button', { name: 'English, default language', exact: true }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await nav.getByRole('link', { name: 'What We Do', exact: true }).click()
  await expect(page).toHaveURL(/\/services$/)
})
test('navbar fits desktop tablet and mobile and supports accessible touch navigation', async ({
  page,
}) => {
  test.setTimeout(90000)
  await page.goto('/')
  for (const width of [1920, 1440, 1280, 1200, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    const header = page.locator('header.et-header')
    expect(await header.evaluate((el) => el.scrollWidth <= innerWidth)).toBe(true)
    if (width >= 1200) {
      await header.getByRole('button', { name: 'What We Do', exact: true }).click()
      await expect(header.locator('.et-mega-services')).toBeVisible()
      expect(
        await header.locator('.et-mega-services').evaluate((el) => el.scrollWidth <= innerWidth),
      ).toBe(true)
      const result = await new AxeBuilder({ page })
        .include('header.et-header')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(result.violations).toEqual([])
      await page.keyboard.press('Escape')
    } else {
      await header.getByRole('button', { name: 'Open navigation', exact: true }).click()
      const dialog = header.getByRole('dialog', { name: 'Site navigation', exact: true })
      await expect(dialog.getByRole('link', { name: 'What We Do', exact: true })).toHaveAttribute(
        'href',
        '/services',
      )
      const services = dialog.getByRole('button', { name: 'What We Do', exact: true })
      if ((await services.getAttribute('aria-expanded')) !== 'true') await services.click()
      await expect(dialog.locator('#mobile-0 summary')).toHaveCount(6)
      const conversion = dialog
        .locator('details')
        .filter({ has: page.getByText('Document & Data Conversion', { exact: true }) })
      if (!(await conversion.evaluate((element) => (element as HTMLDetailsElement).open)))
        await conversion.locator('summary').click()
      await expect(dialog.getByRole('link', { name: 'Data Conversion', exact: true })).toBeVisible()
      const result = await new AxeBuilder({ page })
        .include('dialog[aria-label="Site navigation"]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(result.violations).toEqual([])
      expect(await dialog.evaluate((el) => el.scrollWidth <= innerWidth)).toBe(true)
      await page.keyboard.press('Escape')
    }
  }
})
