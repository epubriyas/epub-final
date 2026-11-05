import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('Case Studies has one destination and displays stories on the same page', async ({ page }) => {
  test.setTimeout(90000)
  expect((await page.goto('/case-studies'))?.status()).toBe(200)
  await expect(page.locator('main h1')).toHaveText('Case Studies')
  await expect(page.locator('#multilingual-elearning-production-safety-training')).toContainText(
    'Articulate Storyline',
  )
  await expect(page.locator('#multilingual-book-typesetting-french-spanish')).toContainText(
    'French and Spanish',
  )
  await expect(page.locator('main')).not.toContainText('CRH')
  await expect(page.locator('main')).not.toContainText('Internal Publication Review')
  await expect(page.locator('main')).not.toContainText('SEO recommendations')
  await expect(
    page.getByRole('navigation', { name: 'Explore our case studies' }).getByRole('link'),
  ).toHaveCount(2)
  expect((await new AxeBuilder({ page }).include('main').analyze()).violations).toEqual([])
  await page.screenshot({ path: 'artifacts/case-studies/desktop.png', fullPage: true })
  await page
    .locator('.et-desktop-nav')
    .getByRole('button', { name: 'Resources', exact: true })
    .click()
  const menu = page.locator('.et-mega-resources')
  await expect(menu.getByRole('link', { name: 'View Case Studies', exact: true })).toHaveAttribute(
    'href',
    '/case-studies',
  )
  await expect(menu.locator('a[href*="category="]')).toHaveCount(0)
  await menu.getByRole('link', { name: 'View Case Studies', exact: true }).click()
  await page.keyboard.press('Escape')
  const slugs = await page
    .locator('main section[id]')
    .evaluateAll((sections) => sections.map((section) => section.id))
  for (const slug of slugs) {
    await page.goto(`/work/${slug}`)
    await expect(page).toHaveURL(new RegExp(`/case-studies#${slug}$`))
    await expect(page.locator(`[id="${slug}"]`)).toBeVisible()
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open navigation' }).click()
  const mobile = page.getByRole('dialog', { name: 'Site navigation' })
  await mobile.getByRole('button', { name: 'Resources', exact: true }).click()
  await mobile
    .locator('summary')
    .filter({ hasText: /^Case Studies$/ })
    .click()
  await mobile.getByRole('link', { name: 'View Case Studies', exact: true }).click()
  await expect(page).toHaveURL(/\/case-studies$/)
  await expect(mobile).not.toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.setViewportSize({ width: 320, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'artifacts/case-studies/mobile.png', fullPage: true })
})
