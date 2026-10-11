import { describe, it, expect } from 'vitest'
import { runInNewContext } from 'node:vm'
import { InitTheme } from '@/providers/Theme/InitTheme'

function bootstrap(saved: string | null, cookie = '', blockedStorage = false) {
  const attributes: Record<string, string> = {}
  const script = InitTheme().props.dangerouslySetInnerHTML.__html
  runInNewContext(script, {
    localStorage: {
      getItem: () => {
        if (blockedStorage) throw new Error('Storage blocked')
        return saved
      },
    },
    document: {
      cookie,
      documentElement: {
        setAttribute: (key: string, value: string) => {
          attributes[key] = value
        },
      },
      querySelector: () => null,
    },
  })
  return attributes
}

describe('manual theme bootstrap', () => {
  it.each([null, 'auto', 'invalid'])('defaults to light for %s', (saved) => {
    expect(bootstrap(saved)['data-theme']).toBe('light')
  })
  it.each(['light', 'dark'])('preserves saved %s preference', (saved) => {
    expect(bootstrap(saved)['data-theme']).toBe(saved)
  })
  it('resets a former automatic preference even with a resolved dark cookie', () => {
    expect(bootstrap('auto', 'epubtrans-theme=dark')['data-theme']).toBe('light')
    expect(
      bootstrap(null, 'epubtrans-theme-preference=auto; epubtrans-theme=dark')['data-theme'],
    ).toBe('light')
  })
  it('uses a saved manual cookie when storage is blocked', () => {
    expect(bootstrap(null, 'epubtrans-theme=dark', true)['data-theme']).toBe('dark')
  })
})
