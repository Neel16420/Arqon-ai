import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  title = 'Failed to load dashboard',
  message = 'An unexpected network error occurred while retrieving user dashboard metrics.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="glass-surface glass-border rounded-2xl p-8 text-center border-red-500/30 bg-red-500/5 flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-3 shrink-0">
        <AlertTriangle size={24} />
      </div>

      <h3
        className="text-base font-bold text-foreground mb-1"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {title}
      </h3>

      <p className="text-xs text-muted max-w-md leading-relaxed mb-4">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground bg-surface-2 hover:bg-surface border border-border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <RefreshCw size={13} />
          Retry Connection
        </button>
      )}
    </div>
  )
}
