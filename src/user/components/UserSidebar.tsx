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
  ChevronRight,
  Camera,
  ShieldCheck,
  Link2,
  Edit3,
  Sun,
  Pin,
  PinOff,
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
const HOVER_COLLAPSE_DELAY = 220 // ms

// ─────────────────────────────────────────────
// Nav data
// ─────────────────────────────────────────────
interface NavItem {
  id: UserPage
  label: string
  icon: React.ReactNode
  badge?: string
}

const mainNavItems: NavItem[] = [
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
]

interface ProfileSubItem {
  tab: string
  label: string
  icon: React.ReactNode
}

const PROFILE_SUB_ITEMS: ProfileSubItem[] = [
  { tab: 'overview', label: 'Overview', icon: <User size={14} /> },
  { tab: 'personal', label: 'Personal Info', icon: <Edit3 size={14} /> },
  { tab: 'avatar', label: 'Avatar', icon: <Camera size={14} /> },
  { tab: 'security', label: 'Security & 2FA', icon: <ShieldCheck size={14} /> },
  { tab: 'appearance', label: 'Settings & Themes', icon: <Sun size={14} /> },
  { tab: 'billing', label: 'Billing & Plan', icon: <CreditCard size={14} /> },
  { tab: 'help', label: 'Help Center', icon: <HelpCircle size={14} /> },
  { tab: 'connected', label: 'Connected Accounts', icon: <Link2 size={14} /> },
]

