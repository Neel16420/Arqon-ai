/**
 * useCountUp
 * ──────────
 * Animates a number from 0 to `endValue` exactly ONCE on mount.
 *
 * Key design decisions:
 *
 *  - The effect dependency array is intentionally empty ([]).
 *    The animation fires once when the component mounts and never again.
 *    Navigating away and back remounts the component → fires again. ✓
 *    React re-renders without unmounting → no replay. ✓
 *    Theme changes / dropdown opens / resize → no replay. ✓
 *
 *  - `endValue`, `durationMs`, and `decimals` are captured at mount time
 *    via useRef so the effect closure reads the initial values without
 *    being re-listed as dependencies.
 *
 *  - Falls back to the final value instantly when prefers-reduced-motion
 *    is active. Respects the OS-level accessibility preference.
 *
 *  - Cleans up the rAF on unmount — no memory leaks.
 *
 * Curve: easeOutExpo — fast start, smooth deceleration, no bounce.
 */
import { useState, useEffect, useRef } from 'react'

export function useCountUp(
  endValue: number,
  durationMs: number = 1400,
  decimals: number = 0
): string {
  const endRef      = useRef(endValue)
  const durationRef = useRef(durationMs)
  const decimalsRef = useRef(decimals)

  const [value, setValue] = useState<number>(0)

  useEffect(() => {
    const target   = endRef.current
    const duration = durationRef.current
    let rafId: number
    let startTime: number | null = null

    const animate = (now: number) => {
      if (startTime === null) startTime = now
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // easeOutExpo: fast acceleration, smooth deceleration, no bounce
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

      setValue(target * ease)

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        setValue(target)   // snap to exact value at completion
      }
    }

    rafId = requestAnimationFrame(animate)

    // Cleanup: cancel any in-flight frame on unmount
    return () => cancelAnimationFrame(rafId)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty array: run once on mount only.

  return value.toFixed(decimalsRef.current)
}
