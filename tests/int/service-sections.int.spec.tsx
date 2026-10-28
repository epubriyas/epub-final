// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ServiceDetail } from '@/components/services/ServiceDetail'
import { ServiceFAQ, ServiceQuality, ServiceUseCases } from '@/components/services/ServiceSections'
import type { Service } from '@/payload-types'
vi.mock('@/components/i18n/LocalizedLink', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))
vi.mock('@/components/RichText', () => ({ default: () => <p>CMS overview</p> }))
vi.mock('next/image', () => ({ default: () => <span>CMS image</span> }))
const service: Service = {
  id: 1,
  title: 'Example service',
  slug: 'example-service',
  category: 'publishing',
  status: 'published',
  createdAt: '',
  updatedAt: '',
}
afterEach(cleanup)
describe('optional CMS service sections', () => {
  it('adds the current service to both hero and closing quote links in service content', () => {
    const html = renderToStaticMarkup(
      <ServiceDetail
        service={{ ...service, slug: 'translation', category: 'translation-localization' }}
        related={[]}
      />,
    )
    const page = document.createElement('div')
    page.innerHTML = html
    const links = [...page.querySelectorAll('a[href^="/get-a-quote"]')]
    expect(links.length).toBeGreaterThanOrEqual(2)
    expect(
      links.every((link) => link.getAttribute('href') === '/get-a-quote?service=localization_dtp'),
    ).toBe(true)
  })
  it('renders a complete minimal service with default visuals and no optional CMS sections', () => {
    const html = renderToStaticMarkup(<ServiceDetail service={service} related={[]} />)
    expect(html).toContain('Example service')
    expect(html).toContain('CMS image')
    expect(html).toContain('Illustrative transformation')
    expect(html).not.toContain('id="process"')
    expect(html).not.toContain('GOOD TO KNOW')
    expect(html).not.toContain('CONNECTED CAPABILITIES')
  })
  it('renders CMS quality notes and use cases, withholding unpublished industry links', () => {
    const data = {
      ...service,
      quality: [{ title: 'Output review', description: 'Review the agreed output.' }],
      useCases: [{ title: 'Publication project', description: 'Project context.' }],
    }
    const html = renderToStaticMarkup(
      <>
        <ServiceQuality service={data} />
        <ServiceUseCases service={data} />
      </>,
    )
    expect(html).toContain('Output review')
    expect(html).toContain('Project context.')
    expect(html).not.toContain('/industries/')
  })
  it('uses a native accessible FAQ disclosure with a focusable summary', () => {
    render(
      <ServiceFAQ
        service={{
          ...service,
          faqs: [
            {
              question: 'Which files should I supply?',
              answer: 'Share the source and output requirements.',
            },
          ],
        }}
      />,
    )
    const summary = screen.getByText('Which files should I supply?')
    summary.focus()
    expect(document.activeElement).toBe(summary)
    fireEvent.click(summary)
    expect(summary.closest('details')?.open).toBe(true)
    expect(screen.getByText('Share the source and output requirements.')).toBeTruthy()
  })
})
