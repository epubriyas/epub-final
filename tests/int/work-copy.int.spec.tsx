// @vitest-environment jsdom
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { WorkExplorer } from '@/components/work/WorkExplorer'
import type { WorkSample } from '@/lib/portfolio'
vi.mock('@/components/i18n/LocalizedLink', () => ({
  default: ({ href, children }: React.ComponentProps<'a'>) => <a href={href}>{children}</a>,
}))
vi.mock('@/components/work/SampleViewer', () => ({ SampleViewer: () => null }))
const sample = (id: number, category: string): WorkSample => ({
  id,
  slug: 'sample-' + id,
  title: 'Sample ' + id,
  category,
  categoryKey: category,
  description: 'Publication layout and typography excerpt.',
  kind: 'Sample',
  format: 'PDF',
  featured: false,
  thumbnail: null,
  pages: [],
  pageCount: 1,
  sectionCount: 0,
  sections: [],
  previewNote: '',
  sourcePageCount: 2,
  services: [],
  quoteHref: '/get-a-quote',
})
afterEach(cleanup)
describe('portfolio copy and navigation', () => {
  it('shows repeated copy once while keeping all samples, links and viewer actions', () => {
    render(
      <WorkExplorer
        samples={[sample(1, 'Publishing'), sample(2, 'Publishing'), sample(3, 'DTP')]}
      />,
    )
    expect(screen.getAllByText('Publication layout and typography excerpt.')).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /View Sample/ })).toHaveLength(3)
    expect(screen.getByRole('link', { name: 'Sample 2' }).getAttribute('href')).toBe(
      '/work/sample-2',
    )
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Sample 2' } })
    expect(screen.getAllByText('Publication layout and typography excerpt.')).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /View Sample/ })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Sample 2' })).toBeTruthy()
  })
})
