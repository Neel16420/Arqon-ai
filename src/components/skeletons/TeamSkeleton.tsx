import { SkelBox } from "./SkeletonBase"

export function TeamSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Top Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <SkelBox className="w-56 h-7 rounded-lg" />
          <SkelBox className="w-80 h-4 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <SkelBox className="w-28 h-9 rounded-xl" />
          <SkelBox className="w-36 h-9 rounded-xl" />
        </div>
      </div>

      {/* 4 Stat Cards Skeleton matching exact dimensions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between"
          >
            <div className="space-y-2 flex-1">
              <SkelBox className="w-24 h-3.5 rounded" />
              <SkelBox className="w-14 h-7 rounded-md" />
            </div>
            <SkelBox className="w-10 h-10 rounded-xl shrink-0" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton (Left: Table + Toolbar, Right: Activity) */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Toolbar Skeleton */}
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <SkelBox className="w-64 h-9 rounded-xl" />
            <div className="flex items-center gap-2">
              <SkelBox className="w-28 h-9 rounded-xl" />
              <SkelBox className="w-28 h-9 rounded-xl" />
              <SkelBox className="w-32 h-9 rounded-xl" />
              <SkelBox className="w-24 h-9 rounded-xl" />
            </div>
          </div>

          {/* Table Rows Skeleton */}
          <div className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] p-2 space-y-3">
            <SkelBox className="w-full h-10 rounded-lg opacity-40" />
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-white/5 bg-[var(--color-surface)]"
              >
                <div className="flex items-center gap-3 w-56">
                  <SkelBox className="w-8 h-8 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <SkelBox className="w-28 h-4 rounded" />
                    <SkelBox className="w-36 h-3 rounded" />
                  </div>
                </div>
                <SkelBox className="w-24 h-6 rounded-full" />
                <SkelBox className="w-20 h-6 rounded-full" />
                <SkelBox className="w-24 h-4 rounded" />
                <SkelBox className="w-20 h-4 rounded" />
                <SkelBox className="w-20 h-6 rounded-md" />
                <SkelBox className="w-6 h-6 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Activity Timeline Skeleton */}
        <div className="xl:w-72 shrink-0 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-5 h-fit">
          <SkelBox className="w-32 h-5 rounded" />
          <div className="space-y-4 pt-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex gap-3 items-start">
                <SkelBox className="w-7 h-7 rounded-full shrink-0 mt-1" />
                <div className="space-y-1.5 flex-1">
                  <SkelBox className="w-full h-3.5 rounded" />
                  <SkelBox className="w-3/4 h-3 rounded" />
                  <SkelBox className="w-12 h-2.5 rounded mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
