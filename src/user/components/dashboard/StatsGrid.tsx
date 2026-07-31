import { MessageSquare, Cpu, Zap, FolderGit2, TrendingUp } from 'lucide-react'
import { useCountUp } from '../../../motion/useCountUp'

export interface StatMetric {
  id: string
  label: string
  numericValue: number
  suffix?: string
  prefix?: string
  decimals?: number
  trend?: string
  trendUp?: boolean
  subtext: string
  icon: 'chat' | 'tokens' | 'requests' | 'projects'
  progress?: number // 0-100 percentage
}

interface StatsGridProps {
  loading?: boolean
  error?: string | null
  stats?: StatMetric[]
}

const DEFAULT_STATS: StatMetric[] = [
  {
    id: 'conversations',
    label: 'Conversations',
    numericValue: 142,
    trend: '+18.4%',
    trendUp: true,
    subtext: 'vs previous 30 days',
    icon: 'chat',
  },
  {
    id: 'tokens-used',
    label: 'Tokens Used',
    numericValue: 1.25,
    suffix: 'M',
    decimals: 2,
    trend: '25% of quota',
    trendUp: true,
    subtext: 'Monthly limit: 5.00M',
    icon: 'tokens',
    progress: 25,
  },
  {
    id: 'requests-today',
    label: 'Requests Today',
    numericValue: 84,
    trend: 'Avg 210ms',
    trendUp: true,
    subtext: '100% success rate',
    icon: 'requests',
  },
  {
    id: 'active-projects',
    label: 'Active Projects',
    numericValue: 6,
    trend: '+2 new',
    trendUp: true,
    subtext: 'All operational',
    icon: 'projects',
  },
]

function AnimatedStatValue({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  const animatedValue = useCountUp(value, 1200, decimals)
  return (
    <span>
      {prefix}
      {animatedValue}
      {suffix}
    </span>
  )
}

function StatIcon({ type }: { type: StatMetric['icon'] }) {
  switch (type) {
    case 'chat':
      return <MessageSquare size={18} className="text-accent" />
    case 'tokens':
      return <Cpu size={18} className="text-emerald-400" />
    case 'requests':
      return <Zap size={18} className="text-blue-400" />
    case 'projects':
      return <FolderGit2 size={18} className="text-purple-400" />
  }
}

export default function StatsGrid({
  loading = false,
  error = null,
  stats = DEFAULT_STATS,
}: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl glass-surface glass-border space-y-3 animate-shimmer"
          >
            <div className="flex items-center justify-between">
              <div className="w-20 h-4 bg-surface-2 rounded animate-pulse" />
              <div className="w-8 h-8 rounded-lg bg-surface-2 animate-pulse" />
            </div>
            <div className="w-28 h-8 bg-surface-2 rounded animate-pulse" />
            <div className="w-36 h-3 bg-surface-2 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl glass-surface glass-border border-red-500/20 text-xs text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="p-5 rounded-xl glass-surface glass-border card-hover flex flex-col justify-between relative overflow-hidden"
        >
          {/* Top Info Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-muted">{stat.label}</span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
              }}
            >
              <StatIcon type={stat.icon} />
            </div>
          </div>

          {/* Big Number */}
          <div className="my-2">
            <div
              className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <AnimatedStatValue
                value={stat.numericValue}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.decimals}
              />
            </div>
          </div>

          {/* Optional Progress Bar */}
          {typeof stat.progress === 'number' && (
            <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden my-1">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-accent transition-all duration-1000 ease-out"
                style={{ width: `${stat.progress}%` }}
              />
            </div>
          )}

          {/* Footer Trend & Subtext */}
          <div className="flex items-center justify-between text-xs mt-1 pt-2 border-t border-border/40">
            <span className="text-muted truncate">{stat.subtext}</span>
            {stat.trend && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400 shrink-0 ml-1">
                <TrendingUp size={12} />
                {stat.trend}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
