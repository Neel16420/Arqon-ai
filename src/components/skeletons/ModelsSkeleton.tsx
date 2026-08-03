import { SkelBox } from "./SkeletonBase"

export function ModelsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-12 w-full mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <SkelBox className="h-7 w-40 rounded-md" />
            <SkelBox className="h-6 w-16 rounded-full" />
          </div>
          <SkelBox className="h-4 w-96 max-w-full rounded-md opacity-60" />
        </div>
      </div>

      {/* Search and Filter Tabs Strip */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <SkelBox className="h-9 w-20 rounded-lg shrink-0" />
          <SkelBox className="h-9 w-24 rounded-lg shrink-0" />
          <SkelBox className="h-9 w-24 rounded-lg shrink-0" />
          <SkelBox className="h-9 w-32 rounded-lg shrink-0" />
        </div>
        <SkelBox className="h-10 w-full sm:w-72 rounded-lg shrink-0" />
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border border-border/40 bg-surface/30 rounded-xl p-5 flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <SkelBox className="w-10 h-10 rounded-lg shrink-0" />
                <div className="space-y-1.5">
                  <SkelBox className="h-5 w-36 rounded" />
                  <SkelBox className="h-3.5 w-24 rounded opacity-60" />
                </div>
              </div>
              <SkelBox className="w-9 h-5 rounded-full shrink-0" />
            </div>

            {/* Tags Strip */}
            <div className="flex flex-wrap gap-2 pt-2">
              <SkelBox className="h-6 w-16 rounded-full" />
              <SkelBox className="h-6 w-20 rounded-full" />
              <SkelBox className="h-6 w-18 rounded-full" />
            </div>

            {/* Pricing Info Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/20 text-xs">
              <SkelBox className="h-4 w-24 rounded opacity-70" />
              <SkelBox className="h-4 w-28 rounded opacity-70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
