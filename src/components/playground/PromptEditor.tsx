import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Settings2, Hash, Zap, Code2, Trash2, RotateCcw, Send, Loader2 } from 'lucide-react'

interface PromptEditorProps {
  promptText: string
  setPromptText: (val: string) => void
  isGenerating: boolean
  onGenerate: () => void
}

export function PromptEditor({ promptText, setPromptText, isGenerating, onGenerate }: PromptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '180px' // Default min height
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = Math.min(Math.max(scrollHeight, 180), 400) + 'px'
    }
  }, [promptText])

  // Handle Tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const newValue = promptText.substring(0, start) + '  ' + promptText.substring(end)
      setPromptText(newValue)
      
      // Request animation frame ensures state is updated before we adjust cursor
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      })
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col relative w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest">Workspace</h2>
      </div>

      {/* Main Workspace Editor */}
      <div className="flex flex-col bg-surface-2/30 border border-border/40 rounded-xl overflow-hidden focus-within:border-accent/40 focus-within:shadow-[0_0_20px_rgba(255,59,59,0.05)] transition-all">
        
        {/* Editor Toolbar */}
        <div className="border-b border-border/40 bg-surface/50 p-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            
            {/* Generation Settings */}
            <div className="flex items-center gap-1">
              <ToolbarButton icon={<SlidersHorizontal size={14} />} label="Temperature: 0.7" />
              <ToolbarButton icon={<Settings2 size={14} />} label="Top P: 1" />
              <ToolbarButton icon={<Hash size={14} />} label="Max Tokens: 4096" />
            </div>
            
            <div className="w-px h-4 bg-border/40 hidden md:block"></div>
            
            {/* Output Settings */}
            <div className="flex items-center gap-1">
              <ToolbarToggle icon={<Zap size={14} />} label="Stream" active />
              <ToolbarToggle icon={<Code2 size={14} />} label="JSON Mode" />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            <button className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted hover:text-foreground transition-colors rounded hover:bg-surface-2">
              <Trash2 size={12} /> Clear
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted hover:text-foreground transition-colors rounded hover:bg-surface-2">
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="relative p-4 flex">
          {/* Optional Line Numbers */}
          <div className="w-6 shrink-0 text-right pr-2 text-muted/40 font-mono text-sm leading-relaxed user-select-none pt-1">
            {promptText.split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          
          <textarea
            ref={textareaRef}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want your AI to do..."
            className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground/90 font-mono leading-relaxed custom-scrollbar placeholder:text-muted/50"
            spellCheck={false}
            style={{ minHeight: '180px' }}
          />
        </div>
      </div>

      {/* Generate Button positioned below workspace */}
      <div className="mt-4 flex justify-end">
        <button
          disabled={!promptText.trim() || isGenerating}
          onClick={onGenerate}
          className={`relative overflow-hidden flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] ${
            !promptText.trim() 
              ? 'bg-surface-2 text-muted cursor-not-allowed border border-border/30 hover:scale-100' 
              : 'bg-accent hover:bg-accent/90 text-white shadow-[0_0_20px_rgba(255,59,59,0.2)] hover:shadow-[0_0_30px_rgba(255,59,59,0.3)] border border-accent/20'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send size={16} />
              Generate
            </>
          )}

          {/* Ripple / Glow effect for active state */}
          {promptText.trim() && !isGenerating && (
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 2, opacity: 0.1 }}
              transition={{ duration: 0.5 }}
              style={{ borderRadius: '100%' }}
            />
          )}
        </button>
      </div>
    </motion.div>
  )
}

function ToolbarButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-surface-2 text-xs text-muted hover:text-foreground transition-colors group whitespace-nowrap">
      <span className="text-muted/70 group-hover:text-foreground/80 transition-colors">{icon}</span>
      {label}
    </button>
  )
}

function ToolbarToggle({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors group whitespace-nowrap ${active ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-surface-2 text-muted hover:text-foreground'}`}>
      <span className={active ? 'text-accent' : 'text-muted/70 group-hover:text-foreground/80'}>{icon}</span>
      {label}
    </button>
  )
}
