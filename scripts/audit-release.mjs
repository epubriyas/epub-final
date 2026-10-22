import fs from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'dotenv'
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3000'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname))
  throw new Error('Use a local build')
const directory = 'artifacts/master-audit/release'
await fs.mkdir(directory, { recursive: true })
const report = { security: [], routes: [], accessibility: [], performance: [], localization: {} }
for (const [route, expected] of [
  ['/api/health', 200],
  ['/api/quote-requests', 403],
  ['/api/enquiries', 403],
  ['/api/quote-files/1/11111111-1111-1111-1111-111111111111.txt', 401],
]) {
  const response = await fetch(base + route)
  report.security.push({ route, status: response.status, expected })
}
const crossOrigin = await fetch(base + '/api/enquiry', {
  method: 'POST',
  headers: { Origin: 'https://example.invalid', 'Content-Type': 'application/json' },
  body: '{}',
})
report.security.push({ route: 'cross-origin enquiry', status: crossOrigin.status, expected: 403 })
const known = JSON.parse(await fs.readFile('artifacts/site-comparison/pages.json', 'utf8'))
for (let index = 0; index < known.length; index += 3) {
  report.routes.push(
    ...(await Promise.all(
      known.slice(index, index + 3).map(async ({ route }) => {
        const response = await fetch(base + route)
        return { route, status: response.status, robots: response.headers.get('x-robots-tag') }
      }),
    )),
  )
}
console.log('HTTP public route checks:', report.routes.length)
const browser = await chromium.launch({ channel: 'msedge' })
report.environment = { node: process.version, browser: browser.version(), base }
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  for (const route of [
    '/company/careers',
    '/company/global-presence',
    '/industries',
    '/technology/production-os',
    '/blog/cristano-ronaldo',
    '/work',
  ]) {
    await page.goto(base + route, { waitUntil: 'networkidle' })
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      for (const theme of ['light', 'dark']) {
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme
        }, theme)
        const result = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
        report.accessibility.push({
          route,
          width,
          theme,
          violations: result.violations.map(({ id, nodes }) => ({
            id,
            nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
          })),
        })
      }
    }
    console.log('Extra UI checked:', route)
  }
  await page.goto(base + '/work', { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark'
  })
  await page
    .getByRole('button', { name: /View Sample/ })
    .first()
    .click()
  const viewer = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  report.accessibility.push({
    route: '/work (open viewer)',
    theme: 'dark',
    width: 1440,
    violations: viewer.violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    })),
  })
  await page.getByRole('button', { name: 'Close sample viewer' }).click()
  await page.goto(base + '/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await page
    .locator('#language-options')
    .screenshot({ path: `${directory}/native-language-options.png`, caret: 'initial' })
  await page.keyboard.press('Escape')
  report.reflow = []
  for (const route of ['/', '/services', '/get-a-quote']) {
    await page.setViewportSize({ width: 640, height: 900 })
    await page.goto(base + route, { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%'
    })
    report.reflow.push({
      route,
      viewport: 640,
      rootTextScale: '200%',
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      note: 'Text scaling simulation; native browser and assistive-technology testing remains a release check.',
    })
  }
  for (const [route, selector, label] of [
    ['/typesetting-services', '.sp-related', 'related'],
    ['/about-us', '.et-page-hero', 'about'],
    ['/get-a-quote', '.et-quote-layout', 'quote'],
  ]) {
    await page.goto(base + route, { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'light'
    })
    await page
      .locator(selector)
      .screenshot({ path: `${directory}/${label}-detail.png`, caret: 'initial' })
  }
  await page.route('**/api/translate', async (route) => {
    const { texts } = route.request().postDataJSON()
    await route.fulfill({
      json: { translations: Object.fromEntries(texts.map((text) => [text, text])) },
    })
  })
  await page.setViewportSize({ width: 390, height: 900 })
  await page.evaluate(() => { document.documentElement.style.fontSize = '' })
  await page.goto(base + '/ar', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.documentElement.lang === 'ar', { timeout: 30000 }).catch(() => {})
  report.localization = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    direction: document.documentElement.dir,
    overflow: document.documentElement.scrollWidth > innerWidth,
    note: 'Provider mocked for RTL layout only; translation accuracy not assessed.',
  }))
  await context.close()
  if (process.argv.includes('--wait-for-matrix')) {
    let ready = false
    for (let attempt = 0; attempt < 360; attempt++) {
      try { await fs.access('artifacts/master-audit/matrix-complete.json'); ready = true; break } catch {}
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
    if (!ready) throw new Error('Responsive audit still running; performance samples deferred')
  }
  for (const width of [390, 1440]) {
    const measured = await browser.newContext({ viewport: { width, height: 900 } })
    await measured.addInitScript(() => {
      window.__auditVitals = { lcp: null, cls: 0, eventDurations: [] }
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__auditVitals.lcp = entry.startTime
      }).observe({ type: 'largest-contentful-paint', buffered: true })
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput) window.__auditVitals.cls += entry.value
      }).observe({ type: 'layout-shift', buffered: true })
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (entry.interactionId) window.__auditVitals.eventDurations.push(entry.duration)
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 })
    })
    const page = await measured.newPage()
    for (const route of ['/', '/typesetting-services', '/get-a-quote']) {
      await page.goto(base + route, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await page.getByRole('button', { name: 'Open EPUBTRANS assistant' }).click()
      await page.getByRole('button', { name: 'Close assistant', exact: true }).click()
      const metrics = await page.evaluate(() => ({
        ...window.__auditVitals,
        ttfb: performance.getEntriesByType('navigation')[0].responseStart,
      }))
      report.performance.push({
        route,
        width,
        ...metrics,
        environment:
          'Local production build, Edge, no CPU/network throttling. Event durations are lab interaction samples, not field INP.',
      })
    }
    await measured.close()
  }
} finally {
  await browser.close()
  await fs.writeFile(`${directory}/results.json`, JSON.stringify(report, null, 2))
}

const env = parse(await fs.readFile('.env', 'utf8'))
const secrets = Object.entries(env).filter(
  ([key, value]) => /SECRET|TOKEN|API_KEY|DATABASE_URL/.test(key) && value.length > 12,
)
const exposedKeys = new Set()
async function inspectBundles(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) await inspectBundles(file)
    else if (file.endsWith('.js')) {
      const text = await fs.readFile(file, 'utf8')
      for (const [key, value] of secrets) if (text.includes(value)) exposedKeys.add(key)
    }
  }
}
await inspectBundles('.next/static')
report.security.push({
  check: 'Local secret values in emitted client JS',
  exposedKeys: [...exposedKeys],
})
await fs.writeFile(`${directory}/results.json`, JSON.stringify(report, null, 2))
console.log(
  'Release audit recorded. Accessibility violations:',
  report.accessibility.filter((row) => row.violations.length).length,
)
