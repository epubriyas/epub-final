import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('Tamil navigation and homepage survive provider failure and return to English', async ({
  page,
}) => {
  test.setTimeout(120000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/api/translate', (route) =>
    route.fulfill({ status: 503, json: { error: 'Provider unavailable' } }),
  )
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/ta')
  await expect(page.locator('h1')).toContainText('உள்ளூர்மயமாக்கல்')
  await expect(page.locator('.et-translation-status')).toContainText('English')
  await expect(
    page.locator('.et-desktop-nav').getByRole('button', { name: 'எங்கள் சேவைகள்' }),
  ).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.getByRole('button', { name: 'Choose website language', exact: true }).click()
  await page
    .locator('#language-options')
    .getByRole('button', { name: 'English, default language' })
    .click()
  await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/)
  await expect(page.locator('h1')).toHaveText(
    'Digital Publishing, Content Transformation & Localization',
  )
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  expect(errors).toEqual([])
})

test('careers page and company menu work at mobile and desktop widths', async ({ page }) => {
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/company/careers')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Build a career')
    await expect(page.getByRole('heading', { name: 'Find your next opportunity.' })).toBeVisible()
    await expect(
      page.getByAltText('People collaborating around a table with laptops and project materials'),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Contact the team' })).toHaveAttribute(
      'href',
      /^mailto:/,
    )
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([])
    await page.emulateMedia({ reducedMotion: 'reduce' })
    expect(
      await page
        .locator('[data-blog-motion]')
        .first()
        .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe('none')
    await page.screenshot({ path: `artifacts/careers/enterprise-hero-${width}.png` })
    await page.screenshot({ path: `artifacts/careers/enterprise-${width}.png`, fullPage: true })
  }
  const roleLink = page.getByRole('link', { name: 'View role & requirements' }).first()
  if (await roleLink.count()) {
    await roleLink.click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Apply by email' })).toHaveAttribute(
      'href',
      /^mailto:/,
    )
    await page.getByRole('link', { name: 'All open roles' }).click()
    await expect(page.getByRole('heading', { name: 'Find your next opportunity.' })).toBeVisible()
  }
  await page.getByRole('button', { name: 'Company', exact: true }).click()
  await expect(
    page.locator('.et-mega').getByRole('link', { name: 'Careers', exact: true }),
  ).toBeVisible()
})

test('native language selector preserves the route, internal links and English return', async ({
  page,
}) => {
  await page.route('**/api/translate', async (route) => {
    const { texts } = route.request().postDataJSON()
    await route.fulfill({
      json: { translations: Object.fromEntries(texts.map((text: string) => [text, text])) },
    })
  })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/company/careers')
  await page.getByRole('button', { name: 'Choose website language', exact: true }).click()
  const selector = page.locator('#language-options')
  await expect(
    selector.getByRole('group', { name: 'Indian languages' }).getByRole('button'),
  ).toHaveCount(4)
  await expect(
    selector.getByRole('group', { name: 'Global languages' }).getByRole('button'),
  ).toHaveCount(6)
  await expect(selector.getByRole('button', { name: 'English, default language' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await selector.getByRole('button', { name: 'Hindi', exact: true }).click()
  await expect(page).toHaveURL(/\/hi\/company\/careers$/)
  await expect(page.getByRole('link', { name: 'Discover our work' })).toHaveAttribute(
    'href',
    '/hi/services',
  )
  await page.getByRole('link', { name: 'Discover our work' }).click()
  await expect(page).toHaveURL(/\/hi\/services$/)
  await page.getByRole('button', { name: 'Choose website language', exact: true }).click()
  await page
    .locator('#language-options')
    .getByRole('button', { name: 'English, default language' })
    .click()
  await expect(page).toHaveURL(/\/services$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('localized administrative routes are blocked and translation endpoint checks origin', async ({
  request,
}) => {
  expect((await request.get('/hi/admin')).status()).toBe(404)
  expect(
    (
      await request.post('/api/translate', {
        headers: { Origin: 'https://untrusted.invalid' },
        data: { locale: 'hi', texts: ['Your content.'] },
      })
    ).status(),
  ).toBe(403)
  expect((await request.get('/careers', { maxRedirects: 0 })).status()).toBe(301)
})

test('language panel stays readable on mobile and keyboard accessible on desktop', async ({
  page,
}) => {
  test.setTimeout(120000)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Choose website language', exact: true })
  await trigger.click()
  await expect(
    page.locator('#language-options').getByRole('heading', { name: 'Choose your language.' }),
  ).toBeVisible()
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([])
  await page.screenshot({ path: 'artifacts/v2/screens/language-selector-desktop.png' })
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Choose website language' }).click()
  const dialog = page.getByRole('dialog', { name: 'Choose website language' })
  await expect(dialog.getByRole('button', { name: 'English, default language' })).toBeVisible()
  await expect(
    dialog.getByRole('group', { name: 'Indian languages' }).getByRole('button'),
  ).toHaveCount(4)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([])
  await dialog.getByRole('button', { name: 'English, default language' }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'artifacts/v2/screens/language-selector-mobile.png' })
})
