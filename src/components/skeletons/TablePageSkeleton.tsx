import { SkelBox } from "./SkeletonBase"

export function TablePageSkeleton({
  hasStats = false,
}: {
  hasStats?: boolean
}) {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-12 w-full mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-2">
          <SkelBox className="h-7 w-48 rounded-md" />
          <SkelBox className="h-4 w-80 max-w-full rounded-md opacity-60" />
        </div>
        <SkelBox className="h-9 w-36 rounded-lg shrink-0" />
      </div>

      {/* Optional Top KPI stats for Requests / Logs */}
      {hasStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="border border-border/40 bg-surface/20 rounded-xl p-4 flex flex-col justify-between h-[90px]"
            >
              <SkelBox className="h-3.5 w-24 rounded" />
              <SkelBox className="h-6 w-32 rounded mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Search and Filters Strip */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <SkelBox className="h-10 w-full sm:w-80 rounded-lg shrink-0" />
        <div className="flex items-center gap-2">
          <SkelBox className="h-9 w-28 rounded-lg" />
          <SkelBox className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="border border-border/40 bg-surface/20 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="h-12 bg-surface/40 border-b border-border/40 px-6 flex items-center justify-between gap-4 text-sm font-medium">
          <SkelBox className="h-4 w-32 rounded shrink-0" />
          <SkelBox className="h-4 w-28 rounded hidden sm:block shrink-0" />
          <SkelBox className="h-4 w-24 rounded hidden md:block shrink-0" />
          <SkelBox className="h-4 w-20 rounded hidden lg:block shrink-0" />
          <SkelBox className="h-4 w-16 rounded shrink-0" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border/20">
          {Array.from({ length: 6 }).map((_, r) => (
            <div
              key={r}
              className="h-16 px-6 flex items-center justify-between gap-4 hover:bg-surface/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial">
                <SkelBox className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1 min-w-[120px]">
                  <SkelBox className="h-4 w-36 max-w-full rounded" />
                  <SkelBox className="h-3 w-20 max-w-full rounded opacity-50" />
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <SkelBox className="w-3 h-3 rounded-full" />
                <SkelBox className="h-4 w-24 rounded" />
              </div>

              <SkelBox className="h-4 w-20 rounded hidden md:block shrink-0 opacity-80" />
              <SkelBox className="h-5 w-16 rounded-full hidden lg:block shrink-0 opacity-70" />

              <div className="flex items-center gap-2 shrink-0">
                <SkelBox className="w-8 h-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
