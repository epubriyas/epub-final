import defaults from '@/config/landing-content.json'

export type HomeLandingContent = typeof defaults.home
export type ServicesLandingContent = typeof defaults.directory

// Validate JSON editor input before saving, including arrays and internal destinations.
export function validateLandingContent(
  value: unknown,
  template: unknown,
  key = 'content',
): true | string {
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return `${key} must be an array.`
    for (const item of value) {
      const result = validateLandingContent(item, template[0], key)
      if (result !== true) return result
    }
    return true
  }
  if (template && typeof template === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return `${key} must be an object.`
    for (const [name, example] of Object.entries(template)) {
      const result = validateLandingContent((value as Record<string, unknown>)[name], example, name)
      if (result !== true) return result
    }
    return true
  }
  if (typeof value !== typeof template) return `${key} must be ${typeof template}.`
  if (typeof value === 'string') {
    if (!value.trim()) return `${key} cannot be empty.`
    if (['href', 'canonicalUrl'].includes(key) && !/^\/(?!\/)[^\s\\]*$/.test(value)) {
      return `${key} must be a site-relative destination beginning with /.`
    }
    if (key === 'anchorId' && !/^[a-z][a-z0-9-]*$/.test(value)) return 'Use a lowercase anchor ID.'
    if (key === 'status' && !['active', 'pendingApproval', 'hidden'].includes(value))
      return 'Invalid card status.'
  }
  if (typeof value === 'number' && !Number.isFinite(value)) return `${key} must be finite.`
  return true
}

export function validateDirectory(value: unknown): true | string {
  const result = validateLandingContent(value, defaults.directory)
  if (result !== true) return result
  const directory = value as ServicesLandingContent
  const categoryIds = directory.categories.map((category) => category.anchorId)
  const audienceIds = directory.audience.cards.map((card) => card.anchorId)
  if (
    audienceIds.length !== 2 ||
    !audienceIds.includes('for-publishers') ||
    !audienceIds.includes('for-localization-providers')
  )
    return 'Both named audience pathway anchors are required.'
  const ids = [...categoryIds, ...audienceIds]
  return new Set(ids).size === ids.length || 'Directory anchor IDs must be unique.'
}
