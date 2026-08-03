import { SkelBox } from "./SkeletonBase"

export function ComingSoonSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[60vh] text-center w-full max-w-2xl mx-auto">
      <div className="border border-border/40 bg-surface/30 backdrop-blur-md rounded-2xl p-8 md:p-10 w-full flex flex-col items-center gap-5 shadow-xl">
        <SkelBox className="w-14 h-14 rounded-2xl opacity-80" />
        <div className="space-y-2.5 flex flex-col items-center w-full">
          <SkelBox className="h-6 w-32 rounded-full opacity-70" />
          <SkelBox className="h-8 w-56 rounded-lg" />
          <SkelBox className="h-4 w-96 max-w-[90%] rounded opacity-60" />
        </div>
        <div className="pt-4 border-t border-border/20 w-full flex flex-col items-center gap-3">
          <SkelBox className="h-10 w-full max-w-sm rounded-lg" />
          <SkelBox className="h-3 w-48 rounded opacity-50" />
        </div>
      </div>
    </div>
  )
}
