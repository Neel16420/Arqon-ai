import React from 'react'
import { MessageSquare, Star, Trash2 } from 'lucide-react'

export interface ConversationSummary {
  id: string
  title: string
  modelId: string
  modelName: string
  lastMessage: string
  updatedAt: string
  isFavorite?: boolean
  messageCount: number
}

interface ConversationItemProps {
  conversation: ConversationSummary
  isActive: boolean
  onSelect: (id: string) => void
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
  onDelete: (id: string, e: React.MouseEvent) => void
}

export default function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onToggleFavorite,
  onDelete,
}: ConversationItemProps) {

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={`group relative p-3 rounded-xl transition-all cursor-pointer border ${
        isActive
          ? 'bg-accent/10 border-accent/40 shadow-md'
          : 'border-transparent hover:bg-surface-2/70 hover:border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Left Icon & Title */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isActive ? 'bg-accent text-white' : 'bg-surface-2 text-muted group-hover:text-foreground'
            }`}
          >
            <MessageSquare size={14} />
          </div>

          <div className="min-w-0 flex-1">
            <h4
              className={`text-xs font-semibold truncate ${
                isActive ? 'text-foreground font-bold' : 'text-foreground group-hover:text-accent'
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {conversation.title}
            </h4>

            <p className="text-[11px] text-muted truncate mt-0.5">
              {conversation.lastMessage || 'Empty thread'}
            </p>
          </div>
        </div>

        {/* Right Actions: Favorite & Menu */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
          {/* Favorite Star Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(conversation.id, e)
            }}
            title={conversation.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            className="p-1 rounded text-muted hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Star
              size={13}
              className={conversation.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
            />
          </button>

          {/* Delete Action */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(conversation.id, e)
            }}
            title="Delete conversation"
            className="p-1 rounded text-muted hover:text-accent transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Footer Timestamp & Model Tag */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-border/40 text-[10px] text-muted font-mono">
        <span>{conversation.modelName}</span>
        <span>{conversation.updatedAt}</span>
      </div>
    </div>
  )
}
