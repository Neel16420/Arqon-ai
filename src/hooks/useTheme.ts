import { useState, useEffect, useCallback } from 'react'

export type Theme = 'dark' | 'light' | 'system'

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeClass(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('arqon-theme') as Theme) || 'system'
    }
    return 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    const stored = (typeof window !== 'undefined'
      ? (localStorage.getItem('arqon-theme') as Theme)
      : null) || 'system'
    return stored === 'system' ? getSystemTheme() : (stored as 'dark' | 'light')
  })

  /**
   * Fire the View Transition ripple.
   * @param newResolved - the resolved theme to apply
   * @param origin - exact pixel coords for the ripple center (defaults to top-right if null)
   */
  const triggerRippleTransition = useCallback(
    (newResolved: 'dark' | 'light', origin: { x: number; y: number } | null) => {
      if (newResolved === resolvedTheme) return

      const x = origin ? `${origin.x}px` : '90%'
      const y = origin ? `${origin.y}px` : '28px'
      document.documentElement.style.setProperty('--click-x', x)
      document.documentElement.style.setProperty('--click-y', y)

      if (!document.startViewTransition) {
        applyThemeClass(newResolved === 'dark')
        setResolvedTheme(newResolved)
        return
      }

      document.documentElement.classList.add('theme-transition')

      const transition = document.startViewTransition(() => {
        applyThemeClass(newResolved === 'dark')
        setResolvedTheme(newResolved)
      })

      transition.finished.finally(() => {
        document.documentElement.classList.remove('theme-transition')
      })
    },
    [resolvedTheme]
  )

  // OS theme change (system mode)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newResolved = e.matches ? 'dark' : 'light'
        if (newResolved !== resolvedTheme) {
          triggerRippleTransition(newResolved, null)
        }
      }
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [theme, resolvedTheme, triggerRippleTransition])

  const setTheme = useCallback(
    (newTheme: Theme, origin: { x: number; y: number } | null) => {
      localStorage.setItem('arqon-theme', newTheme)
      setThemeState(newTheme)
      const newResolved = newTheme === 'system' ? getSystemTheme() : newTheme
      triggerRippleTransition(newResolved, origin)
    },
    [triggerRippleTransition]
  )

  // Apply theme on first mount (no animation — prevents flash)
  useEffect(() => {
    applyThemeClass(resolvedTheme === 'dark')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { theme, resolvedTheme, setTheme }
}
