import { test, expect } from '@playwright/test'

test.use({ timezoneId: 'Asia/Kolkata' })

test('themes stay manual across former schedule boundaries and reloads', async ({
  page,
  context,
}) => {
  test.setTimeout(90000)
  await page.clock.install({ time: new Date('2026-10-09T17:58:00+05:30') })
  await page.clock.pauseAt(new Date('2026-10-09T17:59:00+05:30'))
  await page.goto('/technology')
  await page.clock.runFor(1000)
  await expect(page.getByRole('button', { name: 'Use light theme', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.clock.runFor(59000)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByRole('button', { name: 'Use automatic theme' })).toHaveCount(0)
  await page.clock.runFor(60000)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await page.clock.runFor(1000)
  await expect(page.getByRole('button', { name: 'Use light theme', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('button', { name: 'Use dark theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.clock.setSystemTime(new Date('2026-10-10T07:00:00+05:30'))
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.clock.runFor(60000)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  const second = await context.newPage()
  await second.goto('/technology')
  await expect(second.locator('html')).toHaveAttribute('data-theme-preference', 'dark')
  await second.getByRole('button', { name: 'Use light theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('mobile offers light and dark without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.goto('/technology')
  const choice = page.getByRole('combobox', { name: 'Color theme', exact: true })
  await expect(choice.locator('option')).toHaveCount(2)
  for (const preference of ['dark', 'light']) {
    await choice.selectOption(preference)
    await expect(page.locator('html')).toHaveAttribute('data-theme-preference', preference)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
