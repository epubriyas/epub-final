import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const base = process.env.SOLUTIONS_TEST_URL || 'http://localhost:3000'
const browser = await chromium.launch({ channel: 'msedge' })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
page.setDefaultTimeout(15000)
const errors: string[] = []
page.on('pageerror', (error) => errors.push(error.message))
const output = 'artifacts/solutions-navigation'
await mkdir(output, { recursive: true })
try {
  await page.goto(base, { waitUntil: 'load', timeout: 60000 })
  const trigger = page.getByRole('button', { name: 'Solutions', exact: true })
  const panel = page.locator('[aria-label="Solutions navigation"]')
  await trigger.hover()
  await expect(panel).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  assert.equal(await panel.locator('h3').count(), 4)
  assert.equal(await panel.locator('li a').count(), 18)
  const triggerBox = (await trigger.boundingBox())!
  const panelBox = (await panel.boundingBox())!
  await page.mouse.move(triggerBox.x + 20, panelBox.y + 40, { steps: 12 })
  await expect(panel).toBeVisible()
  await page.screenshot({ path: `${output}/desktop.png` })
  const desktopAxe = await new AxeBuilder({ page }).include('[aria-label="Solutions navigation"]').analyze()
  assert.deepEqual(desktopAxe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })), [])
  const hrefs = await panel.locator('a').evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href')!))])
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(trigger).toBeFocused()
  await page.mouse.move(1000, 900)
  await trigger.press('Enter')
  await expect(panel).toBeVisible()
  await trigger.press('ArrowDown')
  await expect(panel.locator('a').first()).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(panel.getByRole('button', { name: 'Close menu' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(panel.locator('li a').first()).toBeFocused()
  await page.mouse.click(1000, 900)
  await expect(panel).toBeHidden()
  await trigger.click()
  await expect(panel).toBeVisible()
  await panel.getByRole('link', { name: 'Explore our solutions' }).click()
  await expect(page).toHaveURL(`${base}/solutions`)
  await expect(panel).toBeHidden()
  const destinations: { href: string; status: number }[] = []
  for (const href of hrefs) {
    const response = await page.goto(base + href, { waitUntil: 'domcontentloaded', timeout: 60000 })
    assert.equal(response?.status(), 200, href)
    const hash = new URL(base + href).hash.slice(1)
    if (hash) assert.equal(await page.locator(`[id="${hash}"]`).count(), 1, href)
    assert.equal(await page.locator('main h1').count(), 1, href)
    destinations.push({ href, status: response!.status() })
  }
  for (const width of [320, 375, 768]) {
    await page.setViewportSize({ width, height: width === 768 ? 375 : 900 })
    await page.goto(base, { waitUntil: 'load', timeout: 60000 })
    const opener = page.getByRole('button', { name: 'Open navigation' })
    await opener.click()
    const drawer = page.getByRole('dialog', { name: 'Site navigation' })
    const mobileTrigger = drawer.getByRole('button', { name: 'Solutions', exact: true })
    await mobileTrigger.click()
    await expect(mobileTrigger).toHaveAttribute('aria-expanded', 'true')
    const mobile = drawer.locator('#' + (await mobileTrigger.getAttribute('aria-controls')))
    assert.equal(await mobile.locator('details').count(), 4)
    for (const summary of await mobile.locator('summary').all()) await summary.click()
    assert.equal(await mobile.locator('li a:visible').count(), 18)
    assert.equal(await drawer.evaluate((node) => node.scrollWidth <= node.clientWidth), true, `drawer overflow ${width}`)
    for (const link of await mobile.locator('li a').all()) assert.ok((await link.boundingBox())!.height >= 44)
    await mobile.getByRole('link', { name: 'Find the Right Solution' }).scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${output}/mobile-${width}.png` })
    if (width === 375) {
      const mobileAxe = await new AxeBuilder({ page }).include('.et-mobile-dialog').analyze()
      assert.deepEqual(mobileAxe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })), [])
    }
    await page.keyboard.press('Escape')
    await expect(drawer).not.toBeVisible()
    await expect(opener).toBeFocused()
    await opener.click()
    await mobile.getByRole('link', { name: 'Find the Right Solution' }).click()
    await expect(page).toHaveURL(`${base}/get-a-quote`)
    await expect(drawer).not.toBeVisible()
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(base, { waitUntil: 'load', timeout: 60000 })
  await trigger.hover()
  await expect(panel).toBeVisible()
  assert.equal(await panel.evaluate((node) => getComputedStyle(node).transitionDuration), '0s')
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  assert.deepEqual(errors, [])
  await writeFile(`${output}/verification.json`, JSON.stringify({ base, passed: true, checks: ['hover bridge', 'click', 'keyboard and focus', 'Escape', 'outside click', 'link close', '18 entries across four groups', 'all destinations and anchors', 'mobile 320/375/768 with touch targets', 'desktop and mobile axe', 'reduced motion', 'no browser errors'], destinations }, null, 2))
  console.log('Solutions navigation verification passed.')
} finally {
  await browser.close()
}
