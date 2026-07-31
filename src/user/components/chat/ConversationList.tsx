import React, { useState } from 'react'
import ConversationItem, { type ConversationSummary } from './ConversationItem'
import {
  Plus,
  Search,
  Star,
  Clock,
  ChevronDown,
  ChevronRight,
  MessageSquareOff,
} from 'lucide-react'

interface ConversationListProps {
  conversations: ConversationSummary[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
  onDeleteConversation: (id: string, e: React.MouseEvent) => void
  loading?: boolean
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onToggleFavorite,
  onDeleteConversation,
  loading = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [favoritesExpanded, setFavoritesExpanded] = useState(true)
  const [recentsExpanded, setRecentsExpanded] = useState(true)

  // Filter conversations by search query
  const filtered = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const favoriteItems = filtered.filter((c) => c.isFavorite)
  const recentItems = filtered.filter((c) => !c.isFavorite)

  return (
    <div className="flex flex-col h-full w-full bg-surface border-r border-border p-3 space-y-3 select-none overflow-hidden">
      {/* 1. New Chat Button */}
      <button
        onClick={onNewChat}
        className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 group shrink-0"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
          boxShadow: '0 4px 14px rgba(255, 59, 59, 0.3)',
        }}
      >
        <Plus size={16} className="transition-transform group-hover:rotate-90" />
        <span>New AI Chat</span>
      </button>

      {/* 2. Search Conversations Input */}
      <div className="relative shrink-0">
        <Search size={14} className="absolute left-3 top-2.5 text-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
        />
      </div>

      {/* 3. Conversations List Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-2 py-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-surface-2/50 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty Search / No Conversations State */
          <div className="py-8 text-center px-2 space-y-2">
            <MessageSquareOff size={24} className="mx-auto text-muted/60" />
            <p className="text-xs font-semibold text-foreground">
              {searchQuery ? 'No matching conversations' : 'No chat history yet'}
            </p>
            <p className="text-[11px] text-muted leading-relaxed">
              {searchQuery
                ? `No results found for "${searchQuery}". Try a different keyword.`
                : 'Click "New AI Chat" to begin your first thread.'}
            </p>
          </div>
        ) : (
          <>
            {/* FAVORITES SECTION */}
            {favoriteItems.length > 0 && (
              <div className="space-y-1.5">
                <button
                  onClick={() => setFavoritesExpanded((v) => !v)}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-muted uppercase tracking-wider px-1 py-1 hover:text-foreground transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    Favorites ({favoriteItems.length})
                  </span>
                  {favoritesExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>

                {favoritesExpanded && (
                  <div className="space-y-1.5">
                    {favoriteItems.map((item) => (
                      <ConversationItem
                        key={item.id}
                        conversation={item}
                        isActive={item.id === activeConversationId}
                        onSelect={onSelectConversation}
                        onToggleFavorite={onToggleFavorite}
                        onDelete={onDeleteConversation}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* RECENT CHATS SECTION */}
            <div className="space-y-1.5">
              <button
                onClick={() => setRecentsExpanded((v) => !v)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-muted uppercase tracking-wider px-1 py-1 hover:text-foreground transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-accent" />
                  Recent Chats ({recentItems.length})
                </span>
                {recentsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>

              {recentsExpanded && (
                <div className="space-y-1.5">
                  {recentItems.map((item) => (
                    <ConversationItem
                      key={item.id}
                      conversation={item}
                      isActive={item.id === activeConversationId}
                      onSelect={onSelectConversation}
                      onToggleFavorite={onToggleFavorite}
                      onDelete={onDeleteConversation}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer System Status */}
      <div className="pt-2 border-t border-border shrink-0 flex items-center justify-between text-[10px] text-muted font-mono">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-breathe-green" />
          Arqon AI Engine v2.4
        </span>
        <span>{filtered.length} threads</span>
      </div>
    </div>
  )
}
