import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'
import landingContent from '../../src/config/landing-content.json'
const widths = [320, 360, 375, 390, 414, 480, 768, 820, 1024, 1280, 1440, 1600, 1920]
test('published catalog, service visuals, metadata and responsive layouts', async ({ page }) => {
  test.setTimeout(240000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/services')
  const links = page.locator('main .sp-catalog-link')
  // XML enquiries, pending scope and PDF recreation intentionally share destinations.
  await expect(links).toHaveCount(17)
  const hrefs = [
    ...new Set(
      landingContent.directory.categories.flatMap((group) =>
        group.services.map((card) => card.href),
      ),
    ),
  ].filter((href) => href !== '/get-a-quote')
  await mkdir('artifacts/services', { recursive: true })
  for (const route of ['/services', ...hrefs]) {
    const response = await page.goto(route)
    expect(response?.status()).toBe(200)
    await expect(page.locator('main h1')).toHaveCount(1)
    await expect(page.locator('main h1')).toBeVisible()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${route}$`),
    )
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/)
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', /.+/)
    if (route != '/services') {
      await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible()
      await expect(page.locator('main h1')).toHaveText(
        (await page.locator('nav[aria-label="Breadcrumb"] [aria-current="page"]').textContent())!,
      )
      await expect(page.locator('main .sp-button').first()).toHaveAttribute(
        'href',
        /\/get-a-quote(?:\?service=|$)/,
      )
      await expect(page.locator('.sp-timeline > li')).toHaveCount(4)
      const related = await page
        .locator('.sp-related-grid > a')
        .evaluateAll((items) => items.map((item) => item.getAttribute('href')))
      expect(new Set(related).size).toBe(related.length)
      for (const href of related) {
        expect(hrefs).toContain(href)
        expect(href).not.toBe(route)
      }
    }
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 })
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${route} at ${width}`,
      ).toBe(true)
      if (
        [320, 1440].includes(width) &&
        [
          '/services',
          '/typesetting-services',
          '/scielo-xml-markup-services',
          '/copyediting-services',
          '/translation-services',
          '/ebook-creation-services',
          '/transcription-services',
        ].includes(route)
      ) {
        await page.screenshot({
          path: `artifacts/services/${route.split('/').pop()}-${width}.png`,
          fullPage: true,
          caret: 'initial',
        })
        if (route !== '/services')
          await page.locator('.sp-hero').screenshot({
            path: `artifacts/services/${route.split('/').pop()}-hero-${width}.png`,
            caret: 'initial',
          })
      }
    }
    expect(
      await page
        .locator('main img')
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    ).toBe(true)
  }
  expect(errors).toEqual([])
})

test('quote preselection, process anchor, reduced motion and accessible service controls', async ({
  page,
}) => {
  test.setTimeout(120000)
  for (const route of [
    'typesetting',
    'scielo-xml-markup',
    'copyediting',
    'translation',
    'ebook-creation',
    'transcription',
  ]) {
    await page.goto(`/services/${route}`)
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(
      results.violations.map((x) => ({ id: x.id, nodes: x.nodes.map((n) => n.target) })),
    ).toEqual([])
  }
  await page.goto('/typesetting-services')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.locator('#process').scrollIntoViewIfNeeded()
  await expect.poll(() => page.locator('#process').getAttribute('data-motion-state')).toBe('run')
  expect(
    await page
      .locator('.sp-timeline > li')
      .first()
      .evaluate((el) => getComputedStyle(el, '::after').animationName),
  ).toBe('sp-workflow-line')
  await expect(page.locator('.sp-timeline > li')).toHaveCount(4)
  await page.goto('/typesetting-services#process')
  await expect(page.locator('#process')).toBeInViewport()
  await page.getByRole('link', { name: 'Request a Typesetting Quote', exact: true }).first().click()
  await page.goto('/get-a-quote?service=publishing_editorial')
  await expect(
    page.getByRole('radio', { name: 'Publishing & Editorial Services', exact: true }),
  ).toBeChecked()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByLabel('Project Description *')).toBeVisible()
  await page.goto('/get-a-quote?service=invalid')
  await expect(
    page.getByRole('radio', { name: 'Publishing & Editorial Services', exact: true }),
  ).not.toBeChecked()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/scielo-xml-markup-services')
  await expect(page.locator('main h1')).toBeVisible()
  await expect(page.locator('.sp-timeline > li')).toHaveCount(4)
  expect(
    await page
      .locator('.sp-route-ink')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none')
  await page.setViewportSize({ width: 320, height: 844 })
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('missing service slugs return 404', async ({ page }) => {
  for (const slug of ['not-a-service', 'not-another-service']) {
    const response = await page.goto(`/services/${slug}`)
    expect(response?.status()).toBe(404)
  }
})

test('an unavailable optional hero image falls back to a readable diagram', async ({ page }) => {
  await page.route('**/_next/image?**', (route) => route.abort())
  await page.goto('/copyediting-services')
  await expect(page.locator('.sp-hero-art .sv-stage')).toBeVisible()
  await expect(page.locator('main h1')).toBeVisible()
})

test('manual dark theme and mobile service navigation remain usable', async ({ page }) => {
  test.setTimeout(90000)
  await page.goto('/typesetting-services')
  await page.getByRole('button', { name: 'Use dark theme', exact: true }).click()
  for (const route of [
    'typesetting',
    'scielo-xml-markup',
    'copyediting',
    'translation',
    'ebook-creation',
    'transcription',
  ]) {
    await page.goto(`/services/${route}`)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(
      results.violations.map((x) => ({ id: x.id, nodes: x.nodes.map((n) => n.target) })),
    ).toEqual([])
    await page.setViewportSize({ width: 320, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Site navigation', exact: true })
  await dialog.getByRole('button', { name: 'What We Do', exact: true }).click()
  await dialog.locator('summary').filter({ hasText: 'Publishing & content' }).click()
  await dialog.getByRole('link', { name: 'Typesetting', exact: true }).click()
  await expect(page).toHaveURL(/\/typesetting-services$/)
  await expect(dialog).not.toBeVisible()
})