// ─────────────────────────────────────────────
// Tooltip wrapper for collapsed icons
// ─────────────────────────────────────────────
function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative flex items-center group/tip">
      {children}
      <div
        className="
          pointer-events-none absolute left-full ml-2.5 z-50
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
          width: '32px',
          height: '32px',
          minWidth: '32px',
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
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <span
              className="text-[15px] font-bold tracking-tight block"
              style={{
                color: 'var(--color-sidebar-text-active)',
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              ARQON
            </span>
            <span
              className="block font-semibold"
              style={{
                color: 'var(--color-sidebar-text-inactive)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              User Workspace
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
interface UserSidebarProps {
  activePage: UserPage
  setActivePage: (p: UserPage) => void
  /** Whether mobile drawer is open */
  open: boolean
  onClose: () => void
  /** Callback so UserLayout can adjust its margin */
  onExpandedChange?: (expanded: boolean) => void
}

export default function UserSidebar({
  activePage,
  setActivePage,
  open,
  onClose,
  onExpandedChange,
}: UserSidebarProps) {
  const { session } = useAuth()

  // ── Pin state (persisted) ──
  const [pinned, setPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem('arqon-sidebar-pinned') === 'true'
    } catch {
      return true
    }
  })

  // ── Hover expand ──
  const [hovering, setHovering] = useState(false)
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const expanded = pinned || hovering

  // Notify layout
  useEffect(() => {
    onExpandedChange?.(expanded)
  }, [expanded, onExpandedChange])

  const handleMouseEnter = useCallback(() => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
    setHovering(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    collapseTimer.current = setTimeout(() => setHovering(false), HOVER_COLLAPSE_DELAY)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
  }, [])

  // ── Profile accordion ──
  const [profileExpanded, setProfileExpanded] = useState(() => activePage === 'profile')

  useEffect(() => {
    if (activePage === 'profile') setProfileExpanded(true)
  }, [activePage])

  // ── Active sub-tab ──
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window === 'undefined') return 'overview'
    return new URLSearchParams(window.location.search).get('tab') || 'overview'
  })

  useEffect(() => {
    const onPopState = () => {
      setActiveTab(new URLSearchParams(window.location.search).get('tab') || 'overview')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // ── Navigation helpers ──
  const handleNav = useCallback(
    (page: UserPage, e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.blur()
      setActivePage(page)
      onClose()
    },
    [setActivePage, onClose]
  )

  const handleSubNav = useCallback(
    (tab: string, e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.blur()
      setActiveTab(tab)
      window.history.pushState(null, '', `/user/profile?tab=${tab}`)
      setActivePage('profile')
      window.dispatchEvent(new PopStateEvent('popstate'))
      onClose()
    },
    [setActivePage, onClose]
  )

  const handleToggleProfile = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.blur()
      if (!expanded) {
        // If collapsed, expand sidebar first, then open submenu
        setPinned(true)
        localStorage.setItem('arqon-sidebar-pinned', 'true')
        setTimeout(() => setProfileExpanded(true), 200)
      } else {
        setProfileExpanded((prev) => !prev)
      }
      if (activePage !== 'profile') setActivePage('profile')
    },
    [expanded, activePage, setActivePage]
  )

  const handleTogglePin = useCallback(() => {
    const next = !pinned
    setPinned(next)
    try {
      localStorage.setItem('arqon-sidebar-pinned', String(next))
    } catch {}
  }, [pinned])

  // ─────────────────────────────────────────
  // Shared label animation props
  // ─────────────────────────────────────────
  const labelMotion = {
    initial: { opacity: 0, x: -8, width: 0 },
    animate: { opacity: 1, x: 0, width: 'auto' },
    exit: { opacity: 0, x: -8, width: 0 },
    transition: { duration: 0.18 },
  }

  // ─────────────────────────────────────────
  // Render desktop sidebar
  // ─────────────────────────────────────────
  const sidebarContent = (isMobileDrawer = false) => (
    <div className="flex flex-col h-full">
      {/* Header: Logo + Pin button */}
      <div className="relative">
        <ArqonLogo expanded={isMobileDrawer || expanded} />
        {/* Pin/Unpin button — visible when desktop expanded */}
        <AnimatePresence initial={false}>
          {(isMobileDrawer || expanded) && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={handleTogglePin}
              title={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
              className="absolute top-4 right-3 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-all cursor-pointer hidden md:flex items-center justify-center"
            >
              {pinned ? <PinOff size={13} /> : <Pin size={13} />}
            </motion.button>
          )}
        </AnimatePresence>
        {/* Mobile close button */}
        {isMobileDrawer && (
          <button
            onClick={onClose}
            className="absolute top-4 right-3 p-1.5 rounded-lg text-muted hover:text-foreground md:hidden cursor-pointer"
            style={{ background: 'var(--color-surface-2)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Nav */}
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
                active
                  ? 'bg-accent/15 text-accent font-semibold'
                  : 'text-muted hover:text-foreground hover:bg-surface-2/80'
              )}
            >
              {/* Active left bar */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-accent"
                  aria-hidden="true"
                />
              )}

              <span
                className={cn(
                  'shrink-0 transition-transform duration-200',
                  !active && 'group-hover:translate-x-0.5',
                  active ? 'text-accent' : 'text-muted group-hover:text-foreground'
                )}
              >
                {item.icon}
              </span>

              <AnimatePresence initial={false}>
                {(isMobileDrawer || expanded) && (
                  <motion.span
                    {...labelMotion}
                    className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap font-medium text-[13px]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
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

          // In collapsed mode, wrap with tooltip
          return !isMobileDrawer && !expanded ? (
            <Tooltip key={item.id} label={item.label}>
              {btn}
            </Tooltip>
          ) : (
            <div key={item.id}>{btn}</div>
          )
        })}

        {/* ── Profile Accordion ── */}
        <div className="pt-0.5">
          {/* Profile parent trigger */}
          {!isMobileDrawer && !expanded ? (
            <Tooltip label="Profile">
              <button
                onClick={handleToggleProfile}
                className={cn(
                  'relative w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm group cursor-pointer transition-all duration-150',
                  activePage === 'profile'
                    ? 'bg-accent/15 text-accent font-semibold'
                    : 'text-muted hover:text-foreground hover:bg-surface-2/80'
                )}
              >
                {activePage === 'profile' && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-accent" />
                )}
                <span className={cn('shrink-0', activePage === 'profile' ? 'text-accent' : 'text-muted group-hover:text-foreground')}>
                  <User size={18} />
                </span>
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={handleToggleProfile}
              aria-expanded={profileExpanded}
              className={cn(
                'relative w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm group cursor-pointer transition-all duration-150',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                activePage === 'profile'
                  ? 'bg-accent/15 text-accent font-semibold'
                  : 'text-muted hover:text-foreground hover:bg-surface-2/80'
              )}
            >
              {activePage === 'profile' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-accent" />
              )}
              <span className={cn('shrink-0', activePage === 'profile' ? 'text-accent' : 'text-muted group-hover:text-foreground')}>
                <User size={18} />
              </span>
              <AnimatePresence initial={false}>
                {(isMobileDrawer || expanded) && (
                  <motion.span
                    {...labelMotion}
                    className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap font-medium text-[13px]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <span>Profile</span>
                    <ChevronRight
                      size={14}
                      className={cn(
                        'transition-transform duration-250 shrink-0 ml-1',
                        profileExpanded ? 'rotate-90 text-accent' : 'text-muted'
                      )}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}

          {/* Submenu */}
          <AnimatePresence initial={false}>
            {(isMobileDrawer || expanded) && profileExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="ml-5 pl-3 mt-1 border-l border-border/40 space-y-0.5 py-0.5">
                  {PROFILE_SUB_ITEMS.map((sub) => {
                    const isActive = activePage === 'profile' && activeTab === sub.tab
                    return (
                      <button
                        key={sub.tab}
                        onClick={(e) => handleSubNav(sub.tab, e)}
                        tabIndex={0}
                        className={cn(
                          'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer',
                          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
                          isActive
                            ? 'bg-accent/10 text-accent font-bold border border-accent/20'
                            : 'text-muted hover:text-foreground hover:bg-surface-2'
                        )}
                      >
                        <span className={cn('shrink-0', isActive ? 'text-accent' : 'text-muted')}>
                          {sub.icon}
                        </span>
                        <span className="text-[11.5px] font-medium truncate">{sub.label}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Bottom User Info */}
      <div
        className="px-2 py-3 shrink-0 overflow-hidden"
        style={{ borderTop: '1px solid var(--color-sidebar-border-right)' }}
      >
        {!isMobileDrawer && !expanded ? (
          <Tooltip label={`${session.isAuthenticated ? 'Neel' : 'User'} · Workspace`}>
            <button
              onClick={() => setActivePage('profile')}
              className="w-full flex items-center justify-center px-1 py-1 rounded-lg cursor-pointer hover:bg-surface-2 transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-accent/40 shadow-sm">
                <img
                  src="/avatars/avatar-01.png"
                  alt="User"
                  className="w-full h-full object-cover"
                  onError={(e) => { ;(e.target as HTMLElement).style.display = 'none' }}
                />
              </div>
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={() => setActivePage('profile')}
            className="w-full flex items-center gap-3 px-1 py-1 rounded-lg cursor-pointer hover:bg-surface-2 transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-accent/40 shadow-sm">
              <img
                src="/avatars/avatar-01.png"
                alt="User"
                className="w-full h-full object-cover"
                onError={(e) => { ;(e.target as HTMLElement).style.display = 'none' }}
              />
            </div>
            <AnimatePresence initial={false}>
              {(isMobileDrawer || expanded) && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  className="min-w-0 overflow-hidden"
                >
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: 'var(--color-sidebar-text-active)', whiteSpace: 'nowrap' }}
                  >
                    {session.isAuthenticated ? 'Neel Patil' : 'User'}
                  </p>
                  <p
                    className="text-[10px] truncate"
                    style={{
                      color: 'var(--color-sidebar-text-inactive)',
                      fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Pro Workspace
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* ─── Mobile overlay ─── */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden glass-overlay"
          onClick={onClose}
        />
      )}

      {/* ─── Mobile Drawer ─── */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 flex flex-col md:hidden',
          'transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'var(--color-sidebar-bg)',
          borderRight: '1px solid var(--color-sidebar-border-right)',
        }}
      >
        {sidebarContent(true)}
      </div>

      {/* ─── Desktop Smart Rail ─── */}
      <motion.aside
        className="hidden md:flex flex-col fixed inset-y-0 left-0 z-50 overflow-hidden"
        style={{
          background: 'var(--color-sidebar-bg)',
          borderRight: '1px solid var(--color-sidebar-border-right)',
        }}
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
