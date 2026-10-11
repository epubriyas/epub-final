import { beforeEach, afterEach, expect, it, vi } from 'vitest'
const { provider, readFile, writeFile } = vi.hoisted(() => ({
  provider: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
}))
vi.mock('@/lib/i18n/mymemory', () => ({ translateWithMyMemory: provider }))
vi.mock('node:fs/promises', () => ({ mkdir: vi.fn(), readFile, writeFile }))
beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  readFile.mockRejectedValue(new Error('Not cached'))
  vi.stubEnv('GOOGLE_TRANSLATE_API_KEY', '')
})
afterEach(() => vi.unstubAllEnvs())

it('fixed Tamil copy overrides inaccurate cached provider output', async () => {
  readFile.mockResolvedValue('incorrect old translation')
  const { translatePublicText } = await import('@/lib/i18n/translate')
  expect(await translatePublicText(['What We Do', 'Solutions'], 'ta')).toEqual([
    'எங்கள் சேவைகள்',
    'தீர்வுகள்',
  ])
  expect(await translatePublicText(['A wider world.', 'a wider world.'], 'ta')).toEqual([
    'விரிந்த உலகம்.',
    'விரிந்த உலகத்திற்காக.',
  ])
  expect(provider).not.toHaveBeenCalled()
  expect(readFile).not.toHaveBeenCalled()
})
it('returns and caches successful segments even if another segment fails', async () => {
  provider.mockImplementation(async (text: string) => {
    if (text === 'Public text B') throw new Error('Quota unavailable')
    return 'Texte public A'
  })
  const { translatePublicText } = await import('@/lib/i18n/translate')
  expect(await translatePublicText(['Public text A', 'Public text B'], 'fr')).toEqual([
    'Texte public A',
    undefined,
  ])
  expect(writeFile).toHaveBeenCalledWith(expect.any(String), 'Texte public A', { mode: 0o600 })
  provider.mockResolvedValue('Texte public B')
  expect(await translatePublicText(['Public text A', 'Public text B'], 'fr')).toEqual([
    'Texte public A',
    'Texte public B',
  ])
  expect(provider.mock.calls.filter(([text]) => text === 'Public text A')).toHaveLength(1)
})
