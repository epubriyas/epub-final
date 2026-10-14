import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.emulateMedia({ reducedMotion: 'reduce' })
await mkdir('artifacts/ui-audit', { recursive: true })
for (const route of ['/', '/services', '/company', '/solutions', '/industries', '/technology', '/resources', '/contact', '/work']) {
 const response = await page.goto('http://localhost:3002' + route)
 console.log(JSON.stringify({route,status:response.status(),headings:await page.locator('main h1, main h2').allTextContents(),height:await page.locator('body').evaluate(e=>e.scrollHeight)}))
 if (true) await page.screenshot({ path: `artifacts/ui-audit/after-${route === '/' ? 'home' : route.slice(1)}.png`, fullPage: true })
}
await browser.close()


