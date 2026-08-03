import { SkelBox } from "./SkeletonBase"

export function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-12 w-full mx-auto animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-2">
          <SkelBox className="h-7 w-48 rounded-md" />
          <SkelBox className="h-4 w-80 max-w-full rounded-md opacity-60" />
        </div>
        <div className="flex items-center gap-3">
          <SkelBox className="h-9 w-32 rounded-lg" />
          <SkelBox className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* Top Stat Cards Grid (4 KPI boxes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-border/40 bg-surface/30 rounded-xl p-5 flex flex-col justify-between h-[124px]"
          >
            <div className="flex items-center justify-between">
              <SkelBox className="h-4 w-24 rounded" />
              <SkelBox className="h-8 w-8 rounded-lg" />
            </div>
            <div className="space-y-2">
              <SkelBox className="h-7 w-32 rounded" />
              <SkelBox className="h-3 w-40 max-w-full rounded opacity-50" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Panels Grid (Live Routing Stream + Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-border/40 bg-surface/20 rounded-2xl p-6 h-[420px] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-4 border-b border-border/20">
            <div className="space-y-1.5">
              <SkelBox className="h-5 w-40 rounded" />
              <SkelBox className="h-3.5 w-64 max-w-full rounded opacity-50" />
            </div>
            <SkelBox className="h-7 w-24 rounded-md" />
          </div>
          <div className="flex-1 rounded-xl bg-background/30 flex items-center justify-center p-6">
            <SkelBox className="w-full h-full rounded-lg opacity-40" />
          </div>
        </div>

        <div className="border border-border/40 bg-surface/20 rounded-2xl p-6 h-[420px] flex flex-col justify-between">
          <div className="space-y-1.5 pb-4 border-b border-border/20">
            <SkelBox className="h-5 w-36 rounded" />
            <SkelBox className="h-3.5 w-48 max-w-full rounded opacity-50" />
          </div>
          <div className="flex-1 py-6 flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <SkelBox className="w-3 h-3 rounded-full shrink-0" />
                  <SkelBox className="h-4 w-24 rounded" />
                </div>
                <SkelBox className="h-3 w-1/3 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Chart Panel */}
      <div className="border border-border/40 bg-surface/20 rounded-2xl p-6 h-[340px] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-4 border-b border-border/20">
          <div className="space-y-1.5">
            <SkelBox className="h-5 w-48 rounded" />
            <SkelBox className="h-3.5 w-72 max-w-full rounded opacity-50" />
          </div>
          <div className="flex gap-2">
            <SkelBox className="h-8 w-16 rounded-md" />
            <SkelBox className="h-8 w-16 rounded-md" />
            <SkelBox className="h-8 w-16 rounded-md" />
          </div>
        </div>
        <div className="flex-1 pt-4">
          <SkelBox className="w-full h-full rounded-xl opacity-50" />
        </div>
      </div>
    </div>
  )
}
