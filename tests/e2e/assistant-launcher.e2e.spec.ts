import { test, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

test('branded invitation contracts once after five seconds and resets on refresh', async ({
  page,
}) => {
  test.setTimeout(120000)
  const start = new Date('2026-10-29T12:00:00Z')
  await page.clock.install({ time: start })
  await page.clock.pauseAt(start)
  await mkdir('artifacts/assistant-launcher', { recursive: true })
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: width === 320 ? 'reduce' : 'no-preference' })
    await page.goto('/', { timeout: 60000 })
    await expect(page.locator('select[aria-label="Color theme"]').first()).toBeEnabled()
    const launcher = page.getByRole('button', { name: 'Open EPUBTRANS assistant' })
    await expect(launcher).toHaveAttribute('data-compact', 'false')
    await expect(launcher).toHaveCSS('width', '224px')
    await page.screenshot({ path: `artifacts/assistant-launcher/expanded-${width}.png` })
    await page.clock.runFor(4999)
    await expect(launcher).toHaveAttribute('data-compact', 'false')
    await page.clock.runFor(1)
    await expect(launcher).toHaveAttribute('data-compact', 'true')
    await page.clock.runFor(1000)
    await expect(launcher).toHaveCSS('width', '72px')
    await page.screenshot({ path: `artifacts/assistant-launcher/compact-${width}.png` })
    await launcher.click()
    const dialog = page.getByRole('dialog', { name: 'How can we help?' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Close assistant', exact: true }).click()
    await expect(launcher).toBeFocused()
    await expect(launcher).toHaveAttribute('data-compact', 'true')
    await page.reload()
    await expect(launcher).toHaveAttribute('data-compact', 'false')
  }
})

test('form help remains a readable dock after five seconds', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/contact')
  const launcher = page.locator('#project-assistant-dock button')
  await expect(launcher).toBeVisible()
  await page.waitForTimeout(5500)
  await expect(launcher).toHaveAttribute('data-compact', 'false')
  await expect(launcher.getByText('Ask our AI assistant')).toBeVisible()
})
