/**
 * AnimatedRoutingFlow — rebuilt from scratch
 * ──────────────────────────────────────────
 * ROOT CAUSE of previous bug:
 *   Framer Motion's `originX`/`originY` with pixel values on SVG <image>
 *   elements do NOT work correctly. SVG uses its own coordinate system and
 *   Framer Motion calculates origins relative to the SVG viewport, not the
 *   element's bounding box. Result: the whole diagram appeared to rotate.
 *
 * CORRECT APPROACH:
 *   For SVG element rotation around its own center, use CSS:
 *     transform-box: fill-box;
 *     transform-origin: center;
 *   This is the W3C-specified correct method for SVG transforms.
 *
 *   We apply a CSS keyframe animation class to the <image> element directly.
 *   The class is toggled based on the phase. Cumulative rotation is tracked
 *   via a CSS custom property (--rotation) written directly to the element.
 */

import { useRef, useEffect } from "react"
import type { RoutingPhase } from "../motion/useRoutingSequence"

// ─── Provider node — subtle glow only, NO rotation ───────────────────────────

export function useProviderAnimation(
  isActive: boolean,
  phase: RoutingPhase,
  color: string,
) {
  const isCharging = isActive && phase === "charge"
  const isSelected = isActive && phase !== "idle"

  return {
    animate: {
      scale: isCharging ? 1.03 : 1,
      filter: isSelected
        ? `drop-shadow(0 0 8px ${color}60)`
        : "drop-shadow(0 0 0px transparent)",
    },
    transition: { duration: 0.2, ease: "easeOut" as const },
    isCharging,
    isSelected,
  }
}

// ─── Arqon logo rotation ──────────────────────────────────────────────────────
// Uses Web Animations API to sync with the global engine clock.
// Cumulative rotation is tracked at the module level so it persists across unmounts.

let globalCumulativeDeg = 0
let lastSeenPhaseStartTime = 0

export function useArqonLogoRotation(
  phase: RoutingPhase,
  phaseStartTime: number,
) {
  const ref = useRef<Element | null>(null)

  useEffect(() => {
    const el = ref.current as HTMLElement | SVGElement | null
    if (!el) return

    el.style.transformBox = "fill-box"
    el.style.transformOrigin = "center"

    if (phase === "rotate") {
      const duration = 650 // TIMING.rotate

      // Only increment cumulative degrees if this is a NEW rotate phase
      if (lastSeenPhaseStartTime !== phaseStartTime) {
        globalCumulativeDeg += 360
        lastSeenPhaseStartTime = phaseStartTime
      }

      const elapsed = Date.now() - phaseStartTime

      const anim = el.animate(
        [
          { transform: `rotate(${globalCumulativeDeg - 360}deg)` },
          { transform: `rotate(${globalCumulativeDeg}deg)` },
        ],
        {
          duration,
          fill: "forwards",
        },
      )

      // Sync with global clock
      anim.currentTime = elapsed
    } else {
      // Idle or other phases: lock to current cumulative degree
      el.style.transform = `rotate(${globalCumulativeDeg}deg)`
    }
  }, [phase, phaseStartTime])

  return ref
}

// useArqonImgRotation is an alias — same implementation, same Element ref type
export const useArqonImgRotation = useArqonLogoRotation

// ─── Animated Particle Path ───────────────────────────────────────────────────
// One single glowing particle that travels along an SVG path.
// Rendered as an animated SVG <circle> that moves using CSS animation.
// This avoids Framer Motion's SVG coordinate quirks entirely.

interface ParticleProps {
  /** SVG path d-string for the particle to follow */
  d: string
  color: string
  /** Is this the selected provider? */
  isActive: boolean
  phase: RoutingPhase
  phaseStartTime: number
  /** 'inbound' = provider→engine, animated during 'inbound' phase */
  type: "inbound"
}

