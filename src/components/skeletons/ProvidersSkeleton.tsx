import { SkelBox } from "./SkeletonBase"

export function ProvidersSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-12 w-full mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-2">
          <SkelBox className="h-7 w-48 rounded-md" />
          <SkelBox className="h-4 w-96 max-w-full rounded-md opacity-60" />
        </div>
        <SkelBox className="h-9 w-36 rounded-lg shrink-0" />
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border border-border/40 bg-surface/20 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="space-y-1.5">
              <SkelBox className="h-3.5 w-24 rounded" />
              <SkelBox className="h-6 w-20 rounded" />
            </div>
            <SkelBox className="h-10 w-10 rounded-lg opacity-50" />
          </div>
        ))}
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="border border-border/40 bg-surface/30 rounded-xl p-5 flex flex-col justify-between gap-5"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <SkelBox className="w-11 h-11 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <SkelBox className="h-5 w-28 rounded" />
                  <SkelBox className="h-3.5 w-20 rounded opacity-60" />
                </div>
              </div>
              <SkelBox className="w-10 h-6 rounded-full" />
            </div>

            {/* Connection Details */}
            <div className="space-y-3 pt-2 border-t border-border/20">
              <div className="flex items-center justify-between text-sm">
                <SkelBox className="h-3.5 w-20 rounded" />
                <SkelBox className="h-4 w-16 rounded-full" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <SkelBox className="h-3.5 w-24 rounded" />
                <SkelBox className="h-3.5 w-16 rounded" />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-border/20">
              <SkelBox className="h-8 w-24 rounded-md" />
              <SkelBox className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
