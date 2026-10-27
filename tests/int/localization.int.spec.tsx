// @vitest-environment jsdom
import React from 'react'
import { render, screen, waitFor, cleanup, fireEvent, act } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { LocaleProvider, useLocaleNavigation } from '@/components/i18n/LocaleProvider'
const { routePush } = vi.hoisted(() => ({ routePush: vi.fn() }))
vi.mock('next/navigation', () => ({
  usePathname: () => window.location.pathname,
  useRouter: () => ({ push: routePush }),
}))
vi.mock('next/link', () => ({
  default: ({ children, href }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href}>{children}</a>
  ),
}))
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
  routePush.mockReset()
})
describe('native language reading', () => {
  it('repairs a duplicated cached fragment without reloading the page or changing input state', async () => {
    window.history.replaceState({}, '', '/fr/get-a-quote?service=ebook_xml#brief')
    routePush.mockImplementation((destination: string) => {
      window.history.pushState({}, '', destination + '#brief')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    function Switch() {
      const navigate = useLocaleNavigation()
      return <button onClick={() => navigate('en')}>Original English</button>
    }
    render(
      <LocaleProvider locale="fr" configured={false}>
        <Switch />
        <input aria-label="Private draft" defaultValue="Retained draft" />
      </LocaleProvider>,
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Edited private draft' } })
    fireEvent.click(screen.getByRole('button', { name: 'Original English' }))
    await waitFor(() =>
      expect(window.location.pathname + window.location.search + window.location.hash).toBe(
        '/get-a-quote?service=ebook_xml#brief',
      ),
    )
    expect(routePush).toHaveBeenCalledWith('/get-a-quote?service=ebook_xml#brief', {
      scroll: false,
    })
    expect(screen.getByRole('textbox')).toHaveProperty('value', 'Edited private draft')
  })

  it('does not treat unchanged English responses as translated content', async () => {
    window.history.replaceState({}, '', '/fr/typesetting-services?source=test#process')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ translations: { 'A publishing project.': 'A publishing project.' } }),
      })),
    )
    render(
      <LocaleProvider locale="fr">
        <h1>A publishing project.</h1>
      </LocaleProvider>,
    )
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Translation unavailable'),
    )
    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByRole('link', { name: 'English' }).getAttribute('href')).toBe(
      '/typesetting-services?source=test#process',
    )
  })

  it('translates option labels and alternative text without changing values or private entries', async () => {
    window.history.replaceState({}, '', '/ar')
    const sent: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url, options) => {
        const { texts } = JSON.parse(options.body)
        sent.push(...texts)
        return {
          ok: true,
          json: async () => ({
            translations: Object.fromEntries(texts.map((text: string) => [text, 'اختبار ' + text])),
          }),
        }
      }),
    )
    render(
      <LocaleProvider locale="ar">
        <select aria-label="Enquiry type">
          <option value="general">General enquiry</option>
        </select>
        {/* eslint-disable-next-line @next/next/no-img-element -- DOM-only alternative-text fixture. */}
        <img src="/example.png" alt="Publication diagram" />
        <input type="email" defaultValue="private@example.invalid" />
        <ul className="qp-upload-list">
          <li>private-client-manuscript.docx</li>
        </ul>
      </LocaleProvider>,
    )
    await waitFor(() =>
      expect(screen.getByRole('option').textContent).toBe('اختبار General enquiry'),
    )
    expect(screen.getByRole('option').getAttribute('value')).toBe('general')
    expect(screen.getByRole('img').getAttribute('alt')).toBe('اختبار Publication diagram')
    expect(screen.getByRole('textbox').getAttribute('dir')).toBe('ltr')
    expect(sent.join(' ')).not.toContain('private@example.invalid')
    expect(sent.join(' ')).not.toContain('private-client-manuscript.docx')
  })

  it('uses fixed Tamil wording even when the external provider is unavailable', async () => {
    window.history.replaceState({}, '', '/ta')
    const fetchTranslation = vi.fn(async (_url: string, _options: { body: string }) => ({
      ok: false,
    }))
    vi.stubGlobal('fetch', fetchTranslation)
    render(
      <LocaleProvider locale="ta" configured>
        <h1>Your content.</h1>
        <nav>What We Do</nav>
        <p>Unregistered dynamic public sentence.</p>
      </LocaleProvider>,
    )
    await waitFor(() => expect(screen.getByRole('heading').textContent).toBe('உங்கள் உள்ளடக்கம்.'))
    expect(screen.getByRole('navigation').textContent).toBe('எங்கள் சேவைகள்')
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Some text could not be translated'),
    )
    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByRole('heading').getAttribute('lang')).toBe('ta')
    expect(JSON.parse(fetchTranslation.mock.calls[0]?.[1]?.body || '{}').texts).not.toContain(
      'What We Do',
    )
  })
  it('retains the successful first batch when a later batch fails', async () => {
    window.history.replaceState({}, '', '/hi')
    const fetchTranslation = vi.fn(async (_url, options) => {
      if (fetchTranslation.mock.calls.length > 1) return { ok: false }
      const { texts } = JSON.parse(options.body)
      return {
        ok: true,
        json: async () => ({
          translations: Object.fromEntries(texts.map((text: string) => [text, `अनुवाद ${text}`])),
        }),
      }
    })
    vi.stubGlobal('fetch', fetchTranslation)
    render(
      <LocaleProvider locale="hi" configured>
        {Array.from({ length: 33 }, (_, index) => (
          <p key={index}>{`Public sentence ${index}`}</p>
        ))}
      </LocaleProvider>,
    )
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Some text could not be translated'),
    )
    expect(screen.getByText('अनुवाद Public sentence 0')).toBeDefined()
    expect(screen.getByText('Public sentence 32')).toBeDefined()
    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByText('अनुवाद Public sentence 0').getAttribute('lang')).toBe('hi')
  })
  it('reports partial server results without discarding their translated content', async () => {
    window.history.replaceState({}, '', '/hi')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ translations: { 'Your content.': 'आपकी सामग्री।' }, partial: true }),
      })),
    )
    render(
      <LocaleProvider locale="hi" configured>
        <h1>Your content.</h1>
        <p>Untranslated sentence.</p>
      </LocaleProvider>,
    )
    await waitFor(() => expect(screen.getByRole('heading').textContent).toBe('आपकी सामग्री।'))
    expect(screen.getByRole('status').textContent).toContain('Some text could not be translated')
    expect(screen.getByRole('button', { name: 'Retry translation' })).toBeDefined()
  })
  it('translates visible copy and accessibility labels without sending private values', async () => {
    window.history.replaceState({}, '', '/hi/company/careers')
    const requests: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url, options) => {
        const body = JSON.parse(options.body)
        requests.push(...body.texts)
        return {
          ok: true,
          json: async () => ({
            translations: Object.fromEntries(
              body.texts.map((text: string) => [
                text,
                text === 'Your content.'
                  ? 'आपकी सामग्री।'
                  : text === 'Open navigation'
                    ? 'नेविगेशन खोलें'
                    : text,
              ]),
            ),
          }),
        }
      }),
    )
    render(
      <LocaleProvider locale="hi" configured>
        <h1>Your content.</h1>
        <button aria-label="Open navigation">Menu</button>
        <span data-private>Private applicant email and project details</span>
        <input defaultValue="private@example.invalid" />
      </LocaleProvider>,
    )
    await waitFor(() => expect(screen.getByRole('heading').textContent).toBe('आपकी सामग्री।'))
    expect(screen.getByRole('button', { name: 'नेविगेशन खोलें' })).toBeDefined()
    expect(requests.join(' ')).not.toContain('Private applicant')
    expect(requests.join(' ')).not.toContain('private@example.invalid')
    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByRole('heading').getAttribute('lang')).toBe('hi')
  })
  it('Arabic sets RTL only after a successful translated response', async () => {
    window.history.replaceState({}, '', '/ar')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ translations: { 'Your content.': 'المحتوى الخاص بك.' } }),
      })),
    )
    render(
      <LocaleProvider locale="ar" configured>
        <h1>Your content.</h1>
      </LocaleProvider>,
    )
    await waitFor(() => expect(document.documentElement.dir).toBe('rtl'))
  })
  it('missing configuration keeps the original content and reports the limitation', () => {
    window.history.replaceState({}, '', '/ta')
    render(
      <LocaleProvider locale="ta" configured={false}>
        <h1>Your content.</h1>
      </LocaleProvider>,
    )
    expect(screen.getByRole('heading').textContent).toBe('Your content.')
    expect(screen.getByRole('status').textContent).toContain('Translation unavailable')
  })
  it('translates content opened while the first request is still running', async () => {
    window.history.replaceState({}, '', '/hi')
    let finish: (() => void) | undefined
    const fetchTranslation = vi.fn(async (_url, options) => {
      const { texts } = JSON.parse(options.body)
      if (texts.includes('Your content.'))
        await new Promise<void>((resolve) => {
          finish = resolve
        })
      return {
        ok: true,
        json: async () => ({
          translations: Object.fromEntries(
            texts.map((text: string) => [
              text,
              text === 'Your content.' ? 'आपकी सामग्री।' : 'नेविगेशन खोलें',
            ]),
          ),
        }),
      }
    })
    vi.stubGlobal('fetch', fetchTranslation)
    const { container } = render(
      <LocaleProvider locale="hi" configured>
        <h1>Your content.</h1>
      </LocaleProvider>,
    )
    await waitFor(() => expect(finish).toBeDefined())
    const menu = document.createElement('button')
    menu.textContent = 'Open navigation'
    container.append(menu)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 220))
    })
    await act(async () => {
      finish?.()
    })
    await waitFor(() => expect(menu.textContent).toBe('नेविगेशन खोलें'))
    expect(fetchTranslation).toHaveBeenCalledTimes(2)
  })
  it('does not claim success when the API returns no translations', async () => {
    window.history.replaceState({}, '', '/hi')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ translations: {} }),
      })),
    )
    render(
      <LocaleProvider locale="hi" configured>
        <h1>Your content.</h1>
      </LocaleProvider>,
    )
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Translation unavailable'),
    )
    expect(screen.getByRole('heading').textContent).toBe('Your content.')
    expect(document.documentElement.lang).toBe('en')
  })
  it('can retry a failed request and restore English on a language change', async () => {
    window.history.replaceState({}, '', '/hi')
    const fetchTranslation = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValue({
        ok: true,
        json: async () => ({ translations: { 'Your content.': 'आपकी सामग्री।' } }),
      })
    vi.stubGlobal('fetch', fetchTranslation)
    const { rerender } = render(
      <LocaleProvider locale="hi" configured>
        <h1>Your content.</h1>
      </LocaleProvider>,
    )
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Retry translation' })).toBeDefined(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Retry translation' }))
    await waitFor(() => expect(screen.getByRole('heading').textContent).toBe('आपकी सामग्री।'))
    window.history.replaceState({}, '', '/')
    rerender(
      <LocaleProvider locale="en" configured>
        <h1>Your content.</h1>
      </LocaleProvider>,
    )
    await waitFor(() => expect(screen.getByRole('heading').textContent).toBe('Your content.'))
    expect(document.documentElement.lang).toBe('en')
    expect(screen.queryByRole('status')).toBeNull()
  })
})
