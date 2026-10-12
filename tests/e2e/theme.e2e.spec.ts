import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'

test('dark language panel and quote validation stay readable without losing form data', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/get-a-quote')
  await page.getByRole('button', { name: 'Use dark theme', exact: true }).click()
  await page.getByRole('button', { name: 'Choose website language' }).click()
  const languageResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(
    languageResults.violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.map((node) => node.target),
    })),
  ).toEqual([])
  await page.getByRole('button', { name: 'Close language selection' }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByText('Choose the service you need.')).toBeVisible()
  const errorResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(
    errorResults.violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.map((node) => node.target),
    })),
  ).toEqual([])
  await page.getByLabel('Publishing & content', { exact: true }).check()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  const details = 'Publishing project details kept while switching color themes.'
  await page.getByLabel('Project requirements').fill(details)
  await page.getByRole('button', { name: 'Use light theme', exact: true }).click()
  await expect(page.getByLabel('Project requirements')).toHaveValue(details)
  await page.getByRole('button', { name: 'Use dark theme', exact: true }).click()
  await expect(page.getByLabel('Project requirements')).toHaveValue(details)
  expect(
    await page
      .getByLabel('Project requirements')
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe('rgb(22, 40, 35)')
})

test('light is the default and a selected theme survives reload and navigation', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  const group = page.getByRole('group', { name: 'Color theme' })
  await expect(group.getByRole('button', { name: 'Use light theme' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  const quote = await page.locator('.et-header-actions a').boundingBox()
  const toggle = await group.boundingBox()
  expect(toggle!.x).toBeGreaterThanOrEqual(quote!.x + quote!.width)
  await group.getByRole('button', { name: 'Use dark theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  expect((await context.cookies()).find((cookie) => cookie.name === 'epubtrans-theme')?.value).toBe(
    'dark',
  )
  const response = await page.reload()
  expect(await response!.text()).toContain('data-theme="dark"')
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0e1b19')
  await expect(group.getByRole('button', { name: 'Use dark theme' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await mkdir('artifacts/theme', { recursive: true })
  await page.screenshot({ path: 'artifacts/theme/home-dark-desktop.png' })
  await page.getByRole('link', { name: 'Get a Quote', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0e1b19')
  await group.getByRole('button', { name: 'Use light theme' }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.screenshot({ path: 'artifacts/theme/quote-light.png' })
})

test('theme toggle works with blocked local storage and synchronizes across tabs', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const second = await context.newPage()
  await second.goto('/company')
  await page.getByRole('button', { name: 'Use dark theme', exact: true }).click()
  await expect(second.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Storage unavailable')
    }
  })
  await page.getByRole('button', { name: 'Use light theme', exact: true }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await second.close()
})

test('saved dark theme renders correctly before JavaScript executes', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  // Use the configured host so this check works on the ordinary test server too.
  const page = await context.newPage()
  const baseURL = test.info().project.use.baseURL!
  await context.addCookies([{ name: 'epubtrans-theme', value: 'dark', url: baseURL }])
  await page.goto(baseURL + '/company')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  expect(
    await page.locator('body').evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe('rgb(14, 27, 25)')
  await context.close()
})

test('dark pages and header fit phones, tablets and desktop', async ({ page }) => {
  test.setTimeout(240000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Use dark theme', exact: true }).click()
  const routes = new Set([
    '/',
    '/services',
    '/solutions',
    '/industries',
    '/technology',
    '/resources',
    '/company',
    '/company/careers',
    '/work',
    '/get-a-quote',
    '/search',
    '/terms',
    '/privacy-policy',
    '/accessibility',
  ])
  const widths = [320, 390, 768, 1200, 1440]
  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('main h1')).toHaveCount(1)
    const links = await page
      .locator('main a[href]')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))
    for (const link of links)
      if (link?.startsWith('/') && !link.startsWith('//') && !/^\/(api|admin|media)\//.test(link))
        routes.add(link.split(/[?#]/)[0])
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 })
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
      const metrics = await page.locator('.et-header-inner').evaluate((element) => ({
        page: document.documentElement.scrollWidth,
        width: innerWidth,
        controls: [...element.querySelectorAll('a,button')]
          .filter((el) => el.getClientRects().length)
          .map((el) => ({
            left: el.getBoundingClientRect().left,
            right: el.getBoundingClientRect().right,
          })),
      }))
      expect(metrics.page, `${route} at ${width}`).toBeLessThanOrEqual(width)
      expect(
        metrics.controls.every((box) => box.left >= 0 && box.right <= width),
        `${route} header at ${width}`,
      ).toBe(true)
    }
  }
  console.log(`Dark theme verified on ${routes.size} routes at ${widths.length} widths.`)
})

test('dark content, menus, forms and assistant meet automated accessibility checks', async ({
  page,
}) => {
  test.setTimeout(240000)
  await page.goto('/')
  await page.getByRole('button', { name: 'Use dark theme', exact: true }).click()
  await mkdir('artifacts/theme', { recursive: true })
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of [
      '/',
      '/services',
      '/copyediting-services',
      '/resources',
      '/company',
      '/company/careers',
      '/get-a-quote',
      '/search',
    ]) {
      await page.goto(route)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      expect
        .soft(
          results.violations.map((item) => ({
            id: item.id,
            nodes: item.nodes.map((node) => node.target),
          })),
          `${route} dark at ${width}`,
        )
        .toEqual([])
      if (route === '/' || route === '/get-a-quote')
        await page.screenshot({
          path: `artifacts/theme/${route === '/' ? 'home' : 'quote'}-dark-${width}.png`,
        })
    }
    await page.goto('/')
    if (width === 390) {
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
      await page.getByRole('button', { name: 'Company', exact: true }).click()
    } else await page.getByRole('button', { name: 'What We Do', exact: true }).click()
    const menuResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(
      menuResults.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => node.target),
      })),
    ).toEqual([])
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Open EPUBTRANS assistant' }).click()
    const assistantResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(
      assistantResults.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => node.target),
      })),
    ).toEqual([])
    await page
      .getByRole('dialog', { name: 'How can we help?' })
      .screenshot({ path: `artifacts/theme/assistant-dark-${width}.png` })
    await page.getByRole('button', { name: 'Close assistant' }).click()
  }
})
