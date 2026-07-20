import { motion, AnimatePresence, Variants } from 'framer-motion'
import { X, Save, AlertTriangle } from 'lucide-react'
import { AIModel } from '../pages/Models'
import { ProviderIcon } from './icons/ProviderLogos'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

interface EditModalProps extends ModalProps {
  model: AIModel | null
  onSave: (model: AIModel) => void
}

interface DeleteModalProps extends ModalProps {
  model: AIModel | null
  onConfirm: () => void
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: -20 }
}

export function EditModelModal({ isOpen, onClose, model, onSave }: EditModalProps) {
  if (!model) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-2xl bg-surface border border-border/40 rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <ProviderIcon type={model.provider} width={28} height={28} className="rounded-lg" />
                <h2 className="text-lg font-semibold text-foreground tracking-tight font-space">
                  {model.name === '' ? 'Add New Model' : `Edit ${model.name}`}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 text-muted hover:text-foreground hover:bg-surface-2 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">Model Name</label>
                  <input type="text" defaultValue={model.name} className="w-full h-10 px-3 bg-surface-2 border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">Provider</label>
                  <select defaultValue={model.provider} className="w-full h-10 px-3 bg-surface-2 border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 capitalize">
                    {['openai', 'anthropic', 'google', 'azure', 'groq', 'deepseek', 'mistral', 'openrouter'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">Context Window</label>
                  <input type="number" defaultValue={model.contextWindow} className="w-full h-10 px-3 bg-surface-2 border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">Status</label>
                  <select defaultValue={model.status} className="w-full h-10 px-3 bg-surface-2 border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 capitalize">
                    {['healthy', 'disabled', 'beta', 'experimental'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Pricing (per 1M tokens)</label>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
                    <input type="number" step="0.01" defaultValue={model.inputCost} placeholder="Input" className="w-full h-10 pl-7 pr-3 bg-surface-2 border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50" />
                  </div>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
                    <input type="number" step="0.01" defaultValue={model.outputCost} placeholder="Output" className="w-full h-10 pl-7 pr-3 bg-surface-2 border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Capabilities</label>
                <div className="grid grid-cols-2 gap-3">
                  {model.features.map(f => (
                    <label key={f.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-surface-2/50 cursor-pointer hover:bg-surface-2 transition-colors">
                      <input type="checkbox" defaultChecked={f.supported} className="w-4 h-4 rounded border-border/60 text-accent focus:ring-accent focus:ring-offset-background bg-surface" />
                      <span className="text-sm font-medium text-foreground">{f.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">Routing Weight</label>
                  <span className="text-xs font-mono text-foreground">{model.routingWeight.toFixed(1)}x</span>
                </div>
                <input type="range" min="0" max="2" step="0.1" defaultValue={model.routingWeight} className="w-full accent-accent" />
                <p className="text-xs text-muted">Higher weight models are prioritized in fallback chains.</p>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border/40 bg-surface/50 flex justify-end gap-3 shrink-0">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
                Cancel
              </button>
              <button onClick={() => { onSave(model); onClose(); }} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 flex items-center gap-2">
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function DeleteModelModal({ isOpen, onClose, model, onConfirm }: DeleteModalProps) {
  if (!model) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-surface border border-border/40 rounded-[24px] shadow-2xl p-6"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-5 mx-auto">
              <AlertTriangle className="text-accent" size={24} />
            </div>
            
            <h2 className="text-xl font-bold text-foreground text-center mb-2 font-space">Delete Model</h2>
            <p className="text-center text-muted text-sm mb-8">
              Are you sure you want to delete <span className="font-semibold text-foreground">{model.name}</span>? This action cannot be undone and will remove it from all routing chains.
            </p>
            
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-surface-2 transition-colors border border-border/40">
                Cancel
              </button>
              <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-accent hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20">
                Delete Model
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
