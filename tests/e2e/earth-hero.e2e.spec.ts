import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Exercise the actual shader on headless machines without requiring a physical GPU.
test.use({ launchOptions: { args: ['--enable-unsafe-swiftshader'] } })

test('Earth rotates, pauses, supports exploration and respects visibility and reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 950 })
  await page.goto('/')
  const figure = page.locator('figure[aria-labelledby="publishing-visual-caption"]')
  const canvas = figure.locator('canvas')
  await expect(figure).toHaveAttribute('data-earth-ready', 'true')
  await expect(canvas).toHaveAttribute('data-earth-state', 'rotating')
  const initial = await canvas.getAttribute('data-rotation')
  await expect.poll(() => canvas.getAttribute('data-rotation')).not.toBe(initial)
  await figure.getByRole('button', { name: 'Pause globe animation' }).click()
  await expect(canvas).toHaveAttribute('data-earth-state', 'paused')
  const paused = await canvas.getAttribute('data-rotation')
  await page.waitForTimeout(200)
  expect(await canvas.getAttribute('data-rotation')).toBe(paused)
  await canvas.focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => canvas.getAttribute('data-rotation')).not.toBe(paused)
  await figure.getByRole('button', { name: 'Resume globe animation' }).click()
  await page.locator('footer').scrollIntoViewIfNeeded()
  await expect(canvas).toHaveAttribute('data-earth-state', 'offscreen')
  await figure.scrollIntoViewIfNeeded()
  await expect(canvas).toHaveAttribute('data-earth-state', 'rotating')
  await page.setViewportSize({ width: 390, height: 900 })
  await figure.scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    (
      await new AxeBuilder({ page })
        .include('figure[aria-labelledby="publishing-visual-caption"]')
        .analyze()
    ).violations,
  ).toEqual([])
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(canvas).toHaveAttribute('data-earth-state', 'static')
  const still = await canvas.getAttribute('data-rotation')
  await page.waitForTimeout(200)
  expect(await canvas.getAttribute('data-rotation')).toBe(still)
})

test('texture failure and disabled JavaScript retain a matching Earth poster', async ({
  page,
  browser,
}) => {
  await page.route('**/images/earth-daymap.jpg', (route) => route.abort())
  await page.goto('/', { waitUntil: 'networkidle' })
  const figure = page.locator('figure[aria-labelledby="publishing-visual-caption"]')
  await expect(figure).toHaveAttribute('data-earth-ready', 'false')
  await expect(figure.locator('img')).toBeVisible()
  await expect(figure.locator('img')).toHaveAttribute('src', '/images/earth-hero-poster.webp')
  expect(
    await figure.locator('img').evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0)
  await page.reload({ waitUntil: 'networkidle' })
  await expect(figure.locator('img')).toHaveAttribute('src', '/images/earth-hero-poster.webp')
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const staticPage = await context.newPage()
    await staticPage.goto(new URL('/', page.url()).href)
    await expect(
      staticPage.locator('figure img[src="/images/earth-hero-poster.webp"]'),
    ).toBeVisible()
  } finally {
    await context.close()
  }
})

test('service focus highlights its network route and preserves navigation', async ({ page }) => {
  test.setTimeout(60000)
  await page.goto('/')
  const figure = page.locator('figure[aria-labelledby="publishing-visual-caption"]')
  await expect(figure).toHaveAttribute('data-earth-ready', 'true')
  const cards = figure.getByRole('navigation').getByRole('link')
  const destinations = [
    '/typesetting-services',
    '/ebook-creation-services',
    '/translation-services',
    '/accessibility-services',
  ]
  for (let index = 0; index < 4; index++) {
    await cards.nth(index).focus()
    await expect(figure).toHaveAttribute('data-active-service', String(index))
    await expect(figure.locator(`[data-service-path="${index}"]`)).toHaveAttribute(
      'data-active',
      'true',
    )
    await expect(cards.nth(index)).toHaveAttribute('href', destinations[index])
  }
  await page.setViewportSize({ width: 320, height: 800 })
  await figure.scrollIntoViewIfNeeded()
  for (let index = 0; index < 4; index++) await expect(cards.nth(index)).toBeVisible()
  const boxes = await cards.evaluateAll((nodes) =>
    nodes.map((node) => {
      const r = node.getBoundingClientRect()
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom }
    }),
  )
  expect(boxes.every((box) => box.x >= 0 && box.right <= 320)).toBe(true)
  expect(boxes[0].bottom).toBeLessThanOrEqual(boxes[2].y)
  const frame = await figure.boundingBox()
  expect(boxes.every((box) => box.bottom <= frame!.y + frame!.height)).toBe(true)
  const caption = await figure.locator('figcaption').boundingBox()
  expect(caption!.y + caption!.height).toBeLessThanOrEqual(frame!.y + frame!.height)
  await page.setViewportSize({ width: 1440, height: 950 })
  await cards.nth(3).click()
  await expect(page).toHaveURL(/\/accessibility-services$/, { timeout: 15000 })
})
