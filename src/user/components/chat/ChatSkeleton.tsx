export default function ChatSkeleton() {
  return (
    <div className="flex h-full w-full bg-background animate-pulse overflow-hidden rounded-xl border border-border">
      {/* Left Sidebar Skeleton */}
      <div className="w-72 border-r border-border p-4 hidden md:flex flex-col gap-4 bg-surface">
        <div className="h-10 bg-surface-2 rounded-xl" />
        <div className="h-9 bg-surface-2/60 rounded-lg" />
        <div className="space-y-2 mt-2">
          <div className="h-4 w-20 bg-surface-2 rounded" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-surface-2/40 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Main Chat Area Skeleton */}
      <div className="flex-1 flex flex-col justify-between p-4 md:p-6 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="h-9 w-44 bg-surface-2 rounded-xl" />
          <div className="h-8 w-24 bg-surface-2 rounded-lg" />
        </div>

        {/* Messages Placeholder */}
        <div className="flex-1 space-y-6 py-6 overflow-hidden">
          <div className="flex gap-3 max-w-lg">
            <div className="w-8 h-8 rounded-lg bg-surface-2 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-surface-2 rounded w-3/4" />
              <div className="h-4 bg-surface-2 rounded w-1/2" />
            </div>
          </div>
          <div className="flex gap-3 max-w-lg ml-auto flex-row-reverse">
            <div className="w-8 h-8 rounded-lg bg-surface-2 shrink-0" />
            <div className="h-12 bg-surface-2/80 rounded-2xl w-2/3" />
          </div>
        </div>

        {/* Composer Placeholder */}
        <div className="h-16 bg-surface-2/50 rounded-2xl" />
      </div>

      {/* Right Context Panel Skeleton */}
      <div className="w-72 border-l border-border p-4 hidden lg:flex flex-col gap-4 bg-surface">
        <div className="h-6 w-28 bg-surface-2 rounded" />
        <div className="h-20 bg-surface-2/50 rounded-xl" />
        <div className="h-24 bg-surface-2/40 rounded-xl" />
      </div>
    </div>
  )
}
