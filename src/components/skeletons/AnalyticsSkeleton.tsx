import { SkelBox } from "./SkeletonBase"

export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-12 w-full mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-2">
          <SkelBox className="h-7 w-48 rounded-md" />
          <SkelBox className="h-4 w-80 max-w-full rounded-md opacity-60" />
        </div>
        <div className="flex items-center gap-2">
          <SkelBox className="h-9 w-32 rounded-lg" />
          <SkelBox className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="border border-border/40 bg-surface/20 rounded-xl p-4 flex flex-col justify-between h-[104px]"
          >
            <div className="flex items-center justify-between">
              <SkelBox className="h-3.5 w-24 rounded" />
              <SkelBox className="w-5 h-5 rounded opacity-50" />
            </div>
            <div className="space-y-1 mt-2">
              <SkelBox className="h-7 w-28 rounded" />
              <SkelBox className="h-3 w-20 rounded opacity-60" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Volume Chart Panel */}
      <div className="border border-border/40 bg-surface/20 rounded-2xl p-6 h-[360px] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-4 border-b border-border/20">
          <div className="space-y-1">
            <SkelBox className="h-5 w-44 rounded" />
            <SkelBox className="h-3.5 w-64 max-w-full rounded opacity-50" />
          </div>
          <div className="flex gap-2">
            <SkelBox className="h-7 w-14 rounded-md" />
            <SkelBox className="h-7 w-14 rounded-md" />
            <SkelBox className="h-7 w-14 rounded-md" />
          </div>
        </div>
        <div className="flex-1 pt-2">
          <SkelBox className="w-full h-full rounded-xl opacity-40" />
        </div>
      </div>

      {/* Breakdown Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, col) => (
          <div
            key={col}
            className="border border-border/40 bg-surface/20 rounded-2xl p-6 h-[320px] flex flex-col gap-4"
          >
            <div className="space-y-1 pb-3 border-b border-border/20">
              <SkelBox className="h-5 w-36 rounded" />
              <SkelBox className="h-3 w-52 max-w-full rounded opacity-50" />
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <SkelBox className="w-full h-full rounded-xl opacity-35" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
