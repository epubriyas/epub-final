// @vitest-environment jsdom
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import content from '@/config/landing-content.json'
import { ServicesDirectory } from '@/components/services/ServicesDirectory'
import { validateDirectory, validateLandingContent } from '@/lib/landing-schema'
vi.mock('@/components/i18n/LocalizedLink', () => ({
  default: ({ href, children, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))
afterEach(cleanup)
describe('document services directory', () => {
  it('searches descriptions and restores cards when the query is cleared', () => {
    const { container } = render(<ServicesDirectory content={content.directory} />)
    const input = screen.getByRole('searchbox', { name: 'Search services' })
    expect(container.querySelectorAll('.sp-catalog-link')).toHaveLength(17)
    fireEvent.change(input, { target: { value: 'OCR' } })
    expect(container.querySelectorAll('.sp-catalog-link')).toHaveLength(1)
    expect(screen.getByRole('status').textContent).toBe('1 matching services')
    expect(screen.getByRole('heading', { name: 'Data Conversion Services' })).toBeTruthy()
    fireEvent.change(input, { target: { value: '' } })
    expect(container.querySelectorAll('.sp-catalog-link')).toHaveLength(17)
  })
  it('withholds hidden cards and preserves verified specialist routes', () => {
    const directory = structuredClone(content.directory)
    directory.categories[0].services[0].status = 'hidden'
    const { container } = render(<ServicesDirectory content={directory} />)
    expect(container.querySelectorAll('.sp-catalog-link')).toHaveLength(16)
    expect(screen.queryByRole('heading', { name: 'Typesetting Services' })).toBeNull()
    expect(
      screen
        .getByRole('heading', { name: 'Translation Services' })
        .closest('a')
        ?.getAttribute('href'),
    ).toBe('/translation-services')
    expect(
      screen
        .getByRole('heading', { name: 'PDF Recreation & Document Preparation' })
        .closest('a')
        ?.getAttribute('href'),
    ).toBe('/data-conversion-services')
    const summary = screen.getByText(content.directory.faq.items[0].question)
    summary.focus()
    expect(document.activeElement).toBe(summary)
    fireEvent.click(summary)
    expect(summary.closest('details')?.open).toBe(true)
  })
  it('rejects malformed CMS content, unsafe destinations and duplicate anchor IDs', () => {
    expect(validateDirectory(content.directory)).toBe(true)
    const directory = structuredClone(content.directory)
    directory.categories[1].anchorId = directory.categories[0].anchorId
    expect(validateDirectory(directory)).not.toBe(true)
    directory.categories[1].anchorId = 'ebook-xml'
    directory.primaryCTA.href = '//external.example'
    expect(validateDirectory(directory)).not.toBe(true)
    expect(validateLandingContent({ h1: 'Incomplete' }, content.home)).not.toBe(true)
  })
})
