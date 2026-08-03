import { useState, useEffect, useCallback } from 'react'
import type { UserPage } from './components/UserSidebar'
import UserLayout from './layouts/UserLayout'
import Dashboard from './pages/Dashboard'
import ChatLayout from './components/chat/ChatLayout'
import Projects from './pages/Projects'
import PromptLibrary from './pages/PromptLibrary'
import ModelsCatalog from './pages/ModelsCatalog'
import FilesManager from './pages/FilesManager'
import NotificationsCenter from './pages/NotificationsCenter'
import UserProfile from './pages/UserProfile'
import UserSettings from './pages/UserSettings'
import UserBilling from './pages/UserBilling'
import HelpCenter from './pages/HelpCenter'
import UserAuth from './pages/UserAuth'
import UserApiKeys from './pages/UserApiKeys'
import RequestsHistory from './pages/RequestsHistory'
import UserAnalytics from './pages/UserAnalytics'
import { useAuth } from '../hooks/useAuth'

/** Triggers animate-page-enter on every route change via React key trick. */
function PageTransition({ pageKey, children }: { pageKey: string; children: React.ReactNode }) {
  return (
    <div key={pageKey} className="animate-page-enter h-full" style={{ willChange: 'opacity, transform' }}>
      {children}
    </div>
  )
}

export default function UserApp() {
  const { logout } = useAuth()
  
  const getPathPage = (): UserPage => {
    // The path will start with /user/
    const path = window.location.pathname.replace(/^\/user\/?/, '')
    const validPages: UserPage[] = [
      'login',
      'register',
      'forgot-password',
      'reset-password',
      'verify-email',
      'dashboard',
      'chat',
      'keys',
      'requests',
      'analytics',
      'projects',
      'prompts',
      'models',
      'files',
      'notifications',
      'profile',
      'settings',
      'billing',
      'help',
      'history',
    ]
    return validPages.includes(path as UserPage) ? (path as UserPage) : 'dashboard'
  }

  const [activePage, _setActivePage] = useState<UserPage>(getPathPage)

  useEffect(() => {
    const onPopState = () => {
      _setActivePage(getPathPage())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setActivePage = useCallback((page: UserPage) => {
    _setActivePage((prev) => {
      if (prev !== page) {
        window.history.pushState(null, '', `/user/${page}`)
        return page
      }
      return prev
    })
  }, [])

  // If user hits /user exactly, redirect to /user/dashboard
  useEffect(() => {
    if (window.location.pathname === '/user' || window.location.pathname === '/user/') {
      window.history.replaceState(null, '', '/user/dashboard')
    }
  }, [])

  // Render standalone Auth pages for /user/login, /user/register, etc.
  if (
    activePage === 'login' ||
    activePage === 'register' ||
    activePage === 'forgot-password' ||
    activePage === 'reset-password' ||
    activePage === 'verify-email'
  ) {
    return (
      <PageTransition pageKey={activePage}>
        <UserAuth
          mode={activePage as any}
          onSuccessNavigate={(p) => setActivePage(p as UserPage)}
        />
      </PageTransition>
    )
  }

  return (
    <UserLayout activePage={activePage} setActivePage={setActivePage} onLogout={logout}>
      <PageTransition pageKey={activePage}>
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'chat' && <ChatLayout />}
        {activePage === 'keys' && <UserApiKeys />}
        {activePage === 'requests' && <RequestsHistory />}
        {activePage === 'analytics' && <UserAnalytics />}
        {activePage === 'projects' && <Projects />}
        {activePage === 'prompts' && <PromptLibrary />}
        {activePage === 'models' && <ModelsCatalog />}
        {activePage === 'files' && <FilesManager />}
        {activePage === 'notifications' && <NotificationsCenter />}
        {activePage === 'profile' && <UserProfile />}
        {activePage === 'settings' && <UserSettings />}
        {activePage === 'billing' && <UserBilling />}
        {activePage === 'help' && <HelpCenter />}
        {activePage === 'history' && <ChatLayout />}
      </PageTransition>
    </UserLayout>
  )
}
