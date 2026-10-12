import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'
const browser = await chromium.launch({ channel: 'msedge' })
try {
  await mkdir('artifacts/services-upgrade', { recursive: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const slug of ['subtitling', 'accessibility']) {
    const response = await page.goto(`http://localhost:3000/services/${slug}`, {
      waitUntil: 'networkidle',
    })
    if (response.status() !== 200) throw new Error(`${slug} HTTP ${response.status()}`)
    if ((await page.locator('main h1').count()) !== 1) throw new Error('Heading count')
    const image = page.locator('.sp-hero .sp-image img')
    if (!(await image.evaluate((img) => img.complete && img.naturalWidth > 0)))
      throw new Error('Missing hero image')
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 900 })
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
        throw new Error(`${slug} overflow at ${width}`)
    }
    await page.screenshot({
      path: `artifacts/services-upgrade/${slug}-mobile.png`,
      fullPage: true,
      animations: 'disabled',
    })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.screenshot({
      path: `artifacts/services-upgrade/${slug}-desktop.png`,
      fullPage: true,
      animations: 'disabled',
    })
    if (slug === 'subtitling') {
      await page.getByRole('button', { name: 'Play subtitle sequence', exact: true }).click()
      await page
        .getByText('Language gives it a way to travel.', { exact: true })
        .first()
        .waitFor({ timeout: 5000 })
      await page.waitForFunction(() =>
        [...document.querySelectorAll('figure p')].some(
          (p) => p.textContent === 'Language gives it a way to travel.',
        ),
      )
      await page.getByRole('button', { name: 'Pause subtitle sequence', exact: true }).click()
      await page.getByRole('button', { name: 'Reset subtitle sequence', exact: true }).click()
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.waitForFunction(
        () => document.querySelector('button[aria-label="Play subtitle sequence"]').disabled,
      )
      await page.getByRole('button', { name: /00:03 → 00:06/ }).click()
      await page.emulateMedia({ reducedMotion: 'no-preference' })
    } else {
      await page.getByRole('button', { name: 'Reading order', exact: true }).click()
      await page.getByRole('heading', { name: 'Reading order matters.', exact: true }).waitFor()
      await page.getByRole('button', { name: 'Text alternative', exact: true }).click()
      await page.getByRole('heading', { name: 'A useful text alternative.', exact: true }).waitFor()
    }
    const axe = await new AxeBuilder({ page })
      .include('.sp-explanation')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    if (axe.violations.length)
      throw new Error(
        JSON.stringify(
          axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        ),
      )
    await page
      .locator('.sp-explanation')
      .screenshot({
        path: `artifacts/services-upgrade/${slug}-infographic.png`,
        animations: 'disabled',
      })
  }
  if (errors.length) throw new Error(errors.join('\n'))
  console.log(
    'PASS: published pages, hero images, desktop/tablet/mobile, subtitle play/pause/reset, reading views, reduced motion and infographic accessibility checks.',
  )
} finally {
  await browser.close()
}
