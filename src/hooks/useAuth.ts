/**
 * useAuth — Arqon session persistence hook
 *
 * Single source of truth for authentication state.
 *
 * On startup:
 *   1. Read storage
 *   2. Validate every required field AND the schema version
 *   3. If valid  → restore session (user stays logged in)
 *   4. If invalid → clear storage automatically, show Login
 *
 * The storage layer is isolated inside `AuthStorage` so the entire
 * persistence backend can be swapped to JWT / HttpOnly cookies / a
 * backend session API without touching any component or hook consumer.
 *
 * NEVER change auth state anywhere else in the application.
 * This hook is the only place that reads or writes authentication storage.
 */

import { useState, useCallback } from 'react'

// ─── Schema version ───────────────────────────────────────────────────────────
// Bump this string whenever the stored shape changes.
// Any session written with a different version is automatically discarded.
const SCHEMA_VERSION = 'v1'

// ─── Storage keys ─────────────────────────────────────────────────────────────
const KEYS = {
  SCHEMA:           'arqon_schema',
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

const UNAUTHENTICATED: AuthSession = {
  isAuthenticated: false,
  userName:  '',
  userRole:  '',
  userEmail: '',
}

// ─── Validation ───────────────────────────────────────────────────────────────
/**
 * Returns true only when every field is present, non-empty, and the stored
 * schema version matches the current application schema.
 *
 * This prevents three failure modes:
 *   1. Stale storage from a previous schema version
 *   2. Partial writes (e.g. storage quota hit mid-write)
 *   3. Corrupted or manually edited values
 */
function isValidSession(raw: {
  schema:      string | null
  auth:        string | null
  userName:    string | null
  userRole:    string | null
  userEmail:   string | null
}): boolean {
  if (raw.schema !== SCHEMA_VERSION)            return false   // wrong version
  if (raw.auth !== 'true')                      return false   // not authenticated
  if (!raw.userName  || raw.userName.trim()  === '') return false
  if (!raw.userRole  || raw.userRole.trim()  === '') return false
  if (!raw.userEmail || raw.userEmail.trim() === '') return false
  return true
}

// ─── Storage adapter ──────────────────────────────────────────────────────────
const AuthStorage = {
  /**
   * Read storage, validate every field, and return a session.
   * If anything is missing, outdated, or corrupted:
   *   → clear the bad data automatically
   *   → return UNAUTHENTICATED (Login page will render)
   */
  readAndValidate(): AuthSession {
    try {
      const raw = {
        schema:    sessionStorage.getItem(KEYS.SCHEMA),
        auth:      sessionStorage.getItem(KEYS.IS_AUTHENTICATED),
        userName:  sessionStorage.getItem(KEYS.USER_NAME),
        userRole:  sessionStorage.getItem(KEYS.USER_ROLE),
        userEmail: sessionStorage.getItem(KEYS.USER_EMAIL),
      }

      if (!isValidSession(raw)) {
        // Automatically discard incompatible or incomplete data.
        // The user will see the Login page and log in fresh.
        AuthStorage.clear()
        return UNAUTHENTICATED
      }

      return {
        isAuthenticated: true,
        // Non-null assertion is safe here — isValidSession() already checked
        userName:  raw.userName!.trim(),
        userRole:  raw.userRole!.trim(),
        userEmail: raw.userEmail!.trim(),
      }
    } catch {
      // localStorage unavailable (sandboxed iframe, private browsing, etc.)
      // Return unauthenticated — do NOT crash the app.
      return UNAUTHENTICATED
    }
  },

  write(session: Omit<AuthSession, 'isAuthenticated'>): void {
    try {
      sessionStorage.setItem(KEYS.SCHEMA,           SCHEMA_VERSION)
      sessionStorage.setItem(KEYS.IS_AUTHENTICATED, 'true')
      sessionStorage.setItem(KEYS.USER_NAME,        session.userName)
      sessionStorage.setItem(KEYS.USER_ROLE,        session.userRole)
      sessionStorage.setItem(KEYS.USER_EMAIL,       session.userEmail)
    } catch {
      // Storage quota exceeded or unavailable — fail silently.
      // The user is still logged in for this session; they will need
      // to log in again after a refresh if storage is unavailable.
    }
  },

  clear(): void {
    try {
      Object.values(KEYS).forEach((k) => sessionStorage.removeItem(k))
    } catch { /* fail silently */ }
  },
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  /**
   * Initialise synchronously from storage.
   * readAndValidate() is called exactly once, inside the lazy initializer,
   * before the first render. No useEffect, no async, no flash.
   */
  const [session, setSession] = useState<AuthSession>(
    () => AuthStorage.readAndValidate()
  )

  /** Call after a successful password check. Does NOT accept a password. */
  const login = useCallback((opts: Omit<AuthSession, 'isAuthenticated'>) => {
    const next: AuthSession = {
      isAuthenticated: true,
      userName:  opts.userName,
      userRole:  opts.userRole,
      userEmail: opts.userEmail,
    }
    AuthStorage.write(next)
    setSession(next)
  }, [])

  /** Clears all stored auth data and returns to the Login page. */
  const logout = useCallback(() => {
    AuthStorage.clear()
    setSession(UNAUTHENTICATED)
  }, [])

  return { session, login, logout }
}
