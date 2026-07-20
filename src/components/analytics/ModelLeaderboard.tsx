import { useState, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowUpDown, Trophy } from 'lucide-react'
import { ProviderIcon } from '../icons/ProviderLogos'

interface ModelLeaderboardProps {
  refreshTrigger?: boolean
}

type SortKey = 'name' | 'latency' | 'success' | 'cost' | 'requests'

const MOCK_DATA = [
  { id: 'gpt4o', name: 'GPT-4o', provider: 'openai', latency: 280, success: 99.8, cost: 5.0, requests: 1245000 },
  { id: 'opus', name: 'Claude Opus', provider: 'anthropic', latency: 550, success: 99.5, cost: 15.0, requests: 452000 },
  { id: 'gemini', name: 'Gemini 1.5 Pro', provider: 'google', latency: 320, success: 99.2, cost: 7.0, requests: 310000 },
  { id: 'mistral', name: 'Mistral Large', provider: 'mistral', latency: 300, success: 99.0, cost: 4.0, requests: 120000 },
  { id: 'deepseek', name: 'DeepSeek R1', provider: 'deepseek', latency: 180, success: 98.5, cost: 0.5, requests: 85000 },
]

export function ModelLeaderboard({ refreshTrigger }: ModelLeaderboardProps) {
  const shouldReduceMotion = useReducedMotion()
  const [sortKey, setSortKey] = useState<SortKey>('requests')
  const [sortDesc, setSortDesc] = useState(true)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc)
    } else {
      setSortKey(key)
      setSortDesc(true)
    }
  }

  const sortedData = useMemo(() => {
    return [...MOCK_DATA].sort((a, b) => {
      let valA = a[sortKey]
      let valB = b[sortKey]
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB)
      }
      return sortDesc ? (valB as number) - (valA as number) : (valA as number) - (valB as number)
    })
  }, [sortKey, sortDesc, refreshTrigger])

  return (
    <motion.div 
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: shouldReduceMotion ? 0 : 0.9 }}
      whileHover={{ y: -2 }}
      className="w-full bg-surface/30 backdrop-blur-md border border-border/40 rounded-2xl p-6 transition-all hover:border-border hover:bg-surface/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] group flex flex-col"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <Trophy size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-space">Model Leaderboard</h2>
          <p className="text-xs text-muted">Performance ranking across all active models</p>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-xs text-muted uppercase tracking-wider border-b border-border/40">
              <th className="pb-3 px-4 font-medium cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">Model <ArrowUpDown size={12} /></div>
              </th>
              <th className="pb-3 px-4 font-medium cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('latency')}>
                <div className="flex items-center gap-1">Avg Latency <ArrowUpDown size={12} /></div>
              </th>
              <th className="pb-3 px-4 font-medium cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('success')}>
                <div className="flex items-center gap-1">Success Rate <ArrowUpDown size={12} /></div>
              </th>
              <th className="pb-3 px-4 font-medium cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('cost')}>
                <div className="flex items-center gap-1">Cost / 1M <ArrowUpDown size={12} /></div>
              </th>
              <th className="pb-3 px-4 font-medium cursor-pointer hover:text-foreground transition-colors text-right" onClick={() => handleSort('requests')}>
                <div className="flex items-center justify-end gap-1">Total Requests <ArrowUpDown size={12} /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            <AnimatePresence mode="popLayout">
              {sortedData.map((row, index) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  key={row.id} 
                  className="hover:bg-surface-2/30 transition-colors group"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 flex items-center justify-center font-space text-xs font-bold text-muted bg-surface-2 rounded">
                        {index + 1}
                      </div>
                      <ProviderIcon type={row.provider} width={16} height={16} className="opacity-80" />
                      <span className="font-semibold text-foreground group-hover:text-accent transition-colors">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-muted group-hover:text-foreground">{row.latency}ms</td>
                  <td className="py-4 px-4 font-mono text-muted group-hover:text-foreground">{row.success}%</td>
                  <td className="py-4 px-4 font-mono text-muted group-hover:text-foreground">${row.cost.toFixed(2)}</td>
                  <td className="py-4 px-4 font-mono text-right text-muted group-hover:text-foreground">
                    {(row.requests / 1000).toFixed(1)}k
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
