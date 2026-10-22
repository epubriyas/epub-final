import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const phase = process.argv.find((arg) => arg.startsWith('--phase='))?.split('=')[1] || 'after'
const materialScreens = process.argv.includes('--material')
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3000'
const selectedRoutes = process.argv
  .find((arg) => arg.startsWith('--routes='))
  ?.slice(9)
  .split(',')
const routes = selectedRoutes || [
  '/',
  '/services',
  '/typesetting-services',
  '/translation-services',
  '/work',
  '/work/complex-1-typesetting-sample',
  '/about-us',
  '/contact-us',
  '/get-a-quote',
  '/resources',
  '/blog',
]
const widths = [320, 390, 430, 768, 1024, 1440, 1920]
const directory = `artifacts/master-audit/${phase}`
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const results = selectedRoutes
  ? JSON.parse(await fs.readFile(`${directory}/results.json`, 'utf8')).filter(
      (row) => !selectedRoutes.includes(row.route),
    )
  : []
try {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 900 },
  })
  await context.addCookies([{ name: 'epubtrans-theme', value: 'light', url: base }])
  const page = await context.newPage()
  for (const route of routes) {
    const errors = []
    const onError = (error) => errors.push(error.message)
    page.on('pageerror', onError)
    const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 60000 })
    await page.locator('#site-assistant-dock .et-assistant-launcher, #project-assistant-dock .et-assistant-launcher').waitFor({ state: 'visible', timeout: 30000 })
    await page.evaluate(() => document.fonts.ready)
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 })
      await page.evaluate(() => window.scrollTo(0, 0))
      const metrics = await page.evaluate(() => {
        const visible = (element) =>
          element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden'
        const overflow = [
          ...document.querySelectorAll('#main-content *, .et-header *, .et-footer *'),
        ]
          .filter((element) => {
            if (!visible(element)) return false
            const rect = element.getBoundingClientRect()
            if (rect.left >= -1 && rect.right <= innerWidth + 1) return false
            let parent = element.parentElement
            while (parent && parent !== document.body) {
              if (
                parent.tagName !== 'MAIN' &&
                ['clip', 'hidden', 'auto', 'scroll'].includes(getComputedStyle(parent).overflowX)
              )
                return false
              parent = parent.parentElement
            }
            return true
          })
          .slice(0, 10)
          .map((element) => ({
            tag: element.tagName,
            class: element.className,
            text: element.textContent?.slice(0, 60),
          }))
        const colors = Object.fromEntries(
          ['--background-primary', '--brand-primary', '--text-primary', '--border-default'].map(
            (token) => [token, getComputedStyle(document.body).getPropertyValue(token).trim()],
          ),
        )
        return {
          pageWidth: document.documentElement.scrollWidth,
          viewport: innerWidth,
          overflow,
          h1: document.querySelectorAll('main h1').length,
          colors,
        }
      })
      const label = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')
      const screenshot = !materialScreens || [390, 1440].includes(width) ? `${directory}/${label}-${width}.png` : undefined
      if (screenshot) await page.screenshot({ path: screenshot, fullPage: true, caret: 'initial' })
      let violations
      if ([390, 1440].includes(width)) {
        violations = (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations.map(({ id, impact, nodes }) => ({
          id,
          impact,
          nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
        }))
      }
      const result = {
        route,
        width,
        height: 900,
        status: response.status(),
        ...metrics,
        errors: [...errors],
        screenshot,
        ...(violations ? { violations } : {}),
      }
      results.push(result)
      await fs.writeFile(`${directory}/results.json`, JSON.stringify(results, null, 2))
      console.log(
        JSON.stringify({
          route,
          width,
          status: result.status,
          overflow: metrics.overflow.length,
          violations: violations?.length,
          errors: errors.length,
        }),
      )
    }
    page.off('pageerror', onError)
  }
} finally {
  await browser.close()
}
console.log('RESULTS', results.length)
if (phase === 'after') await fs.writeFile('artifacts/master-audit/matrix-complete.json', JSON.stringify({ completed: true, cells: results.length }))
