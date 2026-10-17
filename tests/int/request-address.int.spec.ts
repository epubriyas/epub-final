import { afterEach, expect, it, vi } from 'vitest'
import { requestAddress } from '@/lib/request-address'

afterEach(() => vi.unstubAllEnvs())

it('keeps different Vercel visitors out of a shared local rate-limit bucket', () => {
  vi.stubEnv('VERCEL', '1')
  for (const address of ['192.0.2.1', '192.0.2.2']) {
    const request = new Request('https://epubtrans-v2.vercel.app/api/assistant', {
      headers: { 'x-vercel-forwarded-for': address },
    })
    expect(requestAddress(request)).toBe(address)
  }
})

it('ignores untrusted forwarded headers outside Vercel and the configured nginx proxy', () => {
  vi.stubEnv('VERCEL', '')
  vi.stubEnv('TRUST_NGINX_PROXY', 'false')
  const request = new Request('http://localhost:3000/api/assistant', {
    headers: { 'x-forwarded-for': '192.0.2.1' },
  })
  expect(requestAddress(request)).toBe('local')
})
