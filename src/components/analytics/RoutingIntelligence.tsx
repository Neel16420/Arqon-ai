import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { BrainCircuit, Shuffle, ShieldCheck, Zap } from 'lucide-react'
import { useCountUp } from '../../motion/useCountUp'

interface RoutingIntelligenceProps {
  refreshTrigger?: boolean
}

export function RoutingIntelligence({ refreshTrigger }: RoutingIntelligenceProps) {
  const shouldReduceMotion = useReducedMotion()
  const fallbacks = useCountUp(useMemo(() => Math.floor(Math.random() * 200) + 500, [refreshTrigger]), shouldReduceMotion ? 0 : 1400)
  const cacheHit = useCountUp(useMemo(() => Math.floor(Math.random() * 15) + 30, [refreshTrigger]), shouldReduceMotion ? 0 : 1400)
  
  return (
    <motion.div 
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: shouldReduceMotion ? 0 : 0.4 }}
      whileHover={{ y: -2 }}
      className="w-full bg-surface/30 backdrop-blur-md border border-border/40 rounded-2xl p-6 transition-all hover:border-border hover:bg-surface/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] h-full flex flex-col justify-between group"
    >
      <div>
        <h2 className="text-lg font-bold text-foreground font-space mb-1">Routing Intelligence</h2>
        <p className="text-xs text-muted mb-6">Smart routing decisions made in the last 24h</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        
        {/* Metric 1 */}
        <div className="bg-surface-2/50 rounded-xl p-4 border border-border/30 hover:border-border/60 transition-colors flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Top Provider</span>
            <div className="p-1.5 rounded-md bg-accent/10">
              <BrainCircuit size={14} className="text-accent" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-foreground font-space">OpenAI</div>
            <div className="text-xs text-muted/80 mt-1">Selected 42% of the time</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-2/50 rounded-xl p-4 border border-border/30 hover:border-border/60 transition-colors flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Fallbacks Triggered</span>
            <div className="p-1.5 rounded-md bg-warning/10">
              <Shuffle size={14} className="text-warning" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-foreground font-space">{fallbacks}</div>
            <div className="text-xs text-success mt-1">Prevented {fallbacks} failures</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-2/50 rounded-xl p-4 border border-border/30 hover:border-border/60 transition-colors flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Cache Hit Rate</span>
            <div className="p-1.5 rounded-md bg-success/10">
              <Zap size={14} className="text-success" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-foreground font-space">{cacheHit}%</div>
            <div className="text-xs text-muted/80 mt-1">Saved ~$42.50 today</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-2/50 rounded-xl p-4 border border-border/30 hover:border-border/60 transition-colors flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Smart Efficiency</span>
            <div className="p-1.5 rounded-md bg-info/10">
              <ShieldCheck size={14} className="text-info" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-foreground font-space">98.4%</div>
            <div className="text-xs text-muted/80 mt-1">Optimal routing decisions</div>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
