/**
 * useTokenMonitor
 * ───────────────
 * Single source of truth for AI token usage tracking.
 *
 * Rules:
 *  - 25,000 tokens per free-tier window
 *  - The 5-hour reset countdown starts ONLY after the first request
 *  - Resets based on elapsed time, NOT midnight
 *  - All state is persisted to localStorage and survives page refresh
 *  - Countdown string updates once per second via a single interval
 *  - No unnecessary re-renders: derived strings are computed inside the hook
 *
 * NEVER write token state outside this hook.
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_TOKENS = 25_000
const RESET_WINDOW_MS = 5 * 60 * 60 * 1_000 // 5 hours in ms
const LOW_TOKEN_THRESHOLD = 0.20             // 20 %

// ─── Storage keys ────────────────────────────────────────────────────────────
const STORAGE_KEY = 'arqon_token_monitor_v1'

// ─── Persisted shape ─────────────────────────────────────────────────────────
interface PersistedState {
  tokensUsed: number        // tokens consumed in the current window
  resetAt: number | null    // epoch ms when tokens reset, null if window not started
  largestRequest: number    // largest single-request token count seen
  requestCount: number      // total number of requests made in this window
  windowTotalUsed: number   // sum of all tokens consumed (for avg calculation)
}

// ─── Public shape returned by the hook ───────────────────────────────────────
export interface TokenMonitorState {
  // Raw data
  remaining: number
  used: number
  max: number
  percentage: number          // 0–100
  isLow: boolean              // true when < 20 %
  resetAt: number | null
  largestRequest: number
  requestCount: number
  // Derived / formatted
  countdownString: string     // "Resets in 4h 12m 33s" or "No active session"
  avgTokensPerRequest: number
  estimatedRequestsLeft: number
  // Actions
  consumeTokens: (n: number) => void
  // For simulating usage in dev / test
  _reset: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function readStorage(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    // Validate all required fields exist and are the right type
    if (
      typeof parsed.tokensUsed !== 'number' ||
      typeof parsed.largestRequest !== 'number' ||
      typeof parsed.requestCount !== 'number' ||
      typeof parsed.windowTotalUsed !== 'number' ||
      (parsed.resetAt !== null && typeof parsed.resetAt !== 'number')
    ) {
      return defaultState()
    }
    return parsed as PersistedState
  } catch {
    return defaultState()
  }
}

function writeStorage(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage quota or unavailable — fail silently
  }
}

function defaultState(): PersistedState {
  return {
    tokensUsed: 0,
    resetAt: null,
    largestRequest: 0,
    requestCount: 0,
    windowTotalUsed: 0,
  }
}

function formatCountdown(resetAt: number | null): string {
  if (resetAt === null) return 'No active session'
  const diff = resetAt - Date.now()
  if (diff <= 0) return 'Resetting…'
  const totalSec = Math.floor(diff / 1_000)
  const h = Math.floor(totalSec / 3_600)
  const m = Math.floor((totalSec % 3_600) / 60)
  const s = totalSec % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0 || h > 0) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return `Resets in ${parts.join(' ')}`
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTokenMonitor(): TokenMonitorState {
  // Both useState initializers run synchronously on first mount only.
  // readStorage() is a cheap localStorage read — no async, no flash.
  const [state, setState] = useState<PersistedState>(readStorage)
  const [countdownString, setCountdownString] = useState<string>(() =>
    formatCountdown(readStorage().resetAt)
  )

  // Ref to the interval so we can clear it deterministically
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Keep a ref to the current resetAt so the interval can read it without
  // capturing stale closure values. Updated whenever state changes.
  const resetAtRef = useRef<number | null>(state.resetAt)
  // Keep resetAtRef in sync on every render (cheap assignment)
  resetAtRef.current = state.resetAt

  // ── Countdown + auto-reset ticker ─────────────────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const currentResetAt = resetAtRef.current

      if (currentResetAt === null) {
        // No active window — ensure countdown shows correct label
        setCountdownString('No active session')
        return
      }

      if (now >= currentResetAt) {
        // Window has expired — reset both state and storage
        const next = defaultState()
        writeStorage(next)
        setState(next)
        setCountdownString('No active session')
        return
      }

      // Still running — update countdown string only (no main state change = no re-render)
      setCountdownString(formatCountdown(currentResetAt))
    }, 1_000)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, []) // runs exactly once — reads live state via ref, not stale closure

  // ── consumeTokens ─────────────────────────────────────────────────────────
  const consumeTokens = useCallback((n: number) => {
    if (n <= 0) return
    const now = Date.now()
    // Pre-compute the new resetAt so we can update the countdown string
    // immediately, without embedding side effects inside the setState updater.
    const newResetAt = resetAtRef.current ?? now + RESET_WINDOW_MS

    setState((prev) => {
      const next: PersistedState = {
        tokensUsed: Math.min(prev.tokensUsed + n, MAX_TOKENS),
        resetAt: newResetAt,
        largestRequest: Math.max(prev.largestRequest, n),
        requestCount: prev.requestCount + 1,
        windowTotalUsed: prev.windowTotalUsed + n,
      }
      writeStorage(next)
      return next
    })

    // Update the countdown string with the definitive value.
    // This is safe to call outside the updater — both setState and
    // setCountdownString will be batched by React 18's auto-batching.
    setCountdownString(formatCountdown(newResetAt))
  }, [])


  // ── _reset (dev / test helper) ────────────────────────────────────────────
  const _reset = useCallback(() => {
    const next = defaultState()
    writeStorage(next)
    setState(next)
    setCountdownString('No active session')
  }, [])

  // ── Derived values ────────────────────────────────────────────────────────
  const remaining = Math.max(MAX_TOKENS - state.tokensUsed, 0)
  const percentage = Math.round((remaining / MAX_TOKENS) * 100)
  const isLow = remaining / MAX_TOKENS < LOW_TOKEN_THRESHOLD
  const avgTokensPerRequest =
    state.requestCount > 0
      ? Math.round(state.windowTotalUsed / state.requestCount)
      : 0
  const estimatedRequestsLeft =
    avgTokensPerRequest > 0 ? Math.floor(remaining / avgTokensPerRequest) : 0

  return {
    remaining,
    used: state.tokensUsed,
    max: MAX_TOKENS,
    percentage,
    isLow,
    resetAt: state.resetAt,
    largestRequest: state.largestRequest,
    requestCount: state.requestCount,
    countdownString,
    avgTokensPerRequest,
    estimatedRequestsLeft,
    consumeTokens,
    _reset,
  }
}
