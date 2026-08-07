import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Zap, Check, Sparkles } from 'lucide-react'

import { AIModel } from '../../../types'

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    providerBadge: 'OAI',
    status: 'Operational',
    speed: '210ms avg',
    contextLength: '128k',
    description: 'Flagship multimodal model optimized for reasoning & speed',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    providerBadge: 'ANT',
    status: 'Operational',
    speed: '280ms avg',
    contextLength: '200k',
    description: 'State-of-the-art coding, architecture design & complex logic',
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    providerBadge: 'GOO',
    status: 'Operational',
    speed: '340ms avg',
    contextLength: '1M',
    description: 'Ultra long-context analysis across codebases & documents',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    providerBadge: 'DSK',
    status: 'Operational',
    speed: '190ms avg',
    contextLength: '64k',
    description: 'High-performance open reasoning model with chain-of-thought',
  },
]

interface ModelSelectorProps {
  selectedModelId: string
  onSelectModel: (model: AIModel) => void
  disabled?: boolean
}

export default function ModelSelector({
  selectedModelId,
  onSelectModel,
  disabled = false,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass-surface glass-border hover:border-accent/40 transition-all cursor-pointer group"
      >
        {/* Provider badge */}
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent">
          {selectedModel.providerBadge}
        </span>

        {/* Model name & speed */}
        <div className="flex items-center gap-2 text-left">
          <span
            className="text-xs font-bold text-foreground group-hover:text-accent transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {selectedModel.name}
          </span>
          <span className="text-[10px] text-muted hidden sm:inline font-mono">
            ({selectedModel.speed})
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`text-muted group-hover:text-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 md:w-80 rounded-2xl glass-elevated glass-border glass-shadow p-2 z-50 animate-fade-in-up">
          <div className="px-3 py-2 border-b border-border mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
              <Sparkles size={12} className="text-accent" />
              Select Active Intelligence Model
            </span>
            <span className="text-[10px] text-muted font-mono">4 Models</span>
          </div>

          <div className="space-y-1">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = model.id === selectedModel.id
              return (
                <div
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model)
                    setIsOpen(false)
                  }}
                  className={`group p-2.5 rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-accent/10 border-accent/30 text-foreground'
                      : 'border-transparent hover:bg-surface-2 hover:border-border text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-2 border border-border text-foreground">
                        {model.providerBadge}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {model.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Zap size={10} />
                        {model.speed}
                      </span>
                      {isSelected && <Check size={14} className="text-accent" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-muted mt-1 leading-relaxed">
                    {model.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
