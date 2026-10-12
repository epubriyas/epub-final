import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import { getPayload } from 'payload'
import { chromium } from '@playwright/test'
import config from '../src/payload.config'
if (!['localhost', '127.0.0.1', '::1'].includes(new URL(process.env.DATABASE_URL!).hostname))
  throw new Error('Verification is restricted to the local development database.')
const payload = await getPayload({ config })
const key = randomUUID()
const slug = `blog-publishing-check-${key}`
const email = `blog-check-${key}@example.test`
const password = randomUUID()
let userId: number | undefined
let postId: number | undefined
const browser = await chromium.launch({ channel: 'msedge' })
const textNode = (text: string) => ({
  type: 'text',
  text,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  version: 1,
})
const content = {
  root: {
    type: 'root',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [
          textNode(
            'Temporary publishing verification article. This content is removed when the checks finish.',
          ),
        ],
      },
      {
        type: 'heading',
        tag: 'h2',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [textNode('A connected content journey')],
      },
      {
        type: 'block',
        version: 2,
        format: '',
        fields: {
          blockType: 'blogInfographic',
          title: 'From source to reader',
          description: 'A temporary process graphic for publishing verification.',
          layout: 'steps',
          items: [
            { label: 'Understand', description: 'Confirm the audience and the source.' },
            { label: 'Prepare', description: 'Shape the language and final format.' },
            { label: 'Review', description: 'Check the agreed requirements.' },
          ],
          source: 'Illustrative workflow; no statistics.',
        },
      },
    ],
  },
}
try {
  const user = await payload.create({
    collection: 'users',
    data: { email, password, name: 'Temporary Blog Verification' },
  })
  userId = user.id
  const post = await payload.create({
    collection: 'posts',
    overrideAccess: false,
    user,
    draft: true,
    context: { disableRevalidate: true },
    data: {
      title: 'Temporary blog publishing verification',
      slug,
      _status: 'draft',
      content: content as never,
      meta: {
        description:
          'A temporary article to verify the manager publishing workflow and infographic rendering.',
      },
    },
  })
  postId = post.id
  const privateRead = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    where: { slug: { equals: slug } },
  })
  assert.equal(privateRead.totalDocs, 0)
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const draftResponse = await page.goto(`http://localhost:3000/blog/${slug}`, {
    waitUntil: 'networkidle',
  })
  assert.equal(draftResponse?.status(), 404)
  await page.goto('http://localhost:3000/admin/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: /log in|login/i }).click()
  await page.waitForURL('**/admin')
  await page.goto(`http://localhost:3000/admin/collections/posts/${post.id}`)
  await page.locator('input#field-title').first().waitFor({ timeout: 30000 })
  await page
    .locator('input#field-title')
    .first()
    .fill('Temporary blog publishing verification — edited in admin')
  await page.getByRole('button', { name: /^Publish( changes)?$/ }).click()
  await page
    .getByText(/successfully/i)
    .first()
    .waitFor({ timeout: 30000 })
  const publicPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  publicPage.on('pageerror', (error) => errors.push(error.message))
  const publishedResponse = await publicPage.goto(`http://localhost:3000/blog/${slug}`, {
    waitUntil: 'networkidle',
  })
  assert.equal(publishedResponse?.status(), 200)
  assert.match(await publicPage.locator('main h1').innerText(), /edited in admin/)
  await publicPage.getByRole('heading', { name: 'From source to reader', exact: true }).waitFor()
  const figure = publicPage
    .locator('figure')
    .filter({ has: publicPage.getByRole('heading', { name: 'From source to reader' }) })
  assert.equal(await figure.locator('ol li').count(), 3)
  await mkdir('artifacts/blog', { recursive: true })
  await figure.screenshot({
    path: 'artifacts/blog/infographic-desktop.png',
    animations: 'disabled',
  })
  await publicPage.screenshot({
    path: 'artifacts/blog/article-desktop.png',
    fullPage: true,
    animations: 'disabled',
  })
  for (const width of [1440, 768, 390]) {
    await publicPage.setViewportSize({ width, height: 900 })
    assert.equal(
      await publicPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    )
  }
  await publicPage.screenshot({
    path: 'artifacts/blog/article-mobile.png',
    fullPage: true,
    animations: 'disabled',
  })
  await publicPage.emulateMedia({ reducedMotion: 'reduce' })
  assert.equal(
    await figure.evaluate((el) =>
      [...el.querySelectorAll('*')].some((node) => getComputedStyle(node).animationName !== 'none'),
    ),
    false,
  )
  await publicPage.goto(
    `http://localhost:3000/blog?q=${encodeURIComponent('Temporary blog publishing verification')}`,
    { waitUntil: 'networkidle' },
  )
  assert.equal(
    await publicPage
      .locator('main')
      .getByRole('link', { name: /edited in admin/ })
      .count(),
    1,
  )
  const legacy = await publicPage.goto(`http://localhost:3000/resources/${slug}`, {
    waitUntil: 'networkidle',
  })
  assert.equal(legacy?.status(), 200)
  assert.equal(new URL(publicPage.url()).pathname, `/blog/${slug}`)
  await payload.update({
    collection: 'posts',
    id: post.id,
    overrideAccess: false,
    user,
    context: { disableRevalidate: true },
    data: { _status: 'draft' },
  })
  const unpublishedResponse = await publicPage.goto(`http://localhost:3000/blog/${slug}`, {
    waitUntil: 'networkidle',
  })
  assert.equal(unpublishedResponse?.status(), 404)
  await publicPage.goto(
    `http://localhost:3000/blog?q=${encodeURIComponent('Temporary blog publishing verification')}`,
    { waitUntil: 'networkidle' },
  )
  assert.equal(
    await publicPage
      .locator('main')
      .getByRole('link', { name: /edited in admin/ })
      .count(),
    0,
  )
  assert.deepEqual(errors, [])
  console.log(
    'PASS: anonymous draft protection, manager admin edit and Publish, live article, infographic, search, legacy link, unpublish, responsive layout and reduced motion.',
  )
} finally {
  if (postId)
    await payload.delete({ collection: 'posts', id: postId, context: { disableRevalidate: true } })
  if (userId) await payload.delete({ collection: 'users', id: userId })
  await browser.close()
  await payload.destroy()
  console.log('Temporary verification post and editor removed.')
}
process.exit(0)
