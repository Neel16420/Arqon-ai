/**
 * useCountUp
 * ──────────
 * Animate numbers counting up on mount.
 * Falls back instantly if prefers-reduced-motion is true.
 */
import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

export function useCountUp(
  endValue: number,
  durationMs: number = 1000,
  decimals: number = 0
): string {
  const reduced = useReducedMotion()
  const [value, setValue] = useState(reduced ? endValue : 0)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (reduced) {
      setValue(endValue)
      return
    }

    const animate = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / durationMs, 1)
      
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      setValue(endValue * ease)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setValue(endValue)
      }
    }

    // Reset and start
    startTimeRef.current = null
    setValue(0)
    rafRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafRef.current)
  }, [endValue, durationMs, reduced])

  return value.toFixed(decimals)
}
