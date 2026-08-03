import { useState } from 'react'
import WelcomeHero from '../components/dashboard/WelcomeHero'
import QuickActions, { type QuickActionItem } from '../components/dashboard/QuickActions'
import StatsGrid from '../components/dashboard/StatsGrid'
import ActivityFeed, { type ActivityItem } from '../components/dashboard/ActivityFeed'
import FavoriteModels, { type FavoriteModelItem } from '../components/dashboard/FavoriteModels'
import TipsCard, { type TipItem } from '../components/dashboard/TipsCard'
import EmptyState from '../components/dashboard/EmptyState'
import LoadingState from '../components/dashboard/LoadingState'
import ErrorState from '../components/dashboard/ErrorState'
import { SlidersHorizontal, RefreshCw } from 'lucide-react'

import AnimatedRoutingFlow from '../../components/AnimatedRoutingFlow'

type DashboardViewMode = 'normal' | 'loading' | 'empty' | 'error'

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<DashboardViewMode>('normal')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleNavigate = (page: string) => {
    window.history.pushState(null, '', `/user/${page}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const handleQuickAction = (item: QuickActionItem) => {
    if (item.actionPage) {
      handleNavigate(item.actionPage)
    } else if (item.href) {
      window.location.href = item.href
    } else {
      showToast(`Triggered action: ${item.title}`)
    }
  }

  const handleLaunchModel = (model: FavoriteModelItem) => {
    showToast(`Launching ${model.name} session...`)
    setTimeout(() => handleNavigate('chat'), 500)
  }

  const handleActivityClick = (item: ActivityItem) => {
    showToast(`Viewing details for: ${item.title}`)
  }

  const handleTipAction = (tip: TipItem) => {
    if (tip.actionTarget) {
      handleNavigate(tip.actionTarget)
    } else {
      showToast(`Selected tip action: ${tip.title}`)
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-page-enter">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl glass-elevated glass-border text-xs font-semibold text-foreground shadow-2xl flex items-center gap-2 animate-bounce-subtle">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* State Switcher Bar for Review & Testing */}
      <div className="glass-surface glass-border rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-2 text-muted">
          <SlidersHorizontal size={14} className="text-accent" />
          <span className="font-medium text-foreground">Dashboard UI State:</span>
          <span className="hidden sm:inline text-[11px] text-muted">(Preview UI states)</span>
        </div>

        <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-lg border border-border">
          {(['normal', 'loading', 'empty', 'error'] as DashboardViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all cursor-pointer ${
                viewMode === mode
                  ? 'bg-accent text-white shadow'
                  : 'text-muted hover:text-foreground hover:bg-surface'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW MODE: LOADING */}
      {viewMode === 'loading' && <LoadingState />}

      {/* VIEW MODE: ERROR */}
      {viewMode === 'error' && (
        <ErrorState
          title="Dashboard Service Unavailable"
          message="Failed to connect to Arqon metrics server. Please verify your connection or try again."
          onRetry={() => setViewMode('normal')}
        />
      )}

      {/* VIEW MODE: EMPTY */}
      {viewMode === 'empty' && (
        <EmptyState
          title="Welcome to your new Workspace"
          description="You don't have any active chats, saved prompts, or API activity yet. Start your first session to populate your dashboard."
          actionLabel="Start New AI Chat"
          onAction={() => handleNavigate('chat')}
          onReset={() => setViewMode('normal')}
        />
      )}

      {/* VIEW MODE: NORMAL (Live Premium Dashboard) */}
      {viewMode === 'normal' && (
        <>
          {/* 1. Welcome Hero */}
          <section>
            <WelcomeHero
              userName="Neel"
              planType="Pro Tier"
              apiQuota={{ used: 64, limit: 100 }}
              onQuickStart={() => handleNavigate('chat')}
            />
          </section>

          {/* 2. Quick Action Cards */}
          <section>
            <QuickActions onActionClick={handleQuickAction} />
          </section>

          {/* 3. Usage Overview */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2
                className="text-base font-bold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Usage Overview
              </h2>
              <button
                onClick={() => showToast('Refreshed usage statistics')}
                className="text-xs text-muted hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
                Refresh Metrics
              </button>
            </div>
            <StatsGrid />
          </section>

          {/* Live Routing Flow Map */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2
                className="text-base font-bold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Live Provider Routing Map
              </h2>
              <span className="text-xs text-muted flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync with Connected Keys
              </span>
            </div>
            <AnimatedRoutingFlow />
          </section>

          {/* 4 & 5. Recent Activity & Favorite Models Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 4. Recent Activity */}
            <div>
              <ActivityFeed onItemClick={handleActivityClick} />
            </div>

            {/* 5. Favorite Models */}
            <div>
              <FavoriteModels onLaunchModel={handleLaunchModel} />
            </div>
          </section>

          {/* 6. Tips Section */}
          <section>
            <TipsCard onTipAction={handleTipAction} />
          </section>
        </>
      )}
    </div>
  )
}
