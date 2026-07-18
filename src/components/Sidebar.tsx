import { X, LayoutDashboard, Server, FileText, Settings, Activity, Layers, GitBranch, BarChart2, Key, Terminal, Zap } from 'lucide-react'
import { cn } from '../utils'

export type Page =
  | 'overview'
  | 'providers'
  | 'logs'
  | 'settings'
  | 'requests'
  | 'models'
  | 'routing'
  | 'analytics'
  | 'api-keys'
  | 'playground'

interface NavItem {
  id: Page
  label: string
  icon: React.ReactNode
  p1?: boolean
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'providers', label: 'Providers', icon: <Server size={18} /> },
  { id: 'logs', label: 'Logs', icon: <FileText size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
]

const p1Items: NavItem[] = [
  { id: 'requests', label: 'Requests', icon: <Activity size={18} />, p1: true },
  { id: 'models', label: 'Models', icon: <Layers size={18} />, p1: true },
  { id: 'routing', label: 'Routing', icon: <GitBranch size={18} />, p1: true },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} />, p1: true },
  { id: 'api-keys', label: 'API Keys', icon: <Key size={18} />, p1: true },
  { id: 'playground', label: 'Playground', icon: <Terminal size={18} />, p1: true },
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
            Orchestration Engine
          </span>
        </div>
      )}
    </div>
  )
}

interface SidebarProps {
  activePage: Page
  setActivePage: (p: Page) => void
  open: boolean
  onClose: () => void
}

export default function Sidebar({ activePage, setActivePage, open, onClose }: SidebarProps) {
  const handleNav = (page: Page, e: React.MouseEvent<HTMLButtonElement>) => {
    // Immediately release focus from the clicked button so the browser never
    // renders a focus ring / border on the previously-active item.
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
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-foreground md:hidden"
          style={{ background: 'var(--color-surface-2)' }}
        >
          <X size={14} />
        </button>

        {/* Logo — compact on tablet */}
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
                  'sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm group',
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
                  className="hidden lg:block md:hidden truncate font-medium"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px' }}
                >
                  {item.label}
                </span>
                <span
                  className="block md:hidden lg:block"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', display: 'none' }}
                />
              </button>
            )
          })}

          {/* Divider + P1 items */}
          <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--color-sidebar-border-right)' }}>
            <p className="text-xs font-medium px-3 py-1.5 hidden lg:block" style={{ color: 'var(--color-sidebar-text-inactive)', fontFamily: "'Inter', sans-serif", opacity: 0.7 }}>
              Coming soon
            </p>
            {p1Items.map((item) => {
              return (
                <button
                  key={item.id}
                  tabIndex={-1}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group cursor-not-allowed',
                    'opacity-40'
                  )}
                >
                  <span className="sidebar-icon transition-transform duration-200 text-[var(--color-sidebar-icon-inactive)]">{item.icon}</span>
                  <span
                    className="hidden lg:block font-medium truncate text-[var(--color-sidebar-text-inactive)]"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px' }}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Plan card */}
        <div className="px-2 py-3" style={{ borderTop: '1px solid var(--color-sidebar-border-right)' }}>
          <div
            className="hidden lg:block p-3 rounded-lg mb-2"
            style={{ 
              background: 'var(--color-sidebar-card-bg)', 
              border: 'var(--color-sidebar-card-border)',
              boxShadow: 'var(--color-sidebar-card-shadow)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--color-sidebar-text-active)' }}>Pro Plan</span>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgb(var(--color-success-rgb) / 0.1)', color: 'var(--color-success)', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}
              >
                Active
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--color-sidebar-text-inactive)' }}>Requests</span>
                <span className="text-xs" style={{ color: 'var(--color-sidebar-text-inactive)', fontFamily: "'JetBrains Mono', monospace" }}>
                  2.47M / 5M
                </span>
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-sidebar-border-right)' }}>
                <div className="h-full rounded-full" style={{ width: '49%', background: 'var(--color-accent)' }} />
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="flex items-center gap-3 px-1 py-1 rounded-lg cursor-pointer hover:bg-[var(--color-sidebar-item-hover-bg)] transition-colors">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-accent shrink-0"
              style={{ background: 'rgb(var(--color-accent-rgb) / 0.1)', border: '1px solid rgb(var(--color-accent-rgb) / 0.2)', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              AD
            </div>
            <div className="hidden lg:block min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--color-sidebar-text-active)' }}>Administrator</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-sidebar-text-inactive)', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}>
                admin@arqon.internal
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
