import { SkelBox } from "./SkeletonBase"

export function PlaygroundSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden animate-fade-in pb-8">
      {/* Top Controls Header */}
      <div className="h-14 border-b border-border/40 bg-surface/30 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <SkelBox className="w-8 h-8 rounded-lg shrink-0" />
          <SkelBox className="h-5 w-40 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <SkelBox className="h-8 w-36 rounded-lg" />
          <SkelBox className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* Main Dual Pane Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-[600px] gap-6 p-4 md:p-6">
        {/* Left Provider / Model Configuration Sidebar */}
        <div className="w-full md:w-[280px] lg:w-[320px] border border-border/40 bg-surface/20 rounded-xl p-5 shrink-0 flex flex-col gap-6">
          <div className="space-y-2 pb-4 border-b border-border/20">
            <SkelBox className="h-4 w-28 rounded" />
            <SkelBox className="h-9 w-full rounded-lg mt-2" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <SkelBox className="h-3.5 w-20 rounded" />
                <SkelBox className="h-3.5 w-8 rounded" />
              </div>
              <SkelBox className="h-2 w-full rounded-full opacity-60" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <SkelBox className="h-3.5 w-24 rounded" />
                <SkelBox className="h-3.5 w-8 rounded" />
              </div>
              <SkelBox className="h-2 w-full rounded-full opacity-60" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <SkelBox className="h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* Right Interaction / Terminal Canvas */}
        <div className="flex-1 border border-border/40 bg-surface/20 rounded-xl flex flex-col justify-between overflow-hidden p-5">
          <div className="flex-1 space-y-4 py-4 max-w-2xl mx-auto w-full">
            {/* Mock Message 1 */}
            <div className="flex items-start gap-3">
              <SkelBox className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-2 flex-1 max-w-[80%] bg-surface/40 p-4 rounded-xl">
                <SkelBox className="h-4 w-3/4 rounded" />
                <SkelBox className="h-4 w-1/2 rounded opacity-70" />
              </div>
            </div>

            {/* Mock Message 2 */}
            <div className="flex items-start gap-3 justify-end">
              <div className="space-y-2 flex-1 max-w-[75%] bg-accent/10 p-4 rounded-xl">
                <SkelBox className="h-4 w-full rounded opacity-80" />
                <SkelBox className="h-4 w-5/6 rounded opacity-60" />
              </div>
              <SkelBox className="w-8 h-8 rounded-full shrink-0" />
            </div>
          </div>

          {/* Bottom Prompt Box */}
          <div className="mt-4 pt-4 border-t border-border/20">
            <div className="h-24 border border-border/40 bg-background/50 rounded-xl p-3 flex flex-col justify-between">
              <SkelBox className="h-4 w-64 rounded opacity-50" />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <SkelBox className="w-6 h-6 rounded" />
                  <SkelBox className="w-6 h-6 rounded" />
                </div>
                <SkelBox className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
