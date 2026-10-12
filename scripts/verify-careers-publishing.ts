import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../src/payload.config'
if (!['localhost', '127.0.0.1', '::1'].includes(new URL(process.env.DATABASE_URL!).hostname))
  throw new Error('Local verification only.')
const payload = await getPayload({ config })
const browser = await chromium.launch({ channel: 'msedge' })
const key = randomUUID()
const slug = `career-verification-${key}`
const email = `career-check-${key}@example.test`
const password = randomUUID()
let userId: number | undefined
let roleId: number | undefined
try {
  const user = await payload.create({
    collection: 'users',
    data: { email, password, name: 'Temporary Career Verification' },
  })
  userId = user.id
  const role = await payload.create({
    collection: 'careers',
    overrideAccess: false,
    user,
    data: {
      title: 'Temporary editorial role verification',
      slug,
      status: 'draft',
      description: 'Temporary test opening, removed when publishing checks finish.',
      location: 'Chennai',
      employmentType: 'full-time',
      applicationEmail: 'careers@example.test',
      capabilities: [
        { title: 'Editorial judgement', description: 'Identify clarity and consistency issues.' },
      ],
      content: {
        root: {
          type: 'root',
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'block',
              version: 2,
              format: '',
              fields: {
                blockType: 'blogInfographic',
                title: 'The work at a glance',
                layout: 'cards',
                items: [
                  { label: 'Read', description: 'Understand the source.' },
                  { label: 'Review', description: 'Prepare useful editorial feedback.' },
                ],
              },
            },
          ],
        },
      } as never,
    },
  })
  roleId = role.id
  assert.equal(
    (
      await payload.find({
        collection: 'careers',
        overrideAccess: false,
        where: { slug: { equals: slug } },
      })
    ).totalDocs,
    0,
  )
  const publicPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  assert.equal(
    (await publicPage.goto(`http://localhost:3000/company/careers/${slug}`))?.status(),
    404,
  )
  const editor = await browser.newPage()
  const login = await editor.request.post('http://localhost:3000/api/users/login', {
    data: { email, password },
  })
  assert.equal(login.status(), 200)
  await editor.goto(`http://localhost:3000/admin/collections/careers/${role.id}`, {
    waitUntil: 'networkidle',
  })
  await editor.locator('#field-status').click()
  await editor.getByRole('option', { name: 'published', exact: true }).click()
  await editor.getByRole('button', { name: 'Save', exact: true }).click()
  await editor
    .getByText(/successfully/i)
    .first()
    .waitFor({ timeout: 30000 })
  const result = await publicPage.goto(`http://localhost:3000/company/careers/${slug}`, {
    waitUntil: 'networkidle',
  })
  assert.equal(result?.status(), 200)
  assert.equal(await publicPage.getByRole('heading', { name: 'The work at a glance' }).count(), 1)
  assert.equal(await publicPage.getByRole('heading', { name: 'Editorial judgement' }).count(), 1)
  assert.match(
    (await publicPage
      .getByRole('link', { name: 'Apply by email', exact: true })
      .getAttribute('href')) || '',
    /^mailto:careers@example.test\?subject=Application/,
  )
  await mkdir('artifacts/careers', { recursive: true })
  await publicPage.screenshot({
    path: 'artifacts/careers/role-desktop.png',
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
    path: 'artifacts/careers/role-mobile.png',
    fullPage: true,
    animations: 'disabled',
  })
  await publicPage.goto('http://localhost:3000/company/careers', { waitUntil: 'networkidle' })
  assert.equal(await publicPage.getByRole('heading', { name: role.title, exact: true }).count(), 1)
  for (const width of [1440, 768, 390]) {
    await publicPage.setViewportSize({ width, height: 900 })
    assert.equal(
      await publicPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    )
  }
  await publicPage.emulateMedia({ reducedMotion: 'reduce' })
  assert.equal(
    await publicPage
      .locator('figure[data-blog-motion]')
      .evaluate((el) =>
        [...el.querySelectorAll('*')].some(
          (node) => getComputedStyle(node).animationName !== 'none',
        ),
      ),
    false,
  )
  await payload.update({
    collection: 'careers',
    id: role.id,
    overrideAccess: false,
    user,
    data: { status: 'draft' },
  })
  assert.equal(
    (await publicPage.goto(`http://localhost:3000/company/careers/${slug}`))?.status(),
    404,
  )
  await publicPage.goto('http://localhost:3000/company/careers', { waitUntil: 'networkidle' })
  assert.equal(await publicPage.getByRole('heading', { name: role.title, exact: true }).count(), 0)
  await publicPage.setViewportSize({ width: 1440, height: 1000 })
  await publicPage.screenshot({
    path: 'artifacts/careers/careers-desktop.png',
    fullPage: true,
    animations: 'disabled',
  })
  await publicPage.setViewportSize({ width: 390, height: 900 })
  await publicPage.screenshot({
    path: 'artifacts/careers/careers-mobile.png',
    fullPage: true,
    animations: 'disabled',
  })
  console.log(
    'PASS: admin Status Published + Save, public listing and role detail, infographic, application email, draft privacy, unpublishing, desktop/tablet/mobile and reduced motion.',
  )
} finally {
  if (roleId) await payload.delete({ collection: 'careers', id: roleId })
  if (userId) await payload.delete({ collection: 'users', id: userId })
  await browser.close()
  await payload.destroy()
  console.log('Temporary role and editor removed.')
}
process.exit(0)
