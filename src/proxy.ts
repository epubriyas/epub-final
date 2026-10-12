import { NextRequest, NextResponse } from 'next/server'
import { legacyRedirects } from '@/config/redirects'
import { serviceRedirects } from '@/config/service-paths'
import { getLanguage, languagePath } from '@/config/languages'
export function proxy(request: NextRequest) {
  const original = request.nextUrl.pathname.replace(/\/$/, '') || '/'
  const parts = original.split('/'),
    language = getLanguage(parts[1])
  const preferred = getLanguage(request.cookies.get('epubtrans-language')?.value || 'en')
  const locale = language?.code || 'en'
  const pathname = language ? '/' + parts.slice(2).join('/') : original
  if (language && /^\/(api|admin|next|_next)(\/|$)/.test(pathname))
    return new NextResponse(null, { status: 404 })
  const target =
    pathname === '/careers'
      ? '/company/careers'
      : pathname === '/insights' || pathname === '/posts'
        ? '/resources'
        : pathname.startsWith('/insights/')
          ? pathname.replace('/insights/', '/resources/')
          : pathname.startsWith('/posts/page/')
            ? '/resources'
            : pathname.startsWith('/posts/')
              ? pathname.replace('/posts/', '/resources/')
              : serviceRedirects[pathname] || legacyRedirects[pathname]
  if (target) {
    const url = request.nextUrl.clone()
    url.pathname = languagePath(target, locale)
    return NextResponse.redirect(url, 301)
  }
  if (language?.code === 'en') {
    const url = request.nextUrl.clone()
    url.pathname = pathname
    const response = NextResponse.redirect(url, 307)
    response.cookies.set('epubtrans-language', 'en', {
      path: '/',
      sameSite: 'lax',
      maxAge: 31536000,
      secure: request.nextUrl.protocol === 'https:',
    })
    return response
  }
  if (original === '/' && !language && preferred && preferred.code !== 'en') {
    const url = request.nextUrl.clone()
    url.pathname = languagePath('/', preferred.code)
    return NextResponse.redirect(url, 307)
  }
  const headers = new Headers(request.headers)
  headers.set('x-epubtrans-language', locale)
  if (language) {
    const url = request.nextUrl.clone()
    url.pathname = pathname
    return NextResponse.rewrite(url, { request: { headers } })
  }
  return NextResponse.next({ request: { headers } })
}
export const config = { matcher: ['/((?!api|admin|next/|_next|.*\\..*).*)'] }
