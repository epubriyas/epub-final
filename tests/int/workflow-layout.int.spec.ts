import { describe, expect, it } from 'vitest'
import { compactWorkflow } from '@/lib/service-handoff'

describe('compact service workflows', () => {
  it.each([1, 2, 3, 4, 5, 6])('keeps %i steps intact', (count) => {
    const steps = Array.from({ length: count }, (_, index) => [index])
    expect(compactWorkflow(steps, (group) => group.flat())).toEqual(steps)
  })
  it.each([7, 8, 9, 12])(
    'balances %i steps across four groups without losing order or content',
    (count) => {
      const steps = Array.from({ length: count }, (_, index) => [index])
      const groups = compactWorkflow(steps, (group) => group.flat())
      expect(groups).toHaveLength(4)
      expect(groups.flat()).toEqual(steps.flat())
      const sizes = groups.map((group) => group.length)
      expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1)
    },
  )
})
