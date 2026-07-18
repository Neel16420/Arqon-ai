/**
 * ARQON Motion Design Tokens
 * ─────────────────────────
 * Single source of truth for all animation values.
 * Do NOT hardcode durations or easings elsewhere.
 */

/** Duration presets in milliseconds */
export const DURATION = {
  /** Ultra-fast micro-interactions */
  instant: 80,
  /** Standard hover / state transitions */
  fast: 150,
  /** UI element enter/exit */
  normal: 250,
  /** Cross-panel transitions */
  slow: 400,
  /** Full route transition */
  xslow: 600,
} as const

/** CSS cubic-bezier easing strings */
export const EASE = {
  /** Snappy deceleration for enter */
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Sharp acceleration for exit */
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Symmetric — good for pulses */
  inOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
  /** Natural spring feel */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

/** Packet travel timing in milliseconds */
export const PACKET = {
  /** Time for one packet to travel App → Engine → Provider */
  requestDuration: 1400,
  /** Time for one packet to travel Provider → Engine → App */
  responseDuration: 1600,
  /** Stagger between simultaneous packets */
  stagger: 300,
  /** Loop gap between packet waves (ms) */
  loopInterval: 2200,
  /** Packet visual radius */
  radius: 5,
} as const

/** Engine heartbeat */
export const ENGINE = {
  /** Full breath cycle in ms */
  breathPeriod: 2800,
  /** Scale range for breathing [min, max] */
  breathScale: [0.97, 1.03] as [number, number],
  /** Glow opacity range */
  glowRange: [0.08, 0.22] as [number, number],
} as const

/** Route highlight */
export const ROUTE = {
  /** Active route stroke width */
  activeStrokeWidth: 2.2,
  /** Inactive route stroke opacity */
  inactiveOpacity: 0.18,
  /** Active route opacity */
  activeOpacity: 1,
  /** Transition ms for route switch */
  switchDuration: 350,
} as const
