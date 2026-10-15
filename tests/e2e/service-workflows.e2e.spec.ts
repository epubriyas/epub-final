import { expect, test } from '@playwright/test'

const serviceRoutes = [
  '/translation-services',
  '/desktop-publishing-services',
  '/copyediting-services',
  '/typesetting-services',
  '/cover-page-design-services',
  '/scielo-xml-markup-services',
  '/proofreading-services',
  '/ebook-creation-services',
  '/graphic-design-image-services',
  '/data-conversion-services',
  '/subtitling-services',
  '/voiceover-services',
  '/transcription-services',
  '/elearning-localization-services',
  '/accessibility-services',
]

test('all published service pages present a four-step workflow', async ({ page }) => {
  test.setTimeout(120000)
  for (const route of serviceRoutes) {
    const response = await page.goto(route)
    expect(response?.status(), route).toBe(200)
    await expect(page.locator('.sp-timeline > li'), route).toHaveCount(4)
  }
})

test('workflow line animation is polished and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/typesetting-services')
  await page.locator('#process').scrollIntoViewIfNeeded()
  await expect.poll(() => page.locator('#process').getAttribute('data-motion-state')).toBe('run')
  await expect(page.locator('.sp-timeline > li')).toHaveCount(4)
  expect(
    await page
      .locator('.sp-timeline > li')
      .first()
      .evaluate((element) => getComputedStyle(element, '::after').animationName),
  ).toBe('sp-workflow-line')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/typesetting-services')
  await expect(page.locator('#process')).toHaveAttribute('data-motion-state', 'static')
  expect(
    await page
      .locator('.sp-timeline > li')
      .first()
      .evaluate((element) => getComputedStyle(element, '::after').animationName),
  ).toBe('none')
})
