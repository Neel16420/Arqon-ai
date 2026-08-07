import { motion } from 'framer-motion'
import {
  ShieldCheck,
  CreditCard,
  Key,
  Activity,
  TrendingUp,
  Camera,
  Edit3,
} from 'lucide-react'
import SelectedAvatar from './SelectedAvatar'

export interface AccountOverviewProps {
  userName: string
  email: string
  jobTitle: string
  selectedAvatarUrl: string
  onNavigateTab: (tab: string) => void
  onOpenAvatarModal: () => void
}

export function AccountOverviewSection({
  userName,
  email,
  jobTitle,
  selectedAvatarUrl,
  onNavigateTab,
  onOpenAvatarModal,
}: AccountOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* User Hero Banner */}
      <div className="glass-surface glass-border rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Glow backdrop Sheen */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none"
        />

        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="flex flex-col items-center gap-2">
            <SelectedAvatar
              avatarUrl={selectedAvatarUrl}
              userName={userName}
              size="xl"
              isOnline={true}
              onClick={onOpenAvatarModal}
              showChangeBadge={true}
            />
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center gap-2.5 justify-center sm:justify-start flex-wrap">
              <h2
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {userName}
              </h2>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck size={13} /> Pro Tier Member
              </span>
            </div>

            <p className="text-xs text-muted font-mono">{email}</p>
            <p className="text-xs text-muted font-medium">{jobTitle}</p>

            {/* Quick Action Buttons */}
            <div className="pt-3 flex items-center gap-2.5 justify-center sm:justify-start flex-wrap">
              <button
                onClick={() => onNavigateTab('personal')}
                className="px-3.5 py-1.5 rounded-xl bg-accent text-white font-medium text-xs shadow-md shadow-accent/20 hover:bg-accent-hover transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={13} />
                Edit Personal Info
              </button>

              <button
                onClick={onOpenAvatarModal}
                className="px-3.5 py-1.5 rounded-xl glass-surface glass-border text-foreground hover:bg-surface-2 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Camera size={13} className="text-accent" />
                Change Avatar
              </button>

              <button
                onClick={() => onNavigateTab('billing')}
                className="px-3.5 py-1.5 rounded-xl glass-surface glass-border text-foreground hover:bg-surface-2 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard size={13} className="text-blue-400" />
                Manage Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Account Status */}
        <div className="glass-surface glass-border rounded-2xl p-4 space-y-2">
          <span className="text-xs text-muted font-medium block">Workspace Status</span>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-foreground font-space">Active Pro</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          <p className="text-[11px] text-muted">Member since Jan 2025</p>
        </div>

        {/* 2. Subscription Plan */}
        <div className="glass-surface glass-border rounded-2xl p-4 space-y-2">
          <span className="text-xs text-muted font-medium block">Subscription Tier</span>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-foreground font-space">$29 / month</span>
            <CreditCard size={16} className="text-accent" />
          </div>
          <p className="text-[11px] text-muted">Renews Mar 1, 2025</p>
        </div>

        {/* 3. Storage Usage */}
        <div className="glass-surface glass-border rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted font-medium">Cloud Storage</span>
            <span className="font-mono text-foreground font-semibold">4.2 / 50 GB</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full rounded-full bg-accent w-[8.4%]" />
          </div>
          <p className="text-[11px] text-muted">Files & Prompt Library assets</p>
        </div>

        {/* 4. Active API Keys */}
        <div className="glass-surface glass-border rounded-2xl p-4 space-y-2">
          <span className="text-xs text-muted font-medium block">Active API Keys</span>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-foreground font-space">3 Secret Keys</span>
            <Key size={16} className="text-amber-400" />
          </div>
          <p className="text-[11px] text-muted">Production & Staging keys</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigateTab('security')}
          className="glass-surface glass-border rounded-2xl p-5 text-left hover:border-accent/40 transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3 group-hover:scale-110 transition-transform">
            <ShieldCheck size={20} />
          </div>
          <h4 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
            Account Security & 2FA
          </h4>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Manage password, two-factor authentication, active devices, and session security logs.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('appearance')}
          className="glass-surface glass-border rounded-2xl p-5 text-left hover:border-accent/40 transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
            <TrendingUp size={20} />
          </div>
          <h4 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
            Appearance & Themes
          </h4>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Customize theme modes (Dark/Light/System), accent color preference, and micro-animations.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('help')}
          className="glass-surface glass-border rounded-2xl p-5 text-left hover:border-accent/40 transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
            <Activity size={20} />
          </div>
          <h4 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
            Help Center & Support
          </h4>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Access documentation, FAQ guides, submit bug reports, or contact support team.
          </p>
        </button>
      </div>
    </motion.div>
  )
}

export default AccountOverviewSection
