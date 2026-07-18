/**
 * useReducedMotion
 * ────────────────
 * Subscribes to the OS-level prefers-reduced-motion media query.
 * Returns true when the user has requested reduced motion.
 *
 * Usage:
 *   const reduced = useReducedMotion()
 *   if (reduced) { skip animations }
 *
 * All ARQON animation hooks must check this before running.
 */
import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const mq =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null

  const [reduced, setReduced] = useState<boolean>(mq?.matches ?? false)

  useEffect(() => {
    if (!mq) return
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return reduced
}
