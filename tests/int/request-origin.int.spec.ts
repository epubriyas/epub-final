import { afterEach, describe, expect, it, vi } from 'vitest'
import { isTrustedOrigin, trustedOrigins } from '@/lib/request-origin'

afterEach(() => vi.unstubAllEnvs())

const request = (origin?: string, url = 'https://epubtrans-v2.vercel.app/api/assistant') =>
  new Request(url, { headers: origin ? { origin } : {} })

describe('production request origins', () => {
  it('accepts same-origin production requests despite a stale localhost setting', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'http://localhost:3001')
    expect(isTrustedOrigin(request('https://epubtrans-v2.vercel.app'))).toBe(true)
  })

  it('accepts exact Vercel deployment aliases behind an internal request URL', () => {
    vi.stubEnv('VERCEL_URL', 'epubtrans-build-team.vercel.app')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'epubtrans-v2.vercel.app')
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://www.epubtrans.com/')
    for (const origin of [
      'https://epubtrans-build-team.vercel.app',
      'https://epubtrans-v2.vercel.app',
      'https://www.epubtrans.com',
    ]) {
      expect(isTrustedOrigin(request(origin, 'http://internal:3000/api/assistant'))).toBe(true)
    }
    expect(trustedOrigins()).toContain('https://www.epubtrans.com')
  })

  it('rejects missing, malformed, cross-site and lookalike origins', () => {
    for (const origin of [
      undefined,
      'null',
      'https://evil.vercel.app',
      'https://epubtrans-v2.vercel.app.evil.com',
      'https://epubtrans-v2.vercel.app/path',
      'https://user@epubtrans-v2.vercel.app',
    ]) {
      expect(isTrustedOrigin(request(origin))).toBe(false)
    }
  })
})
