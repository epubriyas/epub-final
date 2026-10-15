import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('homepage process animates once and fits desktop and mobile layouts', async ({ page }) => {
  await page.goto('/')
  const process = page.locator('.hp-process')
  await process.scrollIntoViewIfNeeded()
  await expect(process).toHaveAttribute('data-home-state', 'run')
  await expect(process.locator('.hp-process-card')).toHaveCount(4)
  const particle = await process.locator('.hp-route-particle').evaluate((el) => ({
    path: getComputedStyle(el).offsetPath,
    animation: getComputedStyle(el).animationName,
  }))
  expect(particle.path).not.toBe('none')
  expect(particle.animation).toBe('hp-travel')
  await expect
    .poll(() =>
      process.locator('.hp-route-progress').evaluate((el) => getComputedStyle(el).strokeDashoffset),
    )
    .toBe('0px')
  for (const width of [320, 375, 480, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `width ${width}`,
    ).toBe(true)
    for (const card of await process.locator('.hp-process-card').all())
      await expect(card).toBeVisible()
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  await process.scrollIntoViewIfNeeded()
  const firstCard = process.locator('.hp-process-card').first()
  await firstCard.hover({ position: { x: 40, y: 40 } })
  await expect(firstCard).toHaveAttribute('data-lit', 'true')
  expect(await firstCard.evaluate((el) => el.style.transform)).toContain('perspective')
  await page.mouse.move(0, 0)
  await expect(firstCard).not.toHaveAttribute('data-lit', 'true')
  await expect(process.locator('.hp-checkpoint')).toHaveCount(4)
  const alignment = await process.locator('.hp-process-board').evaluate((board) => {
    const cards = Array.from(board.querySelectorAll<HTMLElement>('.hp-process-card'))
    return Array.from(board.querySelectorAll<HTMLElement>('.hp-checkpoint')).every(
      (node, index) => Math.abs(parseFloat(node.style.top) - (cards[index].offsetTop - 30)) < 1,
    )
  })
  expect(alignment).toBe(true)
  await process.screenshot({
    path: 'artifacts/services/home-process-desktop.png',
    animations: 'disabled',
    caret: 'initial',
    style: 'header, .et-assistant, nextjs-portal {visibility:hidden!important}',
  })
  await page.setViewportSize({ width: 375, height: 900 })
  await process.screenshot({
    path: 'artifacts/services/home-process-mobile.png',
    animations: 'disabled',
    caret: 'initial',
    style: 'header, .et-assistant, nextjs-portal {visibility:hidden!important}',
  })
})

test('homepage process is accessible in both themes with reduced motion', async ({
  page,
  browser,
}) => {
  test.setTimeout(60000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.hp-process')).toHaveAttribute('data-home-state', 'static')
  expect(
    await page.locator('.hp-route-progress').evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none')
  for (const theme of ['light', 'dark']) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value
    }, theme)
    const audit = await new AxeBuilder({ page })
      .include('.et-technology-home')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(
      audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([])
  }
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: page.url() })
  const staticPage = await context.newPage()
  await staticPage.goto('/')
  await expect(staticPage.locator('.hp-process-card')).toHaveCount(4)
  await expect(staticPage.locator('.hp-process-card').last()).toContainText('Deliver')
  await context.close()
})
