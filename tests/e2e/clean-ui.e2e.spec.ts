import { test, expect } from '@playwright/test'
import copy from '../../src/config/landing-content.json'

test('readable content, compact controls and preserved workflow and service navigation', async ({
  page,
}) => {
  test.setTimeout(120000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const primary = page
      .locator('.et-hero')
      .getByRole('link', { name: copy.home.primaryCTA.label, exact: true })
    if (width <= 390) await expect(primary).toBeInViewport()
    if (width === 1440)
      expect(
        await page.locator('.et-hero').evaluate((el) => el.getBoundingClientRect().height),
      ).toBeLessThan(1000)
    for (const step of copy.home.workflow.steps)
      await expect(page.getByText(step.description, { exact: true })).toHaveCount(1)
    const cards = await page.locator('.hp-process-card').evaluateAll((items) =>
      items.map((el) => ({
        clipped: el.scrollHeight > el.clientHeight + 1,
        font: parseFloat(getComputedStyle(el.querySelector('ul')!).fontSize),
        rect: el.getBoundingClientRect().toJSON(),
      })),
    )
    expect(cards).toHaveLength(4)
    for (let i = 0; i < cards.length; i++) {
      expect(cards[i].clipped).toBe(false)
      expect(cards[i].font).toBeGreaterThanOrEqual(16)
      for (let j = i + 1; j < cards.length; j++)
        expect(
          cards[i].rect.left < cards[j].rect.right - 1 &&
            cards[i].rect.right > cards[j].rect.left + 1 &&
            cards[i].rect.top < cards[j].rect.bottom - 1 &&
            cards[i].rect.bottom > cards[j].rect.top + 1,
        ).toBe(false)
    }
    await expect(page.locator('footer .et-footer-cta')).toHaveCount(0)
    await expect(
      page.locator('footer').getByRole('link', { name: 'Discuss your project', exact: true }),
    ).toHaveAttribute('href', '/get-a-quote')
    await page.goto('/services')
    expect(
      await page
        .locator('.sp-directory-search')
        .evaluate((el) => el.getBoundingClientRect().height),
    ).toBeLessThan(180)
    const sizes = await page
      .locator('.sp-catalog-link p')
      .evaluateAll((items) => items.map((el) => parseFloat(getComputedStyle(el).fontSize)))
    expect(sizes.every((size) => size >= 16)).toBe(true)
  }
  const anchors = copy.directory.categories.map((category) => category.anchorId)
  for (const route of ['/industries', '/resources']) {
    await page.goto(route)
    const hrefs = await page
      .locator('main a[href^="/services#"], footer a[href^="/services#"]')
      .evaluateAll((items) => items.map((el) => el.getAttribute('href')!))
    for (const href of hrefs) expect(anchors).toContain(href.split('#')[1])
  }
})
