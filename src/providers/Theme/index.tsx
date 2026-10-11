'use client'

import React, { createContext, useCallback, use, useEffect, useState } from 'react'
import type { Theme, ThemePreference, ThemeContextType } from './types'
import {
  defaultTheme,
  themeCookieKey,
  themePreferenceCookieKey,
  themeLocalStorageKey,
} from './shared'

const ThemeContext = createContext<ThemeContextType>({
  setTheme: () => null,
  theme: defaultTheme,
  preference: defaultTheme,
  ready: false,
})

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0e1b19' : '#f4f2eb')
}
function isPreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark'
}
function saveCookie(key: string, value: string) {
  document.cookie = `${key}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
}

export function ThemeProvider({
  children,
  initialTheme = defaultTheme,
}: {
  children: React.ReactNode
  initialTheme?: Theme
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)
  const [preference, setPreference] = useState<ThemePreference>(initialTheme)
  const [ready, setReady] = useState(false)

  const update = useCallback((next: ThemePreference) => {
    const resolved = next
    applyTheme(resolved)
    document.documentElement.setAttribute('data-theme-preference', next)
    setThemeState(resolved)
    setPreference(next)
    saveCookie(themeCookieKey, resolved)
    saveCookie(themePreferenceCookieKey, next)
  }, [])

  const setTheme = useCallback(
    (value: ThemePreference | null) => {
      const next = value ?? defaultTheme
      update(next)
      try {
        window.localStorage.setItem(themeLocalStorageKey, next)
      } catch {
        /* Cookie and in-memory preference still work. */
      }
    },
    [update],
  )

  useEffect(() => {
    const bootstrapped = document.documentElement.getAttribute('data-theme-preference')
    let next: ThemePreference = isPreference(bootstrapped) ? bootstrapped : defaultTheme
    try {
      const saved = window.localStorage.getItem(themeLocalStorageKey)
      if (saved !== null) next = isPreference(saved) ? saved : defaultTheme
    } catch {
      /* Bootstrap already reads the cookie fallback. */
    }
    let active = true
    queueMicrotask(() => {
      if (!active) return
      update(next)
      setReady(true)
    })
    const sync = (event: StorageEvent) => {
      if (event.key !== themeLocalStorageKey && event.key !== null) return
      update(isPreference(event.newValue) ? event.newValue : defaultTheme)
    }
    window.addEventListener('storage', sync)
    return () => {
      active = false
      window.removeEventListener('storage', sync)
    }
  }, [update])

  return <ThemeContext value={{ setTheme, theme, preference, ready }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
