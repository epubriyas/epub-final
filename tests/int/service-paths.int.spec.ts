import { describe, expect, it } from 'vitest'
import {
  servicePath,
  servicePaths,
  serviceRedirects,
  serviceSlugForPath,
} from '@/config/service-paths'

describe('V1 service URL contract', () => {
  it('maps all 15 records to distinct root URLs with reversible redirects', () => {
    expect(Object.keys(servicePaths)).toHaveLength(15)
    expect(new Set(Object.values(servicePaths)).size).toBe(15)
    for (const [slug, path] of Object.entries(servicePaths)) {
      expect(servicePath(slug)).toBe(path)
      expect(path).toMatch(/^\/[a-z-]+-services$/)
      expect(serviceSlugForPath(path)).toBe(slug)
      expect(serviceRedirects[`/services/${slug}`]).toBe(path)
      expect(serviceRedirects[path]).toBeUndefined()
    }
  })
  it('keeps the graphic design URL exactly as requested', () => {
    expect(servicePath('graphic-design-image-services')).toBe('/graphic-design-image-services')
  })
  it('does not treat inherited object keys as service records', () => {
    expect(servicePath('toString')).toBe('/services/toString')
    expect(serviceSlugForPath('/not-a-service-services')).toBeUndefined()
  })
})
