/**
 * useAuth — Arqon session persistence hook
 *
 * Single source of truth for authentication state and user profile.
 * Coordinates state read and write operations via the unified authService.
 */

import { useState, useCallback, useEffect } from "react"
import { readSession, logout as serviceLogout, writeSession } from "../services/authService"

export interface AuthSession {
  isAuthenticated: boolean
  userName: string
  userRole: string
  userEmail: string
  userAvatar: string
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession>(() => readSession())

  useEffect(() => {
    const handleSync = (e: Event) => {
      if (e instanceof CustomEvent && e.detail) {
        setSession(e.detail as AuthSession)
      } else {
        setSession(readSession())
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
    writeSession(next)
    setSession(next)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("arqon_auth_sync", { detail: next }))
    }
  }, [])

  const logout = useCallback(async () => {
    await serviceLogout()
  }, [])

  const updateProfile = useCallback((updates: Partial<Omit<AuthSession, "isAuthenticated">>) => {
    const current = readSession()
    if (!current.isAuthenticated) return

    const next: Omit<AuthSession, "isAuthenticated"> = {
      userName: updates.userName !== undefined ? updates.userName : current.userName,
      userRole: updates.userRole !== undefined ? updates.userRole : current.userRole,
      userEmail: updates.userEmail !== undefined ? updates.userEmail : current.userEmail,
      userAvatar: updates.userAvatar !== undefined ? updates.userAvatar : current.userAvatar,
    }
    writeSession(next)
    const nextSession: AuthSession = { isAuthenticated: true, ...next }
    setSession(nextSession)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("arqon_auth_sync", { detail: nextSession }))
    }
  }, [])

  return { session, login, logout, updateProfile }
}
