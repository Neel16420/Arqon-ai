import {
  MessageSquare,
  Bookmark,
  Key,
  FolderSync,
  Clock,
  ChevronRight,
  Activity as ActivityIcon,
} from 'lucide-react'
import { useStaggeredList } from '../../../motion/useStaggeredList'

export type ActivityType = 'chat_created' | 'prompt_saved' | 'api_used' | 'project_updated'

export interface ActivityItem {
  id: string
  title: string
  description: string
  timestamp: string
  type: ActivityType
  badge?: string
}

interface ActivityFeedProps {
  loading?: boolean
  error?: string | null
  activities?: ActivityItem[]
  onItemClick?: (item: ActivityItem) => void
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Chat created',
    description: 'Created conversation "React Component Architecture & State Management"',
    timestamp: '10 minutes ago',
    type: 'chat_created',
    badge: 'GPT-4o',
  },
  {
    id: 'act-2',
    title: 'Prompt saved',
    description: 'Saved prompt "System Instruction: Next.js App Router Master"',
    timestamp: '1 hour ago',
    type: 'prompt_saved',
    badge: 'Templates',
  },
  {
    id: 'act-3',
    title: 'API key used',
    description: 'Key "Prod-Primary-Key" executed request for 14.2k completion tokens',
    timestamp: '3 hours ago',
    type: 'api_used',
    badge: 'API Tier 2',
  },
  {
    id: 'act-4',
    title: 'Project updated',
    description: 'Updated project config for "Arqon AI Assistant Frontend"',
    timestamp: 'Yesterday at 4:30 PM',
    type: 'project_updated',
    badge: 'Workspace',
  },
]

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'chat_created':
      return <MessageSquare size={15} className="text-accent" />
    case 'prompt_saved':
      return <Bookmark size={15} className="text-amber-400" />
    case 'api_used':
      return <Key size={15} className="text-emerald-400" />
    case 'project_updated':
      return <FolderSync size={15} className="text-blue-400" />
  }
}

export default function ActivityFeed({
  loading = false,
  error = null,
  activities = DEFAULT_ACTIVITIES,
  onItemClick,
}: ActivityFeedProps) {
  const getStaggerStyle = useStaggeredList(50)

  if (loading) {
    return (
      <div className="glass-surface glass-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-32 h-5 bg-surface-2 rounded animate-pulse" />
          <div className="w-16 h-4 bg-surface-2 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/40 animate-shimmer">
              <div className="w-8 h-8 rounded-lg bg-surface-2 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="w-28 h-4 bg-surface-2 rounded animate-pulse" />
                <div className="w-48 h-3 bg-surface-2 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-surface glass-border rounded-xl p-5 border-red-500/20 text-xs text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="glass-surface glass-border rounded-xl p-5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-base font-bold text-foreground flex items-center gap-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <ActivityIcon size={16} className="text-accent" />
          Recent Activity
        </h2>
        <span className="text-xs text-muted flex items-center gap-1 font-mono">
          <Clock size={12} />
          Realtime Log
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-muted text-xs">
          No recent activity recorded yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {activities.map((item, idx) => (
            <div
              key={item.id}
              style={getStaggerStyle(idx)}
              onClick={() => onItemClick?.(item)}
              className="group flex items-start gap-3.5 p-3 rounded-xl hover:bg-surface-2/70 border border-transparent hover:border-border transition-all cursor-pointer animate-fade-in-up"
            >
              {/* Icon Capsule */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {getActivityIcon(item.type)}
              </div>

              {/* Text details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                    {item.title}
                  </p>
                  <span className="text-[10px] text-muted shrink-0 font-mono">
                    {item.timestamp}
                  </span>
                </div>

                <p className="text-xs text-muted mt-0.5 truncate leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Chevron */}
              <ChevronRight
                size={14}
                className="text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-transform shrink-0 self-center"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
