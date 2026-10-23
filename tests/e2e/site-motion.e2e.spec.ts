import { test, expect } from '@playwright/test'

test('fluid wheel input settles precisely and native anchors and route changes still work', async ({
  page,
}) => {
  test.setTimeout(60000)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-scroll-motion', 'fluid')
  await page.mouse.move(1100, 650)
  await page.mouse.wheel(0, 600)
  const positions = await page.evaluate(async () => {
    const samples: number[] = []
    for (let i = 0; i < 18; i++) {
      await new Promise(requestAnimationFrame)
      samples.push(scrollY)
    }
    return samples
  })
  expect(new Set(positions.map(Math.round)).size).toBeGreaterThan(3)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(590)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(610)
  await page.goto('/typesetting-services')
  await expect(page.locator('html')).toHaveAttribute('data-scroll-motion', 'fluid')
  await page.getByRole('link', { name: 'Explore Publishing Services', exact: true }).click()
  await expect(page).toHaveURL(/\/services#publishing-editorial$/)
  await expect(page.locator('#publishing-editorial')).toBeInViewport()
  expect(
    await page.locator('#publishing-editorial').evaluate((el) => el.getBoundingClientRect().top),
  ).toBeGreaterThanOrEqual(80)
  await page.locator('header .et-header-actions').getByRole('link', { name: 'Get a Quote' }).click()
  await expect(page).toHaveURL(/get-a-quote/)
  await expect(page.locator('html')).toHaveAttribute('data-scroll-motion', 'fluid')
  await expect(
    page.getByRole('radio', { name: 'Publishing & Editorial Services', exact: true }),
  ).toBeVisible()
})

test('reduced motion can be switched live and content remains available without JavaScript', async ({
  page,
  browser,
}) => {
  await page.goto('/resources')
  await expect(page.locator('html')).toHaveAttribute('data-scroll-motion', 'fluid')
  await expect(page.locator('[data-site-reveal]').first()).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('html')).not.toHaveAttribute('data-scroll-motion', 'fluid')
  expect(await page.locator('html').evaluate((el) => el.classList.contains('lenis'))).toBe(false)
  expect(
    await page
      .locator('[data-site-reveal]')
      .evaluateAll((elements) =>
        elements.some((el) =>
          el.getAnimations().some((animation) => animation.playState === 'running'),
        ),
      ),
  ).toBe(false)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('html')).toHaveAttribute('data-scroll-motion', 'fluid')
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: page.url() })
  const staticPage = await context.newPage()
  await staticPage.goto('/services')
  await expect(staticPage.locator('main h1')).toBeVisible()
  await expect(staticPage.locator('.sp-catalog-link')).toHaveCount(17)
  await context.close()
})

test('modal readers keep native scrolling and pause the background until closed', async ({
  page,
}) => {
  test.setTimeout(60000)
  await page.goto('/work')
  const row = page
    .locator('.wp-work-row')
    .filter({ hasText: 'Physics textbook layout: work, energy and power' })
  await row.getByRole('button', { name: /View Sample/ }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('.wp-page-image')).toBeVisible({ timeout: 20000 })
  await expect(page.locator('html')).toHaveClass(/lenis-stopped/)
  const background = await page.evaluate(() => scrollY)
  await dialog.getByRole('button', { name: 'Zoom in', exact: true }).click()
  const reader = dialog.locator('.wp-preview-area')
  await reader.hover()
  await page.mouse.wheel(0, 500)
  await expect.poll(() => reader.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
  expect(await page.evaluate(() => scrollY)).toBe(background)
  await dialog.getByRole('button', { name: 'Close sample viewer' }).click()
  await expect(page.locator('html')).not.toHaveClass(/lenis-stopped/)
})

test('photographic reveals stay readable and stop immediately for reduced motion', async ({
  page,
}) => {
  await page.goto('/industries')
  const images = page.locator('[data-site-image-reveal]')
  await expect(images).toHaveCount(7)
  const card = page.locator('main article').nth(3)
  await card.scrollIntoViewIfNeeded()
  await expect(card).toBeVisible()
  await expect(card.getByRole('heading', { level: 3 })).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('html')).not.toHaveAttribute('data-scroll-motion', 'fluid')
  expect(
    await images.evaluateAll((elements) =>
      elements.some((element) =>
        element.getAnimations().some((animation) => animation.playState === 'running'),
      ),
    ),
  ).toBe(false)
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})
