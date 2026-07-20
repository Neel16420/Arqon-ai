import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Power, Trash2, ChevronRight, Activity, Zap, Shield, Sparkles, CheckCircle, XCircle } from 'lucide-react'
import { ProviderIcon } from './icons/ProviderLogos'
import { AIModel, ModelStatus } from '../pages/Models'
import { formatLatency } from '../utils'

interface ModelCardProps {
  model: AIModel
  onEdit: (model: AIModel) => void
  onDelete: (model: AIModel) => void
  onToggleStatus: (model: AIModel) => void
}

const statusColors: Record<ModelStatus, string> = {
  healthy: 'bg-success/10 text-success border-success/20',
  disabled: 'bg-muted/10 text-muted border-muted/20',
  beta: 'bg-info/10 text-info border-info/20',
  experimental: 'bg-accent/10 text-accent border-accent/20',
}

export function ModelCard({ model, onEdit, onDelete, onToggleStatus }: ModelCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isHealthy = model.status === 'healthy'

  return (
    <motion.div
      layout
      layoutId={`model-card-${model.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={!expanded ? { y: -6 } : undefined}
      className={`
        relative overflow-hidden rounded-[18px] border bg-surface/40 backdrop-blur-md
        transition-colors duration-300
        ${expanded ? 'border-border/60 shadow-lg shadow-black/20' : 'border-border/30 hover:border-border hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:bg-surface/60'}
      `}
      style={{
        gridColumn: expanded ? '1 / -1' : 'auto',
        zIndex: expanded ? 10 : 1,
      }}
    >
      {/* Glow effect on hover (only when collapsed) */}
      {!expanded && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 pointer-events-none transition-opacity duration-300">
          <div className="absolute inset-[-100%] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_50%)]" />
        </div>
      )}

      <div 
        className="p-5 cursor-pointer relative z-10" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div layoutId={`provider-icon-${model.id}`} className="shrink-0">
              <ProviderIcon type={model.provider} width={40} height={40} className="rounded-xl shadow-sm" />
            </motion.div>
            
            <div className="flex flex-col">
              <motion.div layoutId={`model-name-${model.id}`} className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-lg tracking-tight font-space">{model.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${statusColors[model.status]}`}>
                  {model.status}
                </span>
              </motion.div>
              <motion.div layoutId={`model-provider-${model.id}`} className="text-sm text-muted capitalize font-medium flex items-center gap-1.5 mt-0.5">
                {model.provider} <span className="text-border/60">•</span> {model.version}
              </motion.div>
            </div>
          </div>

          {/* Quick Actions (only visible when collapsed) */}
          <AnimatePresence>
            {!expanded && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => onEdit(model)} className="p-2 text-muted hover:text-foreground hover:bg-surface-2 rounded-lg transition-colors" aria-label="Edit Model">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => onToggleStatus(model)} className={`p-2 rounded-lg transition-colors ${isHealthy ? 'text-muted hover:text-accent hover:bg-accent/10' : 'text-accent hover:text-accent hover:bg-accent/20'}`} aria-label={isHealthy ? "Disable Model" : "Enable Model"}>
                  <Power size={16} />
                </button>
                <button onClick={() => onDelete(model)} className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors" aria-label="Delete Model">
                  <Trash2 size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Primary Stats Grid */}
        <motion.div layoutId={`stats-${model.id}`} className="grid grid-cols-3 gap-4 mt-6">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Context</span>
            <span className="text-sm text-foreground font-mono">{(model.contextWindow / 1000).toFixed(0)}k</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Cost (1M)</span>
            <span className="text-sm text-foreground font-mono">
              ${model.inputCost} <span className="text-muted/60">/</span> ${model.outputCost}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Avg Latency</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${model.latency < 400 ? 'bg-success' : model.latency < 800 ? 'bg-warning' : 'bg-accent'}`} />
              <span className="text-sm text-foreground font-mono">{formatLatency(model.latency)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-surface-2/30 border-t border-border/30"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Description & Capabilities */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Sparkles size={14} /> Description
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {model.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Shield size={14} /> Capabilities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {model.features.map(f => (
                      <div 
                        key={f.id}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${f.supported ? 'bg-success/5 border-success/20 text-success' : 'bg-surface/50 border-border/30 text-muted'}`}
                      >
                        {f.supported ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {f.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Routing & Technical */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity size={14} /> Performance & Routing
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface/50 rounded-lg p-3 border border-border/40">
                      <span className="block text-[10px] uppercase tracking-wider text-muted mb-1">Success Rate</span>
                      <span className="text-lg font-space text-foreground">{model.successRate}%</span>
                    </div>
                    <div className="bg-surface/50 rounded-lg p-3 border border-border/40">
                      <span className="block text-[10px] uppercase tracking-wider text-muted mb-1">Routing Weight</span>
                      <span className="text-lg font-space text-foreground">{model.routingWeight.toFixed(1)}x</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap size={14} /> Endpoints & Regions
                  </h4>
                  <div className="bg-surface/50 rounded-lg border border-border/40 overflow-hidden">
                    <div className="px-3 py-2 border-b border-border/40 bg-surface/80 flex items-center gap-2 text-xs text-muted">
                      <span className="font-mono text-accent bg-accent/10 px-1 rounded">{model.endpoints[0]?.method}</span>
                      <span className="font-mono truncate">{model.endpoints[0]?.path}</span>
                    </div>
                    <div className="px-3 py-2 text-xs text-muted flex gap-2">
                      <span className="font-semibold">Regions:</span>
                      <span className="uppercase">{model.regions.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Expanded Action Footer */}
            <div className="px-6 py-4 bg-surface/50 border-t border-border/30 flex justify-end gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(model); }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-surface-2 border border-border/60 hover:bg-surface transition-colors"
              >
                Configure
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleStatus(model); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isHealthy ? 'text-accent border-accent/30 hover:bg-accent/10' : 'text-success border-success/30 hover:bg-success/10'}`}
              >
                {isHealthy ? 'Disable Model' : 'Enable Model'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Icon indicator */}
      <AnimatePresence>
        {!expanded && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute bottom-4 right-4 text-muted/50 pointer-events-none"
          >
            <ChevronRight size={16} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
