import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

const destinations = [
  ['Blog', '/blog'],
  ['Industry Insights', '/industry-insights'],
  ['Publishing', '/work?category=publishing'],
  ['Localization', '/work?category=localization'],
  ['eLearning', '/work?category=elearning'],
  ['Accessibility', '/work?category=accessibility'],
  ['Guides & eBooks', '/resources?type=guides-ebooks'],
  ['Whitepapers & Reports', '/resources?type=whitepapers-reports'],
]
test('Resources menu has the requested groups and working routes on desktop and mobile', async ({
  page,
  request,
}) => {
  test.setTimeout(90000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page
    .locator('.et-desktop-nav')
    .getByRole('button', { name: 'Resources', exact: true })
    .click()
  const desktop = page.locator('.et-mega-resources')
  await expect(desktop.getByRole('heading', { level: 3 })).toHaveText([
    'Insights & Blog',
    'Case Studies',
    'Resources',
  ])
  await expect(desktop.getByText('AI & Technology', { exact: true })).toHaveCount(0)
  for (const [label, href] of destinations) {
    await expect(desktop.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'href',
      href,
    )
    expect((await request.get(href)).status(), href).toBe(200)
  }
  await page.keyboard.press('Escape')
  await expect(
    page.locator('.et-desktop-nav').getByRole('button', { name: 'Technology', exact: true }),
  ).toBeVisible()
  expect((await request.get('/technology')).status()).toBe(200)
  await page
    .locator('.et-desktop-nav')
    .getByRole('button', { name: 'What We Do', exact: true })
    .click()
  await expect(
    page.locator('.et-mega-services').getByRole('link', { name: 'Copyediting', exact: true }),
  ).toHaveAttribute('href', '/copyediting-services')
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open navigation' }).click()
  const mobile = page.getByRole('dialog', { name: 'Site navigation' })
  await mobile.getByRole('button', { name: 'Resources', exact: true }).click()
  const panel = mobile.locator('[id^="mobile-"]')
  for (const summary of ['Insights & Blog', 'Case Studies', 'Resources'])
    await panel
      .locator('summary')
      .filter({ hasText: new RegExp(`^${summary.replace('&', '\\&')}$`) })
      .click()
  for (const [label, href] of destinations)
    await expect(panel.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'href',
      href,
    )
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  expect(errors).toEqual([])
})

test.describe('Existing CMS publishing and classification', () => {
  test.setTimeout(120000)
  test.beforeAll(async () => seedTestUser())
  test.afterAll(async () => cleanupTestUser())
  test('an editor can draft, edit, preview and publish a categorized article', async ({
    page,
    request,
  }) => {
    const login = await page.request.post('/api/users/login', { data: testUser })
    expect(login.status()).toBe(200)
    const slug = `resources-qa-${randomUUID()}`
    const categoryResponse = await page.request.get(
      '/api/categories?where[slug][equals]=industry-insights',
    )
    const category = (await categoryResponse.json()).docs[0]
    expect(category).toBeTruthy()
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Temporary automated publishing verification.',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    }
    const created = await page.request.post('/api/posts', {
      data: {
        title: 'Draft article QA',
        slug,
        content,
        categories: [category.id],
        _status: 'draft',
      },
    })
    expect(created.status()).toBe(201)
    const { doc } = await created.json()
    try {
      expect((await request.get(`/resources/${slug}`)).status()).toBe(404)
      await page.goto(`/admin/collections/posts/${doc.id}`)
      await expect(page.locator('input[name="title"]')).toBeVisible()
      const preview = page.getByRole('link', { name: 'Preview', exact: true })
      await expect(preview).toHaveAttribute('href', /\/next\/preview\?/)
      const previewURL = await preview.getAttribute('href')
      const previewResponse = await page.request.get(previewURL!)
      expect(previewResponse.status()).toBe(200)
      expect(await previewResponse.text()).toContain('Draft article QA')
      await page.request.get('/next/exit-preview')
      const edited = await page.request.patch(`/api/posts/${doc.id}`, {
        data: { title: 'Published article QA', _status: 'published' },
      })
      expect(edited.status()).toBe(200)
      const article = await request.get(`/resources/${slug}`)
      expect(article.status()).toBe(200)
      expect(await article.text()).toContain('Published article QA')
      for (const path of ['/blog', '/industry-insights'])
        expect(
          await (
            await request.get(`${path}?q=${encodeURIComponent('Published article QA')}`)
          ).text(),
        ).toContain(`/resources/${slug}`)
      const unpublish = await page.request.patch(`/api/posts/${doc.id}`, {
        data: { _status: 'draft' },
      })
      expect(unpublish.status()).toBe(200)
      expect((await request.get(`/resources/${slug}`)).status()).toBe(404)
    } finally {
      expect((await page.request.delete(`/api/posts/${doc.id}`)).status()).toBe(200)
    }
  })
  test('case study categories and resource types filter published content', async ({
    page,
    request,
  }) => {
    expect((await page.request.post('/api/users/login', { data: testUser })).status()).toBe(200)
    const slug = `classified-qa-${randomUUID()}`
    const ids: { collection: string; id: number }[] = []
    try {
      for (const [collection, data] of [
        [
          'case-studies',
          {
            title: 'Publishing classification QA',
            slug,
            category: 'publishing',
            permissionConfirmed: true,
            status: 'published',
          },
        ],
        [
          'case-studies',
          {
            title: 'Unapproved classification QA',
            slug: `${slug}-unapproved`,
            category: 'publishing',
            permissionConfirmed: false,
            status: 'published',
          },
        ],
        [
          'resources',
          { title: 'Guide classification QA', slug, type: 'guide', status: 'published' },
        ],
        [
          'resources',
          {
            title: 'Report classification QA',
            slug: `${slug}-report`,
            type: 'report',
            status: 'published',
          },
        ],
        [
          'resources',
          {
            title: 'Draft guide classification QA',
            slug: `${slug}-draft`,
            type: 'guide',
            status: 'draft',
          },
        ],
      ] as const) {
        const response = await page.request.post(`/api/${collection}`, { data })
        expect(response.status()).toBe(201)
        ids.push({ collection, id: (await response.json()).doc.id })
      }
      const publishing = await (await request.get('/work?category=publishing')).text()
      expect(publishing).toContain('Publishing classification QA')
      expect(publishing).not.toContain('Unapproved classification QA')
      expect(await (await request.get('/work?category=localization')).text()).not.toContain(
        'Publishing classification QA',
      )
      const guides = await (await request.get('/resources?type=guides-ebooks')).text()
      expect(guides).toContain('Guide classification QA')
      expect(guides).not.toContain('Report classification QA')
      expect(guides).not.toContain('Draft guide classification QA')
      const reports = await (await request.get('/resources?type=whitepapers-reports')).text()
      expect(reports).toContain('Report classification QA')
      expect(reports).not.toContain('Guide classification QA')
    } finally {
      for (const { collection, id } of ids)
        expect((await page.request.delete(`/api/${collection}/${id}`)).status()).toBe(200)
    }
  })
})
