import 'dotenv/config'
import { parse } from 'dotenv'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import { chromium } from '@playwright/test'
import { put, del } from '@vercel/blob'
import { getPayload } from 'payload'
const cloud = parse(await readFile('.vercel/.env.production.local'))
process.env.DATABASE_URL = cloud.DATABASE_URL
process.env.BLOB_READ_WRITE_TOKEN = cloud.BLOB_READ_WRITE_TOKEN
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })
const browser = await chromium.launch({ channel: 'msedge' })
const base = 'https://epubtrans-v2.vercel.app'
const key = randomUUID(),
  email = `deploy-check-${key}@example.test`,
  password = randomUUID()
let userId: number | undefined, mediaId: number | undefined, quoteId: number | undefined
const filename = key + '.txt'
try {
  const user = await payload.create({
    collection: 'users',
    data: { email, password, name: 'Temporary Deployment Verification' },
  })
  userId = user.id
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()
  page.setDefaultTimeout(60000)
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  for (const route of [
    '/',
    '/services',
    '/translation-services',
    '/accessibility-services',
    '/subtitling-services',
    '/blog',
    '/company/careers',
    '/work',
  ]) {
    const response = await page.goto(base + route, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    })
    assert.equal(response?.status(), 200, route)
    assert.equal(await page.locator('main h1').count(), 1, route)
    assert.equal(await page.locator('a[href="/indexing-services"]').count(), 0)
  }
  await page.goto(base + '/admin/login', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: /log in|login/i }).click()
  await page.waitForURL('**/admin')
  const image = await sharp({
    create: { width: 16, height: 16, channels: 3, background: '#006d68' },
  })
    .png()
    .toBuffer()
  const upload = await context.request.post(base + '/api/media', {
    multipart: {
      _payload: JSON.stringify({ alt: 'Temporary deployment storage test' }),
      file: { name: `deployment-${key}.png`, mimeType: 'image/png', buffer: image },
    },
  })
  if (upload.status() !== 201) {
    console.log('Media upload response status', upload.status())
    throw new Error('Cloud media upload failed')
  }
  const uploaded = (await upload.json()).doc
  mediaId = uploaded.id
  const assetURL = new URL(uploaded.url, base).href
  const asset = await context.request.get(assetURL)
  assert.equal(asset.status(), 200, 'Uploaded media read')
  const anonymous = await browser.newContext()
  assert.equal(
    (await anonymous.request.get(assetURL)).status(),
    200,
    'Public image through authorized Payload handler',
  )
  await put(`quote-attachments/${filename}`, Buffer.from('Temporary storage verification.'), {
    access: 'private',
    token: cloud.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
  })
  const quote = await payload.create({
    collection: 'quote-requests',
    data: {
      name: 'Deployment verification',
      email: 'deployment-check@example.test',
      service: 'Publishing & Editorial',
      details: 'Temporary verification record.',
      consent: true,
      attachments: [{ originalName: 'verification.txt', path: filename, size: 31 }],
      status: 'new',
    },
  })
  quoteId = quote.id
  const attachmentURL = `${base}/api/quote-files/${quote.id}/${filename}`
  assert.equal(
    (await anonymous.request.get(attachmentURL)).status(),
    401,
    'Private attachment denies anonymous access',
  )
  const privateResponse = await context.request.get(attachmentURL)
  assert.equal(privateResponse.status(), 200, 'Authenticated private attachment read')
  assert.equal(await privateResponse.text(), 'Temporary storage verification.')
  await page.goto(base + '/work', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.locator('main img').evaluateAll((images) =>
    images.forEach((img) => {
      ;(img as HTMLImageElement).loading = 'eager'
    }),
  )
  await page.waitForFunction(() =>
    [...document.querySelectorAll('main img')].every(
      (img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0,
    ),
  )
  const failedImages = await page
    .locator('main img')
    .evaluateAll(
      (images) =>
        images.filter(
          (img) => !(img as HTMLImageElement).complete || !(img as HTMLImageElement).naturalWidth,
        ).length,
    )
  assert.equal(failedImages, 0, 'Portfolio images loaded from private store')
  await page.goto(base + '/translation-services', { waitUntil: 'domcontentloaded', timeout: 60000 })
  assert.equal(
    await page.locator('link[rel=canonical]').getAttribute('href'),
    base + '/translation-services',
  )
  await page.setViewportSize({ width: 390, height: 900 })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  await mkdir('artifacts/vercel', { recursive: true })
  await page.screenshot({
    path: 'artifacts/vercel/live-mobile.png',
    fullPage: true,
    animations: 'disabled',
  })
  assert.deepEqual(errors, [])
  await writeFile(
    'artifacts/vercel/deployment-verification.json',
    JSON.stringify(
      {
        url: base,
        health: 'passed',
        adminLogin: 'passed',
        cloudMediaUpload: 'passed',
        privateAttachments: 'passed',
        portfolioImages: 'passed',
        canonical: 'passed',
        mobile: 'passed',
      },
      null,
      2,
    ),
  )
  console.log(
    'PASS: deployed pages, Payload admin login, new cloud image upload/read, private attachment authorization, portfolio images, canonical URLs and mobile layout.',
  )
} finally {
  if (mediaId) await payload.delete({ collection: 'media', id: mediaId })
  if (quoteId) await payload.delete({ collection: 'quote-requests', id: quoteId })
  await del(`quote-attachments/${filename}`, { token: cloud.BLOB_READ_WRITE_TOKEN })
  if (userId) await payload.delete({ collection: 'users', id: userId })
  await browser.close()
  await payload.destroy()
  console.log('Temporary verification account and files removed.')
}
process.exit(0)
