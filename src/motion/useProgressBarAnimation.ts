import { useEffect } from 'react'
import { useReducedMotion } from './useReducedMotion'

// Module-level flag to track animations that have already played during this session.
// This prevents animations from replaying when switching tabs, filtering, or re-rendering.
const playedFlags = new Set<string>()

export function useProgressBarAnimation(id: string): boolean {
  const reduced = useReducedMotion()
  
  // Read state synchronously during render to avoid layout shifts or hydration mismatches.
  const hasPlayed = playedFlags.has(id)

  useEffect(() => {
    // Mark as played after the first render, so subsequent mounts (e.g., from tab switching)
    // will read hasPlayed as true.
    if (!reduced && !hasPlayed) {
      playedFlags.add(id)
    }
  }, [id, reduced, hasPlayed])

  // Only animate if the user hasn't requested reduced motion AND the animation hasn't played yet.
  return !reduced && !hasPlayed
}
