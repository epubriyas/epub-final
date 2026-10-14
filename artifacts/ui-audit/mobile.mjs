import { chromium } from '@playwright/test'
const browser = await chromium.launch({ channel:'msedge',headless:true })
const page = await browser.newPage()
await page.emulateMedia({ reducedMotion:'reduce' })
for (const [route,name] of [['/','home'],['/services','services'],['/copyediting-services','copyediting'],['/company','company'],['/industries','industries'],['/contact','contact'],['/work','work'],['/resources','resources'],['/technology','technology'],['/solutions','solutions']]) {
 await page.setViewportSize({width:390,height:900})
 await page.goto('http://localhost:3002'+route)
 await page.screenshot({path:`artifacts/ui-audit/after-${name}-mobile.png`,fullPage:true})
 if(name==='copyediting') {
  await page.setViewportSize({width:1440,height:900})
  await page.screenshot({path:'artifacts/ui-audit/after-copyediting.png',fullPage:true})
 }
}
await page.setViewportSize({width:1440,height:900})
await page.goto('http://localhost:3002/company')
await page.getByRole('button',{name:'Use dark theme',exact:true}).click()
await page.screenshot({path:'artifacts/ui-audit/after-company-dark.png',fullPage:true})
await browser.close()
