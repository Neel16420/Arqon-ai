/**
 * useAuth — Arqon session persistence hook
 *
 * Single source of truth for authentication state and user profile.
 *
 * On startup:
 *   1. Read storage
 *   2. Validate every required field AND the schema version
 *   3. If valid  → restore session (user stays logged in)
 *   4. If invalid → clear storage automatically, show Login
 *
 * All mounted hook consumers synchronize instantly via window events without reloading.
 */

import { useState, useCallback, useEffect } from "react"

const SCHEMA_VERSION = "v1"

const KEYS = {
  SCHEMA: "arqon_schema",
  IS_AUTHENTICATED: "arqon_auth",
  USER_NAME: "arqon_user_name",
  USER_ROLE: "arqon_user_role",
  USER_EMAIL: "arqon_user_email",
  USER_AVATAR: "arqon_user_avatar",
} as const

export interface AuthSession {
  isAuthenticated: boolean
  userName: string
  userRole: string
  userEmail: string
  userAvatar: string
}

const UNAUTHENTICATED: AuthSession = {
  isAuthenticated: false,
  userName: "",
  userRole: "",
  userEmail: "",
  userAvatar: "",
}

function isValidSession(raw: {
  schema: string | null
  auth: string | null
  userName: string | null
  userRole: string | null
  userEmail: string | null
}): boolean {
  if (raw.schema !== SCHEMA_VERSION) return false
  if (raw.auth !== "true") return false
  if (!raw.userName || raw.userName.trim() === "") return false
  if (!raw.userRole || raw.userRole.trim() === "") return false
  if (!raw.userEmail || raw.userEmail.trim() === "") return false
  return true
}

const AuthStorage = {
  readAndValidate(): AuthSession {
    try {
      const raw = {
        schema: sessionStorage.getItem(KEYS.SCHEMA),
        auth: sessionStorage.getItem(KEYS.IS_AUTHENTICATED),
        userName: sessionStorage.getItem(KEYS.USER_NAME),
        userRole: sessionStorage.getItem(KEYS.USER_ROLE),
        userEmail: sessionStorage.getItem(KEYS.USER_EMAIL),
        userAvatar: sessionStorage.getItem(KEYS.USER_AVATAR),
      }

      if (!isValidSession(raw)) {
        AuthStorage.clear()
        return UNAUTHENTICATED
      }

      return {
        isAuthenticated: true,
        userName: raw.userName!.trim(),
        userRole: raw.userRole!.trim(),
        userEmail: raw.userEmail!.trim(),
        userAvatar: raw.userAvatar?.trim() || "/avatars/avatar-1.png",
      }
    } catch {
      return UNAUTHENTICATED
    }
  },

  write(session: Omit<AuthSession, "isAuthenticated">): void {
    try {
      sessionStorage.setItem(KEYS.SCHEMA, SCHEMA_VERSION)
      sessionStorage.setItem(KEYS.IS_AUTHENTICATED, "true")
      sessionStorage.setItem(KEYS.USER_NAME, session.userName)
      sessionStorage.setItem(KEYS.USER_ROLE, session.userRole)
      sessionStorage.setItem(KEYS.USER_EMAIL, session.userEmail)
      sessionStorage.setItem(KEYS.USER_AVATAR, session.userAvatar || "/avatars/avatar-1.png")
    } catch {
      /* fail silently */
    }
  },

  clear(): void {
    try {
      Object.values(KEYS).forEach((k) => sessionStorage.removeItem(k))
    } catch {
      /* fail silently */
    }
  },
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession>(() =>
    AuthStorage.readAndValidate(),
  )

  useEffect(() => {
    const handleSync = (e: Event) => {
      if (e instanceof CustomEvent && e.detail) {
        setSession(e.detail as AuthSession)
      } else {
        setSession(AuthStorage.readAndValidate())
      }
    }

    window.addEventListener("arqon_auth_sync", handleSync)
    window.addEventListener("storage", handleSync)
    return () => {
      window.removeEventListener("arqon_auth_sync", handleSync)
      window.removeEventListener("storage", handleSync)
    }
  }, [])

  const login = useCallback((opts: Omit<AuthSession, "isAuthenticated">) => {
    const next: AuthSession = {
      isAuthenticated: true,
      userName: opts.userName,
      userRole: opts.userRole,
      userEmail: opts.userEmail,
      userAvatar: opts.userAvatar || "/avatars/avatar-1.png",
    }
    AuthStorage.write(next)
    setSession(next)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("arqon_auth_sync", { detail: next }))
    }
  }, [])

  const logout = useCallback(() => {
    AuthStorage.clear()
    setSession(UNAUTHENTICATED)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("arqon_auth_sync", { detail: UNAUTHENTICATED }))
    }
  }, [])

  const updateProfile = useCallback((updates: Partial<Omit<AuthSession, "isAuthenticated">>) => {
    const current = AuthStorage.readAndValidate()
    if (!current.isAuthenticated) return

    const next: Omit<AuthSession, "isAuthenticated"> = {
      userName: updates.userName !== undefined ? updates.userName : current.userName,
      userRole: updates.userRole !== undefined ? updates.userRole : current.userRole,
      userEmail: updates.userEmail !== undefined ? updates.userEmail : current.userEmail,
      userAvatar: updates.userAvatar !== undefined ? updates.userAvatar : current.userAvatar,
    }
    AuthStorage.write(next)
    const nextSession: AuthSession = { isAuthenticated: true, ...next }
    setSession(nextSession)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("arqon_auth_sync", { detail: nextSession }))
    }
  }, [])

  return { session, login, logout, updateProfile }
}
