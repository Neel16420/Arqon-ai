import { useState, useEffect, useCallback } from 'react'
import Login from './pages/Login'
import Terms from './pages/Terms'
import Help from './pages/Help'
import Privacy from './pages/Privacy'
import Overview from './pages/Overview'
import Providers from './pages/Providers'
import Logs from './pages/Logs'
import Settings from './pages/Settings'
import ApiKeys from './pages/ApiKeys'
import Routing from './pages/Routing'
import Requests from './pages/Requests'
import ComingSoon from './pages/ComingSoon'
import Sidebar, { type Page } from './components/Sidebar'
import Header from './components/Header'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'

/** Triggers animate-page-enter on every route change via React key trick. */
function PageTransition({ pageKey, children }: { pageKey: string; children: React.ReactNode }) {
  return (
    <div key={pageKey} className="animate-page-enter" style={{ willChange: 'opacity, transform' }}>
      {children}
    </div>
  )
}

const P1_META: Record<string, { title: string; desc: string; eta: string }> = {
  models: {
    title: 'Model Catalog',
    desc: 'Browse and filter every available model across all connected providers — context length, capabilities (vision, audio, tool-calling), pricing, and enable/disable toggles.',
    eta: 'Q1 2025',
  },

  analytics: {
    title: 'Analytics Dashboard',
    desc: 'Requests per hour, provider usage share, latency percentiles, failure rates, token consumption, and estimated cost — all with configurable date ranges.',
    eta: 'Q2 2025',
  },
  playground: {
    title: 'Interactive Playground',
    desc: 'A chat-style console to test any model and provider directly — with streaming responses, per-request metadata, and side-by-side model comparison.',
    eta: 'Q2 2025',
  },
}

function AppLayout({ children, activePage, setActivePage, onLogout }: {
  children: React.ReactNode
  activePage: Page
  setActivePage: (p: Page) => void
  onLogout: () => void
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-background)' }}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Content area — offset for sidebar */}
      <div
        className="flex flex-col flex-1 min-w-0 overflow-hidden"
        style={{
          marginLeft: 0,
          paddingLeft: 0,
        }}
      >
        {/* On md+ screens, we need to account for the sidebar */}
        <style>{`
          @media (min-width: 768px) {
            .content-area { margin-left: 56px; }
          }
          @media (min-width: 1024px) {
            .content-area { margin-left: 224px; }
          }
        `}</style>

        <div className="content-area flex flex-col flex-1 min-w-0 overflow-hidden h-full">
          <Header activePage={activePage} onMenuClick={() => setSidebarOpen(true)} onLogout={onLogout} />
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 md:px-6 py-5 md:py-6 max-w-screen-xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { session, login, logout } = useAuth()
  const getPathPage = (): Page => {
    const path = window.location.pathname.substring(1)
    const validPages: Page[] = ['overview', 'providers', 'logs', 'settings', 'requests', 'models', 'routing', 'analytics', 'api-keys', 'playground']
    return validPages.includes(path as Page) ? (path as Page) : 'overview'
  }

  const [activePage, _setActivePage] = useState<Page>(getPathPage)

  useEffect(() => {
    const onPopState = () => {
      _setActivePage(getPathPage())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setActivePage = useCallback((page: Page) => {
    _setActivePage((prev) => {
      if (prev !== page) {
        window.history.pushState(null, '', `/${page}`)
        return page
      }
      return prev
    })
  }, [])
  // Initialize theme tracking
  useTheme()

  if (window.location.pathname === '/terms') {
    return <Terms />
  }
  
  if (window.location.pathname === '/privacy') {
    return <Privacy />
  }

  if (window.location.pathname === '/help') {
    return <Help />
  }

  if (!session.isAuthenticated) {
    return <Login onLogin={(session) => login(session)} />
  }

  const p1Meta = P1_META[activePage]

  return (
    <AppLayout activePage={activePage} setActivePage={setActivePage} onLogout={logout}>
      <PageTransition pageKey={activePage}>
        {activePage === 'overview' && <Overview onNavigate={setActivePage as any} />}
        {activePage === 'providers' && <Providers />}
        {activePage === 'logs' && <Logs />}
        {activePage === 'settings' && <Settings />}
        {activePage === 'api-keys' && <ApiKeys />}
        {activePage === 'routing' && <Routing />}
        {activePage === 'requests' && <Requests />}
        {p1Meta && (
          <ComingSoon
            title={p1Meta.title}
            description={p1Meta.desc}
            eta={p1Meta.eta}
          />
        )}
      </PageTransition>
    </AppLayout>
  )
}
