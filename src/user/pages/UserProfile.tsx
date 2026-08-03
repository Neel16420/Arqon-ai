import { useState } from 'react'
import { User, Check, Camera, KeyRound, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../components/toast/ToastContext'

const AVATAR_PRESETS = [
  '/avatars/avatar-1.png',
  '/avatars/avatar-2.png',
  '/avatars/avatar-3.png',
  '/avatars/avatar-4.png',
  '/avatars/avatar-5.png',
  '/avatars/avatar-6.png',
  '/avatars/avatar-7.png',
  '/avatars/avatar-8.png',
]

export default function UserProfile() {
  const { session } = useAuth()
  const { success } = useToast()

  const [userName, setUserName] = useState(session.userName || 'Neel')
  const [email, setEmail] = useState(session.userEmail || 'user@example.com')
  const [jobTitle, setJobTitle] = useState('Senior AI Systems Engineer')
  const [bio, setBio] = useState('Building high-performance multi-model LLM interfaces with React, Rust, and TypeScript.')
  const [timezone, setTimezone] = useState('UTC+05:30 (Asia/Kolkata)')
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/avatar-1.png')

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [customAvatarUrl, setCustomAvatarUrl] = useState('')

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    success('Profile changes & global user session updated successfully!')
  }

  const handleSelectAvatar = (url: string) => {
    setSelectedAvatar(url)
    setIsAvatarModalOpen(false)
    success('Avatar updated!')
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
          Manage your personal identity, avatar, localized settings, and account password.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Card */}
        <div className="glass-surface glass-border rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
          <div
            onClick={() => setIsAvatarModalOpen(true)}
            className="relative group cursor-pointer"
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-accent/40 shadow-xl flex items-center justify-center bg-surface-2">
              <img
                src={selectedAvatar}
                alt={userName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback letter if image fails
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
              <span className="font-bold text-3xl text-foreground font-mono">
                {userName.charAt(0)}
              </span>
            </div>
            <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-xs font-medium">
              <Camera size={20} className="mb-1" />
              <span>Change</span>
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h3 className="text-lg font-bold text-foreground">{userName}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                Pro Tier
              </span>
            </div>
            <p className="text-xs text-muted font-mono">{email}</p>
            <p className="text-xs text-muted">{jobTitle}</p>
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="text-xs text-accent font-semibold hover:underline mt-1 inline-block cursor-pointer"
            >
              Open Avatar Picker →
            </button>
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
            Security & Password
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
            className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white shadow-lg cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
              boxShadow: '0 4px 14px rgba(255, 59, 59, 0.35)',
            }}
          >
            Save Profile & Password
          </button>
        </div>
      </form>

      {/* AVATAR PICKER MODAL */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay animate-fade-in">
          <div className="glass-surface glass-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h3
                className="text-base font-bold text-foreground flex items-center gap-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Camera size={18} className="text-accent" />
                Select Profile Avatar
              </h3>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="text-muted hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Presets Grid */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-2">Preset Avatars</label>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_PRESETS.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectAvatar(presetUrl)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer hover:scale-105 ${
                      selectedAvatar === presetUrl ? 'border-accent ring-2 ring-accent/30' : 'border-border'
                    }`}
                  >
                    <img src={presetUrl} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL */}
            <div className="pt-2 border-t border-border/50">
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Or Use Custom Avatar URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 p-2 rounded-xl glass-input text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customAvatarUrl) handleSelectAvatar(customAvatarUrl)
                  }}
                  className="px-4 py-2 rounded-xl bg-accent text-white font-semibold text-xs cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
