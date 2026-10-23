// @vitest-environment jsdom
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import content from '@/config/landing-content.json'
import { ServicesDirectory } from '@/components/services/ServicesDirectory'
import { validateDirectory, validateLandingContent } from '@/lib/landing-schema'
import { directoryQuoteHref } from '@/lib/landing-directory'
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
    expect(screen.getByRole('status').textContent).toBe('1 matching service')
    expect(screen.getByRole('heading', { name: 'Data Conversion Services' })).toBeTruthy()
    fireEvent.change(input, { target: { value: '' } })
    expect(container.querySelectorAll('.sp-catalog-link')).toHaveLength(17)
  })
  it('matches multiple terms and e-book aliases without leaving empty categories', () => {
    const { container } = render(<ServicesDirectory content={content.directory} />)
    const input = screen.getByRole('searchbox', { name: 'Search services' })
    fireEvent.change(input, { target: { value: ' PDF Word ' } })
    expect(container.querySelectorAll('.sp-catalog-link')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Data Conversion Services' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Publishing & Editorial Services' })).toBeNull()
    fireEvent.change(input, { target: { value: 'e-book' } })
    expect(screen.getByRole('heading', { name: 'eBook Creation Services' })).toBeTruthy()
    fireEvent.change(input, { target: { value: 'zzzz-unmatched-service' } })
    expect(screen.getByRole('heading', { name: 'No services match your search.' })).toBeTruthy()
    expect(container.querySelectorAll('#service-results section')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Show all services' }))
    expect(container.querySelectorAll('.sp-catalog-link')).toHaveLength(17)
    expect(document.activeElement).toBe(input)
    fireEvent.change(input, { target: { value: 'OCR' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input).toHaveProperty('value', '')
  })
  it('prefills supported quote categories and preserves custom destinations', () => {
    expect(directoryQuoteHref('publishing-editorial', '/get-a-quote')).toBe(
      '/get-a-quote?service=publishing_editorial',
    )
    expect(directoryQuoteHref('ebook-xml', '/get-a-quote?source=directory#brief')).toBe(
      '/get-a-quote?source=directory&service=ebook_xml#brief',
    )
    expect(directoryQuoteHref('unknown', '/get-a-quote')).toBe('/get-a-quote')
    expect(directoryQuoteHref('ebook-xml', '/contact')).toBe('/contact')
    render(<ServicesDirectory content={content.directory} />)
    expect(
      screen
        .getByRole('link', { name: 'Request a Quote for Accessibility Services' })
        .getAttribute('href'),
    ).toBe('/get-a-quote?service=digital_accessibility')
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
