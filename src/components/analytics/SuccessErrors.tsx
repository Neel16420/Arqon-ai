import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface SuccessErrorsProps {
  refreshTrigger?: boolean
}

const COLORS = {
  Success: '#10b981',
  Retries: '#f59e0b',
  Timeouts: '#8b5cf6',
  Errors: '#ff3b3b'
}

// Custom shape to use Framer Motion for precise staggered bottom-up growth and hover lift
const CustomBar = (props: any) => {
  const { x, y, width, height, fill, payload, index, shouldReduceMotion, isHovered, refreshKey } = props
  
  // Recharts passes negative/zero height on initial render sometimes, prevent errors
  if (height === undefined || Number.isNaN(height)) return null

  // Stagger: 40ms. Duration: 600ms.
  const delay = shouldReduceMotion ? 0 : index * 0.04
  const duration = shouldReduceMotion ? 0 : 0.6

  return (
    <motion.rect
      key={`bar-${payload.name}-${refreshKey}`}
      x={x}
      width={width}
      fill={fill}
      rx={4}
      // transform origin for scaling
      style={{ transformOrigin: `${x + width/2}px ${y + height}px` }}
      initial={{ y: y + height, height: 0 }}
      animate={{ 
        y: isHovered ? y - 2 : y, 
        height: height,
        filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
        // Shadow is applied via CSS filter drop-shadow in modern browsers for SVG
      }}
      transition={{
        y: { duration: isHovered ? 0.2 : duration, delay: isHovered ? 0 : delay, ease: "easeOut" },
        height: { duration, delay, ease: "easeOut" },
        filter: { duration: 0.2 }
      }}
      className="cursor-pointer transition-shadow"
    />
  )
}

export function SuccessErrors({ refreshTrigger }: SuccessErrorsProps) {
  const shouldReduceMotion = useReducedMotion()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const refreshKey = refreshTrigger ? 'r' : 'i'

  const data = useMemo(() => [
    { name: 'Success', value: Math.floor(Math.random() * 500000) + 2000000 },
    { name: 'Retries', value: Math.floor(Math.random() * 50000) + 10000 },
    { name: 'Timeouts', value: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Errors', value: Math.floor(Math.random() * 10000) + 2000 },
  ], [refreshTrigger])

  return (
    <motion.div 
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: shouldReduceMotion ? 0 : 0.7 }}
      className="w-full bg-surface/30 backdrop-blur-md border border-border/40 rounded-2xl p-6 hover:border-border transition-colors h-[320px] flex flex-col group relative"
    >
      {/* Micro-interaction shadow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[180ms] pointer-events-none -z-10 shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-2xl" />

      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground font-space">Success vs Errors</h2>
        <p className="text-xs text-muted mt-1">Request outcome distribution</p>
      </div>

      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            onMouseMove={(state) => {
              if (state.isTooltipActive && state.activeTooltipIndex !== undefined) {
                setHoveredIndex(Number(state.activeTooltipIndex))
              } else {
                setHoveredIndex(null)
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              dy={10}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              contentStyle={{ 
                backgroundColor: 'rgba(10, 10, 12, 0.9)', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
              itemStyle={{ fontSize: '13px', padding: '2px 0' }}
              labelStyle={{ display: 'none' }}
              formatter={(value: any) => [
                value >= 1000000 ? (value/1000000).toFixed(2) + 'M' : value >= 1000 ? (value/1000).toFixed(1) + 'k' : value, 
                'Requests'
              ]}
              animationDuration={120} // fast tooltip fade
            />
            <Bar 
              dataKey="value" 
              isAnimationActive={false} // Disable Recharts animation, use CustomBar Framer Motion
              shape={(props: any) => (
                <CustomBar 
                  {...props} 
                  shouldReduceMotion={shouldReduceMotion} 
                  refreshKey={refreshKey}
                  isHovered={hoveredIndex === props.index}
                />
              )}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
