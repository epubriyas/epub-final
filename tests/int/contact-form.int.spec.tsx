// @vitest-environment jsdom
import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ContactForm } from '@/components/forms/ContactForm'

vi.mock('@/components/i18n/LocalizedLink', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('retains values after a failed attempt and shows approved confirmation only after acceptance', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Please check the highlighted fields.', errors: { message: 'Please complete this field.' } }), { status: 422 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ enquiryId: '21' }), { status: 201 }))
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => { callback(); return 0 })
  render(<ContactForm />)
  fireEvent.change(screen.getByLabelText('Your Name *'), { target: { value: 'Test Customer' } })
  fireEvent.change(screen.getByLabelText('Business Email *'), { target: { value: 'test@example.com' } })
  fireEvent.change(screen.getByLabelText('Enquiry Type *'), { target: { value: 'general' } })
  fireEvent.change(screen.getByLabelText('Your Message *'), { target: { value: 'A general business question.' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send Enquiry' }))
  await waitFor(() => expect(screen.getByLabelText('Your Message *')).toBeTruthy())
  expect((screen.getByLabelText('Your Message *') as HTMLTextAreaElement).value).toBe('A general business question.')
  fireEvent.click(screen.getByRole('button', { name: 'Send Enquiry' }))
  await waitFor(() => expect(screen.getByText('Thank you for contacting EPUBTRANS.')).toBeTruthy())
  expect(fetchMock).toHaveBeenCalledTimes(2)
})
