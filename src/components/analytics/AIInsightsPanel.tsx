import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles, TrendingUp, AlertTriangle, Zap, Check } from 'lucide-react'

interface AIInsightsPanelProps {
  refreshTrigger?: boolean
}

export function AIInsightsPanel({ refreshTrigger }: AIInsightsPanelProps) {
  const shouldReduceMotion = useReducedMotion()
  const insights = useMemo(() => [
    {
      id: 1,
      type: 'positive',
      icon: <Zap size={14} className="text-success" />,
      text: 'Average latency improved by 12% following recent routing optimizations.',
      color: 'border-success/30 bg-success/5'
    },
    {
      id: 2,
      type: 'neutral',
      icon: <TrendingUp size={14} className="text-info" />,
      text: 'OpenAI handled 42% of total requests, up 5% from yesterday.',
      color: 'border-info/30 bg-info/5'
    },
    {
      id: 3,
      type: 'warning',
      icon: <AlertTriangle size={14} className="text-warning" />,
      text: 'Anthropic cost increased by 9% due to extended context window usage.',
      color: 'border-warning/30 bg-warning/5'
    },
    {
      id: 4,
      type: 'positive',
      icon: <Check size={14} className="text-success" />,
      text: 'Routing engine successfully prevented 812 failures via fallback chaining.',
      color: 'border-success/30 bg-success/5'
    },
    {
      id: 5,
      type: 'highlight',
      icon: <Sparkles size={14} className="text-accent" />,
      text: 'Estimated monthly savings of $380 from Smart Routing.',
      color: 'border-accent/40 bg-accent/10 shadow-[0_0_15px_rgba(255,59,59,0.1)]'
    }
  ], [refreshTrigger])

  return (
    <motion.div 
      initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}
      whileHover={{ y: -2 }}
      className="w-full bg-surface/30 backdrop-blur-md border border-border/40 rounded-2xl p-6 relative overflow-hidden"
    >
      {/* Subtle ambient glow in background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[50px] -z-10 translate-x-1/2 -translate-y-1/2" />

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <Sparkles size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-space">AI Insights</h2>
          <p className="text-xs text-muted">Real-time intelligence</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={`${insight.id}-${refreshTrigger ? 'r' : 'i'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.5 + (index * 0.15) }}
            className={`flex gap-3 p-3.5 rounded-xl border ${insight.color} transition-all hover:bg-surface-2/50`}
          >
            <div className="shrink-0 mt-0.5">
              {insight.icon}
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              {insight.text}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
