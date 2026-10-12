import { test, expect } from '@playwright/test'

test('XML visual runs on entry, finishes and can be replayed with the keyboard', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/scielo-xml-markup-services')
  const diagram = page.locator('.sv-xml-animation')
  await diagram.scrollIntoViewIfNeeded()
  await expect(diagram.locator('.sv-xml')).toHaveAttribute('data-playing', 'true')
  const replay = diagram.getByRole('button', { name: 'Replay transformation' })
  await expect(replay).toBeDisabled()
  await expect(diagram.locator('.sv-xml')).toHaveAttribute('data-playing', 'false', {
    timeout: 7000,
  })
  expect(await diagram.locator('code').textContent()).toContain('<title>A clear structure.</title>')
  await replay.focus()
  await replay.press('Enter')
  await expect(diagram.locator('.sv-xml')).toHaveAttribute('data-playing', 'true')
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(diagram.getByText('SOURCE ARTICLE', { exact: true })).toBeVisible()
  }
  await expect(diagram.locator('.sv-xml')).toHaveAttribute('data-playing', 'false', {
    timeout: 7000,
  })
  await page.screenshot({ path: 'artifacts/services/xml-animation-desktop.png', caret: 'initial' })
  expect(errors).toEqual([])
})

test('XML content is static with reduced motion and readable without JavaScript', async ({
  page,
  browser,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/scielo-xml-markup-services')
  const diagram = page.locator('.sv-xml-animation')
  await diagram.scrollIntoViewIfNeeded()
  await expect(diagram.locator('.sv-xml')).toHaveAttribute('data-playing', 'false')
  await expect(diagram.getByRole('button', { name: 'Replay transformation' })).toHaveCount(0)
  expect(
    await diagram
      .locator('.sv-xml-line')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none')
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: page.url() })
  const staticPage = await context.newPage()
  await staticPage.goto('/scielo-xml-markup-services')
  await expect(staticPage.locator('.sv-xml-animation code')).toContainText('Publication content.')
  await context.close()
})
