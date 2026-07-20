import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ProviderIcon } from '../icons/ProviderLogos'

interface TokenUsageProps {
  refreshTrigger?: boolean
}

export function TokenUsage({ refreshTrigger }: TokenUsageProps) {
  const shouldReduceMotion = useReducedMotion()
  const data = useMemo(() => [
    { name: 'OpenAI', provider: 'openai', used: 120, total: 150, color: 'bg-[#ff3b3b]' },
    { name: 'Anthropic', provider: 'anthropic', used: 85, total: 100, color: 'bg-[#3b82f6]' },
    { name: 'Gemini', provider: 'google', used: 40, total: 100, color: 'bg-[#10b981]' },
    { name: 'Azure', provider: 'azure', used: 25, total: 50, color: 'bg-[#f59e0b]' },
    { name: 'Mistral', provider: 'mistral', used: 12, total: 20, color: 'bg-[#ec4899]' },
  ], [refreshTrigger])

  return (
    <motion.div 
      key={refreshTrigger ? 'r' : 'i'}
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: shouldReduceMotion ? 0 : 0.8 }}
      whileHover={{ y: -2 }}
      className="w-full bg-surface/30 backdrop-blur-md border border-border/40 rounded-2xl p-6 transition-all hover:border-border hover:bg-surface/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] h-[320px] flex flex-col group"
    >
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground font-space">Token Allocation</h2>
        <p className="text-xs text-muted mt-1">Provider limits and current usage (Millions)</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-2">
        {data.map((item, index) => {
          const percent = (item.used / item.total) * 100
          return (
            <div key={item.name}>
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                  <ProviderIcon type={item.provider} width={16} height={16} className="opacity-80" />
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </div>
                <div className="text-xs text-muted">
                  <span className="text-foreground font-mono">{item.used}M</span> / {item.total}M
                </div>
              </div>
              <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden border border-border/30">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: shouldReduceMotion ? 0 : 0.8 + (index * 0.1), ease: "easeOut" }}
                  className={`h-full ${item.color}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
