import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useCountUp } from '../../motion/useCountUp'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { PiggyBank } from 'lucide-react'

interface MetricCardsProps {
  refreshTrigger?: boolean
}

const generateSparkline = (points: number, min: number, max: number) => {
  return Array.from({ length: points }).map((_, i) => ({
    value: Math.random() * (max - min) + min,
    index: i
  }))
}

export function MetricCards({ refreshTrigger }: MetricCardsProps) {
  const shouldReduceMotion = useReducedMotion()
  void refreshTrigger; // Used in useMemo dependencies
  const cards = useMemo(() => [
    {
      title: 'Total Requests',
      value: Math.floor(Math.random() * 1000) + 2000,
      suffix: 'M',
      trend: '+12%',
      trendUp: true,
      color: '#ff3b3b', // Arqon Red
      data: generateSparkline(10, 10, 30)
    },
    {
      title: 'Tokens Processed',
      value: Math.floor(Math.random() * 50) + 100,
      suffix: 'M',
      trend: '+6%',
      trendUp: true,
      color: '#3b82f6', // Blue
      data: generateSparkline(10, 50, 100)
    },
    {
      title: 'Average Latency',
      value: Math.floor(Math.random() * 50) + 250,
      suffix: 'ms',
      trend: '-18%',
      trendUp: true, // down is good for latency
      color: '#10b981', // Green
      data: generateSparkline(10, 200, 400).reverse()
    },
    {
      title: 'Estimated Cost',
      value: Math.floor(Math.random() * 500) + 1000,
      prefix: '$',
      trend: '-9%',
      trendUp: true, // down is good for cost
      color: '#f59e0b', // Orange
      data: generateSparkline(10, 1000, 1500).reverse()
    }
  ], [refreshTrigger])

  const savingsValue = useCountUp(useMemo(() => Math.floor(Math.random() * 200) + 200, [refreshTrigger]))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <Card key={card.title} card={card} index={i} shouldReduceMotion={shouldReduceMotion} refreshKey={refreshTrigger ? 'r' : 'i'} />
      ))}
      
      {/* 5th Premium Card: Cost Savings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 4 * 0.1 }}
        whileHover={{ y: -4 }}
        className="relative overflow-hidden rounded-xl border border-success/30 bg-success/5 backdrop-blur-md p-5 group transition-all hover:border-success/50 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] flex flex-col justify-between"
      >
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-semibold text-success uppercase tracking-wider">Smart Routing Savings</span>
          <PiggyBank size={14} className="text-success" />
        </div>
        <div>
          <div className="text-2xl font-bold text-success font-space flex items-baseline gap-1">
            ${savingsValue}
            <span className="text-sm font-normal text-success/70">/mo</span>
          </div>
          <div className="text-[10px] text-success/60 mt-1 uppercase tracking-wide">
            Compared to static routing
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Card({ card, index, shouldReduceMotion, refreshKey }: { card: any, index: number, shouldReduceMotion: boolean | null, refreshKey: string }) {
  const count = useCountUp(card.value, shouldReduceMotion ? 0 : 1400)

  return (
    <motion.div
      key={`card-${card.title}-${refreshKey}`}
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: shouldReduceMotion ? 0 : index * 0.1 }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-xl border border-border/40 bg-surface/30 backdrop-blur-md p-5 group transition-all hover:border-border hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:bg-surface/60 flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">{card.title}</span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${card.trendUp ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}`}>
          {card.trend}
        </span>
      </div>
      
      <div className="flex items-end justify-between relative z-10">
        <div className="text-2xl font-bold text-foreground font-space flex items-baseline">
          {card.prefix}{card.suffix === 'M' ? (Number(count) / 1000).toFixed(2) : count}{card.suffix}
        </div>
        
        <div className="w-16 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={card.data}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={card.color} 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={!shouldReduceMotion}
                animationDuration={500}
                animationEasing="ease-out"
                key={refreshKey}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
