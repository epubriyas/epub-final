import { expect, it } from 'vitest'
import { validateQuoteFiles } from '@/lib/quote-uploads'
it('accepts optional files and supported project documents', () => {
  expect(validateQuoteFiles([])).toBe('')
  expect(validateQuoteFiles([{ name: 'brief.pdf', size: 1024 }])).toBe('')
})
it('rejects excess, oversized, empty and unsupported files', () => {
  expect(
    validateQuoteFiles(Array.from({ length: 4 }, () => ({ name: 'brief.txt', size: 12 }))),
  ).not.toBe('')
  expect(validateQuoteFiles([{ name: 'brief.pdf', size: 1024 * 1024 + 1 }])).not.toBe('')
  expect(validateQuoteFiles([{ name: 'brief.txt', size: 0 }])).not.toBe('')
  expect(validateQuoteFiles([{ name: 'script.exe', size: 12 }])).not.toBe('')
})
