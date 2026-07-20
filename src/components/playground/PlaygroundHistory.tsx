import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Database, DollarSign } from 'lucide-react'
import { ProviderIcon } from '../icons/ProviderLogos'
import { ModelProvider } from '../../pages/Playground'

interface PlaygroundHistoryProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (prompt: string) => void
}

interface HistoryItem {
  id: string
  prompt: string
  provider: ModelProvider
  model: string
  time: string
  tokens: number
  cost: string
}

const MOCK_HISTORY: HistoryItem[] = [
  { id: '1', prompt: 'Write a highly optimized quick sort in TypeScript and explain its complexity.', provider: 'openai', model: 'GPT-4o', time: '2 mins ago', tokens: 409, cost: '$0.0015' },
  { id: '2', prompt: 'Translate this python script to Rust.', provider: 'anthropic', model: 'Claude Opus', time: '1 hour ago', tokens: 1250, cost: '$0.0120' },
  { id: '3', prompt: 'Generate a JSON schema for a user profile with strict validation rules.', provider: 'google', model: 'Gemini 1.5 Pro', time: '3 hours ago', tokens: 845, cost: '$0.0042' },
  { id: '4', prompt: 'Summarize the latest research on transformer memory efficiency.', provider: 'mistral', model: 'Mistral Large', time: 'Yesterday', tokens: 2100, cost: '$0.0085' },
]

export function PlaygroundHistory({ isOpen, onClose, onSelect }: PlaygroundHistoryProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/50 backdrop-blur-sm z-40"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 w-[380px] h-full bg-surface-2/95 border-l border-border/40 shadow-2xl z-50 flex flex-col backdrop-blur-xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/40">
              <h2 className="text-sm font-semibold text-foreground font-space">Playground History</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded hover:bg-surface text-muted hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {MOCK_HISTORY.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.prompt)
                    onClose()
                  }}
                  className="w-full text-left bg-surface/50 border border-border/40 hover:border-accent/30 rounded-xl p-4 group transition-all duration-300 hover:shadow-[0_4px_20px_rgba(255,59,59,0.05)] hover:bg-surface/80 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ProviderIcon type={item.provider} width={14} height={14} className="opacity-80" />
                      <span className="text-xs font-medium text-foreground/80">{item.model}</span>
                    </div>
                    <span className="text-[10px] text-muted flex items-center gap-1"><Clock size={10} /> {item.time}</span>
                  </div>

                  <p className="text-sm text-foreground/90 line-clamp-2 mb-3 leading-relaxed font-mono">
                    {item.prompt}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-muted border-t border-border/30 pt-3">
                    <div className="flex items-center gap-1.5"><Database size={10} className="text-info/80" /> {item.tokens} tokens</div>
                    <div className="flex items-center gap-1.5"><DollarSign size={10} className="text-success/80" /> {item.cost}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
