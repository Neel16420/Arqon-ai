export default function LoadingState() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero Skeleton */}
      <div className="glass-surface glass-border rounded-2xl p-8 animate-shimmer space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-2" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-surface-2 rounded" />
            <div className="w-56 h-7 bg-surface-2 rounded" />
          </div>
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-5 rounded-xl glass-surface glass-border space-y-3 animate-shimmer">
            <div className="w-10 h-10 rounded-lg bg-surface-2" />
            <div className="w-28 h-4 bg-surface-2 rounded" />
            <div className="w-40 h-3 bg-surface-2 rounded" />
          </div>
        ))}
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-xl glass-surface glass-border space-y-3 animate-shimmer">
            <div className="w-20 h-4 bg-surface-2 rounded" />
            <div className="w-32 h-8 bg-surface-2 rounded" />
          </div>
        ))}
      </div>

      {/* Activity + Models Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl glass-surface glass-border space-y-4 animate-shimmer">
          <div className="w-32 h-5 bg-surface-2 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="w-full h-12 bg-surface-2/40 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="p-5 rounded-xl glass-surface glass-border space-y-4 animate-shimmer">
          <div className="w-32 h-5 bg-surface-2 rounded" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-28 bg-surface-2/40 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
