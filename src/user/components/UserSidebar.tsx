import { useState, useEffect, useCallback, useRef } from 'react'
import type React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  CreditCard,
  HelpCircle,
  Key,
  Activity,
  BarChart2,
  Camera,
  ShieldCheck,
  Link2,
  Sun,
  Pin,
  PinOff,
  ChevronUp,
  LogOut,
  Settings,
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

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const EXPANDED_W = 264
const COLLAPSED_W = 68
const HOVER_COLLAPSE_DELAY = 220

// ─────────────────────────────────────────────
// Nav items
// ─────────────────────────────────────────────
interface NavItem {
  id: UserPage
  label: string
  icon: React.ReactNode
  badge?: string
}

const mainNavItems: NavItem[] = [
  { id: 'dashboard',     label: 'Dashboard',       icon: <LayoutDashboard size={18} /> },
  { id: 'chat',          label: 'AI Workspace',     icon: <MessageSquare size={18} />,  badge: 'Pro' },
  { id: 'keys',          label: 'API Keys',         icon: <Key size={18} /> },
  { id: 'requests',      label: 'Requests Log',     icon: <Activity size={18} /> },
  { id: 'analytics',     label: 'Usage Analytics',  icon: <BarChart2 size={18} /> },
  { id: 'models',        label: 'AI Models',        icon: <Cpu size={18} /> },
  { id: 'projects',      label: 'Projects',         icon: <FolderGit2 size={18} /> },
  { id: 'prompts',       label: 'Prompt Library',   icon: <Bookmark size={18} /> },
  { id: 'files',         label: 'Files & Assets',   icon: <FileText size={18} /> },
  { id: 'notifications', label: 'Notifications',    icon: <Bell size={18} />, badge: '3' },
]

// ─────────────────────────────────────────────
// Account hub menu items
// ─────────────────────────────────────────────
interface AccountMenuItem {
  label: string
  icon: React.ReactNode
  action: 'profile-tab' | 'avatar-modal' | 'logout'
  tab?: string
  danger?: boolean
}

const ACCOUNT_MENU_ITEMS: AccountMenuItem[] = [
  { label: 'My Profile',              icon: <User size={14} />,        action: 'profile-tab', tab: 'overview' },
  { label: 'Change Avatar',           icon: <Camera size={14} />,      action: 'avatar-modal' },
  { label: 'Settings & Appearance',   icon: <Sun size={14} />,         action: 'profile-tab', tab: 'appearance' },
  { label: 'Security & 2FA',          icon: <ShieldCheck size={14} />, action: 'profile-tab', tab: 'security' },
  { label: 'Billing & Plan',          icon: <CreditCard size={14} />,  action: 'profile-tab', tab: 'billing' },
  { label: 'Notification Preferences',icon: <Bell size={14} />,        action: 'profile-tab', tab: 'notification-prefs' },
  { label: 'Help Center',             icon: <HelpCircle size={14} />,  action: 'profile-tab', tab: 'help' },
  { label: 'Connected Accounts',      icon: <Link2 size={14} />,       action: 'profile-tab', tab: 'connected' },
  { label: 'Log Out',                 icon: <LogOut size={14} />,      action: 'logout', danger: true },
]

// ─────────────────────────────────────────────
// Tooltip (for collapsed icons)
// ─────────────────────────────────────────────
function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative flex items-center group/tip">
      {children}
      <div
        className="
          pointer-events-none absolute left-full ml-2.5 z-[60]
          px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap
          bg-surface-2 border border-border text-foreground shadow-xl
          opacity-0 scale-95 translate-x-1
          group-hover/tip:opacity-100 group-hover/tip:scale-100 group-hover/tip:translate-x-0
          transition-all duration-150
        "
      >
        {label}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Arqon Logo
