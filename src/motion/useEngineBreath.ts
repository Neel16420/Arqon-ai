/**
 * useEngineBreath
 * ───────────────
 * Drives the ARQON engine center's "breathing" heartbeat animation.
 *
 * Uses a single rAF loop and writes scale/opacity directly to a
 * provided SVG <g> element's style — zero React re-renders.
 *
 * The breathing is a smooth sine wave that:
 * - Scales the engine glyph between ENGINE.breathScale[0] and [1]
 * - Pulses the outer glow opacity between ENGINE.glowRange[0] and [1]
 *
 * Usage:
 *   const engineRef = useEngineBreath()
 *   <g ref={engineRef}>...</g>
 */

import { useEffect, useRef } from 'react'
import { ENGINE } from './motionTokens'
import { useReducedMotion } from './useReducedMotion'

export function useEngineBreath() {
  const ref = useRef<SVGGElement>(null)
  const glowRef = useRef<SVGCircleElement>(null)
  const rafRef = useRef<number>(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return

    const [scaleMin, scaleMax] = ENGINE.breathScale
    const [glowMin, glowMax] = ENGINE.glowRange
    const period = ENGINE.breathPeriod

    const animate = (now: number) => {
      // Sine wave: 0→1→0 over one period
      const phase = (now % period) / period
      const sine = (Math.sin(phase * Math.PI * 2 - Math.PI / 2) + 1) / 2

      const scale = scaleMin + (scaleMax - scaleMin) * sine
      const glowOpacity = glowMin + (glowMax - glowMin) * sine

      if (ref.current) {
        // GPU-accelerated via transform — no layout thrash
        ref.current.style.transform = `scale(${scale})`
        ref.current.style.transformOrigin = '290px 152px' // engine center in viewBox coords
        ref.current.style.transformBox = 'fill-box'
      }

      if (glowRef.current) {
        glowRef.current.setAttribute('opacity', String(glowOpacity))
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [reduced])

  return { ref, glowRef }
}
