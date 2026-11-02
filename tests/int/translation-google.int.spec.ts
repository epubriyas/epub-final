import { afterEach, expect, it, vi } from 'vitest'
import { languages } from '@/config/languages'

const { translate, client } = vi.hoisted(() => ({ translate: vi.fn(), client: vi.fn() }))
vi.mock('@google-cloud/translate', () => ({
  v2: {
    Translate: class {
      constructor(options: unknown) {
        client(options)
      }
      translate = translate
    },
  },
}))
afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

it('translates the entire batch using the requested language and server credentials', async () => {
  vi.stubEnv('GOOGLE_TRANSLATE_API_KEY', 'test-key')
  translate.mockResolvedValue([['Bonjour', 'Votre contenu']])
  const { translateWithGoogle } = await import('@/lib/i18n/google')
  expect(await translateWithGoogle(['Hello', 'Your content'], 'fr')).toEqual([
    'Bonjour',
    'Votre contenu',
  ])
  expect(client).toHaveBeenCalledWith(expect.objectContaining({ key: 'test-key' }))
  expect(translate).toHaveBeenCalledWith(['Hello', 'Your content'], {
    from: 'en',
    to: 'fr',
    format: 'text',
  })
})

it('rejects incomplete responses instead of marking the page fully translated', async () => {
  translate.mockResolvedValue([['Bonjour']])
  const { translateWithGoogle } = await import('@/lib/i18n/google')
  await expect(translateWithGoogle(['Hello', 'Your content'], 'fr')).rejects.toThrow(
    'Invalid translation response',
  )
})

it.each(languages.filter((language) => language.code !== 'en'))(
  'forwards the $name locale to Google',
  async ({ code }) => {
    translate.mockResolvedValue([['Translated text']])
    const { translateWithGoogle } = await import('@/lib/i18n/google')
    await translateWithGoogle(['Public content'], code)
    expect(translate).toHaveBeenCalledWith(['Public content'], {
      from: 'en',
      to: code,
      format: 'text',
    })
  },
)
