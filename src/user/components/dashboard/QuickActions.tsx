import React from 'react'
import {
  MessageSquarePlus,
  History,
  Bookmark,
  Activity,
  Settings,
  BookOpen,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

export interface QuickActionItem {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  badge?: string
  actionPage?: string
  href?: string
}

interface QuickActionsProps {
  loading?: boolean
  error?: string | null
  items?: QuickActionItem[]
  onActionClick?: (item: QuickActionItem) => void
}

const DEFAULT_ACTIONS: QuickActionItem[] = [
  {
    id: 'new-chat',
    title: 'New AI Chat',
    subtitle: 'Start a high-speed reasoning or code session',
    icon: <MessageSquarePlus className="text-accent" size={20} />,
    badge: 'Popular',
    actionPage: 'chat',
  },
  {
    id: 'recent-conversations',
    title: 'Recent Conversations',
    subtitle: 'Resume previous threads & generated outputs',
    icon: <History className="text-blue-400" size={20} />,
    actionPage: 'history',
  },
  {
    id: 'saved-prompts',
    title: 'Saved Prompts',
    subtitle: 'Access system instructions & custom templates',
    icon: <Bookmark className="text-amber-400" size={20} />,
    badge: '12 Prompts',
    actionPage: 'chat',
  },
  {
    id: 'api-usage',
    title: 'API Usage',
    subtitle: 'Monitor token consumption & latency stats',
    icon: <Activity className="text-emerald-400" size={20} />,
    actionPage: 'settings',
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Manage profile preferences & API keys',
    icon: <Settings className="text-purple-400" size={20} />,
    actionPage: 'settings',
  },
  {
    id: 'documentation',
    title: 'Documentation',
    subtitle: 'Explore model benchmarks & API reference',
    icon: <BookOpen className="text-cyan-400" size={20} />,
    badge: 'v2.4 Docs',
    href: '/help',
  },
]

export default function QuickActions({
  loading = false,
  error = null,
  items = DEFAULT_ACTIONS,
  onActionClick,
}: QuickActionsProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-32 h-5 bg-surface-2 rounded animate-pulse" />
          <div className="w-20 h-4 bg-surface-2 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl glass-surface glass-border space-y-3 animate-shimmer"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-2 animate-pulse" />
              <div className="w-24 h-4 bg-surface-2 rounded animate-pulse" />
              <div className="w-36 h-3 bg-surface-2 rounded animate-pulse" />
            </div>
          ))}
        </div>
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

  if (!items || items.length === 0) {
    return (
      <div className="p-6 rounded-xl glass-surface glass-border text-center text-muted text-xs">
        No quick actions configured.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          className="text-base font-bold text-foreground flex items-center gap-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <Sparkles size={16} className="text-accent" />
          Quick Actions
        </h2>
        <span className="text-xs text-muted">Instant Access</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onActionClick?.(item)}
            className="group relative p-4 md:p-5 rounded-xl glass-surface glass-border card-hover cursor-pointer transition-all duration-200 flex flex-col justify-between"
          >
            {/* Top Row: Icon + Badge */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {item.icon}
              </div>

              {item.badge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-medium">
                  {item.badge}
                </span>
              )}
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between gap-1">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                <ChevronRight
                  size={14}
                  className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0"
                />
              </div>
              <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
