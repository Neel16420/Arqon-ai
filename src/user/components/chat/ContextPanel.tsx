import { useState } from 'react'
import {
  SlidersHorizontal,
  Bookmark,
  Cpu,
  X,
  Sparkles,
} from 'lucide-react'
import type { AIModel } from './ModelSelector'

interface ContextPanelProps {
  currentModel: AIModel
  temperature: number
  onChangeTemperature: (val: number) => void
  maxTokens: number
  onChangeMaxTokens: (val: number) => void
  systemPrompt: string
  onChangeSystemPrompt: (prompt: string) => void
  onClose?: () => void
  onSelectPinnedPrompt?: (promptText: string) => void
}

const PINNED_PROMPTS_DEFAULT = [
  {
    id: 'pin-1',
    title: 'Code Refactor Master',
    promptText: 'Act as a Senior Principal Engineer. Refactor this code for readability, performance, and clean design patterns.',
  },
  {
    id: 'pin-2',
    title: 'Strict JSON Output',
    promptText: 'Output your response strictly as valid JSON adhering to the specified schema with no surrounding text.',
  },
]

export default function ContextPanel({
  currentModel,
  temperature,
  onChangeTemperature,
  maxTokens,
  onChangeMaxTokens,
  systemPrompt,
  onChangeSystemPrompt,
  onClose,
  onSelectPinnedPrompt,
}: ContextPanelProps) {
  const [pinnedPrompts, setPinnedPrompts] = useState(PINNED_PROMPTS_DEFAULT)
  const [activeTab, setActiveTab] = useState<'params' | 'system' | 'pinned'>('params')

  const handleRemovePin = (id: string) => {
    setPinnedPrompts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="flex flex-col h-full w-full bg-surface border-l border-border select-none overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-accent" />
          <h3
            className="text-sm font-bold text-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Context & Parameters
          </h3>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-border bg-surface-2/40 p-1 gap-1 shrink-0 text-xs">
        <button
          onClick={() => setActiveTab('params')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeTab === 'params'
              ? 'bg-accent text-white shadow'
              : 'text-muted hover:text-foreground hover:bg-surface'
          }`}
        >
          Parameters
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'bg-accent text-white shadow'
              : 'text-muted hover:text-foreground hover:bg-surface'
          }`}
        >
          System Prompt
        </button>
        <button
          onClick={() => setActiveTab('pinned')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeTab === 'pinned'
              ? 'bg-accent text-white shadow'
              : 'text-muted hover:text-foreground hover:bg-surface'
          }`}
        >
          Pinned ({pinnedPrompts.length})
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Active Model Info Capsule */}
        <div className="p-3.5 rounded-xl glass-surface glass-border space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent">
                {currentModel.providerBadge}
              </span>
              <span
                className="text-xs font-bold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {currentModel.name}
              </span>
            </div>

            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-breathe-green" />
              {currentModel.status}
            </span>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            {currentModel.description}
          </p>

          <div className="flex items-center justify-between text-[10px] text-muted pt-2 border-t border-border/40 font-mono">
            <span>Context: {currentModel.contextLength}</span>
            <span>Speed: {currentModel.speed}</span>
          </div>
        </div>

        {/* TAB 1: PARAMETERS */}
        {activeTab === 'params' && (
          <div className="space-y-5">
            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  Temperature
                  <span className="text-[10px] font-normal text-muted">(Creativity)</span>
                </span>
                <span className="font-mono text-accent font-bold">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => onChangeTemperature(parseFloat(e.target.value))}
                className="w-full accent-accent bg-surface-2 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-muted font-mono">
                <span>0.00 Precise</span>
                <span>0.50 Balanced</span>
                <span>1.00 Creative</span>
              </div>
            </div>

            {/* Max Tokens Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  Max Output Tokens
                </span>
                <span className="font-mono text-accent font-bold">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="256"
                max="8192"
                step="256"
                value={maxTokens}
                onChange={(e) => onChangeMaxTokens(parseInt(e.target.value, 10))}
                className="w-full accent-accent bg-surface-2 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-muted font-mono">
                <span>256</span>
                <span>4096</span>
                <span>8192</span>
              </div>
            </div>

            {/* Token Usage Bar (Placeholder) */}
            <div className="p-3.5 rounded-xl glass-surface glass-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Cpu size={14} className="text-emerald-400" />
                  Estimated Token Usage
                </span>
                <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                  1.4k / 128k
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '12%' }} />
              </div>
              <p className="text-[10px] text-muted">
                ~1,420 tokens processed in current chat thread.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM PROMPT */}
        {activeTab === 'system' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles size={14} className="text-accent" />
                Custom System Instructions
              </span>
            </div>

            <textarea
              value={systemPrompt}
              onChange={(e) => onChangeSystemPrompt(e.target.value)}
              placeholder="e.g. You are a Senior Full-Stack TypeScript Architect. Always answer concisely with modern code patterns..."
              rows={6}
              className="w-full p-3 rounded-xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 leading-relaxed resize-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />

            <p className="text-[10px] text-muted leading-relaxed">
              System prompts override default model behaviors for this conversation session.
            </p>
          </div>
        )}

        {/* TAB 3: PINNED PROMPTS */}
        {activeTab === 'pinned' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Bookmark size={14} className="text-amber-400" />
                Saved & Pinned Prompts
              </span>
            </div>

            {pinnedPrompts.length === 0 ? (
              /* EMPTY PINNED PROMPTS STATE */
              <div className="py-8 text-center px-2 space-y-2 border border-dashed border-border rounded-xl">
                <Bookmark size={22} className="mx-auto text-muted/60" />
                <p className="text-xs font-semibold text-foreground">No pinned prompts yet</p>
                <p className="text-[10px] text-muted">
                  Save custom prompt templates here for quick 1-click execution.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pinnedPrompts.map((pin) => (
                  <div
                    key={pin.id}
                    onClick={() => onSelectPinnedPrompt?.(pin.promptText)}
                    className="group p-3 rounded-xl glass-surface glass-border hover:border-accent/40 transition-all cursor-pointer space-y-1 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                        {pin.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemovePin(pin.id)
                        }}
                        title="Unpin prompt"
                        className="p-1 rounded text-muted hover:text-accent transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <p className="text-[11px] text-muted line-clamp-2 leading-relaxed font-mono">
                      "{pin.promptText}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
