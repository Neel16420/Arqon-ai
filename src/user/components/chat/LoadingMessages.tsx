export default function LoadingMessages() {
  return (
    <div className="space-y-6 py-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-2 shrink-0" />
          <div className="space-y-2 flex-1 max-w-xl">
            <div className="h-4 bg-surface-2 rounded w-1/4" />
            <div className="h-4 bg-surface-2 rounded w-full" />
            <div className="h-4 bg-surface-2 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
