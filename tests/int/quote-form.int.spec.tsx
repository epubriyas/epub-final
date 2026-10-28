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

it('prevents duplicate clicks and sends approved field IDs while retaining the exact brief', async () => {
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
  fireEvent.click(screen.getByRole('radio', { name: 'Publishing & Editorial Services' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.change(screen.getByLabelText(/Attach project files/), {
    target: { files: [new File(['Brief'], 'brief.txt', { type: 'text/plain' })] },
  })
  const brief = '  Please preserve this original message.\nSecond line & <tags>.\n  '
  fireEvent.change(screen.getByLabelText('Project Description *'), { target: { value: brief } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.change(screen.getByLabelText('Full Name *'), { target: { value: 'Test Customer' } })
  fireEvent.change(screen.getByLabelText('Business Email *'), {
    target: { value: 'test@example.com' },
  })
  fireEvent.change(screen.getByLabelText('Company / Organization *'), {
    target: { value: 'Example' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  const form = screen.getByRole('button', { name: 'Submit Project Enquiry' }).closest('form')!
  fireEvent.submit(form)
  fireEvent.submit(form)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('button', { name: 'Submitting…' }).hasAttribute('disabled')).toBe(true)
  const options = fetchMock.mock.calls[0] as unknown as [string, { body: FormData }]
  expect((options[1].body.get('files') as File).name).toBe('brief.txt')
  expect(options[1].body.get('service_required')).toBe('publishing_editorial')
  expect(options[1].body.get('full_name')).toBe('Test Customer')
  expect(JSON.parse(String(options[1].body.get('project_description')))).toBe(brief)
  complete(
    new Response(JSON.stringify({ reference: '123', notification: 'unavailable' }), {
      status: 201,
    }),
  )
  await waitFor(() =>
    expect(screen.getByText('Your project enquiry has been submitted.')).toBeTruthy(),
  )
  expect(screen.queryByRole('button', { name: 'Submit Project Enquiry' })).toBeNull()
})

it('opens project requirements for a valid service and allows changing the selection', () => {
  render(<QuoteForm initialService="localization_dtp" />)
  expect(screen.getByRole('heading', { name: 'Project Requirements' })).toBeTruthy()
  expect(
    screen.getByText('Localization & Multilingual Production', { selector: 'strong' }),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Change service' }))
  expect(
    (
      screen.getByRole('radio', {
        name: 'Localization & Multilingual Production',
      }) as HTMLInputElement
    ).checked,
  ).toBe(true)
})

it('starts at service selection for an unknown service category', () => {
  render(<QuoteForm initialService="untrusted-value" />)
  expect(screen.getAllByRole('radio').every((input) => !(input as HTMLInputElement).checked)).toBe(
    true,
  )
})
