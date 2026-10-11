'use client'
import { Moon, Sun } from 'lucide-react'
import type { ThemePreference } from '@/providers/Theme/types'
import { useTheme } from '@/providers/Theme'

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, preference, setTheme, ready } = useTheme()
  if (compact)
    return (
      <div className="et-theme-toggle-compact" data-no-translate title="Choose light or dark theme">
        {theme === 'dark' ? (
          <Moon size={16} aria-hidden="true" />
        ) : (
          <Sun size={16} aria-hidden="true" />
        )}
        <select
          disabled={!ready}
          aria-label="Color theme"
          value={preference}
          onChange={(event) => setTheme(event.target.value as ThemePreference)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    )
  return (
    <div className="et-theme-toggle" role="group" aria-label="Color theme" data-no-translate>
      <button
        type="button"
        aria-label="Use light theme"
        disabled={!ready}
        title="Light theme"
        aria-pressed={preference === 'light'}
        onClick={() => setTheme('light')}
      >
        <Sun size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Use dark theme"
        disabled={!ready}
        title="Dark theme"
        aria-pressed={preference === 'dark'}
        onClick={() => setTheme('dark')}
      >
        <Moon size={15} aria-hidden="true" />
      </button>
    </div>
  )
}
