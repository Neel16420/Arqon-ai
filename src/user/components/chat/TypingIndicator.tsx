import { Bot } from 'lucide-react'

interface TypingIndicatorProps {
  modelName?: string
}

export default function TypingIndicator({ modelName = 'Arqon AI' }: TypingIndicatorProps) {
  return (
    <div className="flex items-start gap-3 my-4 animate-fade-in-up">
      {/* Bot Avatar */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-md"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
          boxShadow: '0 2px 8px rgba(255, 59, 59, 0.25)',
        }}
      >
        <Bot size={16} />
      </div>

      {/* Bubble with bouncing dots */}
      <div className="p-4 rounded-2xl glass-surface glass-border text-foreground flex items-center gap-3">
        <span className="text-xs font-semibold text-muted">{modelName} is thinking</span>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full bg-accent animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-accent animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-accent animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  )
}
