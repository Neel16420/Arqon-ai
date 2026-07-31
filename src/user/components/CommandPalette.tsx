import React, { useState, useEffect } from 'react'
import {
  Search,
  LayoutDashboard,
  MessageSquare,
  FolderGit2,
  Bookmark,
  Cpu,
  FileText,
  Bell,
  User,
  Settings,
  CreditCard,
  HelpCircle,
  ArrowRight,
  X,
  Command,
} from 'lucide-react'
import type { UserPage } from './UserSidebar'

export interface CommandItem {
  id: string
  title: string
  category: 'Navigation' | 'Models' | 'Projects' | 'Prompts'
  pageTarget?: UserPage
  icon: React.ReactNode
  shortcut?: string
}

const COMMAND_ITEMS: CommandItem[] = [
  { id: 'c-dash', title: 'Go to User Dashboard', category: 'Navigation', pageTarget: 'dashboard', icon: <LayoutDashboard size={16} className="text-accent" />, shortcut: 'G D' },
  { id: 'c-chat', title: 'Open AI Workspace Chat', category: 'Navigation', pageTarget: 'chat', icon: <MessageSquare size={16} className="text-blue-400" />, shortcut: 'G C' },
  { id: 'c-proj', title: 'Open Projects Workspace', category: 'Navigation', pageTarget: 'projects', icon: <FolderGit2 size={16} className="text-purple-400" />, shortcut: 'G P' },
  { id: 'c-prompt', title: 'Open Prompt Library', category: 'Navigation', pageTarget: 'prompts', icon: <Bookmark size={16} className="text-amber-400" />, shortcut: 'G L' },
  { id: 'c-models', title: 'View AI Models & Benchmarks', category: 'Navigation', pageTarget: 'models', icon: <Cpu size={16} className="text-emerald-400" />, shortcut: 'G M' },
  { id: 'c-files', title: 'View Files & Documents', category: 'Navigation', pageTarget: 'files', icon: <FileText size={16} className="text-cyan-400" />, shortcut: 'G F' },
  { id: 'c-notif', title: 'Notification Center', category: 'Navigation', pageTarget: 'notifications', icon: <Bell size={16} className="text-yellow-400" /> },
  { id: 'c-prof', title: 'User Profile & Identity', category: 'Navigation', pageTarget: 'profile', icon: <User size={16} className="text-indigo-400" /> },
  { id: 'c-sett', title: 'User Settings & Preferences', category: 'Navigation', pageTarget: 'settings', icon: <Settings size={16} className="text-gray-400" />, shortcut: 'G S' },
  { id: 'c-bill', title: 'Subscription & Billing', category: 'Navigation', pageTarget: 'billing', icon: <CreditCard size={16} className="text-emerald-400" /> },
  { id: 'c-help', title: 'Help Center & Documentation', category: 'Navigation', pageTarget: 'help', icon: <HelpCircle size={16} className="text-cyan-400" /> },
  // Models
  { id: 'm-gpt4', title: 'Launch GPT-4o Session', category: 'Models', pageTarget: 'chat', icon: <Cpu size={16} className="text-emerald-400" /> },
  { id: 'm-claude', title: 'Launch Claude 3.5 Sonnet Session', category: 'Models', pageTarget: 'chat', icon: <Cpu size={16} className="text-amber-400" /> },
  { id: 'm-gemini', title: 'Launch Gemini 1.5 Pro Session', category: 'Models', pageTarget: 'chat', icon: <Cpu size={16} className="text-blue-400" /> },
]

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: UserPage) => void
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          setQuery('')
          setSelectedIndex(0)
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filtered = COMMAND_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (item: CommandItem) => {
    if (item.pageTarget) {
      onNavigate(item.pageTarget)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-fade-in-up">
      <div className="w-full max-w-xl rounded-2xl glass-elevated glass-border p-3 shadow-2xl space-y-2 relative overflow-hidden">
        {/* Search Header */}
        <div className="relative flex items-center border-b border-border pb-2 px-2">
          <Search size={18} className="text-accent shrink-0 mr-2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Type a command, page name, or search keyword... (Cmd+K)"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted outline-none py-1.5"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-1 p-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border ${
                  idx === selectedIndex
                    ? 'bg-accent/15 border-accent/30 text-foreground'
                    : 'border-transparent hover:bg-surface-2 hover:border-border text-foreground'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate group-hover:text-accent transition-colors">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted font-mono">{item.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.shortcut && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-border text-muted">
                      {item.shortcut}
                    </span>
                  )}
                  <ArrowRight size={14} className="text-muted group-hover:text-accent transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="pt-2 border-t border-border px-2 flex items-center justify-between text-[10px] text-muted font-mono">
          <span className="flex items-center gap-1">
            <Command size={10} /> + K to toggle
          </span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  )
}
