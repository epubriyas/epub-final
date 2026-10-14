// @vitest-environment jsdom
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AboutPage } from '@/components/company/AboutPage'

const mocks = vi.hoisted(() => ({ getSiteSettings: vi.fn() }))

vi.mock('@/lib/content', () => ({ getSiteSettings: mocks.getSiteSettings }))
vi.mock('@/components/i18n/LocalizedLink', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const render = async (aboutPage = {}) => {
  mocks.getSiteSettings.mockResolvedValue({ aboutPage })
  return renderToStaticMarkup(await AboutPage())
}

describe('About EPUBTRANS page', () => {
  beforeEach(() => mocks.getSiteSettings.mockReset())

  it('includes the required sections, production categories, workflow, and destinations', async () => {
    const html = await render()
    const requiredHeadings = [
      'About EPUBTRANS',
      'Who We Are',
      'Who We Work With',
      'What We Do',
      'Our Approach to Content Production',
      'What Matters in Our Work',
      'Mission & Vision',
      'Based in India, Supporting International Content Workflows',
      'Explore Our Services',
      'Work With EPUBTRANS',
    ]
    const renderedHeadings = [...html.matchAll(/<h[12][^>]*>(.*?)<\/h[12]>/g)].map((match) =>
      match[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&'),
    )
    let previousHeading = -1
    for (const heading of requiredHeadings) {
      const position = renderedHeadings.indexOf(heading)
      expect(position, `missing heading: ${heading}`).toBeGreaterThan(-1)
      expect(position, `heading out of order: ${heading}`).toBeGreaterThan(previousHeading)
      previousHeading = position
    }

    for (const capability of [
      'Publishing &amp; Editorial Production',
      'eBook, XML &amp; Structured Content',
      'Document &amp; Data Conversion',
      'Localization &amp; Multilingual Production',
      'eLearning &amp; Multimedia',
      'Digital Accessibility',
    ]) expect(html).toContain(capability)

    expect(html).toContain('href="/typesetting-services"')
    expect(html).toContain('href="/desktop-publishing-services"')
    expect(html).toContain('href="/scielo-xml-markup-services"')
    expect(html).toContain('href="/ebook-creation-services"')
    expect(html).toContain('href="/data-conversion-services"')
    expect(html).toContain('href="/accessibility-services"')
    expect(html).toContain('href="/services"')
    expect(html).toContain('href="/get-a-quote"')
    expect((html.match(/href="\/get-a-quote"/g) || []).length).toBe(3)
    const workflowSteps = [
      'Understand the Project',
      'Establish the Requirements',
      'Carry Out the Production Work',
      'Review and Prepare Deliverables',
    ]
    previousHeading = -1
    for (const step of workflowSteps) {
      const position = html.indexOf(step)
      expect(position).toBeGreaterThan(previousHeading)
      previousHeading = position
    }
  })

  it('keeps existing Mission and Vision visible until approved replacement copy is complete', async () => {
    const html = await render({
      mission: 'Draft mission',
      vision: 'Draft vision',
      missionVisionApproved: false,
    })
    expect(html).not.toContain('Draft mission')
    expect(html).not.toContain('Draft vision')
    expect(html).toContain('To help people publish and share content')
    expect(html).toContain('A future where useful ideas can travel')

    const approvedHtml = await render({
      mission: 'Approved mission copy',
      vision: 'Approved vision copy',
      missionVisionApproved: true,
    })
    expect(approvedHtml).toContain('Approved mission copy')
    expect(approvedHtml).toContain('Approved vision copy')
    expect(approvedHtml).not.toContain('To help people publish and share content')
  })
})
