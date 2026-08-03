import { SkelBox } from "./SkeletonBase"

export function RoutingSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-12 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-2">
          <SkelBox className="h-7 w-52 rounded-md" />
          <SkelBox className="h-4 w-96 max-w-full rounded-md opacity-60" />
        </div>
        <SkelBox className="h-9 w-40 rounded-lg shrink-0" />
      </div>

      {/* Strategy Selector Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-border/40 bg-surface/20 rounded-xl p-4 flex flex-col gap-2 h-[96px]"
          >
            <div className="flex items-center justify-between">
              <SkelBox className="w-6 h-6 rounded-lg" />
              <SkelBox className="w-4 h-4 rounded-full opacity-40" />
            </div>
            <SkelBox className="h-4 w-28 rounded" />
            <SkelBox className="h-3 w-36 max-w-full rounded opacity-50" />
          </div>
        ))}
      </div>

      {/* Flow Diagram Panel */}
      <div className="border border-border/40 bg-surface/20 rounded-2xl p-6 h-[380px] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-4 border-b border-border/20">
          <div className="space-y-1">
            <SkelBox className="h-5 w-40 rounded" />
            <SkelBox className="h-3.5 w-64 max-w-full rounded opacity-60" />
          </div>
          <div className="flex gap-2">
            <SkelBox className="h-8 w-24 rounded-md" />
            <SkelBox className="h-8 w-8 rounded-md" />
          </div>
        </div>
        <div className="flex-1 rounded-xl bg-background/30 flex items-center justify-center p-4">
          <SkelBox className="w-full h-full rounded-lg opacity-40" />
        </div>
      </div>

      {/* Fallback Chains & Priorities */}
      <div className="space-y-4">
        <SkelBox className="h-6 w-44 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, k) => (
            <div
              key={k}
              className="border border-border/40 bg-surface/30 rounded-xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <SkelBox className="h-5 w-36 rounded" />
                <SkelBox className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-3 pt-2 border-t border-border/20">
                <div className="flex items-center gap-3">
                  <SkelBox className="w-8 h-8 rounded-lg shrink-0" />
                  <SkelBox className="h-4 w-32 rounded flex-1" />
                  <SkelBox className="h-6 w-14 rounded-md shrink-0" />
                </div>
                <div className="flex items-center gap-3 pl-4 border-l-2 border-dashed border-border/40">
                  <SkelBox className="w-7 h-7 rounded-lg shrink-0 opacity-80" />
                  <SkelBox className="h-4 w-28 rounded flex-1 opacity-80" />
                  <SkelBox className="h-6 w-16 rounded-md shrink-0 opacity-80" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
