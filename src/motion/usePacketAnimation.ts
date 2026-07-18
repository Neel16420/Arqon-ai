/**
 * usePacketAnimation
 * ──────────────────
 * Drives the request/response packet system using requestAnimationFrame.
 *
 * Architecture:
 * - Uses a single rAF loop — no setInterval, no setTimeout loops.
 * - Packets are plain objects in a ref — no state mutations per frame.
 * - Only writes to SVG element attributes directly (no React re-renders per frame).
 * - Returns refs to be attached to SVG <circle> elements.
 *
 * How it works:
 * 1. A "wave" is spawned every PACKET.loopInterval ms.
 * 2. Each wave creates one REQUEST packet and one RESPONSE packet.
 * 3. REQUEST travels: App (origin) → Engine center → Provider node.
 * 4. RESPONSE travels: Provider node → Engine center → App (origin).
 * 5. Progress [0..1] is computed from elapsed time / duration.
 * 6. Position is interpolated along the two-segment path using lerp().
 * 7. The SVG element's cx/cy/opacity attributes are set directly via DOM.
 *
 * This keeps React completely out of the hot animation path.
 */

import { useEffect, useRef, useCallback } from 'react'
import { PACKET } from './motionTokens'
import { useReducedMotion } from './useReducedMotion'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RouteNode {
  /** Provider name (used as key) */
  name: string
  /** Provider brand color hex */
  color: string
  /** SVG x coordinate of provider dot */
  x: number
  /** SVG y coordinate of provider dot */
  y: number
}

/** Two-segment path: point A → midpoint → point B */
interface PathSegment {
  ax: number; ay: number
  mx: number; my: number
  bx: number; by: number
}

interface Packet {
  /** DOM reference to the SVG circle */
  el: SVGCircleElement | null
  /** Normalized progress [0, 1] */
  progress: number
  /** Duration in ms */
  duration: number
  /** Timestamp when this packet started */
  startTime: number
  /** Two-leg path */
  path: PathSegment
  /** Whether this is a response packet (reverse direction) */
  isResponse: boolean
  /** Brand color */
  color: string
}

// ─── Math utilities ───────────────────────────────────────────────────────────

/** Linear interpolation */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Evaluate position on a two-segment path.
 * Segment 1: A → M (t = 0..0.5)
 * Segment 2: M → B (t = 0.5..1)
 */
function evalPath(path: PathSegment, t: number): { x: number; y: number } {
  if (t <= 0.5) {
    const s = t / 0.5
    return { x: lerp(path.ax, path.mx, s), y: lerp(path.ay, path.my, s) }
  }
  const s = (t - 0.5) / 0.5
  return { x: lerp(path.mx, path.bx, s), y: lerp(path.my, path.by, s) }
}

/** Ease in-out cubic — smooth acceleration and deceleration */
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Fade envelope: fast fade-in, hold, fast fade-out at ends */
function packetOpacity(t: number): number {
  const fadeIn = 0.08
  const fadeOut = 0.92
  if (t < fadeIn) return t / fadeIn
  if (t > fadeOut) return 1 - (t - fadeOut) / (1 - fadeOut)
  return 1
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param activeProvider - Currently selected provider node
 * @param enginePos - SVG coordinate of the ARQON engine center
 * @param appPos - SVG coordinate of the Your Application node
 */
export function usePacketAnimation(
  activeProvider: RouteNode | null,
  enginePos: { x: number; y: number },
  appPos: { x: number; y: number },
) {
  const reduced = useReducedMotion()

  // Refs for the two packet SVG elements
  const reqRef = useRef<SVGCircleElement>(null)
  const resRef = useRef<SVGCircleElement>(null)

  // Internal animation state — never touches React state
  const rafRef = useRef<number>(0)
  const lastWaveRef = useRef<number>(0)
  const packetsRef = useRef<Packet[]>([])
  const activeRef = useRef<RouteNode | null>(activeProvider)

  // Keep activeRef in sync without re-creating the rAF loop
  useEffect(() => {
    activeRef.current = activeProvider
  }, [activeProvider])

  const spawnWave = useCallback((now: number) => {
    const provider = activeRef.current
    if (!provider) return

    // Build request path: App → Engine → Provider
    const reqPath: PathSegment = {
      ax: appPos.x, ay: appPos.y,
      mx: enginePos.x, my: enginePos.y,
      bx: provider.x, by: provider.y,
    }

    // Build response path: Provider → Engine → App
    const resPath: PathSegment = {
      ax: provider.x, ay: provider.y,
      mx: enginePos.x, my: enginePos.y,
      bx: appPos.x, by: appPos.y,
    }

    packetsRef.current = [
      {
        el: reqRef.current,
        progress: 0,
        duration: PACKET.requestDuration,
        startTime: now,
        path: reqPath,
        isResponse: false,
        color: provider.color,
      },
      {
        el: resRef.current,
        progress: 0,
        duration: PACKET.responseDuration,
        startTime: now + PACKET.stagger + PACKET.requestDuration * 0.6,
        path: resPath,
        isResponse: true,
        color: provider.color,
      },
    ]
  }, [appPos, enginePos])

  const tick = useCallback((now: number) => {
    // Spawn a new wave if enough time has elapsed
    if (now - lastWaveRef.current >= PACKET.loopInterval) {
      lastWaveRef.current = now
      spawnWave(now)
    }

    for (const pkt of packetsRef.current) {
      if (!pkt.el || now < pkt.startTime) {
        // Not started yet — hide it
        if (pkt.el) {
          pkt.el.setAttribute('opacity', '0')
        }
        continue
      }

      const elapsed = now - pkt.startTime
      const raw = Math.min(elapsed / pkt.duration, 1)
      const t = easeInOut(raw)
      const pos = evalPath(pkt.path, t)
      const opacity = packetOpacity(raw)

      // Write directly to DOM — bypasses React reconciler
      pkt.el.setAttribute('cx', String(pos.x))
      pkt.el.setAttribute('cy', String(pos.y))
      pkt.el.setAttribute('opacity', String(opacity))
      pkt.el.setAttribute('fill', pkt.color)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [spawnWave])

  useEffect(() => {
    if (reduced) {
      // Hide both packets, keep engine alive but no packets
      if (reqRef.current) reqRef.current.setAttribute('opacity', '0')
      if (resRef.current) resRef.current.setAttribute('opacity', '0')
      return
    }

    // Kick off the loop
    lastWaveRef.current = 0 // force immediate first wave
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [reduced, tick, activeProvider]) // restart loop when provider changes

  return { reqRef, resRef }
}
