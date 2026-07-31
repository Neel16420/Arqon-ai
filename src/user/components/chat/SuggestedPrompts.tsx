import { FileText, Code2, Briefcase, Edit3, Bug, Sparkles } from 'lucide-react'

export interface SuggestedPromptItem {
  id: string
  title: string
  category: string
  promptText: string
  icon: React.ReactNode
}

interface SuggestedPromptsProps {
  onSelectPrompt: (promptText: string) => void
}

const SUGGESTED_PROMPTS: SuggestedPromptItem[] = [
  {
    id: 'sum-doc',
    title: 'Summarize this document',
    category: 'Analysis',
    promptText: 'Please provide a concise summary of the key findings, takeaways, and action points from this document.',
    icon: <FileText size={18} className="text-blue-400" />,
  },
  {
    id: 'explain-code',
    title: 'Explain this code',
    category: 'Engineering',
    promptText: 'Explain how this code works step-by-step, including time complexity, data structures, and edge cases:',
    icon: <Code2 size={18} className="text-emerald-400" />,
  },
  {
    id: 'biz-plan',
    title: 'Generate a business plan',
    category: 'Strategy',
    promptText: 'Draft an executive business plan outline covering value proposition, target audience, revenue model, and go-to-market strategy.',
    icon: <Briefcase size={18} className="text-amber-400" />,
  },
  {
    id: 'improve-writing',
    title: 'Improve my writing',
    category: 'Copywriting',
    promptText: 'Refine and polish the following text for clarity, tone, and impact while maintaining the original message:',
    icon: <Edit3 size={18} className="text-purple-400" />,
  },
  {
    id: 'debug-react',
    title: 'Debug my React component',
    category: 'Development',
    promptText: 'Identify potential memory leaks, re-render bottlenecks, or state bugs in the following React component:',
    icon: <Bug size={18} className="text-accent" />,
  },
]

export default function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        <Sparkles size={14} className="text-accent" />
        <span>Suggested Prompts to Get Started</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelectPrompt(prompt.promptText)}
            className="group text-left p-3.5 rounded-xl glass-surface glass-border card-hover transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {prompt.icon}
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-border text-muted">
                {prompt.category}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                {prompt.title}
              </h4>
              <p className="text-[11px] text-muted mt-1 line-clamp-2 leading-relaxed">
                "{prompt.promptText}"
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
