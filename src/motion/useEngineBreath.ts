/**
 * useEngineBreath
 * ───────────────
 * Drives the ARQON engine hexagon's "breathing" heartbeat animation.
 *
 * Uses a single rAF loop and writes scale/opacity directly to DOM elements —
 * zero React re-renders.
 *
 * IMPORTANT: This hook is applied ONLY to the hexagon <g> element.
 * The Arqon logo image is a separate sibling element that does NOT receive
 * any transform from this hook. This prevents the logo's own rotation from
 * being compounded with a parent scale transform.
 *
 * Usage:
 *   const { ref, glowRef } = useEngineBreath()
 *   <g ref={ref}>  ← hexagon ONLY, never the logo
 *   <circle ref={glowRef} />  ← outer glow opacity
 */

import { useEffect, useRef } from "react"
import { ENGINE } from "./motionTokens"
import { useReducedMotion } from "./useReducedMotion"

export function useEngineBreath(isRunning: boolean = true) {
  const ref = useRef<SVGGElement>(null)
  const glowRef = useRef<SVGCircleElement>(null)
  const rafRef = useRef<number>(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !isRunning) {
      if (ref.current) {
        ref.current.style.transform = `scale(1)`
      }
      if (glowRef.current) {
        glowRef.current.setAttribute("opacity", "0")
      }
      return
    }

    const [scaleMin, scaleMax] = ENGINE.breathScale
    const [glowMin, glowMax] = ENGINE.glowRange
    const period = ENGINE.breathPeriod

    const animate = (now: number) => {
      // Sine wave: smoothly oscillates between 0 and 1 over one period
      const t = (now % period) / period
      const sine = (Math.sin(t * Math.PI * 2 - Math.PI / 2) + 1) / 2

      const scale = scaleMin + (scaleMax - scaleMin) * sine
      const glowOpacity = glowMin + (glowMax - glowMin) * sine

      if (ref.current) {
        // GPU-accelerated — fill-box makes transform-origin relative to element bounds
        ref.current.style.transform = `scale(${scale})`
        ref.current.style.transformOrigin = "center center"
        ref.current.style.transformBox = "fill-box"
      }

      if (glowRef.current) {
        glowRef.current.setAttribute("opacity", String(glowOpacity))
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [reduced, isRunning])

  return { ref, glowRef }
}