export function AnimatedParticlePath({
  d,
  color,
  isActive,
  phase,
  phaseStartTime,
  type,
}: ParticleProps) {
  const isTraveling = isActive && phase === type

  return (
    <g>
      {/* Static rail — always visible, dim when inactive.
           Dark mode : faint white  (--color-routing-line = rgba(255,255,255,1) @ 0.4 / 0.15 opacity)
           Light mode: soft slate   (--color-routing-line = rgba(15,23,42,1)    @ 0.4 / 0.20 opacity)
           CSS vars defined in index.css :root (dark) and :root.light blocks.
      */}
      <path
        d={d}
        fill="none"
        stroke={isActive ? color : "var(--color-routing-line)"}
        strokeWidth={isActive ? 1.5 : 1.2}
        opacity={
          isActive
            ? 0.4
            : "var(--color-routing-line-inactive-opacity)" as unknown as number
        }
        style={{
          transition:
            "stroke 0.3s ease, stroke-width 0.3s ease, opacity 0.3s ease",
        }}
      />

      {/* Traveling glow particle — ONE only, conditionally rendered */}
      {isTraveling && (
        <TravelingParticle
          d={d}
          color={color}
          duration={800}
          phaseStartTime={phaseStartTime}
        />
      )}
    </g>
  )
}

// ─── TravelingParticle ────────────────────────────────────────────────────────
// A single glowing dot that travels from start to end of an SVG path.
// Uses strokeDashoffset animation — the most reliable SVG animation method.

function TravelingParticle({
  d,
  color,
  duration,
  phaseStartTime,
}: {
  d: string
  color: string
  duration: number
  phaseStartTime: number
}) {
  const pathRef = useRef<SVGPathElement | null>(null)
  const particleRef = useRef<SVGPathElement | null>(null)

  useEffect(() => {
    const path = pathRef.current
    const particle = particleRef.current
    if (!path || !particle) return

    const len = path.getTotalLength()

    // Sync with global clock
    const elapsed = Date.now() - phaseStartTime

    particle.style.strokeDasharray = `6 ${len}`
    particle.style.opacity = "0" // Let animation handle opacity

    const anim = particle.animate(
      [
        { strokeDashoffset: String(len + 6), opacity: 1, offset: 0 },
        {
          strokeDashoffset: String(len + 6 - (len + 12) * 0.8),
          opacity: 1,
          offset: 0.8,
        },
        { strokeDashoffset: "-6", opacity: 0, offset: 1 },
      ],
      {
        duration,
        fill: "forwards",
      },
    )

    anim.currentTime = elapsed

    return () => {
      anim.cancel()
    }
  }, [duration, phaseStartTime])

  return (
    <>
      {/* Invisible reference path used only to get the path length */}
      <path ref={pathRef} d={d} fill="none" stroke="none" />
      {/* The glowing particle */}
      <path
        ref={particleRef}
        d={d}
        fill="none"
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0}
        style={{
          filter: `drop-shadow(0 0 3px ${color}) drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}80)`,
          willChange: "stroke-dashoffset, opacity",
        }}
      />
    </>
  )
}

// ─── OutboundParticlePath ─────────────────────────────────────────────────────
// The second leg: Arqon → Application.
// Fires during 'outbound' phase only.
// Reuses TravelingParticle (same component, same effect) — no duplication.
// The static rail is always drawn (dim line from engine to app node).

interface OutboundParticleProps {
  d: string
  color: string
  phase: RoutingPhase
  phaseStartTime: number
}

export function OutboundParticlePath({
  d,
  color,
  phase,
  phaseStartTime,
}: OutboundParticleProps) {
  const isTraveling = phase === "outbound"

  return (
    <g>
      {/* Static rail — always visible as a dim connector.
           Uses --color-routing-line-outbound which switches between:
             dark : rgba(255,255,255,0.10)  — faint white on dark background
             light: rgba(15,23,42,0.18)     — soft slate on white background
      */}
      <path
        d={d}
        fill="none"
        stroke="var(--color-routing-line-outbound)"
        strokeWidth="0.8"
        opacity={0.85}
      />
      {/* Traveling glow particle (reused component) */}
      {isTraveling && (
        <TravelingParticle
          d={d}
          color={color}
          duration={700}
          phaseStartTime={phaseStartTime}
        />
      )}
    </g>
  )
}

