import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const routes = [
  'production-technologies',
  'workflow-automation',
  'in-house-development',
  'production-os',
]

test('Technology menu connects all pages and Production OS on desktop and mobile', async ({
  page,
  request,
}) => {
  test.setTimeout(90000)
  await page.goto('/technology')
  await page
    .locator('.et-desktop-nav')
    .getByRole('button', { name: 'Technology', exact: true })
    .click()
  const menu = page.locator('.et-mega-technology')
  await expect(menu.getByRole('heading', { level: 3 })).toHaveText([
    'Production Technologies',
    'Workflow Automation & AI',
    'In-House Development',
  ])
  const links = await menu
    .getByRole('link')
    .evaluateAll((nodes) => nodes.map((node) => (node as HTMLAnchorElement).getAttribute('href')!))
  for (const href of links) {
    expect((await request.get(href)).status(), href).toBe(200)
    if (href.includes('#')) {
      await page.goto(href)
      await expect(page.locator(`[id="${href.split('#')[1]}"]`)).toHaveCount(1)
    }
  }
  await page.goto('/technology/in-house-development')
  await expect(
    page.getByText('Internal initiative · In development', { exact: true }),
  ).toBeVisible()
  await page.screenshot({ path: 'artifacts/technology/development-desktop.png', fullPage: true })
  await page
    .locator('.et-desktop-nav')
    .getByRole('button', { name: 'Technology', exact: true })
    .click()
  await expect(page.locator('.et-mega-technology')).toHaveCSS('opacity', '1')
  await page.screenshot({ path: 'artifacts/technology/menu-desktop.png' })
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open navigation' }).click()
  const mobile = page.getByRole('dialog', { name: 'Site navigation' })
  await mobile.getByRole('button', { name: 'Technology', exact: true }).click()
  await mobile
    .locator('summary')
    .filter({ hasText: /^In-House Development$/ })
    .click()
  await mobile.getByRole('link', { name: 'EPUBTRANS Production OS', exact: true }).click()
  await expect(page).toHaveURL(/technology\/production-os$/)
  await expect(mobile).not.toBeVisible()
  await page.screenshot({ path: 'artifacts/technology/production-os-mobile.png', fullPage: true })
})

test('Technology pages fit narrow screens and expose accessible content', async ({ page }) => {
  test.setTimeout(90000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const route of routes) {
    await page.goto(`/technology/${route}`)
    await expect(page.locator('main h1')).toHaveCount(1)
    await expect(page.locator('#overview')).toBeVisible()
    await expect(page.locator('#details article')).toHaveCount(3)
    await expect(page.locator('#questions article')).toHaveCount(3)
    for (const anchor of ['overview', 'capabilities', 'details', 'example', 'questions']) {
      await expect(page.locator(`[id="${anchor}"]`)).toHaveCount(1)
    }
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${route} at ${width}`,
      ).toBe(true)
    }
    const accessibility = await new AxeBuilder({ page }).include('main').analyze()
    expect(accessibility.violations).toEqual([])
    await page.getByRole('button', { name: 'Use dark theme', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    const darkAccessibility = await new AxeBuilder({ page }).include('main').analyze()
    expect(darkAccessibility.violations).toEqual([])
    await page.getByRole('button', { name: 'Use light theme', exact: true }).click()
  }
  expect(errors).toEqual([])
  expect((await page.goto('/technology/unknown-topic'))?.status()).toBe(404)
})
