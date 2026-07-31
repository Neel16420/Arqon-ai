import { useRef, useEffect } from 'react'
import MessageBubble, { type ChatMessage } from './MessageBubble'
import ModelSelector, { type AIModel } from './ModelSelector'
import PromptComposer from './PromptComposer'
import EmptyChat from './EmptyChat'
import TypingIndicator from './TypingIndicator'
import LoadingMessages from './LoadingMessages'
import { PanelRight, Menu, Trash2 } from 'lucide-react'

interface ChatWindowProps {
  conversationId: string | null
  conversationTitle?: string
  messages: ChatMessage[]
  selectedModelId: string
  onSelectModel: (model: AIModel) => void
  onSendMessage: (text: string) => void
  onRegenerateResponse: (messageId: string) => void
  onClearConversation: () => void
  isTyping?: boolean
  loading?: boolean
  userName?: string
  onToggleLeftSidebar?: () => void
  onToggleRightContext?: () => void
  initialPromptText?: string
}

export default function ChatWindow({
  conversationId: _conversationId,
  conversationTitle,
  messages,
  selectedModelId,
  onSelectModel,
  onSendMessage,
  onRegenerateResponse,
  onClearConversation,
  isTyping = false,
  loading = false,
  userName = 'Neel',
  onToggleLeftSidebar,
  onToggleRightContext,
  initialPromptText = '',
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant')?.id

  return (
    <div className="flex flex-col h-full w-full bg-background relative overflow-hidden">
      {/* 1. Header Bar */}
      <header className="h-14 px-4 border-b border-border bg-surface flex items-center justify-between gap-3 shrink-0 z-10">
        {/* Left: Mobile Menu Button & Model Selector */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleLeftSidebar && (
            <button
              onClick={onToggleLeftSidebar}
              className="md:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu size={18} />
            </button>
          )}

          <ModelSelector
            selectedModelId={selectedModelId}
            onSelectModel={onSelectModel}
          />

          {conversationTitle && (
            <span className="text-xs font-semibold text-foreground truncate hidden lg:inline max-w-xs border-l border-border pl-3">
              {conversationTitle}
            </span>
          )}
        </div>

        {/* Right: Actions & Context Panel Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {messages.length > 0 && (
            <button
              onClick={onClearConversation}
              className="p-2 rounded-xl text-muted hover:text-accent hover:bg-surface-2 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Clear current conversation"
            >
              <Trash2 size={15} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {onToggleRightContext && (
            <button
              onClick={onToggleRightContext}
              className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
              title="Toggle Parameters & Context Panel"
            >
              <PanelRight size={18} />
            </button>
          )}
        </div>
      </header>

      {/* 2. Messages & Conversation View Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {loading ? (
          <LoadingMessages />
        ) : messages.length === 0 ? (
          /* Empty Chat Welcome State */
          <EmptyChat
            userName={userName}
            onSelectPrompt={onSendMessage}
          />
        ) : (
          /* Render Active Conversation Messages */
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onRegenerate={onRegenerateResponse}
                isLastAssistantMessage={msg.id === lastAssistantMessageId}
              />
            ))}

            {/* Mock Typing Indicator */}
            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 3. Bottom Prompt Composer */}
      <footer className="p-3 md:p-4 bg-background border-t border-border/60 shrink-0">
        <div className="max-w-4xl mx-auto">
          <PromptComposer
            onSendMessage={onSendMessage}
            disabled={isTyping}
            initialText={initialPromptText}
          />
        </div>
      </footer>
    </div>
  )
}
