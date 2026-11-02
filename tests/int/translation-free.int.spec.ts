import { afterEach, expect, it, vi } from 'vitest'

const { google, fallback } = vi.hoisted(() => ({ google: vi.fn(), fallback: vi.fn() }))
vi.mock('@vitalets/google-translate-api', () => ({ translate: google }))
vi.mock('@/lib/i18n/mymemory', () => ({ translateWithMyMemory: fallback }))
afterEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
})

it('translates without credentials and shares identical in-flight requests', async () => {
  google.mockResolvedValue({ text: 'Bonjour' })
  const { translateWithoutKey } = await import('@/lib/i18n/free')
  expect(
    await Promise.all([translateWithoutKey('Hello', 'fr'), translateWithoutKey('Hello', 'fr')]),
  ).toEqual(['Bonjour', 'Bonjour'])
  expect(google).toHaveBeenCalledTimes(1)
  expect(google).toHaveBeenCalledWith('Hello', expect.objectContaining({ from: 'en', to: 'fr' }))
  expect(fallback).not.toHaveBeenCalled()
})

it('falls back on provider failure and keeps processing later text', async () => {
  google.mockRejectedValueOnce(new Error('Rate limited')).mockResolvedValueOnce({ text: 'Merci' })
  fallback.mockRejectedValueOnce(new Error('Quota reached'))
  const { translateWithoutKey } = await import('@/lib/i18n/free')
  await expect(translateWithoutKey('Hello', 'fr')).rejects.toThrow('Quota reached')
  await expect(translateWithoutKey('Thank you', 'fr')).resolves.toBe('Merci')
})
