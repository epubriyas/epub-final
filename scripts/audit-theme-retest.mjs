import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Targeted retest of the final release findings against the local production build.
const browser = await chromium.launch({ channel: 'msedge' })
const rows = []
const output = 'artifacts/master-audit/release/theme-retest.json'
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  for (const route of ['/industries', '/blog/cristano-ronaldo', '/work']) {
    await page.goto('http://127.0.0.1:3000' + route, { waitUntil: 'networkidle' })
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      for (const theme of ['light', 'dark']) {
        await page.evaluate((theme) => { document.documentElement.dataset.theme = theme }, theme)
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
        rows.push({ route, width, theme, violations: result.violations })
        await fs.writeFile(output, JSON.stringify(rows, null, 2))
      }
    }
    console.log('Retested', route)
  }
  await page.getByRole('button', { name: /View Sample/ }).first().click()
  await page.getByRole('region', { name: 'Sample preview' }).waitFor({ timeout: 30000 })
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  rows.push({ route: '/work (open viewer)', width: 1440, theme: 'dark', violations: result.violations })
  await fs.writeFile(output, JSON.stringify(rows, null, 2))
  console.log('Scans', rows.length, 'with violations', rows.filter(row => row.violations.length).length)
} finally {
  await browser.close()
}
