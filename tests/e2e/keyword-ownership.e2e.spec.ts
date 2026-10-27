import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { readFileSync, readdirSync } from 'node:fs'
import type { ServiceHandoff } from '../../src/lib/service-handoff'
import { servicePaths } from '../../src/config/service-paths'

test('all existing service owners retain unique server-rendered metadata', async ({
  page,
  request,
}) => {
  test.setTimeout(300000)
  await mkdir('artifacts/keyword-ownership', { recursive: true })
  const titles = new Set<string>()
  const descriptions = new Set<string>()
  const headings = new Set<string>()
  const results = []
  const handoffs: ServiceHandoff[] = readdirSync('src/config/service-handoffs').map((file) =>
    JSON.parse(readFileSync('src/config/service-handoffs/' + file, 'utf8')),
  )
  for (const [slug, path] of Object.entries(servicePaths)) {
    const handoff = handoffs.find((item) => item.slug === slug)!
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status(), path).toBe(200)
    const html = await response.text()
    if (slug === 'data-conversion') {
      expect(html).toContain('id="pdf-to-word-ocr"')
      expect(html).toContain('id="pdf-recreation"')
    }
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('main h1')).toHaveCount(1)
    await expect(page.locator('main h1')).toHaveText(handoff.hero.title)
    const title = await page.title()
    expect(titles.has(title), path).toBe(false)
    expect(descriptions.has(handoff.seo.description), path).toBe(false)
    expect(headings.has(handoff.hero.title), path).toBe(false)
    titles.add(title)
    descriptions.add(handoff.seo.description)
    headings.add(handoff.hero.title)
    expect(title).toBe(handoff.seo.title)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      handoff.seo.description,
    )
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      handoff.seo.title,
    )
    const canonical = new URL((await page.locator('link[rel="canonical"]').getAttribute('href'))!)
    expect(canonical.pathname).toBe(path)
    expect(canonical.hash).toBe('')
    expect(canonical.hostname).not.toBe('epub-audit.vercel.app')
    await expect(page.locator('main a[href="/get-a-quote"]').first()).toBeVisible()
    results.push({
      path,
      title,
      h1: handoff.hero.title,
      canonical: canonical.href,
    })
  }
  await writeFile('artifacts/keyword-ownership/seo-results.json', JSON.stringify(results, null, 2))
})

test('conversion directory entries support direct loads, refresh, keyboard focus and client navigation', async ({
  page,
}) => {
  test.setTimeout(180000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    for (const [label, id, heading] of [
      ['Data Conversion Services', 'pdf-to-word-ocr', 'PDF-to-Word Conversion & OCR'],
      [
        'PDF Recreation & Document Preparation',
        'pdf-recreation',
        'PDF Recreation & Editable Document Preparation',
      ],
    ]) {
      const path = `/data-conversion-services#${id}`
      await page.goto(path)
      const target = page.locator(`#${id}`)
      await expect(target).toHaveCount(1)
      await expect(target).toHaveText(heading)
      await expect.poll(async () => (await target.boundingBox())!.y).toBeGreaterThanOrEqual(80)
      expect((await target.boundingBox())!.y).toBeLessThan(300)
      await target.focus()
      await expect(target).toBeFocused()
      await page.reload()
      await expect.poll(async () => (await target.boundingBox())!.y).toBeGreaterThanOrEqual(80)
      await page.screenshot({ path: `artifacts/keyword-ownership/${id}-${width}.png` })
      await page.goto('/services')
      await expect(page.locator('.sp-catalog-link')).toHaveCount(17)
      const card = page
        .locator('.sp-catalog-link')
        .filter({ has: page.getByRole('heading', { name: label, exact: true }) })
      await expect(card).toHaveAttribute('href', path)
      await card.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(new RegExp(`/data-conversion-services#${id}$`))
      await expect.poll(async () => (await target.boundingBox())!.y).toBeGreaterThanOrEqual(80)
      expect((await target.boundingBox())!.y).toBeLessThan(300)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
    }
  }
})

test('contextual service boundaries use existing owner destinations', async ({ page, request }) => {
  test.setTimeout(180000)
  const edges: Record<string, string[]> = {
    'xml-jats': ['scielo-xml-markup'],
    'scielo-xml-markup': ['xml-jats'],
    'data-conversion': ['desktop-publishing', 'xml-jats'],
    'desktop-publishing': ['data-conversion', 'typesetting', 'translation'],
    typesetting: ['desktop-publishing'],
    'ebook-creation': ['accessibility'],
    accessibility: ['ebook-creation'],
    copyediting: ['proofreading'],
    proofreading: ['copyediting'],
    'graphic-design-image-services': ['cover-page-design'],
    'cover-page-design': ['graphic-design-image-services'],
    translation: ['desktop-publishing'],
    'elearning-localization': ['subtitling', 'voiceover'],
    subtitling: ['transcription'],
    transcription: ['subtitling'],
    voiceover: ['subtitling'],
  }
  for (const [source, targets] of Object.entries(edges)) {
    await page.goto(servicePaths[source])
    for (const target of targets) {
      await expect(page.locator(`main a[href="${servicePaths[target]}"]`).first()).toHaveCount(1)
      expect((await request.get(servicePaths[target], { maxRedirects: 0 })).status()).toBe(200)
    }
  }
})

for (const slug of [
  'data-conversion',
  'desktop-publishing',
  'typesetting',
  'xml-jats',
  'scielo-xml-markup',
  'ebook-creation',
]) {
  test('accessibility of updated owner: ' + slug, async ({ page }) => {
    test.setTimeout(180000)
    await mkdir('artifacts/keyword-ownership', { recursive: true })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(servicePaths[slug], { waitUntil: 'networkidle' })
    const result = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    await writeFile(
      'artifacts/keyword-ownership/axe-' + slug + '.json',
      JSON.stringify({ violations: result.violations, passes: result.passes.length }, null, 2),
    )
    expect(result.violations).toEqual([])
  })
}
