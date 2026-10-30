import type { AffiliateRule } from '@/lib/seo/links'

// Only unambiguous tracking signals are enabled. Add host-scoped redirect paths
// (e.g. { hostname: YOUR_HOST, pathPrefix: '/go/' }) when used commercially.
export const blogAffiliateRules: readonly AffiliateRule[] = [
  { hostname: 'amazon.com', includeSubdomains: true, queryParameter: 'tag' },
  { hostname: 'hop.clickbank.net', includeSubdomains: true },
]
