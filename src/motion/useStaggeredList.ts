/**
 * useStaggeredList
 * ────────────────
 * Returns a CSS inline style object with an animation delay for a given index.
 * Useful for staggering lists (like logs) on mount.
 */
import { useReducedMotion } from './useReducedMotion'

export function useStaggeredList(delayMs: number = 40) {
  const reduced = useReducedMotion()
  
  return (index: number): React.CSSProperties => {
    if (reduced) {
      return {}
    }

    return {
      animationDelay: `${index * delayMs}ms`,
      animationFillMode: 'both' // Ensures it stays invisible before it starts
    }
  }
}
