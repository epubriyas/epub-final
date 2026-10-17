/** Use proxy headers only when the configured hosting platform owns them. */
export function requestAddress(request: Request): string {
  if (process.env.VERCEL === '1') {
    return (
      request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'
    )
  }
  if (process.env.TRUST_NGINX_PROXY === 'true') {
    return request.headers.get('x-real-ip') || 'unknown'
  }
  return 'local'
}
