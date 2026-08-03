import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Check, Globe, Clock, Mail, Phone, AtSign } from 'lucide-react'
import { useToast } from '../../../components/toast/ToastContext'

export interface PersonalInfoProps {
  userName: string
  email: string
  jobTitle: string
  bio: string
  timezone: string
  onUpdateInfo: (info: { userName: string; email: string; jobTitle: string; bio: string; timezone: string }) => void
}

export function PersonalInfoSection({
  userName: initialName,
  email: initialEmail,
  jobTitle: initialJob,
  bio: initialBio,
  timezone: initialTz,
  onUpdateInfo,
}: PersonalInfoProps) {
  const { success } = useToast()

  const [userName, setUserName] = useState(initialName)
  const [usernameTag, setUsernameTag] = useState('neel-dev')
  const [email, setEmail] = useState(initialEmail)
  const [phone, setPhone] = useState('+1 (555) 234-5678')
  const [jobTitle, setJobTitle] = useState(initialJob)
  const [bio, setBio] = useState(initialBio)
  const [timezone, setTimezone] = useState(initialTz)
  const [language, setLanguage] = useState('English (US)')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateInfo({ userName, email, jobTitle, bio, timezone })
    success('Personal information updated successfully!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-6">
        <div className="border-b border-border/50 pb-4">
          <h3
            className="text-lg font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <User size={20} className="text-accent" />
            Personal Information
          </h3>
          <p className="text-xs text-muted mt-1">
            Update your public profile identity, contact credentials, bio, and localization preferences.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div>
              <label className="block text-foreground font-semibold mb-1.5 flex items-center gap-1.5">
                <User size={13} className="text-accent" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-foreground outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Username Handle */}
            <div>
              <label className="block text-foreground font-semibold mb-1.5 flex items-center gap-1.5">
                <AtSign size={13} className="text-accent" />
                Username Handle
              </label>
              <input
                type="text"
                required
                value={usernameTag}
                onChange={(e) => setUsernameTag(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-foreground outline-none focus:ring-1 focus:ring-accent font-mono"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-foreground font-semibold mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-accent" />
                Primary Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-foreground outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-foreground font-semibold mb-1.5 flex items-center gap-1.5">
                <Phone size={13} className="text-accent" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-foreground outline-none focus:ring-1 focus:ring-accent font-mono"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-foreground font-semibold mb-1.5">
                Job Title / Role
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-foreground outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-foreground font-semibold mb-1.5 flex items-center gap-1.5">
                <Globe size={13} className="text-accent" />
                Interface Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-foreground outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="English (US)">English (US)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="German">German (Deutsch)</option>
                <option value="Japanese">Japanese (日本語)</option>
              </select>
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-foreground font-semibold mb-1.5 flex items-center gap-1.5">
              <Clock size={13} className="text-accent" />
              Primary Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-foreground outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="UTC+05:30 (Asia/Kolkata)">UTC+05:30 (Asia/Kolkata)</option>
              <option value="UTC+00:00 (London)">UTC+00:00 (London)</option>
              <option value="UTC-05:00 (New York)">UTC-05:00 (New York)</option>
              <option value="UTC-08:00 (San Francisco)">UTC-08:00 (San Francisco)</option>
            </select>
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-foreground font-semibold mb-1.5">
              Short Biography
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your AI workflow or project domain..."
              className="w-full p-3 rounded-xl glass-input text-foreground outline-none focus:ring-1 focus:ring-accent leading-relaxed resize-none"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-border/50">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all cursor-pointer flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
              }}
            >
              <Check size={15} />
              Save Personal Info
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default PersonalInfoSection
