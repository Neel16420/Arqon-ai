import { useState, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface PerformanceHeroProps {
  refreshTrigger?: boolean
}

type MetricType = 'Requests' | 'Latency' | 'Tokens' | 'Cost' | 'Errors'

const generateData = (type: MetricType) => {
  const points = 24
  let base = 0
  let variance = 0
  
  if (type === 'Requests') { base = 5000; variance = 2000 }
  else if (type === 'Latency') { base = 200; variance = 100 }
  else if (type === 'Tokens') { base = 100000; variance = 50000 }
  else if (type === 'Cost') { base = 10; variance = 5 }
  else if (type === 'Errors') { base = 5; variance = 10 }

  return Array.from({ length: points }).map((_, i) => ({
    time: `${i}:00`,
    value: Math.max(0, Math.floor(base + Math.random() * variance * (Math.sin(i / 3) + 1))),
  }))
}

// Custom staggered dot
const CustomDot = (props: any) => {
  const { cx, cy, index, shouldReduceMotion, refreshKey, color } = props
  if (cx == null || cy == null) return null
  
  return (
    <motion.circle
      key={`dot-${index}-${refreshKey}`}
      cx={cx}
      cy={cy}
      r={3}
      fill={color}
      stroke="rgba(10, 10, 12, 1)"
      strokeWidth={1.5}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
      initial={shouldReduceMotion ? { scale: 1 } : { scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: shouldReduceMotion ? 0 : 0.8 + (index * 0.03), duration: 0.3, type: 'spring' }}
      className="pointer-events-none"
    />
  )
}

// Active dot for hover
const CustomActiveDot = (props: any) => {
  const { cx, cy, color } = props
  if (cx == null || cy == null) return null
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={5}
      fill="#fff"
      stroke={color}
      strokeWidth={3}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
      initial={{ scale: 1 }}
      animate={{ scale: 1.35 }}
      transition={{ duration: 0.15 }}
      className="pointer-events-none drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
    />
  )
}

export function PerformanceHero({ refreshTrigger }: PerformanceHeroProps) {
  const shouldReduceMotion = useReducedMotion()
  const [activeMetric, setActiveMetric] = useState<MetricType>('Requests')
  const refreshKey = refreshTrigger ? 'r' : 'i'
  
  const data = useMemo(() => generateData(activeMetric), [activeMetric, refreshTrigger])
  const strokeColor = activeMetric === 'Errors' ? '#ff3b3b' : '#3b82f6'

  return (
    <motion.div 
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}
      className="w-full bg-surface/30 backdrop-blur-md border border-border/40 rounded-2xl p-6 transition-all hover:border-border hover:bg-surface/50 h-[420px] flex flex-col group relative"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <h2 className="text-lg font-bold text-foreground font-space">Performance Timeline</h2>
          <p className="text-xs text-muted mt-1">Aggregated platform metrics over the last 24 hours.</p>
        </div>
        
        <div className="flex bg-surface-2 border border-border/40 rounded-lg p-1">
          {(['Requests', 'Latency', 'Tokens', 'Cost', 'Errors'] as MetricType[]).map(metric => (
            <button
              key={metric}
              onClick={() => setActiveMetric(metric)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeMetric === metric 
                  ? 'bg-accent text-white shadow-sm' 
                  : 'text-muted hover:text-foreground hover:bg-surface'
              }`}
            >
              {metric}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 relative -ml-4 z-10">
        {/* We need a key here to force re-animation of the area gradient on metric change / refresh */}
        <ResponsiveContainer width="100%" height="100%" key={`${activeMetric}-${refreshKey}`}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
              </linearGradient>
              <style>
                {`
                  @keyframes delayedFadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                  }
                `}
              </style>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickFormatter={(val) => {
                if (activeMetric === 'Cost') return `$${val}`
                if (val >= 1000) return `${(val/1000).toFixed(1)}k`
                return val
              }}
            />
            <Tooltip 
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ 
                backgroundColor: 'rgba(10, 10, 12, 0.9)', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
              itemStyle={{ color: '#fff', fontSize: '13px' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}
              animationDuration={120}
            />
            {/* The Area fill fades in AFTER the line draws */}
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="none"
              fillOpacity={1} 
              fill="url(#colorValue)" 
              isAnimationActive={false}
              style={{
                opacity: shouldReduceMotion ? 1 : 0,
                animation: shouldReduceMotion ? 'none' : 'delayedFadeIn 300ms ease-out 800ms forwards'
              }}
            />
            {/* The Line draws progressively left to right */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2}
              isAnimationActive={!shouldReduceMotion}
              animationDuration={800}
              animationEasing="ease-out"
              dot={(props: any) => <CustomDot {...props} shouldReduceMotion={shouldReduceMotion} refreshKey={refreshKey} color={strokeColor} />}
              activeDot={(props: any) => <CustomActiveDot {...props} color={strokeColor} />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
