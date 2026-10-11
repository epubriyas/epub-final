// @vitest-environment jsdom
import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { QuoteForm } from '@/components/forms/QuoteForm'

vi.mock('@/components/i18n/LocalizedLink', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('blocks repeated submissions while saving and preserves the brief in transport', async () => {
  let complete!: (response: Response) => void
  const fetchMock = vi.fn(
    () =>
      new Promise<Response>((resolve) => {
        complete = resolve
      }),
  )
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
    callback()
    return 0
  })
  render(<QuoteForm />)
  fireEvent.click(screen.getByLabelText('Publishing & content'))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  const brief = '  Please preserve this original message.\nSecond line & <tags>.\n  '
  fireEvent.change(screen.getByLabelText('Project requirements *'), { target: { value: brief } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.change(screen.getByLabelText('Full name *'), { target: { value: 'Test Customer' } })
  fireEvent.change(screen.getByLabelText('Email address *'), {
    target: { value: 'test@example.com' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('checkbox'))
  const form = screen.getByRole('button', { name: 'Submit request' }).closest('form')!
  fireEvent.submit(form)
  fireEvent.submit(form)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('button', { name: 'Saving request…' }).hasAttribute('disabled')).toBe(
    true,
  )
  const options = fetchMock.mock.calls[0] as unknown as [string, { body: FormData }]
  expect(JSON.parse(String(options[1].body.get('details')))).toBe(brief)
  complete(
    new Response(JSON.stringify({ reference: '123', notification: 'failed' }), { status: 201 }),
  )
  await waitFor(() =>
    expect(screen.getByText(/Your request is saved, but the email notification/)).toBeTruthy(),
  )
  expect(screen.queryByRole('button', { name: 'Submit request' })).toBeNull()
})
