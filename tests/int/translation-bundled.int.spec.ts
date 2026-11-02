import { afterEach, expect, it, vi } from 'vitest'
import bundled from '@/lib/i18n/bundled.json'
import { fixedTranslation } from '@/lib/i18n/fixed-translations'

const { provider, readFile } = vi.hoisted(() => ({ provider: vi.fn(), readFile: vi.fn() }))
vi.mock('@/lib/i18n/free', () => ({ translateWithoutKey: provider }))
vi.mock('node:fs/promises', () => ({ readFile, mkdir: vi.fn(), writeFile: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())

it('serves saved Hindi page content with no disk cache or translation service', async () => {
  vi.stubEnv('TRANSLATION_PROVIDER', 'free')
  provider.mockRejectedValue(new Error('Rate limited'))
  readFile.mockRejectedValue(new Error('No writable cache'))
  const { translatePublicText } = await import('@/lib/i18n/translate')
  const sources = Object.keys(bundled.hi)
  expect(sources.length).toBeGreaterThan(200)
  expect(await translatePublicText(sources, 'hi')).toEqual(
    sources.map(
      (source) => fixedTranslation(source, 'hi') || bundled.hi[source as keyof typeof bundled.hi],
    ),
  )
  expect(provider).not.toHaveBeenCalled()
  expect(readFile).not.toHaveBeenCalled()
})
