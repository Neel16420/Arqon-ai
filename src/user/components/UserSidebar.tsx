import type React from 'react'
import {
  X,
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
  Key,
  Activity,
  BarChart2,
} from 'lucide-react'
import { cn } from '../../utils'
import { useAuth } from '../../hooks/useAuth'

export type UserPage =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'verify-email'
  | 'dashboard'
  | 'chat'
  | 'keys'
  | 'requests'
  | 'analytics'
  | 'projects'
  | 'prompts'
  | 'models'
  | 'files'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'billing'
  | 'help'
  | 'history'

interface NavItem {
  id: UserPage
  label: string
  icon: React.ReactNode
  badge?: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'chat', label: 'AI Workspace', icon: <MessageSquare size={18} />, badge: 'Pro' },
  { id: 'keys', label: 'API Keys', icon: <Key size={18} /> },
  { id: 'requests', label: 'Requests Log', icon: <Activity size={18} /> },
  { id: 'analytics', label: 'Usage Analytics', icon: <BarChart2 size={18} /> },
  { id: 'models', label: 'AI Models', icon: <Cpu size={18} /> },
  { id: 'projects', label: 'Projects', icon: <FolderGit2 size={18} /> },
  { id: 'prompts', label: 'Prompt Library', icon: <Bookmark size={18} /> },
  { id: 'files', label: 'Files & Assets', icon: <FileText size={18} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, badge: '3' },
  { id: 'profile', label: 'User Profile', icon: <User size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  { id: 'billing', label: 'Billing & Plan', icon: <CreditCard size={18} /> },
  { id: 'help', label: 'Help Center', icon: <HelpCircle size={18} /> },
]

function ArqonLogo({ compact }: { compact: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-5 shrink-0" style={{ borderBottom: '1px solid var(--color-sidebar-border-right)' }}>
      <div
        className="shrink-0 flex items-center justify-center rounded-lg"
        style={{
          width: '32px',
          height: '32px',
          background: 'rgb(var(--color-accent-rgb) / 0.08)',
          border: '1px solid rgb(var(--color-accent-rgb) / 0.18)',
          boxShadow: '0 0 10px rgb(var(--color-accent-rgb) / 0.1)',
        }}
      >
        <img
          src="/logo/arqon-new-logo.png"
          alt="Arqon"
          style={{ width: '26px', height: '26px', objectFit: 'contain' }}
        />
      </div>
      {!compact && (
        <div>
          <span
            className="text-[15px] font-bold tracking-tight"
            style={{ color: 'var(--color-sidebar-text-active)', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}
          >
            ARQON
          </span>
          <span
            className="block font-semibold"
            style={{ color: 'var(--color-sidebar-text-inactive)', fontFamily: "'Inter', sans-serif", fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            User Workspace
          </span>
        </div>
      )}
    </div>
  )
}

interface UserSidebarProps {
  activePage: UserPage
  setActivePage: (p: UserPage) => void
  open: boolean
  onClose: () => void
}

export default function UserSidebar({ activePage, setActivePage, open, onClose }: UserSidebarProps) {
  const { session } = useAuth()

  const handleNav = (page: UserPage, e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()
    setActivePage(page)
    onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden glass-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col',
          'transition-transform duration-200 ease-in-out',
          // Desktop: full width, always visible
          'lg:w-56 lg:translate-x-0',
          // Tablet: icon-only, always visible
          'md:w-14 md:translate-x-0',
          // Mobile: full width, toggled
          'w-64',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
        style={{ background: 'var(--color-sidebar-bg)', borderRight: '1px solid var(--color-sidebar-border-right)' }}
      >
        {/* Close button on mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-foreground md:hidden cursor-pointer"
          style={{ background: 'var(--color-surface-2)' }}
        >
          <X size={14} />
        </button>

        {/* Logo */}
        <div className="hidden lg:block">
          <ArqonLogo compact={false} />
        </div>
        <div className="hidden md:block lg:hidden">
          <ArqonLogo compact />
        </div>
        <div className="block md:hidden">
          <ArqonLogo compact={false} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
          {navItems.map((item) => {
            const active = activePage === item.id
            return (
              <button
                key={item.id}
                onClick={(e) => handleNav(item.id, e)}
                tabIndex={0}
                className={cn(
                  'sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm group cursor-pointer',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  active ? 'active' : ''
                )}
              >
                <span className={cn(
                  'sidebar-icon transition-transform duration-200 group-hover:translate-x-1'
                )}>
                  {item.icon}
                </span>
                <span
                  className="hidden lg:flex md:hidden flex-1 items-center justify-between truncate font-medium"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px' }}
                >
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent/10 text-accent border border-accent/20">
                      {item.badge}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Account Bottom Area */}
        <div className="px-2 py-3" style={{ borderTop: '1px solid var(--color-sidebar-border-right)' }}>
          <div
            onClick={(_e) => {
              setActivePage('profile')
            }}
            className="flex items-center gap-3 px-1 py-1 rounded-lg cursor-pointer hover:bg-[var(--color-sidebar-item-hover-bg)] transition-colors"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-accent shrink-0"
              style={{ background: 'rgb(var(--color-accent-rgb) / 0.1)', border: '1px solid rgb(var(--color-accent-rgb) / 0.2)', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <User size={16} />
            </div>
            <div className="hidden lg:block min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--color-sidebar-text-active)' }}>
                {session.isAuthenticated ? 'Neel' : 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--color-sidebar-text-inactive)', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}>
                user@example.com
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
