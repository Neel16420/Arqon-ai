import { useState, useEffect, useCallback } from "react"
import UserApp from "./user/UserApp"
import Login from "./pages/Login"
import Terms from "./pages/Terms"
import Help from "./pages/Help"
import Privacy from "./pages/Privacy"
import Overview from "./pages/Overview"
import Providers from "./pages/Providers"
import Logs from "./pages/Logs"
import Settings from "./pages/Settings"
import ApiKeys from "./pages/ApiKeys"
import Routing from "./pages/Routing"
import Requests from "./pages/Requests"
import Models from "./pages/Models"
import Analytics from "./pages/Analytics"
import Playground from "./pages/Playground"
import ComingSoon from "./pages/ComingSoon"
import TeamManagement from "./pages/TeamManagement"
import RolesPermissions from "./pages/RolesPermissions"
import UsageLimits from "./pages/UsageLimits"
import AuditLogs from "./pages/AuditLogs"
import ActivityTimeline from "./pages/ActivityTimeline"
import Sidebar, { type Page } from "./layouts/Sidebar"
import Header from "./layouts/Header"
import { useTheme } from "./hooks/useTheme"
import { useAuth } from "./hooks/useAuth"
import { PageSkeleton } from "./components/skeletons/PageSkeleton"
import { AnimatePresence, motion } from "framer-motion"
import { useReducedMotion } from "./motion/useReducedMotion"

/** Enterprise-grade Page Transition component with Framer Motion mounted at the routing root. */
function PageTransition({
  pageKey,
  children,
}: {
  pageKey: string
  children: React.ReactNode
}) {
  const reduced = useReducedMotion()

  const variants: any = reduced
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0, transition: { duration: 0 } },
        exit: { opacity: 1, transition: { duration: 0 } },
      }
    : {
        initial: { opacity: 0, y: 8 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.2, ease: "easeOut" },
        },
        exit: {
          opacity: 0.98,
          transition: { duration: 0.09, ease: "easeIn" },
        },
      }

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => {
        const mainEl = document.querySelector("main")
        if (mainEl) {
          mainEl.scrollTop = 0
        }
      }}
    >
      <motion.div
        key={pageKey}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="px-4 md:px-6 py-5 md:py-6 max-w-screen-xl mx-auto page-transition-root"
        style={{ willChange: "opacity, transform" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

const P1_META: Record<string, { title: string, desc: string, eta: string }> = {
  models: {
    title: "Model Catalog",

    desc: "Browse and filter every available model across all connected providers — context length, capabilities (vision, audio, tool-calling), pricing, and enable/disable toggles.",

    eta: "Q1 2025",
  },

  analytics: {
    title: "Analytics Dashboard",

    desc: "Requests per hour, provider usage share, latency percentiles, failure rates, token consumption, and estimated cost — all with configurable date ranges.",

    eta: "Q2 2025",
  },
}

function AppLayout({
  children,
  activePage,
  pageKey,
  setActivePage,
  onLogout,
}: {
  children: React.ReactNode
  activePage: Page
  pageKey: string
  setActivePage: (p: Page) => void
  onLogout: () => void
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Persisted collapse state for Desktop

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("arqon-sidebar-collapsed") === "true"
    }

    return false
  })

  // Sync to localstorage

  useEffect(() => {
    localStorage.setItem("arqon-sidebar-collapsed", String(isCollapsed))
  }, [isCollapsed])

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--color-background)" }}
    >
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden h-full">
        <Header
          activePage={activePage}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-y-auto">
          <PageTransition pageKey={pageKey}>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}

