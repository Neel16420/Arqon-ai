import { useState } from 'react'
import { User, Check, Camera } from 'lucide-react'

export default function UserProfile() {
  const [userName, setUserName] = useState('Neel')
  const [email, setEmail] = useState('user@example.com')
  const [jobTitle, setJobTitle] = useState('Senior AI Systems Engineer')
  const [bio, setBio] = useState('Building high-performance multi-model LLM interfaces with React, Rust, and TypeScript.')
  const [timezone, setTimezone] = useState('UTC+05:30 (Asia/Kolkata)')
  const [savedToast, setSavedToast] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 3000)
  }

  return (
    <div className="space-y-6 pb-12 animate-page-enter max-w-4xl mx-auto">
      {/* Toast */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl glass-elevated glass-border text-xs font-semibold text-foreground shadow-2xl flex items-center gap-2 animate-bounce-subtle">
          <Check size={16} className="text-emerald-400" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-foreground flex items-center gap-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <User className="text-accent" size={24} />
          User Profile
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage your personal identity, bio, localized settings, and connected accounts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Card */}
        <div className="glass-surface glass-border rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group cursor-pointer">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center font-bold text-3xl text-foreground shadow-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 59, 59, 0.2) 0%, rgba(24, 24, 27, 0.9) 100%)',
                border: '1px solid rgba(255, 59, 59, 0.3)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {userName.charAt(0)}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Camera size={20} />
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h3 className="text-lg font-bold text-foreground">{userName}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                Pro Member
              </span>
            </div>
            <p className="text-xs text-muted font-mono">{email}</p>
            <p className="text-xs text-muted">{jobTitle}</p>
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

        {/* Connected Accounts */}
        <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
          <h3
            className="text-base font-bold text-foreground border-b border-border pb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Connected Accounts
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2/60 border border-border">
              <div className="flex items-center gap-3">
                <User size={20} className="text-foreground" />
                <div>
                  <p className="text-xs font-bold text-foreground">GitHub</p>
                  <p className="text-[11px] text-muted">Connected as @neel-dev</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2/60 border border-border">
              <div className="flex items-center gap-3">
                <User size={20} className="text-blue-400" />
                <div>
                  <p className="text-xs font-bold text-foreground">Google Workspace</p>
                  <p className="text-[11px] text-muted">user@example.com</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                Connected
              </span>
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
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  )
}
