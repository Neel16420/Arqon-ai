import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ProviderIcon } from '../icons/ProviderLogos'

interface LatencyHeatmapProps {
  refreshTrigger?: boolean
}

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Gemini' },
  { id: 'azure', name: 'Azure' },
  { id: 'mistral', name: 'Mistral' },
]

const HOURS = Array.from({ length: 24 }).map((_, i) => `${i}:00`)

// Generate color based on intensity (0 = excellent, 1 = terrible)
const getColor = (intensity: number) => {
  if (intensity < 0.3) return 'bg-success/80' // Green
  if (intensity < 0.6) return 'bg-warning/80' // Yellow
  if (intensity < 0.8) return 'bg-orange-500/80' // Orange
  return 'bg-accent/80' // Red
}

export function LatencyHeatmap({ refreshTrigger }: LatencyHeatmapProps) {
  const shouldReduceMotion = useReducedMotion()
  const [hoveredCell, setHoveredCell] = useState<{ p: string; h: string; l: number; r: number } | null>(null)

  const data = useMemo(() => {
    return PROVIDERS.map(p => {
      return {
        provider: p,
        hours: HOURS.map(h => {
          const baseLatency = p.id === 'anthropic' ? 400 : p.id === 'openai' ? 250 : 300
          // Add some random spikes
          const spike = Math.random() > 0.9 ? Math.random() * 800 : 0
          const latency = baseLatency + (Math.random() * 100) + spike
          
          // Normalize intensity (0 to 1) assuming max expected latency is 1200ms
          const intensity = Math.min(1, Math.max(0, (latency - 100) / 1000))
          
          return {
            hour: h,
            latency: Math.floor(latency),
            intensity,
            requests: Math.floor(Math.random() * 5000)
          }
        })
      }
    })
  }, [refreshTrigger])

  return (
    <motion.div 
      key={refreshTrigger ? 'r' : 'i'}
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: shouldReduceMotion ? 0 : 0.5 }}
      whileHover={{ y: -2 }}
      className="w-full bg-surface/30 backdrop-blur-md border border-border/40 rounded-2xl p-6 transition-all hover:border-border hover:bg-surface/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] h-full flex flex-col relative group"
    >
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-foreground font-space mb-1">Latency Heatmap</h2>
          <p className="text-xs text-muted">24-hour latency distribution across providers</p>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] text-muted">
          <span>Fast</span>
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-success/80" />
            <div className="w-2.5 h-2.5 rounded-sm bg-warning/80" />
            <div className="w-2.5 h-2.5 rounded-sm bg-orange-500/80" />
            <div className="w-2.5 h-2.5 rounded-sm bg-accent/80" />
          </div>
          <span>Slow</span>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px] flex flex-col h-full justify-between gap-1">
          {/* Header Row (Hours) */}
          <div className="flex mb-2">
            <div className="w-8 shrink-0" /> {/* Spacer for provider icons */}
            <div className="flex-1 flex justify-between px-2">
              {HOURS.filter((_, i) => i % 4 === 0).map(h => (
                <div key={h} className="text-[10px] text-muted/60">{h}</div>
              ))}
            </div>
          </div>

          {/* Data Rows */}
          {data.map((row) => (
            <div key={row.provider.id} className="flex items-center gap-3">
              <div className="w-8 flex justify-center shrink-0">
                <ProviderIcon type={row.provider.id} width={16} height={16} className="opacity-80" />
              </div>
              <div className="flex-1 flex gap-1 h-6">
                {row.hours.map((cell, i) => (
                  <motion.div
                    key={`${row.provider.id}-${i}`}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: shouldReduceMotion ? 0 : (i * 0.02) + 0.5 }}
                    onMouseEnter={() => setHoveredCell({ p: row.provider.name, h: cell.hour, l: cell.latency, r: cell.requests })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`flex-1 rounded-sm cursor-pointer hover:ring-1 hover:ring-white/50 transition-all ${getColor(cell.intensity)}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Tooltip Overlay */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-6 right-6 bg-surface border border-border/60 rounded-lg p-3 shadow-xl backdrop-blur-md z-50 pointer-events-none"
          >
            <div className="text-xs font-semibold text-foreground mb-1">{hoveredCell.p} <span className="text-muted font-normal">• {hoveredCell.h}</span></div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div className="text-muted">Avg Latency</div>
              <div className="font-mono text-right text-foreground">{hoveredCell.l}ms</div>
              <div className="text-muted">Requests</div>
              <div className="font-mono text-right text-foreground">{hoveredCell.r}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
