import { describe, expect, it } from 'vitest'
import { getAssistantReply } from '@/lib/assistant'
describe('EPUBTRANS project guidance', () => {
  it('routes contact enquiries to the separate contact page', () => {
    expect(getAssistantReply('How can I contact your team?').links?.[0].href).toBe('/contact-us')
  })
  it('understands a translation question and carries its context into a follow-up', () => {
    const first = getAssistantReply('I need to translate a brochure')
    expect(first.topic).toBe('localization')
    expect(first.links?.[0].href).toBe('/translation-services')
    expect(getAssistantReply('I need translation services').topic).toBe('localization')
    const followup = getAssistantReply('It is 200 pages for next month', first.topic)
    expect(followup.topic).toBe('localization')
    expect(followup.links?.some((link) => link.href === '/get-a-quote')).toBe(true)
  })
  it('hands off pricing and deadlines without inventing an estimate', () => {
    const reply = getAssistantReply('How much does it cost and can you deliver tomorrow?')
    expect(reply.text).toContain('depend on')
    expect(reply.links?.[0].href).toBe('/get-a-quote')
    expect(reply.text).not.toMatch(/guarantee|₹|\$\d/)
  })
  it('routes job enquiries to careers and unknown questions to a useful starting point', () => {
    expect(getAssistantReply('Are you hiring?').links?.[0].href).toBe('/company/careers')
    expect(
      getAssistantReply('Something unrelated').links?.some((link) => link.href === '/contact-us'),
    ).toBe(true)
  })
})
