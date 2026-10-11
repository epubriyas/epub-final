export type Theme = 'dark' | 'light'
export type ThemePreference = Theme

export interface ThemeContextType {
  setTheme: (theme: ThemePreference | null) => void
  theme?: Theme | null
  preference: ThemePreference
  ready: boolean
}

export function themeIsValid(string: null | string): string is Theme {
  return string ? ['dark', 'light'].includes(string) : false
}
