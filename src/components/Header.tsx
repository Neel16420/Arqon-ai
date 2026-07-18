import { useState, useRef, useEffect } from 'react'
import { Menu, Bell, ChevronDown, User, Settings2, CreditCard, LogOut } from 'lucide-react'
import type { Page } from './Sidebar'
import ThemeSegmentedControl from './ThemeToggle'

const PAGE_META: Record<Page, { title: string; desc: string }> = {
  overview: { title: 'Overview', desc: 'Platform health and traffic at a glance' },
  providers: { title: 'Providers', desc: 'Manage AI provider integrations and priorities' },
  logs: { title: 'Logs', desc: 'Full request and response history' },
  settings: { title: 'Settings', desc: 'Platform configuration and admin access' },
  requests: { title: 'Requests', desc: 'Real-time request stream' },
  models: { title: 'Models', desc: 'Available models across all providers' },
  routing: { title: 'Routing', desc: 'Visual routing rules and failover chains' },
  analytics: { title: 'Analytics', desc: 'Usage metrics, latency trends, and cost analysis' },
  'api-keys': { title: 'API Keys', desc: 'Gateway authentication key management' },
  playground: { title: 'Playground', desc: 'Test models and providers interactively' },
}

const notifications = [
  { id: 1, msg: 'Azure OpenAI degraded — failover active', time: '2m ago', type: 'warning' },
  { id: 2, msg: 'Google AI quota at 96% capacity', time: '18m ago', type: 'warning' },
  { id: 3, msg: 'New provider Mistral Large added', time: '2h ago', type: 'info' },
]

const userMenuItems = [
  { id: 'profile', label: 'Profile', icon: User, desc: 'View your profile' },
  { id: 'settings', label: 'Settings', icon: Settings2, desc: 'Platform preferences' },
  { id: 'account', label: 'Account', icon: CreditCard, desc: 'Billing & plan' },
]

interface HeaderProps {
  activePage: Page
  onMenuClick: () => void
  onLogout: () => void
}

export default function Header({ activePage, onMenuClick, onLogout }: HeaderProps) {
  const meta = PAGE_META[activePage]
  const [showNotif, setShowNotif] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
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

  return (
    <header
      className="flex items-center justify-between px-4 lg:px-6 h-14 shrink-0 sticky top-0 z-30"
      style={{ background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}
    >
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-muted hover:text-foreground transition-colors"
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

      {/* Right: theme toggle + notification bell + avatar */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Theme Segmented Control */}
        <ThemeSegmentedControl />

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative p-2 rounded-lg text-muted hover:text-foreground transition-colors"
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
              <div
                className="absolute right-0 top-full mt-2 w-72 rounded-xl z-50 overflow-hidden glass-surface glass-border glass-shadow glass-open"
              >
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold text-foreground"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Notifications
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgb(var(--color-accent-rgb) / 0.1)', color: 'var(--color-accent)', fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {notifications.length}
                    </span>
                  </div>
                </div>
                {notifications.map((n, i) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: i < notifications.length - 1 ? '1px solid #1C1C1E' : 'none' }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: n.type === 'warning' ? 'var(--color-warning)' : 'var(--color-info)' }}
                    />
                    <div>
                      <p className="text-xs text-foreground leading-relaxed">{n.msg}</p>
                      <p className="text-xs text-muted mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="header-user-menu-btn"
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2 h-9 px-3 rounded-lg cursor-pointer transition-all hover:border-border-2"
            style={{
              background: showUserMenu ? 'var(--color-surface-2)' : 'var(--color-surface)',
              border: showUserMenu ? '1px solid var(--color-border-2)' : '1px solid var(--color-border)',
            }}
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: '#000000', boxShadow: '0 0 8px rgb(var(--color-accent-rgb) / 0.25)' }}
            >
              <img
                src="/logo/arqon-new-logo.png"
                alt="Arqon"
                className="w-full h-full object-contain"
                style={{ padding: '2px' }}
              />
            </div>
            <span className="text-xs font-medium text-foreground hidden sm:block">Admin</span>
            <ChevronDown
              size={12}
              className="text-muted hidden sm:block transition-transform duration-200"
              style={{ transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {/* Slide-down dropdown menu */}
          <div
            id="header-user-dropdown"
            className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50 glass-elevated glass-border glass-shadow"
            style={{
              transformOrigin: 'top right',
              transform: showUserMenu ? 'scaleY(1) translateY(0)' : 'scaleY(0) translateY(-8px)',
              opacity: showUserMenu ? 1 : 0,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease',
              pointerEvents: showUserMenu ? 'auto' : 'none',
            }}
          >
            {/* User info header */}
            <div
              className="px-4 py-3 flex items-center gap-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: '#000', boxShadow: '0 0 10px rgb(var(--color-accent-rgb) / 0.2)' }}
              >
                <img
                  src="/logo/arqon-new-logo.png"
                  alt="Arqon"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }}
                />
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs font-semibold text-foreground truncate"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Administrator
                </p>
                <p
                  className="text-xs text-muted truncate"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}
                >
                  admin@arqon.internal
                </p>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              {userMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    id={`header-menu-${item.id}`}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all group glass-hover"
                    style={{ background: 'transparent' }}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-muted)' }}
                    >
                      <Icon size={13} />
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-xs font-medium text-foreground"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {item.label}
                      </p>
                      <p className="text-xs text-muted" style={{ fontSize: '10px' }}>
                        {item.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Logout — separated */}
            <div style={{ borderTop: '1px solid var(--color-border)' }} className="py-1">
              <button
                id="header-menu-logout"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                style={{ background: 'transparent' }}
                onClick={onLogout}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgb(var(--color-accent-rgb) / 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgb(var(--color-accent-rgb) / 0.08)', color: 'var(--color-accent)' }}
                >
                  <LogOut size={13} />
                </span>
                <p
                  className="text-xs font-medium"
                  style={{ color: 'var(--color-accent)', fontFamily: "'Inter', sans-serif" }}
                >
                  Log out
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
