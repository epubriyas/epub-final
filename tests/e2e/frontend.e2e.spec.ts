import { test, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

test('homepage presents EPUBTRANS and the quote destination', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/EPUBTRANS/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your content.')
  await expect(page.getByRole('link', { name: 'Get a Quote' }).first()).toHaveAttribute(
    'href',
    '/get-a-quote',
  )
  await mkdir('artifacts/v2/screens', { recursive: true })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.screenshot({ path: 'artifacts/v2/screens/homepage-desktop.png' })
})

test('mobile resource filters and repeated search parameters render safely', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto('/resources?q=unmatched-editorial-fixture')
  await expect(page.getByRole('combobox', { name: 'Article category' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'No matching articles.' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.goto('/resources?q=first&q=second')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A clearer start. A stronger result.',
  )
})

test('Resources navigation and project checklists work on desktop and mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Resources', exact: true })
    .click()
  await expect(page).toHaveURL(/\/resources$/)
  await expect(page).toHaveTitle('Resources | EPUBTRANS')
  await expect(page.locator('.et-resource-guides article')).toHaveCount(3)
  await expect(page.getByRole('link', { name: 'Explore editorial support' })).toHaveAttribute(
    'href',
    '/copyediting-services',
  )
  await page.setViewportSize({ width: 375, height: 900 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.getByRole('button', { name: 'Open navigation' }).click()
  const mobile = page.getByRole('dialog', { name: 'Site navigation' })
  await expect(mobile.getByRole('link', { name: 'Resources', exact: true })).toBeVisible()
  await mobile.getByRole('link', { name: 'Resources', exact: true }).click()
  await expect(mobile).not.toBeVisible()
})

test('legacy Insights links redirect with the language and search intact', async ({ request }) => {
  for (const [source, target] of [
    ['/insights?q=publishing&page=2', '/resources?q=publishing&page=2'],
    ['/hi/insights/sample-article?q=guide', '/hi/resources/sample-article?q=guide'],
    ['/posts/sample-article', '/resources/sample-article'],
    ['/blogs', '/resources'],
  ]) {
    const response = await request.get(source, { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(
      new URL(response.headers().location, response.url()).pathname +
        new URL(response.headers().location, response.url()).search,
    ).toBe(target)
  }
})
