/** Exact origins only: never trust an arbitrary *.vercel.app site. */
function originOf(value?: string): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.origin : undefined
  } catch {
    return undefined
  }
}

export function trustedOrigins(): string[] {
  return [
    ...new Set(
      [
        originOf(process.env.NEXT_PUBLIC_SERVER_URL),
        ...[
          process.env.VERCEL_PROJECT_PRODUCTION_URL,
          process.env.VERCEL_URL,
          process.env.VERCEL_BRANCH_URL,
        ].map((host) => (host ? originOf(`https://${host}`) : undefined)),
      ].filter((origin): origin is string => Boolean(origin)),
    ),
  ]
}

export function isTrustedOrigin(request: Request): boolean {
  const supplied = request.headers.get('origin')
  const origin = originOf(supplied || undefined)
  // Origin headers must contain only an origin, not credentials or a path.
  if (!origin || supplied !== origin) return false
  return origin === originOf(request.url) || trustedOrigins().includes(origin)
}
