import { SkelBox } from "./SkeletonBase"

export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-12 w-full mx-auto max-w-5xl">
      {/* Header */}
      <div className="border-b border-border/40 pb-5 space-y-2">
        <SkelBox className="h-7 w-40 rounded-md" />
        <SkelBox className="h-4 w-96 max-w-full rounded-md opacity-60" />
      </div>

      {/* Main Settings Body */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Nav Menu */}
        <div className="space-y-2 md:col-span-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-10 px-3 rounded-lg flex items-center gap-3 bg-surface/10"
            >
              <SkelBox className="w-5 h-5 rounded" />
              <SkelBox className="h-4 w-24 rounded" />
            </div>
          ))}
        </div>

        {/* Right Configuration Forms */}
        <div className="md:col-span-3 border border-border/40 bg-surface/20 rounded-xl p-6 space-y-6">
          <div className="space-y-1 pb-4 border-b border-border/20">
            <SkelBox className="h-5 w-48 rounded" />
            <SkelBox className="h-3.5 w-80 max-w-full rounded opacity-60" />
          </div>

          {/* Form Rows */}
          <div className="space-y-6">
            <div className="space-y-2">
              <SkelBox className="h-4 w-32 rounded" />
              <SkelBox className="h-10 w-full rounded-lg" />
            </div>

            <div className="space-y-2">
              <SkelBox className="h-4 w-36 rounded" />
              <SkelBox className="h-10 w-full rounded-lg" />
            </div>

            {/* Toggle Setting Row */}
            <div className="flex items-center justify-between pt-4 border-t border-border/20">
              <div className="space-y-1">
                <SkelBox className="h-4 w-44 rounded" />
                <SkelBox className="h-3 w-64 max-w-full rounded opacity-50" />
              </div>
              <SkelBox className="w-11 h-6 rounded-full shrink-0" />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/20">
            <SkelBox className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
