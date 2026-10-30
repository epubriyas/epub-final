import { describe, expect, it } from 'vitest'
import { getMediaUrl } from '../../src/utilities/getMediaUrl'

describe('media cache URLs', () => {
  it('preserves the storage prefix when adding a cache version', () => {
    const result = getMediaUrl('/api/media/file/exact_reference_image.png?prefix=media', '2026-10-30T05:23:29.267Z')
    const url = new URL(result, 'https://example.com')
    expect(url.searchParams.get('prefix')).toBe('media')
    expect(url.searchParams.get('v')).toBe('2026-10-30T05:23:29.267Z')
  })

  it('supports plain paths, remote URLs, and fragments', () => {
    expect(getMediaUrl('/image.png', '1')).toBe('/image.png?v=1')
    expect(getMediaUrl('https://cdn.example.com/image.png?prefix=media#preview', '2'))
      .toBe('https://cdn.example.com/image.png?prefix=media&v=2#preview')
    expect(getMediaUrl('/image.png?prefix=media')).toBe('/image.png?prefix=media')
    expect(getMediaUrl(null, '1')).toBe('')
  })
})