function AdminApp() {
  const { session, logout } = useAuth()

  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    if (!session.isAuthenticated) {
      setIsInitialLoad(true)

      return
    }

    if (isInitialLoad) {
      const id = requestAnimationFrame(() => {
        setIsInitialLoad(false)
      })

      return () => cancelAnimationFrame(id)
    }
  }, [session.isAuthenticated, isInitialLoad])

  const getPathPage = (): Page => {
    const path = window.location.pathname.substring(1)

    const validPages: Page[] = [
      "overview",

      "providers",

      "logs",

      "settings",

      "requests",

      "models",

      "routing",

      "analytics",

      "api-keys",

      "playground",

      "team",

      "roles",

      "limits",

      "audit-logs",

      "timeline",
    ]

    return validPages.includes(path as Page) ? path as Page : "overview"
  }

  const [activePage, _setActivePage] = useState<Page>(getPathPage)

  useEffect(() => {
    const onPopState = () => {
      _setActivePage(getPathPage())
    }

    window.addEventListener("popstate", onPopState)

    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  const setActivePage = useCallback((page: Page) => {
    _setActivePage((prev) => {
      if (prev !== page) {
        window.history.pushState(null, "", `/${page}`)

        return page
      }

      return prev
    })
  }, [])

  // Initialize theme tracking

  useTheme()

  if (window.location.pathname === "/terms") {
    return <Terms />
  }

  if (window.location.pathname === "/privacy") {
    return <Privacy />
  }

  if (window.location.pathname === "/help") {
    return <Help />
  }

  if (!session.isAuthenticated) {
    return <Login />
  }

  const p1Meta = P1_META[activePage]

  return (
    <>
      <AppLayout
        activePage={activePage}
        pageKey={`${activePage}-${isInitialLoad ? "skel" : "ready"}`}
        setActivePage={setActivePage}
        onLogout={logout}
      >
        {isInitialLoad ? (
          <PageSkeleton activePage={activePage} />
        ) : (
          <>
            {activePage === "overview" && (
              <Overview onNavigate={setActivePage as any} />
            )}
            {activePage === "providers" && <Providers />}
            {activePage === "logs" && <Logs />}
            {activePage === "settings" && <Settings />}
            {activePage === "api-keys" && <ApiKeys />}
            {activePage === "routing" && <Routing />}
            {activePage === "requests" && <Requests />}
            {activePage === "models" && <Models />}
            {activePage === "analytics" && <Analytics />}
            {activePage === "playground" && <Playground />}
            {activePage === "team" && <TeamManagement />}
            {activePage === "roles" && <RolesPermissions />}
            {activePage === "limits" && <UsageLimits />}
            {activePage === "audit-logs" && <AuditLogs />}
            {activePage === "timeline" && <ActivityTimeline />}
            {p1Meta && (
              <ComingSoon
                title={p1Meta.title}
                description={p1Meta.desc}
                eta={p1Meta.eta}
              />
            )}
          </>
        )}
      </AppLayout>
    </>
  )
}

export default function App() {
  const { session } = useAuth()
  const [activePath, setActivePath] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPopState = () => {
      setActivePath(window.location.pathname)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const isAuth = session.isAuthenticated
  const isPublic = ['/login', '/terms', '/privacy', '/help'].includes(activePath)

  // Guard 1: Redirect unauthenticated users to /login
  useEffect(() => {
    if (!isAuth && !isPublic) {
      window.history.replaceState(null, '', '/login')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [isAuth, isPublic, activePath])

  // Guard 2: Redirect authenticated users on public /login back to dashboard
  useEffect(() => {
    if (isAuth && activePath === '/login') {
      const destination = session.userRole === 'admin' ? '/overview' : '/user/dashboard'
      window.history.replaceState(null, '', destination)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [isAuth, activePath, session.userRole])

  // Guard 3: Redirect authenticated users with 'user' role away from Admin paths
  useEffect(() => {
    if (isAuth && session.userRole === 'user' && !activePath.startsWith('/user') && !isPublic) {
      window.history.replaceState(null, '', '/user/dashboard')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [isAuth, session.userRole, activePath, isPublic])

  if (!isAuth) {
    if (activePath === '/terms') return <Terms />
    if (activePath === '/privacy') return <Privacy />
    if (activePath === '/help') return <Help />
    return <Login />
  }

  // Authenticated routing
  if (activePath.startsWith('/user')) {
    return <UserApp />
  }

  return <AdminApp />
}
