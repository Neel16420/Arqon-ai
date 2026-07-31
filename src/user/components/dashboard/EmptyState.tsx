import React from 'react'
import { Inbox, Plus, RefreshCw } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  onReset?: () => void
}

export default function EmptyState({
  title = 'No data available',
  description = 'There are no entries or statistics to display at this time.',
  icon,
  actionLabel,
  onAction,
  onReset,
}: EmptyStateProps) {
  return (
    <div className="glass-surface glass-border rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center relative overflow-hidden">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-muted shrink-0"
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
        }}
      >
        {icon || <Inbox size={26} className="text-accent/80" />}
      </div>

      <h3
        className="text-lg font-bold text-foreground mb-1 tracking-tight"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {title}
      </h3>

      <p className="text-xs md:text-sm text-muted max-w-md leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        {onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
            }}
          >
            <Plus size={14} />
            {actionLabel || 'Create New Item'}
          </button>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground bg-surface-2 hover:bg-surface border border-border transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} />
            Reset State
          </button>
        )}
      </div>
    </div>
  )
}
