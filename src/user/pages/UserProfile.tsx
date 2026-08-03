import { useState } from 'react'
import { User, Check, KeyRound, Sparkles } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../components/toast/ToastContext'
import SelectedAvatar from '../components/profile/SelectedAvatar'
import AvatarPickerModal from '../components/profile/AvatarPickerModal'

export default function UserProfile() {
  const { session } = useAuth()
  const { success } = useToast()

  const [userName, setUserName] = useState(session.userName || 'Neel')
  const [email, setEmail] = useState(session.userEmail || 'user@example.com')
  const [jobTitle, setJobTitle] = useState('Senior AI Systems Engineer')
  const [bio, setBio] = useState('Building high-performance multi-model LLM interfaces with React, Rust, and TypeScript.')
  const [timezone, setTimezone] = useState('UTC+05:30 (Asia/Kolkata)')
  const [selectedAvatarId, setSelectedAvatarId] = useState('avatar-01')
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('/avatars/avatar-01.png')

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    success('Profile changes & workspace settings updated successfully!')
  }

  const handleSaveAvatarFromModal = (avatarId: string, avatarUrl: string) => {
    setSelectedAvatarId(avatarId)
    setSelectedAvatarUrl(avatarUrl)
  }

  return (
    <div className="space-y-6 pb-12 animate-page-enter max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-foreground flex items-center gap-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <User className="text-accent" size={24} />
          User Profile & Security
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage your personal identity, default workspace avatar, localized settings, and account credentials.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Avatar Card */}
        <div className="glass-surface glass-border rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <SelectedAvatar
              avatarUrl={selectedAvatarUrl}
              userName={userName}
              size="xl"
              isOnline={true}
              onClick={() => setIsAvatarModalOpen(true)}
              showChangeBadge={true}
            />

            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="mt-1 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface border border-border text-accent font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              Change Avatar
            </button>
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <h3 className="text-xl font-bold text-foreground">{userName}</h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                Pro Tier Member
              </span>
            </div>
            <p className="text-xs text-muted font-mono">{email}</p>
            <p className="text-xs text-muted font-medium">{jobTitle}</p>

            <div className="pt-2 flex items-center gap-4 text-xs text-muted justify-center sm:justify-start">
              <span>Status: <strong className="text-emerald-400 font-normal">Active</strong></span>
              <span>•</span>
              <span>Timezone: <strong className="text-foreground font-normal">{timezone.split(' ')[0]}</strong></span>
            </div>
          </div>
        </div>

        {/* Personal Details Form */}
        <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
          <h3
            className="text-base font-bold text-foreground border-b border-border pb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground outline-none focus:border-accent/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground outline-none focus:border-accent/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Job Title / Role
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground outline-none focus:border-accent/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground outline-none focus:border-accent/50"
              >
                <option value="UTC+05:30 (Asia/Kolkata)">UTC+05:30 (Asia/Kolkata)</option>
                <option value="UTC+00:00 (London)">UTC+00:00 (London)</option>
                <option value="UTC-05:00 (New York)">UTC-05:00 (New York)</option>
                <option value="UTC-08:00 (San Francisco)">UTC-08:00 (San Francisco)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Short Biography
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground outline-none focus:border-accent/50 leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Security & Password Update */}
        <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
          <h3
            className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <KeyRound size={18} className="text-accent" />
            Security & Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground outline-none focus:border-accent/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground outline-none focus:border-accent/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white shadow-lg cursor-pointer active:scale-95 transition-all flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
              boxShadow: '0 4px 14px rgba(255, 59, 59, 0.35)',
            }}
          >
            <Check size={15} />
            Save Profile & Security
          </button>
        </div>
      </form>

      {/* AVATAR PICKER MODAL */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarId={selectedAvatarId}
        onSaveAvatar={handleSaveAvatarFromModal}
      />
    </div>
  )
}
