import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ProviderIcon } from '../icons/ProviderLogos'
import { useCountUp } from '../../motion/useCountUp'

interface ProviderDistributionProps {
  refreshTrigger?: boolean
}

const COLORS = ['#ff3b3b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']

// Helper component for animating percentage string
function AnimatedPercentage({ value, durationMs, shouldReduceMotion }: { value: number, durationMs: number, shouldReduceMotion: boolean | null }) {
  const count = useCountUp(value, shouldReduceMotion ? 0 : durationMs)
  return <span>{count}%</span>
}

export function ProviderDistribution({ refreshTrigger }: ProviderDistributionProps) {
  const shouldReduceMotion = useReducedMotion()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  // Re-mount key to force restart animations on refresh
  const keyBase = refreshTrigger ? 'r' : 'i'

  const rawData = useMemo(() => [
    { name: 'OpenAI', value: Math.floor(Math.random() * 400) + 300, provider: 'openai' },
    { name: 'Anthropic', value: Math.floor(Math.random() * 300) + 200, provider: 'anthropic' },
    { name: 'Gemini', value: Math.floor(Math.random() * 200) + 100, provider: 'google' },
    { name: 'Azure', value: Math.floor(Math.random() * 150) + 50, provider: 'azure' },
    { name: 'Mistral', value: Math.floor(Math.random() * 100) + 30, provider: 'mistral' },
  ], [refreshTrigger]).sort((a, b) => b.value - a.value)

  const total = rawData.reduce((acc, curr) => acc + curr.value, 0)
  
  // SVG Math
  const radius = 70
  const strokeWidth = 24
  const circumference = 2 * Math.PI * radius
  
  let currentAngle = -90 // Start at top
  let currentDelay = 0.2 // Initial delay

  const slices = rawData.map((d, i) => {
    const percentage = d.value / total
    const sliceLength = percentage * circumference
    const strokeDasharray = `${sliceLength} ${circumference}`
    const rotation = currentAngle
    
    // Each slice gets a portion of the 900ms duration proportional to its size (minimum 100ms)
    const drawDuration = shouldReduceMotion ? 0 : Math.max(0.1, percentage * 0.9)
    const thisDelay = currentDelay
    currentDelay += drawDuration
    
    currentAngle += (percentage * 360)
    
    return {
      ...d,
      percentage: Math.round(percentage * 100),
      color: COLORS[i % COLORS.length],
      strokeDasharray,
      rotation,
      drawDuration,
      delay: thisDelay
    }
  })

  return (
    <motion.div 
      key={`container-${keyBase}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
      className="w-full bg-surface/30 backdrop-blur-md border border-border/40 rounded-2xl p-6 transition-colors h-[420px] flex flex-col group relative overflow-hidden"
    >
      {/* Micro-interaction: Subtle hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02)_0%,transparent_70%)]" />

      <h2 className="text-lg font-bold text-foreground font-space mb-1">Provider Distribution</h2>
      <p className="text-xs text-muted mb-6">Traffic handled per AI provider</p>

      <div className="flex-1 min-h-0 relative flex flex-col items-center">
        {/* Custom SVG Donut */}
        <div className="w-full h-[200px] flex items-center justify-center relative">
          <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-visible">
            {slices.map((slice, i) => {
              const isHovered = hoveredIndex === i
              const isDimmed = hoveredIndex !== null && !isHovered

              return (
                <motion.circle
                  key={`slice-${slice.name}-${keyBase}`}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeLinecap="butt"
                  style={{ transformOrigin: '100px 100px' }}
                  initial={shouldReduceMotion ? { 
                    rotate: slice.rotation, 
                    strokeDashoffset: 0 
                  } : { 
                    rotate: slice.rotation, 
                    strokeDashoffset: circumference,
                    scale: 1
                  }}
                  animate={shouldReduceMotion ? {} : { 
                    strokeDashoffset: 0,
                    scale: [1, 1.04, 1], // The "Pop" effect when it finishes drawing
                    opacity: isDimmed ? 0.3 : 1
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{
                    strokeDashoffset: { duration: slice.drawDuration, delay: slice.delay, ease: "easeOut" },
                    scale: { duration: 0.3, delay: slice.delay + slice.drawDuration, ease: "easeOut" }, // Pop occurs right after drawing
                    opacity: { duration: 0.2 }
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer transition-colors"
                />
              )
            })}
          </svg>

          {/* Center text (Total) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: shouldReduceMotion ? 0 : currentDelay, duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="text-[10px] text-muted uppercase tracking-widest mb-0.5">Total</div>
            <div className="text-xl font-bold text-foreground font-space">
              {(total / 1000).toFixed(1)}k
            </div>
          </motion.div>
        </div>

        {/* Legend */}
        <div className="w-full mt-6 space-y-1.5 overflow-y-auto custom-scrollbar pr-2 pb-2">
          {slices.map((slice, i) => (
            <motion.div 
              key={`legend-${slice.name}-${keyBase}`}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.8 + (i * 0.04), duration: 0.3 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between text-sm group p-1.5 rounded-lg transition-colors cursor-pointer ${
                hoveredIndex === i ? 'bg-surface-2' : hoveredIndex !== null ? 'opacity-40' : 'hover:bg-surface-2/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                <ProviderIcon type={slice.provider} width={14} height={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="text-foreground/80 group-hover:text-foreground transition-colors">{slice.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-muted group-hover:text-foreground transition-colors">{slice.value}</span>
                <span className="font-mono text-xs w-10 text-right text-muted/60">
                  <AnimatedPercentage value={slice.percentage} durationMs={900} shouldReduceMotion={shouldReduceMotion} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
