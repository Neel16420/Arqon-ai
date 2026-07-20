import { motion, AnimatePresence } from 'framer-motion'
import { ProviderIcon } from '../icons/ProviderLogos'
import { Check, Zap, Database } from 'lucide-react'

export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'azure' | 'mistral' | 'groq' | 'deepseek' | 'openrouter'

interface ProviderInfo {
  id: ModelProvider
  name: string
  latency: string
  context: string
  models: string[]
}

const PROVIDERS: ProviderInfo[] = [
  { id: 'openai', name: 'OpenAI', latency: '240ms', context: '128k', models: ['GPT-4o', 'GPT-4.1', 'GPT-3.5-Turbo', 'O1 Preview'] },
  { id: 'anthropic', name: 'Anthropic', latency: '350ms', context: '200k', models: ['Claude Opus', 'Claude Sonnet 3.5', 'Claude Haiku'] },
  { id: 'google', name: 'Google', latency: '290ms', context: '1M+', models: ['Gemini 1.5 Pro', 'Gemini Flash'] },
  { id: 'azure', name: 'Azure', latency: '210ms', context: '128k', models: ['Azure GPT-4o', 'Azure Llama 3'] },
  { id: 'mistral', name: 'Mistral', latency: '190ms', context: '32k', models: ['Mistral Large', 'Mistral Nemo', 'Mixtral 8x22B'] },
  { id: 'groq', name: 'Groq', latency: '18ms', context: '8k', models: ['Llama 3 70B', 'Mixtral 8x7B'] },
  { id: 'deepseek', name: 'DeepSeek', latency: '280ms', context: '64k', models: ['DeepSeek R1', 'DeepSeek Coder'] },
  { id: 'openrouter', name: 'OpenRouter', latency: '400ms', context: 'Varies', models: ['Auto-Router', 'Llama 3 405B', 'Command R+'] },
]

interface ProviderSidebarProps {
  selectedProvider: ModelProvider
  setSelectedProvider: (p: ModelProvider) => void
  selectedModel: string
  setSelectedModel: (m: string) => void
}

export function ProviderSidebar({ selectedProvider, setSelectedProvider, selectedModel, setSelectedModel }: ProviderSidebarProps) {
  
  return (
    <div className="flex flex-col h-full py-6">
      <div className="px-5 mb-4">
        <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest">Routing Providers</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-2 pb-6">
        {PROVIDERS.map((provider) => {
          const isSelected = selectedProvider === provider.id
          
          return (
            <div key={provider.id} className="relative group">
              <button
                onClick={() => {
                  setSelectedProvider(provider.id)
                  setSelectedModel(provider.models[0]) // Reset model to first available
                }}
                className={`w-full relative overflow-hidden rounded-xl p-3 text-left transition-all duration-300 ${
                  isSelected 
                    ? 'bg-surface/60 border-accent/40 shadow-[0_0_20px_rgba(255,59,59,0.1)]' 
                    : 'bg-surface-2/30 border-transparent hover:bg-surface-2 hover:border-border/40'
                } border`}
              >
                {/* Micro-interaction background glow on hover */}
                {!isSelected && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
                
                {/* Active scale animation wrapper */}
                <motion.div
                  initial={false}
                  animate={{ scale: isSelected ? 1.02 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <ProviderIcon type={provider.id} width={18} height={18} className={isSelected ? 'opacity-100' : 'opacity-70'} />
                        {/* Status indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-success border-2 border-background" />
                      </div>
                      <span className={`font-medium ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                        {provider.name}
                      </span>
                    </div>
                    {isSelected && (
                      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
                        <Check size={14} className="text-accent" />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-muted">
                    <div className="flex items-center gap-1">
                      <Zap size={10} className="text-warning/80" />
                      {provider.latency}
                    </div>
                    <div className="flex items-center gap-1">
                      <Database size={10} className="text-info/80" />
                      {provider.context}
                    </div>
                  </div>
                </motion.div>
              </button>

              {/* Model Dropdown (Slides down when provider is selected) */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden mt-2 px-1"
                  >
                    <div className="bg-surface/50 rounded-lg border border-border/40 overflow-hidden">
                      {provider.models.map(model => (
                        <button
                          key={model}
                          onClick={(e) => { e.stopPropagation(); setSelectedModel(model); }}
                          className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                            selectedModel === model 
                              ? 'bg-accent/10 text-accent font-medium' 
                              : 'text-muted hover:text-foreground hover:bg-surface-2'
                          }`}
                        >
                          {model}
                          {selectedModel === model && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
