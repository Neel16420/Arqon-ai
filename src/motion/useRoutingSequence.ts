/**
 * useRoutingSequence
 * ──────────────────
 * Global singleton that drives the routing animation state machine.
 *
 * Architecture: Module-level variables (not React state) act as the
 * single source of truth. All React components subscribe via listeners.
 *
 * PART 5 — One global provider state shared across ALL pages.
 * PART 6 — No auto-switching. User controls provider selection.
 *           Animation loops ONLY on the selected provider, forever.
 *
 * Phases (for Overview diagram — provider → Arqon → App):
 *   idle → charge → inbound → rotate → pause → idle → ...
 *
 * The Routing page only uses: charge → inbound → rotate → pause
 */

import { useState, useEffect } from "react"
import { providersStore } from "../store/providers"

export type RoutingPhase = "idle" | "charge" | "inbound" | "rotate" | "outbound" | "arrival" | "pause"

// ─── Global singleton state ───────────────────────────────────────────────────
// These live at module scope — one instance for the entire app.
let selectedProviderId: string | null = null
let phase: RoutingPhase = "idle"
let phaseStartTime: number = 0
const listeners = new Set<() => void>()
let isRunning = false
let timer: number | null = null

const notify = () => listeners.forEach((l) => l())

// Timing (ms)
const TIMING = {
  charge: 150, // Brief highlight before glow leaves
  inbound: 800, // Particle travels Provider → Arqon
  rotate: 650, // Logo spins exactly 360°
  outbound: 700, // Particle travels Arqon → Application  [NEW]
  arrival: 200, // Application arrival pulse             [NEW]
  pause: 900, // Rest before next loop
}

const clearTimer = () => {
  if (timer !== null) {
    window.clearTimeout(timer)
    timer = null
  }
}

/** Runs one full cycle and schedules the next automatically */
const runCycle = () => {
  if (!isRunning || phase !== "idle") return

  const step = (next: RoutingPhase, delay: number, after: () => void) => {
    phase = next
    phaseStartTime = Date.now()
    notify()
    timer = window.setTimeout(after, delay)
  }

  step("charge", TIMING.charge, () =>
    step("inbound", TIMING.inbound, () =>
      step("rotate", TIMING.rotate, () =>
        step("outbound", TIMING.outbound, () =>
          step("arrival", TIMING.arrival, () =>
            step("pause", TIMING.pause, () => {
              phase = "idle"
              notify()
              if (isRunning) runCycle()
            }),
          ),
        ),
      ),
    ),
  )
}

export const startRoutingEngine = () => {
  if (isRunning) return
  if (selectedProviderId === null) return
  isRunning = true
  runCycle()
}

export const stopRoutingEngine = () => {
  isRunning = false
  clearTimer()
  phase = "idle"
  phaseStartTime = 0
  notify()
}

// Subscribe to provider store to handle 0 active providers case automatically
providersStore.subscribe(() => {
  const activeProviders = providersStore.getProviders().filter((p) => p.enabled)

  if (activeProviders.length === 0) {
    if (isRunning) {
      stopRoutingEngine()
    }
    selectedProviderId = null
    phase = "idle"
    notify()
  } else {
    // If selected provider was removed or disabled, drop selection and stop.
    // No auto-switching. User must click to select a new provider.
    const valid = selectedProviderId
      ? activeProviders.find((p) => p.id === selectedProviderId)
      : null
    if (!valid && selectedProviderId !== null) {
      selectedProviderId = null
      phase = "idle"
      phaseStartTime = 0
      notify()
      if (isRunning) {
        stopRoutingEngine()
      }
    }

    if (!isRunning && listeners.size > 0 && selectedProviderId !== null) {
      startRoutingEngine()
    }
  }
})

// ─── React hook ───────────────────────────────────────────────────────────────

export function useRoutingSequence() {
  const [state, setState] = useState({
    selectedProviderId,
    phase,
    phaseStartTime,
  })

  useEffect(() => {
    const sync = () => setState({ selectedProviderId, phase, phaseStartTime })
    listeners.add(sync)
    // Do not auto-start on mount. Wait for user selection.
    return () => {
      listeners.delete(sync)
    }
  }, [])

  const setProvider = (id: string | null) => {
    if (selectedProviderId === id) return
    clearTimer()
    selectedProviderId = id
    phase = "idle"
    phaseStartTime = 0
    notify()
    if (id === null) {
      if (isRunning) stopRoutingEngine()
    } else {
      if (!isRunning) startRoutingEngine()
      if (isRunning) runCycle()
    }
  }

  return {
    selectedProviderId: state.selectedProviderId,
    phase: state.phase,
    phaseStartTime: state.phaseStartTime,
    setSelectedProviderId: setProvider,
  }
}
