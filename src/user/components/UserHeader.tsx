import { useState, useRef, useEffect } from 'react'
import { Menu, Bell, ChevronDown, User, Settings2, LogOut, Search } from 'lucide-react'
import type { UserPage } from './UserSidebar'
import ThemeSegmentedControl from '../../components/ThemeToggle'
import CommandPalette from './CommandPalette'

const PAGE_META: Record<UserPage, { title: string; desc: string }> = {
  login: { title: 'User Sign In', desc: 'Sign in to your user workspace' },
  register: { title: 'Create Account', desc: 'Sign up for a user account' },
  'forgot-password': { title: 'Reset Password', desc: 'Request password reset instructions' },
  'reset-password': { title: 'Reset Password', desc: 'Enter your new password' },
  'verify-email': { title: 'Verify Email', desc: 'Verify your email address' },
  dashboard: { title: 'Dashboard', desc: 'Welcome back to your workspace overview' },
  chat: { title: 'AI Workspace', desc: 'Interact with AI models & prompt reasoning' },
  keys: { title: 'API Keys', desc: 'Manage authentication tokens & test endpoints' },
  requests: { title: 'Requests & Activity', desc: 'Audit real-time prompt payloads and routed responses' },
  analytics: { title: 'Personal Analytics', desc: 'Insights into token usage, costs, and provider latencies' },
  projects: { title: 'Projects Workspace', desc: 'Organize AI chats, prompts, & project assets' },
  prompts: { title: 'Prompt Library', desc: 'Manage system instructions & prompt templates' },
  models: { title: 'AI Models', desc: 'Compare latency, context, and performance' },
  files: { title: 'Files & Documents', desc: 'Index document assets for RAG retrieval' },
  notifications: { title: 'Notifications', desc: 'System alerts, API quota & security updates' },
  profile: { title: 'User Profile', desc: 'Personal identity, avatar, & account security' },
  settings: { title: 'Settings', desc: 'Preferences, security, & model options' },
  billing: { title: 'Billing & Plans', desc: 'Subscription tier, quotas, & invoice history' },
  help: { title: 'Help & Docs', desc: 'Documentation, FAQs, & support tickets' },
  history: { title: 'Conversation History', desc: 'Review previous chat logs' },
}

const notifications = [
  { id: 1, msg: 'Welcome to the Arqon User Workspace', time: 'Just now', type: 'info' },
  { id: 2, msg: 'API Quota: 85% reached', time: '5m ago', type: 'warning' },
]

interface UserHeaderProps {
  activePage: UserPage
  setActivePage?: (p: UserPage) => void
  onMenuClick: () => void
  onLogout: () => void
}

export default function UserHeader({ activePage, setActivePage, onMenuClick, onLogout }: UserHeaderProps) {
  const meta = PAGE_META[activePage] || { title: 'User Panel', desc: '' }
  const [showNotif, setShowNotif] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const handleNavigate = (page: UserPage) => {
    if (setActivePage) setActivePage(page)
    else {
      window.history.pushState(null, '', `/user/${page}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }

  return (
    <>
      <header
        className="flex items-center justify-between px-4 lg:px-6 h-14 shrink-0 sticky top-0 z-30"
        style={{ background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-muted hover:text-foreground transition-colors cursor-pointer"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <Menu size={16} />
          </button>

          <div className="min-w-0">
            <h1
              className="text-sm font-semibold text-foreground truncate"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {meta.title}
            </h1>
            <p className="text-xs text-muted hidden md:block truncate">{meta.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Panel Switcher (User <-> Admin) */}
          <button
            onClick={() => {
              window.history.pushState(null, '', '/overview')
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-surface-2 hover:bg-surface border border-border text-foreground transition-all flex items-center gap-1.5 cursor-pointer"
            title="Switch to Admin Panel"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="hidden md:inline">Admin Panel</span>
          </button>

          {/* Global Search & Command Palette Button */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-muted hover:text-foreground bg-surface-2/80 hover:bg-surface-2 border border-border transition-all cursor-pointer hidden sm:flex"
            title="Global Search (Cmd+K / Ctrl+K)"
          >
            <Search size={14} className="text-accent" />
            <span className="font-medium">Search...</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-muted">
              ⌘K
            </kbd>
          </button>

          <ThemeSegmentedControl />

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotif((v) => !v)}
              className="relative p-2 rounded-lg text-muted hover:text-foreground transition-colors cursor-pointer"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <Bell size={15} />
              {notifications.length > 0 && (
                <span
                  className="absolute top-1 right-1 w-2 h-2 rounded-full animate-bounce-subtle"
                  style={{ background: 'var(--color-accent)' }}
                />
              )}
            </button>

            {showNotif && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl z-50 overflow-hidden glass-surface glass-border glass-shadow glass-open">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span
                      className="text-xs font-semibold text-foreground"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Notifications
                    </span>
                    <button
                      onClick={() => {
                        setShowNotif(false)
                        handleNavigate('notifications')
                      }}
                      className="text-[10px] text-accent font-semibold hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotif(false)
                        handleNavigate('notifications')
                      }}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-border/40 last:border-0"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: n.type === 'warning' ? 'var(--color-warning)' : 'var(--color-info)' }}
                      />
                      <div>
                        <p className="text-xs text-foreground leading-relaxed">{n.msg}</p>
                        <p className="text-xs text-muted mt-0.5 font-mono text-[10px]">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User Account Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg cursor-pointer transition-all hover:border-border-2"
              style={{
                background: showUserMenu ? 'var(--color-surface-2)' : 'var(--color-surface)',
                border: showUserMenu ? '1px solid var(--color-border-2)' : '1px solid var(--color-border)',
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-accent/40 shadow-sm"
              >
                <img
                  src="/avatars/avatar-01.png"
                  alt="Neel"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-medium text-foreground hidden sm:block">Neel</span>
              <ChevronDown
                size={12}
                className="text-muted hidden sm:block transition-transform duration-200"
                style={{ transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50 glass-elevated glass-border glass-shadow"
              style={{
                transformOrigin: 'top right',
                transform: showUserMenu ? 'scaleY(1) translateY(0)' : 'scaleY(0) translateY(-8px)',
                opacity: showUserMenu ? 1 : 0,
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease',
                pointerEvents: showUserMenu ? 'auto' : 'none',
              }}
            >
              <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ background: '#000', boxShadow: '0 0 10px rgb(var(--color-accent-rgb) / 0.2)' }}
                >
                  <User size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-xs font-semibold text-foreground truncate"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Neel
                  </p>
                  <p
                    className="text-xs text-muted truncate font-mono text-[10px]"
                  >
                    user@example.com
                  </p>
                </div>
              </div>

              <div className="py-1 text-xs">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    handleNavigate('profile')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all glass-hover"
                >
                  <User size={14} className="text-muted" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    handleNavigate('settings')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all glass-hover"
                >
                  <Settings2 size={14} className="text-muted" />
                  <span>Settings</span>
                </button>
              </div>

              <div className="py-1 border-t border-border">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all text-accent hover:bg-accent/10"
                  onClick={onLogout}
                >
                  <LogOut size={14} />
                  <span className="font-semibold">Log out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={handleNavigate}
      />
    </>
  )
}
