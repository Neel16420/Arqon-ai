import { useState, useCallback } from 'react'
import type { UserProfileData, BillingSubscription } from '../types'

/**
 * Custom hook encapsulating workspace state and backend readiness logic.
 * Components consume this hook so migrating from mock data to SWR/React Query
 * requires ZERO component refactoring.
 */
export function useUserWorkspace() {
  const [profile, setProfile] = useState<UserProfileData>({
    id: 'usr-1',
    name: 'Neel',
    email: 'user@example.com',
    jobTitle: 'Senior AI Systems Engineer',
    bio: 'Building multi-model AI architectures.',
    timezone: 'UTC+05:30 (Asia/Kolkata)',
    language: 'English (US)',
    tier: 'Pro Tier',
  })

  const [subscription, setSubscription] = useState<BillingSubscription>({
    planName: 'Pro',
    price: '$49',
    period: '/month',
    renewalDate: 'August 1, 2026',
    tokensUsed: 1250000,
    tokensLimit: 5000000,
  })

  const updateProfile = useCallback((updates: Partial<UserProfileData>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }, [])

  return {
    profile,
    subscription,
    setSubscription,
    updateProfile,
    // Prepared SWR / React Query integration points:
    isLoading: false,
    isError: null,
    mutate: () => {},
  }
}
