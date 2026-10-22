import fs from 'node:fs/promises'
import { JSDOM } from 'jsdom'

const production = 'https://epubtrans-v2.vercel.app'
const local = process.env.COMPARE_LOCAL_URL || 'http://localhost:3000'
const routes = new Set(['/'])
for (const sitemap of ['/pages-sitemap.xml', '/posts-sitemap.xml']) {
  const response = await fetch(production + sitemap)
  if (!response.ok) throw new Error(`Sitemap unavailable: ${sitemap}`)
  for (const match of (await response.text()).matchAll(/<loc>(.*?)<\/loc>/g)) {
    const url = new URL(match[1])
    if (url.origin === production) routes.add(url.pathname.replace(/\/$/, '') || '/')
  }
}
const results = []
const clean = (text) => text.replace(/\s+/g, ' ').trim()
async function read(base, route) {
  const response = await fetch(base + route, { signal: AbortSignal.timeout(60000) })
  const document = new JSDOM(await response.text()).window.document
  const main = document.querySelector('main')
  document.querySelectorAll('script,style,nextjs-portal').forEach((node) => node.remove())
  const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'))
  return {
    status: response.status,
    title: document.title,
    heading: clean(document.querySelector('h1')?.textContent || ''),
    text: clean((main || document.body).textContent || ''),
    links,
  }
}
for (const route of routes) {
  const [remote, nearby] = await Promise.all([read(production, route), read(local, route)])
  for (const href of remote.links) {
    const url = new URL(href, production)
    if (url.origin !== production || /\.[a-z0-9]+$/i.test(url.pathname) || /^\/(api|admin|_next)(\/|$)/.test(url.pathname)) continue
    routes.add(url.pathname.replace(/\/$/, '') || '/')
  }
  const result = {
    route, productionStatus: remote.status, localStatus: nearby.status,
    titleMatches: remote.title === nearby.title,
    headingMatches: remote.heading === nearby.heading,
    contentMatches: remote.text === nearby.text,
    productionHeading: remote.heading, localHeading: nearby.heading,
  }
  results.push(result)
  console.log(JSON.stringify(result))
  if (routes.size > 200) throw new Error('Unexpected crawl size')
}
await fs.mkdir('artifacts/site-comparison', { recursive: true })
await fs.writeFile('artifacts/site-comparison/pages.json', JSON.stringify(results, null, 2))
console.log('SUMMARY', JSON.stringify({ pages: results.length, failures: results.filter((row) => row.localStatus !== row.productionStatus || !row.titleMatches || !row.contentMatches || !row.headingMatches).length }))
