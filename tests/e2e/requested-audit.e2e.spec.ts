import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'

test.setTimeout(180000)
const slugs = ['andy-crestodina', 'd', 'cristano-ronaldo', 'sameer']

test('audit content is private across public routes, APIs, search and sitemap', async ({
  page,
  request,
}) => {
  for (const slug of slugs) {
    expect((await request.get(`/blog/${slug}`)).status()).toBe(404)
    expect((await request.get(`/resources/${slug}`)).status()).toBe(404)
    const response = await request.get(`/api/posts?where[slug][equals]=${slug}`)
    expect(response.ok()).toBe(true)
    expect((await response.json()).totalDocs).toBe(0)
  }
  const search = await request.get('/api/search?limit=100')
  expect(search.ok()).toBe(true)
  for (const doc of (await search.json()).docs) expect(slugs).not.toContain(doc.slug)
  const sitemap = await (await request.get('/posts-sitemap.xml')).text()
  for (const slug of slugs) expect(sitemap).not.toContain(`/blog/${slug}`)
  expect((await request.get('/company/careers/Desktop%20publish%20Assistant')).status()).toBe(404)
  expect(
    (
      await (
        await request.get('/api/careers?where[slug][equals]=Desktop%20publish%20Assistant')
      ).json()
    ).totalDocs,
  ).toBe(0)
  for (const path of ['/resources', '/blog', '/search', '/company/careers']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('main')).not.toContainText(
      /cristiano ronaldo|demo 2|Andy Crestodina|our life in epubtrans i am sameer|riyastech001@gmail.com|Desktop publish Assistant/i,
    )
  }
})

test('four specialist cards and separate quote links work at desktop, tablet and mobile sizes', async ({
  page,
  request,
}) => {
  await mkdir('artifacts/requested-audit', { recursive: true })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/services', { waitUntil: 'domcontentloaded' })
    for (const slug of ['translation', 'subtitling', 'voiceover', 'transcription']) {
      const name = slug[0].toUpperCase() + slug.slice(1) + ' Services'
      const card = page
        .locator('.sp-directory-card')
        .filter({ has: page.getByRole('heading', { name, exact: true }) })
      await expect(card.locator('.sp-catalog-link')).toHaveAttribute('href', `/${slug}-services`)
      const quote = card.getByRole('link', { name: `Request a Quote for ${name}`, exact: true })
      await expect(quote).toHaveAttribute('href', '/get-a-quote')
      await quote.focus()
      await expect(quote).toBeFocused()
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({
      path: `artifacts/requested-audit/services-${width}.png`,
      fullPage: true,
    })
  }
  for (const slug of ['translation', 'subtitling', 'voiceover', 'transcription'])
    expect((await request.get(`/${slug}-services`)).status()).toBe(200)
  expect((await request.get('/get-a-quote')).status()).toBe(200)
  expect(errors).toEqual([])
})

for (const path of ['/translation-services', '/voiceover-services', '/work', '/company/careers']) {
  test(`responsive reading and accessibility: ${path}`, async ({ page }) => {
    await mkdir('artifacts/requested-audit/company', { recursive: true })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      if (path.endsWith('-services')) {
        const guide = page.getByRole('navigation', { name: 'On this service page' })
        await expect(guide).toBeVisible()
        for (const href of await guide
          .locator('a')
          .evaluateAll((links) => links.map((link) => link.getAttribute('href')!)))
          await expect(page.locator(href)).toHaveCount(1)
        const summary = page.locator('.sp-faq summary').first()
        await summary.focus()
        await page.keyboard.press('Enter')
        await expect(summary.locator('..')).toHaveAttribute('open', '')
      }
      if (path === '/work') {
        await expect(page.locator('.wp-work-row')).toHaveCount(19)
        await expect(page.locator('main')).not.toContainText(
          /Complex Heavy|Medium 2 typesetting|Simple 3 typesetting/,
        )
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      const axe = await new AxeBuilder({ page })
        .include('main')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(axe.violations).toEqual([])
      await page.screenshot({
        path: `artifacts/requested-audit/${path.slice(1)}-${width}.png`,
        fullPage: true,
      })
    }
  })
}
