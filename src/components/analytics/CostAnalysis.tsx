import { useState, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface CostAnalysisProps {
  refreshTrigger?: boolean
}

type TimeFrame = 'Today' | 'Week' | 'Month' | 'Year'

const generateData = (frame: TimeFrame) => {
  const points = frame === 'Today' ? 24 : frame === 'Week' ? 7 : frame === 'Month' ? 30 : 12
  const multiplier = frame === 'Today' ? 1 : frame === 'Week' ? 24 : frame === 'Month' ? 24 * 7 : 24 * 30

  return Array.from({ length: points }).map((_, i) => {
    // Generate some slightly realistic looking stacked data
    const openai = Math.floor(Math.random() * 50 * multiplier) + (20 * multiplier)
    const claude = Math.floor(Math.random() * 40 * multiplier) + (10 * multiplier)
    const gemini = Math.floor(Math.random() * 20 * multiplier) + (5 * multiplier)
    const azure = Math.floor(Math.random() * 15 * multiplier)
    const mistral = Math.floor(Math.random() * 10 * multiplier)

    return {
      name: frame === 'Today' ? `${i}:00` : frame === 'Week' ? `Day ${i+1}` : frame === 'Month' ? `${i+1}` : `M${i+1}`,
      OpenAI: openai,
      Claude: claude,
      Gemini: gemini,
      Azure: azure,
      Mistral: mistral,
      total: openai + claude + gemini + azure + mistral
    }
  })
}

export function CostAnalysis({ refreshTrigger }: CostAnalysisProps) {
  const shouldReduceMotion = useReducedMotion()
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('Week')
  
  const refreshKey = refreshTrigger ? 'r' : 'i'
  const data = useMemo(() => generateData(timeFrame), [timeFrame, refreshTrigger])

  return (
    <motion.div 
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: shouldReduceMotion ? 0 : 0.6 }}
      className="w-full bg-surface/30 backdrop-blur-md border border-border/40 rounded-2xl p-6 transition-all hover:border-border hover:bg-surface/50 h-[400px] flex flex-col group relative"
    >
      {/* Micro-interaction shadow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[180ms] pointer-events-none -z-10 shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-2xl" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <h2 className="text-lg font-bold text-foreground font-space">Cost Analysis</h2>
          <p className="text-xs text-muted mt-1">Provider cost breakdown over time</p>
        </div>
        
        <div className="flex bg-surface-2 border border-border/40 rounded-lg p-1">
          {(['Today', 'Week', 'Month', 'Year'] as TimeFrame[]).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeFrame === tf 
                  ? 'bg-accent text-white shadow-sm' 
                  : 'text-muted hover:text-foreground hover:bg-surface'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(10, 10, 12, 0.9)', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
              itemStyle={{ fontSize: '12px', padding: '2px 0' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}
              formatter={(value: any) => [`$${value.toFixed(2)}`, undefined]}
              animationDuration={120}
            />
            {/* Stacked Areas */}
            <Area type="monotone" dataKey="Mistral" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.8} isAnimationActive={!shouldReduceMotion} animationDuration={800} animationEasing="ease-out" key={`mistral-${timeFrame}-${refreshKey}`} />
            <Area type="monotone" dataKey="Azure" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.8} isAnimationActive={!shouldReduceMotion} animationDuration={800} animationEasing="ease-out" key={`azure-${timeFrame}-${refreshKey}`} />
            <Area type="monotone" dataKey="Gemini" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} isAnimationActive={!shouldReduceMotion} animationDuration={800} animationEasing="ease-out" key={`gemini-${timeFrame}-${refreshKey}`} />
            <Area type="monotone" dataKey="Claude" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} isAnimationActive={!shouldReduceMotion} animationDuration={800} animationEasing="ease-out" key={`claude-${timeFrame}-${refreshKey}`} />
            <Area type="monotone" dataKey="OpenAI" stackId="1" stroke="#ff3b3b" fill="#ff3b3b" fillOpacity={0.8} isAnimationActive={!shouldReduceMotion} animationDuration={800} animationEasing="ease-out" key={`openai-${timeFrame}-${refreshKey}`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
