import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  User,
  ShieldCheck,
  Camera,
  Sun,
  Bell,
  CreditCard,
  HelpCircle,
  Link2,
  LayoutDashboard,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../components/toast/ToastContext'

// Import Section Components
import AccountOverviewSection from '../components/profile/AccountOverviewSection'
import PersonalInfoSection from '../components/profile/PersonalInfoSection'
import AvatarSection from '../components/profile/AvatarSection'
import SecuritySection from '../components/profile/SecuritySection'
import AppearanceSection from '../components/profile/AppearanceSection'
import NotificationPrefsSection from '../components/profile/NotificationPrefsSection'
import BillingSection from '../components/profile/BillingSection'
import HelpCenterSection from '../components/profile/HelpCenterSection'
import ConnectedAccountsSection from '../components/profile/ConnectedAccountsSection'

export type AccountCenterTab =
  | 'overview'
  | 'personal'
  | 'avatar'
  | 'security'
  | 'appearance'
  | 'notification-prefs'
  | 'billing'
  | 'help'
  | 'connected'

interface NavTabItem {
  id: AccountCenterTab
  label: string
  icon: React.ReactNode
}

const NAV_TABS: NavTabItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'personal', label: 'Personal Info', icon: <User size={16} /> },
  { id: 'avatar', label: 'Avatar', icon: <Camera size={16} /> },
  { id: 'security', label: 'Security', icon: <ShieldCheck size={16} /> },
  { id: 'appearance', label: 'Appearance', icon: <Sun size={16} /> },
  { id: 'notification-prefs', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard size={16} /> },
  { id: 'help', label: 'Help Center', icon: <HelpCircle size={16} /> },
  { id: 'connected', label: 'Connected Accounts', icon: <Link2 size={16} /> },
]

const getUrlTab = (): AccountCenterTab => {
  if (typeof window === 'undefined') return 'overview'
  const params = new URLSearchParams(window.location.search)
  const tab = params.get('tab') as AccountCenterTab
  const validTabs: AccountCenterTab[] = [
    'overview',
    'personal',
    'avatar',
    'security',
    'appearance',
    'notification-prefs',
    'billing',
    'help',
    'connected',
  ]
  return validTabs.includes(tab) ? tab : 'overview'
}

export default function UserProfile() {
  const { session } = useAuth()
  const { success } = useToast()

  const [activeTab, _setActiveTab] = useState<AccountCenterTab>(getUrlTab)

  useEffect(() => {
    const onPopState = () => {
      _setActiveTab(getUrlTab())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setActiveTab = (tab: AccountCenterTab) => {
    _setActiveTab(tab)
    const newUrl = `/user/profile?tab=${tab}`
    window.history.pushState(null, '', newUrl)
  }

  // User Profile State
  const [userName, setUserName] = useState(session.userName || 'Neel')
  const [email, setEmail] = useState(session.userEmail || 'user@example.com')
  const [jobTitle, setJobTitle] = useState('Senior AI Systems Engineer')
  const [bio, setBio] = useState('Building high-performance multi-model LLM interfaces with React, Rust, and TypeScript.')
  const [timezone, setTimezone] = useState('UTC+05:30 (Asia/Kolkata)')
  const [selectedAvatarId, setSelectedAvatarId] = useState('avatar-01')
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('/avatars/avatar-01.png')

  // Sync avatar from layout-level AvatarPickerModal (via custom event)
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, url } = (e as CustomEvent<{ id: string; url: string }>).detail
      setSelectedAvatarId(id)
      setSelectedAvatarUrl(url)
    }
    window.addEventListener('arqon-avatar-changed', handler)
    return () => window.removeEventListener('arqon-avatar-changed', handler)
  }, [])

  // Open the layout-level avatar modal
  const openAvatarModal = () => {
    window.dispatchEvent(new CustomEvent('arqon-open-avatar-modal'))
  }

  const handleUpdateInfo = (info: {
    userName: string
    email: string
    jobTitle: string
    bio: string
    timezone: string
  }) => {
    setUserName(info.userName)
    setEmail(info.email)
    setJobTitle(info.jobTitle)
    setBio(info.bio)
    setTimezone(info.timezone)
  }

  return (
    <div className="space-y-6 pb-12 animate-page-enter">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-foreground flex items-center gap-2.5"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <User className="text-accent" size={26} />
          Account Center
        </h1>
        <p className="text-xs text-muted mt-1">
          Centralized management for personal info, avatar assets, security credentials, appearance, billing, and support.
        </p>
      </div>

      {/* Account Center Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Internal Sidebar Navigation (Desktop) / Top Segmented Control (Mobile) */}
        <div className="lg:col-span-3 glass-surface glass-border rounded-2xl p-2 sm:p-3 space-y-1 sticky top-20 z-20">
          <div className="hidden lg:block px-3 py-2 text-[11px] font-bold text-muted uppercase tracking-wider font-mono border-b border-border/40 mb-2">
            Account Navigation
          </div>

          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 scrollbar-none pb-1 lg:pb-0">
            {NAV_TABS.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-accent text-white shadow-md shadow-accent/20'
                      : 'text-muted hover:text-foreground hover:bg-surface-2/80'
                  }`}
                >
                  <span className={active ? 'text-white' : 'text-muted'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Section Content Area */}
        <div className="lg:col-span-9 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <AccountOverviewSection
                key="overview"
                userName={userName}
                email={email}
                jobTitle={jobTitle}
                selectedAvatarUrl={selectedAvatarUrl}
                onNavigateTab={(t) => setActiveTab(t as AccountCenterTab)}
                onOpenAvatarModal={openAvatarModal}
              />
            )}

            {activeTab === 'personal' && (
              <PersonalInfoSection
                key="personal"
                userName={userName}
                email={email}
                jobTitle={jobTitle}
                bio={bio}
                timezone={timezone}
                onUpdateInfo={handleUpdateInfo}
              />
            )}

            {activeTab === 'avatar' && (
              <AvatarSection
                key="avatar"
                userName={userName}
                selectedAvatarId={selectedAvatarId}
                selectedAvatarUrl={selectedAvatarUrl}
                onSelectAvatarId={(id, url) => {
                  // Dispatch global event so sidebar + layout stay in sync
                  window.dispatchEvent(new CustomEvent('arqon-avatar-changed', { detail: { id, url } }))
                  success('Avatar updated!')
                }}
                onOpenAvatarModal={openAvatarModal}
              />
            )}

            {activeTab === 'security' && <SecuritySection key="security" />}
            {activeTab === 'appearance' && <AppearanceSection key="appearance" />}
            {activeTab === 'notification-prefs' && <NotificationPrefsSection key="notification-prefs" />}
            {activeTab === 'billing' && <BillingSection key="billing" />}
            {activeTab === 'help' && <HelpCenterSection key="help" />}
            {activeTab === 'connected' && <ConnectedAccountsSection key="connected" />}
          </AnimatePresence>
        </div>
      </div>

    </div>
  )
}
