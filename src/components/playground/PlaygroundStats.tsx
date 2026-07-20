import { motion, useReducedMotion } from 'framer-motion'
import { Activity, Clock, DollarSign, Database, CheckCircle2 } from 'lucide-react'
import { useCountUp } from '../../motion/useCountUp'
import { ModelProvider } from '../../pages/Playground'
import { useEffect, useState } from 'react'

interface PlaygroundStatsProps {
  isGenerating: boolean
  provider: ModelProvider
}

// Sparkline component simulation
function MiniSparkline({ active }: { active: boolean }) {
  const shouldReduceMotion = useReducedMotion()
  return (
    <div className="w-12 h-4 flex items-end gap-[1px] opacity-50">
      {[4, 2, 5, 3, 7, 4, 8, 5, 9, 6].map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: '20%' }}
          animate={{ height: active ? `${h * 10}%` : '20%' }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.4,
            delay: shouldReduceMotion ? 0 : i * 0.05,
            repeat: active ? Infinity : 0,
            repeatType: 'reverse'
          }}
          className="w-1 bg-accent/80 rounded-t-[1px]"
        />
      ))}
    </div>
  )
}

export function PlaygroundStats({ isGenerating, provider }: PlaygroundStatsProps) {
  const [phase, setPhase] = useState(0) // 0: Idle, 1: Queued, 2: Routing, 3: Processing, 4: Completed
  
  // Realism simulation for Timeline and Cost
  useEffect(() => {
    if (isGenerating) {
      setPhase(1)
      const t1 = setTimeout(() => setPhase(2), 300)
      const t2 = setTimeout(() => setPhase(3), 800)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    } else if (phase === 3) {
      setPhase(4)
      const t3 = setTimeout(() => setPhase(0), 4000) // Reset after 4s idle
      return () => clearTimeout(t3)
    }
  }, [isGenerating])

  return (
    <div className="w-full flex items-center justify-between gap-8 h-full">
      
      {/* 1. Left Side: Route Visualization */}
      <div className="flex items-center gap-3 w-[250px] shrink-0">
        <span className="text-[10px] font-medium text-muted uppercase tracking-widest mr-2">Route Flow</span>
        
        <div className="flex items-center gap-2">
          {/* App Node */}
          <div className="w-6 h-6 rounded-md bg-surface border border-border flex items-center justify-center relative">
            <div className="w-2 h-2 rounded-sm bg-foreground/60" />
            {isGenerating && (
              <motion.div 
                className="absolute inset-0 bg-accent/20 rounded-md"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
          
          {/* Path 1 */}
          <div className="w-6 h-px bg-border relative overflow-hidden">
            {isGenerating && (
              <motion.div
                className="absolute top-0 left-0 w-3 h-full bg-accent/80 shadow-[0_0_8px_rgba(255,59,59,0.8)]"
                animate={{ x: [-12, 24] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>

          {/* Arqon Engine Node */}
          <div className="w-6 h-6 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center relative shadow-[0_0_10px_rgba(255,59,59,0.1)]">
            <img src="/logo/arqon-new-logo.png" alt="Arqon" className="w-3.5 h-3.5 object-contain opacity-80" />
          </div>

          {/* Path 2 */}
          <div className="w-6 h-px bg-border relative overflow-hidden">
            {isGenerating && phase >= 2 && (
              <motion.div
                className="absolute top-0 left-0 w-3 h-full bg-accent/80 shadow-[0_0_8px_rgba(255,59,59,0.8)]"
                animate={{ x: [-12, 24] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>

          {/* Provider Node */}
          <div className="w-6 h-6 rounded-md bg-surface border border-border flex items-center justify-center text-[8px] font-bold text-foreground uppercase truncate px-1">
            {provider.substring(0, 3)}
            {isGenerating && phase >= 3 && (
              <motion.div 
                className="absolute inset-0 bg-accent/20 rounded-md"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
        </div>
      </div>

      {/* 2. Middle: Request Timeline */}
      <div className="flex-1 flex justify-center min-w-0">
        <div className="flex items-center max-w-sm w-full relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border -translate-y-1/2 -z-10" />
          {/* Progress bar */}
          <div className="absolute top-1/2 left-0 h-[1px] bg-success -translate-y-1/2 -z-10 transition-all duration-500 ease-out" 
               style={{ width: phase === 0 ? '0%' : phase === 1 ? '10%' : phase === 2 ? '50%' : phase === 3 ? '85%' : '100%' }} />
          
          <div className="flex justify-between w-full">
            <TimelineNode label="Queued" active={phase >= 1} done={phase > 1} />
            <TimelineNode label="Routing" active={phase >= 2} done={phase > 2} />
            <TimelineNode label="Processing" active={phase >= 3} done={phase > 3} />
            <TimelineNode label="Completed" active={phase >= 4} done={phase === 4} />
          </div>
        </div>
      </div>

      {/* 3. Right Side: Metrics */}
      <div className="flex items-center gap-6 shrink-0">
        <StatCard icon={<Clock size={12} />} label="Latency" value={phase === 4 ? 245 : 0} suffix="ms" active={isGenerating} />
        <StatCard icon={<Database size={12} />} label="Tokens" value={phase === 4 ? 409 : 0} active={isGenerating} />
        <StatCard icon={<DollarSign size={12} />} label="Cost" value={phase === 4 ? 0.0015 : 0} prefix="$" decimals={4} active={isGenerating} />
        <StatCard icon={<Activity size={12} />} label="Response Time" value={phase === 4 ? 1.2 : 0} suffix="s" decimals={1} active={isGenerating} />
      </div>

    </div>
  )
}

function TimelineNode({ label, active, done }: { label: string, active: boolean, done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 relative group">
      <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-background
        ${done ? 'border-success bg-success/20 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 
          active ? 'border-accent bg-accent/20 shadow-[0_0_8px_rgba(255,59,59,0.3)]' : 
          'border-border/60'}`}
      >
        {done && <CheckCircle2 size={8} className="text-success" />}
      </div>
      <span className={`text-[9px] uppercase tracking-wider font-medium transition-colors absolute top-5 whitespace-nowrap
        ${done ? 'text-success/80' : active ? 'text-foreground' : 'text-muted/40'}`}
      >
        {label}
      </span>
    </div>
  )
}

function StatCard({ icon, label, value, prefix = '', suffix = '', decimals = 0, active }: { 
  icon: React.ReactNode, label: string, value: number, prefix?: string, suffix?: string, decimals?: number, active: boolean 
}) {
  const shouldReduceMotion = useReducedMotion()
  const displayValue = useCountUp(value, shouldReduceMotion ? 0 : 1000, decimals)
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted/60 text-[10px] font-medium uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-sm font-mono font-medium text-foreground">
          {prefix}{displayValue}{suffix}
        </span>
        <MiniSparkline active={active} />
      </div>
    </div>
  )
}