// ─────────────────────────────────────────────
function ArqonLogo({ expanded }: { expanded: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-4 shrink-0 overflow-hidden"
      style={{ borderBottom: '1px solid var(--color-sidebar-border-right)' }}
    >
      <div
        className="shrink-0 flex items-center justify-center rounded-lg"
        style={{
          width: '32px', height: '32px', minWidth: '32px',
          background: 'rgb(var(--color-accent-rgb) / 0.08)',
          border: '1px solid rgb(var(--color-accent-rgb) / 0.18)',
          boxShadow: '0 0 10px rgb(var(--color-accent-rgb) / 0.1)',
        }}
      >
        <img src="/logo/arqon-new-logo.png" alt="Arqon" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18 }} className="overflow-hidden"
          >
            <span className="text-[15px] font-bold tracking-tight block"
              style={{ color: 'var(--color-sidebar-text-active)', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              ARQON
            </span>
            <span className="block font-semibold"
              style={{ color: 'var(--color-sidebar-text-inactive)', fontFamily: "'Inter', sans-serif", fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              User Workspace
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface UserSidebarProps {
  activePage: UserPage
  setActivePage: (p: UserPage) => void
  open: boolean
  onClose: () => void
  onExpandedChange?: (expanded: boolean) => void
  /** Avatar URL so the sidebar always reflects the latest selection */
  avatarUrl?: string
  /** Opens the avatar picker modal from outside (lifted up) */
  onOpenAvatarModal?: () => void
  /** Logout handler */
  onLogout?: () => void
}

export default function UserSidebar({
  activePage,
  setActivePage,
  open,
  onClose,
  onExpandedChange,
  avatarUrl = '/avatars/avatar-01.png',
  onOpenAvatarModal,
  onLogout,
}: UserSidebarProps) {
  const { session, logout } = useAuth()

  // ── Pin state ──
  const [pinned, setPinned] = useState<boolean>(() => {
    try { return localStorage.getItem('arqon-sidebar-pinned') !== 'false' } catch { return true }
  })

  // ── Hover expand ──
  const [hovering, setHovering] = useState(false)
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const expanded = pinned || hovering

  useEffect(() => { onExpandedChange?.(expanded) }, [expanded, onExpandedChange])

  const handleMouseEnter = useCallback(() => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
    setHovering(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    collapseTimer.current = setTimeout(() => setHovering(false), HOVER_COLLAPSE_DELAY)
  }, [])

  useEffect(() => () => { if (collapseTimer.current) clearTimeout(collapseTimer.current) }, [])

  // ── Account hub menu ──
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  // Close menu when clicking outside
  const accountHubRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!accountMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (accountHubRef.current && !accountHubRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [accountMenuOpen])

  // ── Navigation helpers ──
  const handleNav = useCallback((page: UserPage, e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()
    setActivePage(page)
    onClose()
  }, [setActivePage, onClose])

  const handleAccountMenuAction = useCallback((item: AccountMenuItem) => {
    setAccountMenuOpen(false)
    if (item.action === 'logout') {
      onLogout?.()
      logout()
      return
    }
    if (item.action === 'avatar-modal') {
      onOpenAvatarModal?.()
      return
    }
    if (item.action === 'profile-tab' && item.tab) {
      window.history.pushState(null, '', `/user/profile?tab=${item.tab}`)
      setActivePage('profile')
      window.dispatchEvent(new PopStateEvent('popstate'))
      onClose()
    }
  }, [setActivePage, onClose, onOpenAvatarModal, onLogout, logout])

  // Shared label motion
  const labelMotion = {
    initial: { opacity: 0, x: -8, width: 0 },
    animate: { opacity: 1, x: 0, width: 'auto' },
    exit:    { opacity: 0, x: -8, width: 0 },
    transition: { duration: 0.18 },
  }

  // ─────────────────────────────────────────
  // Sidebar content (shared between desktop and mobile drawer)
  // ─────────────────────────────────────────
  const sidebarContent = (isMobileDrawer = false) => {
    const isExpanded = isMobileDrawer || expanded

    return (
      <div className="flex flex-col h-full">
        {/* ── Header: Logo + Pin ── */}
        <div className="relative">
          <ArqonLogo expanded={isExpanded} />
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  const next = !pinned
                  setPinned(next)
                  try { localStorage.setItem('arqon-sidebar-pinned', String(next)) } catch {}
                }}
                title={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
                className="absolute top-4 right-3 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-all cursor-pointer hidden md:flex items-center justify-center"
              >
                {pinned ? <PinOff size={13} /> : <Pin size={13} />}
              </motion.button>
            )}
          </AnimatePresence>
          {isMobileDrawer && (
            <button onClick={onClose}
              className="absolute top-4 right-3 p-1.5 rounded-lg text-muted hover:text-foreground md:hidden cursor-pointer"
              style={{ background: 'var(--color-surface-2)' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* ── Main Nav ── */}
        <nav className="flex-1 px-2 py-2 overflow-y-auto overflow-x-hidden space-y-0.5">
          {mainNavItems.map((item) => {
            const active = activePage === item.id
            const btn = (
              <button
                key={item.id}
                onClick={(e) => handleNav(item.id, e)}
                tabIndex={0}
                className={cn(
                  'relative w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm group cursor-pointer transition-all duration-150',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  active ? 'bg-accent/15 text-accent font-semibold' : 'text-muted hover:text-foreground hover:bg-surface-2/80'
                )}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-accent" aria-hidden="true" />}
                <span className={cn('shrink-0 transition-transform duration-200',
                  !active && 'group-hover:translate-x-0.5',
                  active ? 'text-accent' : 'text-muted group-hover:text-foreground')}>
                  {item.icon}
                </span>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.span {...labelMotion}
                      className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap font-medium text-[13px]"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-2 shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent/10 text-accent border border-accent/20">
                          {item.badge}
                        </span>
                      )}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )

            return !isExpanded ? (
              <Tooltip key={item.id} label={item.label}>{btn}</Tooltip>
            ) : (
              <div key={item.id}>{btn}</div>
            )
          })}
        </nav>

        {/* ── Bottom Account Hub ── */}
        <div
          ref={accountHubRef}
          className="px-2 py-2 shrink-0 overflow-visible relative"
          style={{ borderTop: '1px solid var(--color-sidebar-border-right)' }}
        >
          {/* Account Menu — opens upward */}
          <AnimatePresence initial={false}>
            {accountMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="absolute bottom-full left-2 right-2 mb-2 z-[70] rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 -8px 32px rgba(0,0,0,0.4), 0 -2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {/* Menu Header — user identity */}
                <div className="px-3.5 py-3 border-b border-border/60 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-accent/40 shadow-sm">
                    <img src={avatarUrl} alt="User" className="w-full h-full object-cover"
                      onError={(e) => { ;(e.target as HTMLElement).style.display = 'none' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: 'var(--color-sidebar-text-active)', whiteSpace: 'nowrap' }}>
                      {session.isAuthenticated ? 'Neel Patil' : 'User'}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--color-sidebar-text-inactive)', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                      Pro Workspace
                    </p>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-1.5 space-y-0.5">
                  {ACCOUNT_MENU_ITEMS.map((item, idx) => {
                    const isDivider = idx === ACCOUNT_MENU_ITEMS.length - 1
                    return (
                      <div key={item.label}>
                        {isDivider && <div className="my-1 border-t border-border/50" />}
                        <button
                          onClick={() => handleAccountMenuAction(item)}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all text-left',
                            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
                            item.danger
                              ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
                              : 'text-muted hover:text-foreground hover:bg-surface-2'
                          )}
                        >
                          <span className={cn('shrink-0', item.danger ? 'text-rose-400' : 'text-muted')}>
                            {item.icon}
                          </span>
                          {item.label}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Account Hub Card */}
          {!isExpanded ? (
            <Tooltip label={`${session.isAuthenticated ? 'Neel Patil' : 'User'} · Account`}>
              <button
                onClick={() => setAccountMenuOpen((v) => !v)}
                className={cn(
                  'w-full flex items-center justify-center px-1 py-1.5 rounded-xl cursor-pointer transition-all',
                  accountMenuOpen ? 'bg-surface-2 ring-1 ring-accent/30' : 'hover:bg-surface-2'
                )}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-accent/40 shadow-sm">
                  <img src={avatarUrl} alt="User" className="w-full h-full object-cover"
                    onError={(e) => { ;(e.target as HTMLElement).style.display = 'none' }} />
                </div>
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={() => setAccountMenuOpen((v) => !v)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all',
                accountMenuOpen ? 'bg-surface-2 ring-1 ring-accent/30' : 'hover:bg-surface-2'
              )}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-accent/40 shadow-sm">
                <img src={avatarUrl} alt="User" className="w-full h-full object-cover"
                  onError={(e) => { ;(e.target as HTMLElement).style.display = 'none' }} />
              </div>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.18 }} className="flex-1 min-w-0 overflow-hidden"
                  >
                    <p className="text-xs font-semibold truncate"
                      style={{ color: 'var(--color-sidebar-text-active)', whiteSpace: 'nowrap' }}>
                      {session.isAuthenticated ? 'Neel Patil' : 'User'}
                    </p>
                    <p className="text-[10px] truncate"
                      style={{ color: 'var(--color-sidebar-text-inactive)', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                      Pro Workspace
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="shrink-0 text-muted"
                  >
                    <ChevronUp
                      size={13}
                      className={cn('transition-transform duration-200', accountMenuOpen ? 'rotate-180 text-accent' : '')}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden glass-overlay" onClick={onClose} />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 flex flex-col md:hidden',
          'transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'var(--color-sidebar-bg)', borderRight: '1px solid var(--color-sidebar-border-right)' }}
      >
        {sidebarContent(true)}
      </div>

      {/* Desktop Smart Rail */}
      <motion.aside
        className="hidden md:flex flex-col fixed inset-y-0 left-0 z-50 overflow-hidden"
        style={{ background: 'var(--color-sidebar-bg)', borderRight: '1px solid var(--color-sidebar-border-right)' }}
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {sidebarContent(false)}
      </motion.aside>
    </>
  )
}
