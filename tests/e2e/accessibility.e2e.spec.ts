import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
test('key surfaces have no automated WCAG 2.2 AA accessibility violations', async ({ page }) => {
  test.setTimeout(120000)
  // Audit settled content; motion behavior is covered by the animation suites.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/', '/services', '/get-a-quote']) {
      await page.goto(route)
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      expect(
        result.violations.map((item) => ({
          id: item.id,
          description: item.description,
          nodes: item.nodes.map((node) => node.target),
        })),
        `${route} at ${width}`,
      ).toEqual([])
    }
  }
})
