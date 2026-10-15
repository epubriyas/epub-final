import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
const slug = process.argv[2]
const content = JSON.parse(await fs.readFile(`src/config/service-handoffs/${slug}.json`, 'utf8'))
const routes = {
  'xml-jats': 'xml-conversion-services',
  'desktop-publishing': 'desktop-publishing-services',
  'cover-page-design': 'cover-page-design-services',
  'ebook-creation': 'ebook-creation-services',
  'data-conversion': 'data-conversion-services',
  'graphic-design-image-services': 'graphic-design-image-services',
  'scielo-xml-markup': 'scielo-xml-markup-services',
}
const path = `/${routes[slug] || `${slug}-services`}`
const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const texts = [content.hero.title, content.hero.lead, ...content.hero.paragraphs]
const links = new Set()
const collect = (blocks) =>
  blocks.forEach((b) => {
    if (b.kind === 'list') texts.push(...b.items)
    else if (b.kind === 'linked-paragraph') texts.push(b.before, b.text, b.after || '')
    else texts.push(b.text)
    if (b.kind === 'link') links.add(b.href)
    if (b.kind === 'linked-paragraph') links.add(b.href)
  })
collect(content.hero.actions)
for (const s of content.sections) {
  texts.push(s.title)
  collect(s.lead)
  for (const g of s.groups) {
    texts.push(g.title.replace(/^\d+\.\s*/, ''))
    collect(g.blocks)
    if (g.href) links.add(g.href)
  }
}
const normalize = (s) => s.replace(/\s+/g, ' ').trim()
const browser = await chromium.launch({ channel: 'msedge' })
const context = await browser.newContext({ reducedMotion: 'reduce' })
const page = await context.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await fs.mkdir('artifacts/clean-ui/service-handoffs', { recursive: true })
try {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    const response = await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 })
    assert.equal(response.status(), 200)
    const text = normalize(await page.locator('main').textContent())
    const missing = texts.filter((t) => !text.includes(normalize(t)))
    assert.deepEqual(missing, [], `${slug} missing copy`)
    assert.equal(await page.locator('main h1').count(), 1)
    assert.equal(await page.locator('main h1').textContent(), content.hero.title)
    assert.equal(
      await page.locator('meta[name="description"]').getAttribute('content'),
      content.seo.description,
    )
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `overflow ${width}`,
    )
    if (width !== 320) {
      const axe = await new AxeBuilder({ page })
        .include('main')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      assert.deepEqual(axe.violations, [], `accessibility ${width}`)
      await page.screenshot({ path: `artifacts/clean-ui/service-handoffs/${slug}-${width}.png` })
    }
  }
  for (const link of links) {
    const response = await page.request.get(new URL(link.split('#')[0], base).href)
    assert.equal(response.status(), 200, link)
  }
  assert.deepEqual(errors, [])
  console.log(
    JSON.stringify({
      slug,
      path,
      verifiedCopyBlocks: texts.length,
      links: links.size,
      widths: [1440, 390, 320],
      accessibility: 'passed',
      result: 'passed',
    }),
  )
} finally {
  await browser.close()
}