// ─── useAppArrivalEffect ──────────────────────────────────────────────────────
// Drives the "arrival pulse" on the Application node rect.
// Writes stroke color, fill tint, and drop-shadow directly to the DOM element
// using the active provider color so the glow feels like data arriving from
// that specific provider.
// NO scaling, NO movement, NO bounce — only a soft color glow.

export function useAppArrivalEffect(
  phase: RoutingPhase,
  providerColor: string,
) {
  const ref = useRef<SVGRectElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Ensure the rect has a CSS transition for smooth enter + exit.
    // 450ms on fill/stroke/filter; 600ms on filter for a slightly slower fade-out feel.
    el.style.transition =
      "fill 450ms ease, stroke 450ms ease, filter 600ms ease"

    if (phase === "arrival") {
      // Arrival: provider-colored border + fill tint + drop-shadow glow.
      // Fill: base dark card tinted at ~15% provider opacity.
      el.setAttribute(
        "fill",
        `color-mix(in srgb, ${providerColor} 15%, rgba(8,8,12,0.65))`,
      )
      el.setAttribute("stroke", providerColor)
      el.setAttribute("stroke-width", "1.5")
      el.setAttribute("stroke-opacity", "0.65")
      el.style.filter = [
        `drop-shadow(0 0 6px  ${providerColor}66)`,
        `drop-shadow(0 0 18px ${providerColor}33)`,
        `drop-shadow(0 0 45px ${providerColor}1A)`,
      ].join(" ")
    } else {
      // Idle: back to default dim state.
      el.setAttribute("fill", "rgba(8,8,12,0.65)")
      el.setAttribute("stroke", "rgba(255,255,255,0.08)")
      el.setAttribute("stroke-width", "1")
      el.setAttribute("stroke-opacity", "1")
      el.style.filter = "none"
    }
  }, [phase, providerColor])

  return ref
}

// ─── useEngineFlash ───────────────────────────────────────────────────────────
// TASK 2: Red core "processing" flash.
//
// Fires ONLY when phase transitions to 'rotate' (= packet just arrived at Arqon).
// Targets the hexagon polygon fill ONLY — no scale, no bloom, no movement.
//
// The ref is on the <polygon> element itself, NOT the <g ref={hexRef}>.
// This means the flash is completely independent of the breathing scale animation.
//
// Timing: 130ms bright hold → 420ms fade back to idle fill.

export function useEngineFlash(phase: RoutingPhase) {
  const ref = useRef<SVGPolygonElement | null>(null)
  const didFlash = useRef(false)
  const fadeTimer = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (phase === "rotate" && !didFlash.current) {
      didFlash.current = true

      // Cancel any in-progress fade
      if (fadeTimer.current !== null) {
        window.clearTimeout(fadeTimer.current)
        fadeTimer.current = null
      }

      // Instant bright flash on the border only
      el.style.transition = "none"
      el.setAttribute("stroke", "#ff4444")
      el.setAttribute("stroke-width", "3")
      el.style.filter =
        "drop-shadow(0 0 12px rgba(220, 38, 38, 0.8)) drop-shadow(0 0 24px rgba(220, 38, 38, 0.4))"

      // After 130ms, smooth fade back to idle dim fill
      fadeTimer.current = window.setTimeout(() => {
        el.style.transition =
          "stroke 420ms ease-out, stroke-width 420ms ease-out, filter 420ms ease-out"
        el.setAttribute("stroke", "var(--color-accent)")
        el.setAttribute("stroke-width", "1.5")
        el.style.filter = "none"
        fadeTimer.current = null
      }, 130)
    } else if (phase !== "rotate") {
      didFlash.current = false
    }

    return () => {
      if (fadeTimer.current !== null) {
        window.clearTimeout(fadeTimer.current)
        fadeTimer.current = null
      }
    }
  }, [phase])

  return ref
}

import RoutingDiagram from "./RoutingDiagram"

export default function AnimatedRoutingFlow() {
  return <RoutingDiagram />
}
