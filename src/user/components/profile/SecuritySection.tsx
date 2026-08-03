import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  Laptop,
  Globe,
  Trash2,
  Check,
  Lock,
  History,
} from 'lucide-react'
import { useToast } from '../../../components/toast/ToastContext'

export function SecuritySection() {
  const { success, info } = useToast()

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [sessions, setSessions] = useState([
    {
      id: 'sess-1',
      device: 'MacBook Pro 16" (Chrome 122.0)',
      location: 'Kolkata, India',
      ip: '192.168.1.16',
      active: true,
      time: 'Current Session',
    },
    {
      id: 'sess-2',
      device: 'iPhone 15 Pro (Safari Mobile)',
      location: 'Kolkata, India',
      ip: '192.168.1.45',
      active: false,
      time: '2 hours ago',
    },
  ])

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match')
      return
    }
    success('Password updated successfully!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleRevokeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id))
    info('Session revoked successfully')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Password Form */}
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
        <div className="border-b border-border/50 pb-3">
          <h3
            className="text-base font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <KeyRound size={18} className="text-accent" />
            Change Password
          </h3>
          <p className="text-xs text-muted mt-0.5">Ensure your account uses a strong, random password.</p>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-foreground mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 rounded-xl glass-input text-foreground outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full p-2.5 rounded-xl glass-input text-foreground outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full p-2.5 rounded-xl glass-input text-foreground outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs shadow-md shadow-accent/20 hover:bg-accent-hover transition-all cursor-pointer flex items-center gap-2"
            >
              <Check size={14} />
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* 2FA Card */}
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div>
            <h3
              className="text-base font-bold text-foreground flex items-center gap-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <ShieldCheck size={18} className="text-emerald-400" />
              Two-Factor Authentication (2FA)
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Add an extra layer of security using Google Authenticator or SMS codes.
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => {
              setTwoFactorEnabled(!twoFactorEnabled)
              success(
                !twoFactorEnabled ? '2FA Enabled for workspace' : '2FA Disabled'
              )
            }}
            className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
              twoFactorEnabled ? 'bg-accent' : 'bg-surface-2 border border-border'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/50 text-xs text-muted flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Smartphone size={18} className="text-foreground" />
            <div>
              <span className="font-semibold text-foreground block">Authenticator App (TOTP)</span>
              <span className="text-[11px] text-muted">Configured via Authy / Google Authenticator</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
            Active
          </span>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
        <div className="border-b border-border/50 pb-3">
          <h3
            className="text-base font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Laptop size={18} className="text-accent" />
            Active Sessions & Devices
          </h3>
          <p className="text-xs text-muted mt-0.5">Devices currently signed into your Arqon account.</p>
        </div>

        <div className="space-y-3 text-xs">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2/60 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-muted" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{s.device}</span>
                    {s.active && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted font-mono">
                    {s.location} • {s.ip} • {s.time}
                  </span>
                </div>
              </div>

              {!s.active && (
                <button
                  onClick={() => handleRevokeSession(s.id)}
                  className="p-1.5 rounded-lg text-muted hover:text-rose-400 hover:bg-surface-2 transition-all cursor-pointer"
                  title="Revoke Session"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default SecuritySection
