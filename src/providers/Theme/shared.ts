import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'
export const themeCookieKey = 'epubtrans-theme'
export const themePreferenceCookieKey = 'epubtrans-theme-preference'

export const defaultTheme: Theme = 'light'

export const getImplicitPreference = (): Theme | null => {
  const mediaQuery = '(prefers-color-scheme: dark)'
  const mql = window.matchMedia(mediaQuery)
  const hasImplicitPreference = typeof mql.matches === 'boolean'

  if (hasImplicitPreference) {
    return mql.matches ? 'dark' : 'light'
  }

  return null
}
