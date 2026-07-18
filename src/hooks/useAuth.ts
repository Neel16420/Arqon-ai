/**
 * useAuth — Arqon session persistence hook
 *
 * Persists the minimum required session data to localStorage so that
 * refreshing the page or reopening the browser keeps the user logged in.
 *
 * Storage layer is deliberately isolated inside `AuthStorage` so it can
 * later be replaced with JWT, HttpOnly cookies, or a backend auth API
 * without touching any component code.
 */

import { useState, useCallback } from 'react'

// ─── Storage key constants ───────────────────────────────────────────────────
const KEYS = {
  IS_AUTHENTICATED: 'arqon_auth',
  USER_NAME:        'arqon_user_name',
  USER_ROLE:        'arqon_user_role',
  USER_EMAIL:       'arqon_user_email',
} as const

// ─── Session shape ────────────────────────────────────────────────────────────
export interface AuthSession {
  isAuthenticated: boolean
  userName:  string
  userRole:  string
  userEmail: string
}

// ─── Storage adapter (swap this layer to switch storage backends) ─────────────
const AuthStorage = {
  read(): AuthSession {
    try {
      return {
        isAuthenticated: localStorage.getItem(KEYS.IS_AUTHENTICATED) === 'true',
        userName:  localStorage.getItem(KEYS.USER_NAME)  ?? 'Administrator',
        userRole:  localStorage.getItem(KEYS.USER_ROLE)  ?? 'admin',
        userEmail: localStorage.getItem(KEYS.USER_EMAIL) ?? 'admin@arqon.internal',
      }
    } catch {
      // localStorage unavailable (e.g. private browsing with restrictions)
      return { isAuthenticated: false, userName: '', userRole: '', userEmail: '' }
    }
  },

  write(session: Omit<AuthSession, 'isAuthenticated'>): void {
    try {
      localStorage.setItem(KEYS.IS_AUTHENTICATED, 'true')
      localStorage.setItem(KEYS.USER_NAME,  session.userName)
      localStorage.setItem(KEYS.USER_ROLE,  session.userRole)
      localStorage.setItem(KEYS.USER_EMAIL, session.userEmail)
    } catch { /* storage quota exceeded or unavailable — fail silently */ }
  },

  clear(): void {
    try {
      Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
    } catch { /* fail silently */ }
  },
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  // Initialise directly from storage — no flash of login screen on refresh
  const [session, setSession] = useState<AuthSession>(() => AuthStorage.read())

  /** Call after a successful password check. Does NOT accept a password. */
  const login = useCallback((opts?: Partial<Omit<AuthSession, 'isAuthenticated'>>) => {
    const next: AuthSession = {
      isAuthenticated: true,
      userName:  opts?.userName  ?? 'Administrator',
      userRole:  opts?.userRole  ?? 'admin',
      userEmail: opts?.userEmail ?? 'admin@arqon.internal',
    }
    AuthStorage.write(next)
    setSession(next)
  }, [])

  /** Clears storage and returns to the login screen. */
  const logout = useCallback(() => {
    AuthStorage.clear()
    setSession({ isAuthenticated: false, userName: '', userRole: '', userEmail: '' })
  }, [])

  return { session, login, logout }
}
