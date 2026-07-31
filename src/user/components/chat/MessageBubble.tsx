import { useState } from 'react'
import { Bot, User, Copy, Check, RefreshCw, Terminal } from 'lucide-react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  tokens?: number
  modelName?: string
  codeSnippets?: Array<{ language: string; code: string }>
}

interface MessageBubbleProps {
  message: ChatMessage
  onRegenerate?: (messageId: string) => void
  isLastAssistantMessage?: boolean
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-border bg-black/80 font-mono text-xs shadow-xl">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-2/80 border-b border-border/60 text-muted">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-accent">
          <Terminal size={12} />
          {language || 'code'}
        </span>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1 text-[11px] hover:text-foreground transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto text-emerald-300 leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function MessageBubble({
  message,
  onRegenerate,
  isLastAssistantMessage = false,
}: MessageBubbleProps) {
  const [copiedText, setCopiedText] = useState(false)
  const isUser = message.role === 'user'

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
  }

  return (
    <div
      className={`group flex items-start gap-3 my-4 animate-fade-in-up ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-md ${
          isUser
            ? 'bg-surface-2 text-foreground border border-border'
            : 'text-white'
        }`}
        style={
          !isUser
            ? {
                background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
                boxShadow: '0 4px 14px rgba(255, 59, 59, 0.3)',
              }
            : undefined
        }
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message Content Container */}
      <div className={`max-w-2xl space-y-1.5 ${isUser ? 'items-end text-right' : ''}`}>
        {/* Header line: Name / Time / Model */}
        <div
          className={`flex items-center gap-2 text-[11px] text-muted ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span className="font-semibold text-foreground">
            {isUser ? 'You' : message.modelName || 'Arqon AI'}
          </span>
          <span>•</span>
          <span className="font-mono">{message.timestamp}</span>
          {message.tokens && (
            <span className="text-[10px] font-mono px-1.5 rounded bg-surface-2 border border-border">
              {message.tokens} tokens
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-accent/15 border border-accent/30 text-foreground rounded-tr-none shadow-md'
              : 'glass-surface glass-border text-foreground rounded-tl-none shadow-lg'
          }`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Main Message Text */}
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Optional Code Snippets rendered in code blocks */}
          {message.codeSnippets &&
            message.codeSnippets.map((snippet, idx) => (
              <CodeBlock key={idx} language={snippet.language} code={snippet.code} />
            ))}
        </div>

        {/* Action Toolbar below Bubble */}
        <div
          className={`flex items-center gap-2 pt-1 opacity-80 group-hover:opacity-100 transition-opacity ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          {/* Copy Message Action */}
          <button
            onClick={handleCopyMessage}
            className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Copy message text"
          >
            {copiedText ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span className="text-[10px] hidden group-hover:inline">Copy</span>
              </>
            )}
          </button>

          {/* Regenerate Response Action (For AI Messages) */}
          {!isUser && isLastAssistantMessage && onRegenerate && (
            <button
              onClick={() => onRegenerate(message.id)}
              className="p-1 rounded text-muted hover:text-accent hover:bg-surface-2 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Regenerate response"
            >
              <RefreshCw size={12} />
              <span className="text-[10px]">Regenerate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
