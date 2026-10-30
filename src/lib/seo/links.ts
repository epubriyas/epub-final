export type LinkClassification = 'auto' | 'editorial' | 'trusted' | 'sponsored'
export type AffiliateRule = {
  hostname: string
  includeSubdomains?: boolean
  pathPrefix?: string
  queryParameter?: string
}
export type LinkPolicy = { primaryURL: string; affiliateRules: readonly AffiliateRule[] }

/** Parse first: substring matches must never establish domain ownership. */
export function seoLink(
  href: string,
  policy: LinkPolicy,
  classification: LinkClassification = 'auto',
  newTab = false,
): { href?: string; target?: '_blank'; rel?: string } {
  let url: URL
  let primary: URL
  try {
    primary = new URL(policy.primaryURL)
    url = new URL(href, primary)
  } catch {
    return {}
  }
  if (!href.trim() || /[\u0000-\u001f\u007f]/.test(href)) return {}
  if (!['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol)) return {}
  if (url.username || url.password) return {}
  const web = ['https:', 'http:'].includes(url.protocol)
  const normalize = (host: string) => host.toLowerCase().replace(/^www\./, '')
  const internal = web && normalize(url.hostname) === normalize(primary.hostname)
  const affiliate =
    classification === 'sponsored' ||
    (classification === 'auto' &&
      web &&
      policy.affiliateRules.some((rule) => {
        const host = url.hostname.toLowerCase()
        const expected = rule.hostname.toLowerCase()
        return (
          (host === expected || (rule.includeSubdomains && host.endsWith(`.${expected}`))) &&
          (!rule.pathPrefix || url.pathname.startsWith(rule.pathPrefix)) &&
          (!rule.queryParameter || Boolean(url.searchParams.get(rule.queryParameter)))
        )
      }))
  const blank = newTab || (classification === 'trusted' && web && !internal)
  const rel = [
    ...(affiliate ? ['sponsored', 'nofollow'] : []),
    ...(blank ? ['noopener'] : []),
  ].join(' ')
  return { href, ...(blank ? { target: '_blank' as const } : {}), ...(rel ? { rel } : {}) }
}
