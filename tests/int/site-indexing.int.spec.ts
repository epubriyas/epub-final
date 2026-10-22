import { describe, expect, it } from 'vitest'
import { siteCanBeIndexed } from '../../src/lib/site-indexing.cjs'

describe('environment-specific search indexing', () => {
  it('blocks Vercel staging, localhost, preview builds and lookalike hosts', () => {
    for (const url of [
      'https://epubtrans-v2.vercel.app',
      'http://localhost:3000',
      'https://www.epubtrans.com.example.org',
      'invalid',
    ]) {
      expect(siteCanBeIndexed(url, 'production')).toBe(false)
    }
    expect(siteCanBeIndexed('https://www.epubtrans.com', 'preview')).toBe(false)
  })
  it('allows the future self-hosted production domain without a Vercel dependency', () => {
    expect(siteCanBeIndexed('https://www.epubtrans.com', undefined)).toBe(true)
    expect(siteCanBeIndexed('https://epubtrans.com', 'production')).toBe(true)
    expect(siteCanBeIndexed('http://www.epubtrans.com', 'production')).toBe(false)
  })
})
