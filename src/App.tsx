import { useState } from 'react'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Providers from './pages/Providers'
import Logs from './pages/Logs'
import Settings from './pages/Settings'
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
  requests: {
    title: 'Real-time Request Stream',
    desc: 'A live-updating feed of every request flowing through Arqon, with sub-second granularity and streaming SSE push. Backend work in progress.',
    eta: 'Q1 2025',
  },
  models: {
    title: 'Model Catalog',
    desc: 'Browse and filter every available model across all connected providers — context length, capabilities (vision, audio, tool-calling), pricing, and enable/disable toggles.',
    eta: 'Q1 2025',
  },
  routing: {
    title: 'Routing Rule Builder',
    desc: 'Visual priority ordering, failover chains, retry/cooldown settings, and a simulator to preview the predicted route before deploying changes.',
    eta: 'Q1 2025',
  },
  analytics: {
    title: 'Analytics Dashboard',
    desc: 'Requests per hour, provider usage share, latency percentiles, failure rates, token consumption, and estimated cost — all with configurable date ranges.',
    eta: 'Q2 2025',
  },
  'api-keys': {
    title: 'API Key Management',
    desc: 'Dedicated key management with scope-based permissions, expiration dates, and per-key usage metrics. Until then, manage keys in Settings.',
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
  const [activePage, setActivePage] = useState<Page>('overview')
  // Initialize theme tracking
  useTheme()

  if (!session.isAuthenticated) {
    return <Login onLogin={() => login()} />
  }

  const p1Meta = P1_META[activePage]

  return (
    <AppLayout activePage={activePage} setActivePage={setActivePage} onLogout={logout}>
      <PageTransition pageKey={activePage}>
        {activePage === 'overview' && <Overview />}
        {activePage === 'providers' && <Providers />}
        {activePage === 'logs' && <Logs />}
        {activePage === 'settings' && <Settings />}
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
