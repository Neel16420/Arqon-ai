import { motion, useReducedMotion } from 'framer-motion'

export function Skeleton({ className, rounded = 'rounded-lg' }: { className?: string, rounded?: string }) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={`bg-surface-2 ${rounded} ${className}`} />
  }

  return (
    <div className={`relative overflow-hidden bg-surface-2 ${rounded} ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
        }}
        animate={{
          translateX: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  )
}

export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background pb-20 animate-fade-in">
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-12 space-y-8 custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <Skeleton className="w-48 h-8 mb-2" />
            <Skeleton className="w-64 h-4" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="w-32 h-9" />
            <Skeleton className="w-9 h-9" />
            <Skeleton className="w-40 h-9" />
          </div>
        </div>

        {/* Global Timeline */}
        <Skeleton className="w-full h-[72px] rounded-[18px]" />

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-[120px] rounded-xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Skeleton className="xl:col-span-2 h-[420px] rounded-2xl" />
              <Skeleton className="xl:col-span-1 h-[420px] rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Skeleton className="h-[280px] rounded-2xl" />
              <Skeleton className="h-[280px] rounded-2xl" />
            </div>
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-[500px] rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
