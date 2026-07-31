import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, X, CornerDownLeft } from 'lucide-react'

interface PromptComposerProps {
  onSendMessage: (text: string) => void
  disabled?: boolean
  initialText?: string
}

export default function PromptComposer({
  onSendMessage,
  disabled = false,
  initialText = '',
}: PromptComposerProps) {
  const [text, setText] = useState(initialText)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialText) {
      setText(initialText)
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }, [initialText])

  // Auto-expand textarea height up to 180px
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 180)}px`
    }
  }, [text])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSendMessage(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.focus()
    }
  }

  return (
    <div className="w-full relative">
      <div className="glass-surface glass-border rounded-2xl p-3 shadow-2xl relative transition-all focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/30">
        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask Arqon anything... (Shift+Enter for new line)"
          rows={1}
          className="w-full bg-transparent text-foreground placeholder:text-muted text-sm resize-none outline-none leading-relaxed min-h-[44px] max-h-[180px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />

        {/* Bottom Toolbar & Action Buttons */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/40">
          {/* Left Actions: Attach, Voice, Clear */}
          <div className="flex items-center gap-1.5">
            {/* Attachment Button */}
            <button
              type="button"
              title="Attach File / Document (UI Only)"
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <Paperclip size={16} />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              title="Voice Prompt (UI Only)"
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <Mic size={16} />
            </button>

            {/* Clear Input Button */}
            {text.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear input"
                className="p-2 rounded-lg text-muted hover:text-accent hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Right Actions: Counter & Send Button */}
          <div className="flex items-center gap-3">
            {/* Character & Token Estimate Counter */}
            <span className="text-[10px] font-mono text-muted hidden sm:inline">
              {text.length} chars (~{Math.ceil(text.length / 4)} tokens)
            </span>

            {/* Keyboard hint */}
            <span className="text-[10px] text-muted hidden md:flex items-center gap-1">
              <CornerDownLeft size={10} /> Enter to send
            </span>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled || text.trim().length === 0}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 ${
                disabled || text.trim().length === 0
                  ? 'opacity-40 cursor-not-allowed bg-surface-2 text-muted'
                  : 'hover:brightness-110'
              }`}
              style={
                text.trim().length > 0 && !disabled
                  ? {
                      background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
                      boxShadow: '0 4px 14px rgba(255, 59, 59, 0.35)',
                    }
                  : undefined
              }
            >
              <span>Send</span>
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
