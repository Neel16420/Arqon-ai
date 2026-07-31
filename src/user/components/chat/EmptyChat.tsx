import SuggestedPrompts from './SuggestedPrompts'
import { Bot, Sparkles, Shield, Cpu } from 'lucide-react'

interface EmptyChatProps {
  userName?: string
  selectedModelName?: string
  onSelectPrompt: (promptText: string) => void
}

export default function EmptyChat({
  userName = 'Neel',
  selectedModelName = 'GPT-4o',
  onSelectPrompt,
}: EmptyChatProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto my-auto animate-fade-in-up">
      {/* AI Hero Logo */}
      <div className="relative mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
            boxShadow: '0 8px 30px rgba(255, 59, 59, 0.3)',
          }}
        >
          <Bot size={32} />
        </div>
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background animate-breathe-green" />
      </div>

      {/* Greeting & Title */}
      <h2
        className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-2"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        How can Arqon help you today,{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-accent">
          {userName}?
        </span>
      </h2>

      <p className="text-xs md:text-sm text-muted max-w-lg leading-relaxed mb-6">
        Connected to <span className="font-semibold text-foreground">{selectedModelName}</span>. Ask complex reasoning questions, debug code, analyze documents, or craft creative strategies.
      </p>

      {/* Badges */}
      <div className="flex items-center gap-3 flex-wrap justify-center text-[11px] text-muted mb-8">
        <span className="px-2.5 py-1 rounded-full bg-surface-2 border border-border flex items-center gap-1.5 font-medium">
          <Cpu size={13} className="text-emerald-400" />
          Multi-Model Routing
        </span>
        <span className="px-2.5 py-1 rounded-full bg-surface-2 border border-border flex items-center gap-1.5 font-medium">
          <Shield size={13} className="text-blue-400" />
          Enterprise Encrypted
        </span>
        <span className="px-2.5 py-1 rounded-full bg-surface-2 border border-border flex items-center gap-1.5 font-medium">
          <Sparkles size={13} className="text-amber-400" />
          Sub-300ms Latency
        </span>
      </div>

      {/* Suggested Prompts Grid */}
      <SuggestedPrompts onSelectPrompt={onSelectPrompt} />
    </div>
  )
}
