import { useMemo } from 'react'
import { Sparkles, Zap, ArrowUpRight, Award } from 'lucide-react'

interface WelcomeHeroProps {
  userName?: string
  avatarUrl?: string
  planType?: string
  apiQuota?: {
    used: number
    limit: number
  }
  loading?: boolean
  error?: string | null
  onQuickStart?: () => void
}

export default function WelcomeHero({
  userName = 'Neel',
  planType = 'Pro Tier',
  apiQuota = { used: 64, limit: 100 },
  loading = false,
  error = null,
  onQuickStart,
}: WelcomeHeroProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }, [])

  if (loading) {
    return (
      <div className="glass-surface glass-border rounded-2xl p-6 md:p-8 animate-shimmer relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 animate-pulse" />
            <div className="space-y-2">
              <div className="w-32 h-4 bg-surface-2 rounded animate-pulse" />
              <div className="w-48 h-7 bg-surface-2 rounded animate-pulse" />
              <div className="w-64 h-4 bg-surface-2 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-36 h-10 bg-surface-2 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl glass-surface glass-border border-red-500/30 bg-red-500/5 text-foreground flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold">Failed to load welcome data</p>
            <p className="text-xs text-muted">{error}</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-2 hover:bg-surface border border-border text-foreground transition-all"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl glass-surface glass-border p-6 md:p-8 hover-lift">
      {/* Background ambient lighting effects */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full pointer-events-none opacity-10 blur-2xl"
        style={{ background: 'radial-gradient(circle, var(--color-info) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* User Identity & Greeting */}
        <div className="flex items-start md:items-center gap-4 md:gap-5">
          {/* Avatar with Status Ring */}
          <div className="relative shrink-0 group">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center font-bold text-2xl text-foreground shadow-lg transition-transform duration-300 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 59, 59, 0.2) 0%, rgba(24, 24, 27, 0.9) 100%)',
                border: '1px solid rgba(255, 59, 59, 0.3)',
                boxShadow: '0 8px 24px rgba(255, 59, 59, 0.15)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {userName.charAt(0)}
            </div>
            {/* Live Indicator Dot */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background animate-breathe-green" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent uppercase tracking-wider flex items-center gap-1">
                <Award size={12} />
                {planType}
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                API Quota: {apiQuota.used}%
              </span>
            </div>

            <h1
              className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {greeting},{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-accent">
                {userName} 👋
              </span>
            </h1>

            <p className="text-sm md:text-base text-muted mt-1 max-w-xl leading-relaxed">
              Welcome back to <span className="font-semibold text-foreground">Arqon</span>. Let's build something amazing today.
            </p>
          </div>
        </div>

        {/* Quick Start Action Callout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={onQuickStart}
            className="px-5 py-3 rounded-xl font-medium text-sm text-white shadow-lg flex items-center justify-center gap-2 group transition-all duration-200 active:scale-95 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
              boxShadow: '0 4px 14px rgba(255, 59, 59, 0.35)',
            }}
          >
            <Sparkles size={16} className="transition-transform group-hover:rotate-12" />
            <span>New AI Session</span>
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
