import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useCountUp } from '../../motion/useCountUp'

interface GlobalTimelineProps {
  refreshTrigger?: boolean
}

export function GlobalTimeline({ refreshTrigger }: GlobalTimelineProps) {
  const shouldReduceMotion = useReducedMotion()
  // Generate mock 24h data
  const data = useMemo(() => {
    return Array.from({ length: 48 }).map((_, i) => ({
      time: `${Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
      intensity: Math.random() * 0.8 + (i > 20 && i < 30 ? 0.2 : 0) // Peak in middle
    }))
  }, [refreshTrigger])

  const totalRequests = useCountUp(useMemo(() => Math.floor(Math.random() * 50000) + 2000000, [refreshTrigger]), shouldReduceMotion ? 0 : 1400)

  return (
    <motion.div 
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-surface/30 backdrop-blur-md border border-border/40 rounded-[18px] p-4 flex flex-col md:flex-row items-center gap-6 group hover:border-border transition-colors"
    >
      <div className="shrink-0 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center relative">
          <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-accent/30 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
        </div>
        <div>
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">Global Traffic (24h)</div>
          <div className="text-lg font-bold text-foreground font-space flex items-baseline gap-1">
            {(Number(totalRequests) / 1000000).toFixed(2)}M
            <span className="text-[10px] text-success font-medium tracking-wide">▲ LIVE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-end h-8 gap-0.5 w-full">
        {data.map((d, i) => (
          <motion.div
            key={i}
            initial={shouldReduceMotion ? { height: `${Math.max(10, d.intensity * 100)}%` } : { height: 0 }}
            animate={{ height: `${Math.max(10, d.intensity * 100)}%` }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.8, delay: shouldReduceMotion ? 0 : i * 0.01 }}
            className={`flex-1 rounded-t-sm ${d.intensity > 0.7 ? 'bg-accent/80' : 'bg-accent/30'}`}
          />
        ))}
      </div>
    </motion.div>
  )
}
