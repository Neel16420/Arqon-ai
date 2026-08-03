import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useToast } from "../components/toast/ToastContext"
import { useAuth } from "../hooks/useAuth"
import {
  X,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  CheckCircle,
  Key,
  User,
  Palette,
  Bell,
  LayoutDashboard,
  Sparkles,
  Shield,
  Zap,
  Command,
  HardDrive,
  Info,
  Lock,
  Monitor,
  Smartphone,
  Server,
  Database,
  Download,
  Upload,
  RotateCcw,
} from "lucide-react"
import { maskKey } from "../utils"
import { Avatar } from "./TeamManagement"
import type { TeamMember } from "../store/team"
import { SelectFilter, type SelectOption } from "../components/SelectFilter"
import { useTheme } from "../hooks/useTheme"
import { ActionSuccessButton, StatusChangeIndicator } from "../components/SuccessFeedback"

// ─── Foundational Reusable UI Components (Phase 13) ──────────────────────────

export function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: () => void
}) {
  return (
    <StatusChangeIndicator active={enabled} className="inline-flex">
      <button
        type="button"
        onClick={onChange}
        className="relative flex-shrink-0 rounded-full transition-all duration-200 focus:outline-none"
        style={{
          background: enabled ? "var(--color-accent)" : "var(--color-border)",
          boxShadow: enabled ? "0 0 12px rgba(255, 59, 59, 0.45)" : "none",
          width: "40px",
          height: "22px",
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 rounded-full bg-white transition-transform duration-200 shadow-sm"
          style={{
            width: "18px",
            height: "18px",
            transform: enabled ? "translateX(18px)" : "translateX(0)",
          }}
        />
      </button>
    </StatusChangeIndicator>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-base font-semibold text-foreground mb-1"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {children}
    </h2>
  )
}

export function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  mono,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  hint?: string
  mono?: boolean
  disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3.5 text-sm rounded-lg outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          color: "var(--color-foreground)",
          fontFamily: mono
            ? "'JetBrains Mono', monospace"
            : "'Inter', sans-serif",
          fontSize: mono ? "13px" : undefined,
        }}
        onFocus={(e) =>
          (e.currentTarget.style.border = "1px solid var(--color-border-2)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.border = "1px solid var(--color-border)")
        }
      />
      {hint && <p className="text-xs text-muted mt-1.5">{hint}</p>}
    </div>
  )
}

export function SaveButton({
  onSave,
  label = "Save Changes",
  disabled = false,
  className = "",
}: {
  onSave: () => void | Promise<void>
  label?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <ActionSuccessButton
      onAction={onSave}
      label={label}
      loadingLabel="Saving..."
      successLabel="Saved"
      toastTitle="Settings Updated"
      toastMessage="Your configuration changes have been applied successfully."
      disabled={disabled}
      className={`hover-lift h-9.5 rounded-lg ${className}`}
    />
  )
}

function CopyButton({ text }: { text: string }) {
  const { success } = useToast()
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        success("Copied to clipboard")
      }}
      className="p-1.5 rounded text-muted hover:text-foreground transition-colors"
    >
      <Copy size={13} />
    </button>
  )
}

export function SettingsCard({
  title,
  description,
  children,
  footer,
  className = "",
}: {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl p-6 card-hover transition-all duration-250 ${className}`}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="mb-5">
        <SectionTitle>{title}</SectionTitle>
        {description && (
          <p className="text-xs text-muted mt-0.5">{description}</p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
      {footer && (
        <div
          className="mt-6 pt-4 flex items-center justify-end"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          {footer}
        </div>
      )}
    </div>
  )
}

// ─── Section 1: Profile ──────────────────────────────────────────────────────

function AvatarPickerModal({
  currentAvatar,
  onClose,
  onSave,
}: {
  currentAvatar: string
  onClose: () => void
  onSave: (newAvatar: string) => Promise<void>
}) {
  const [selected, setSelected] = useState(currentAvatar || "/avatars/avatar-1.png")
  const [saving, setSaving] = useState(false)
  const avatars = [
    "/avatars/avatar-1.png",
    "/avatars/avatar-2.png",
    "/avatars/avatar-3.png",
    "/avatars/avatar-4.png",
    "/avatars/avatar-5.png",
    "/avatars/avatar-6.png",
    "/avatars/avatar-7.png",
    "/avatars/avatar-8.png",
  ]

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 transition-opacity"
        onClick={() => !saving && onClose()}
        aria-hidden="true"
        style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)" }}
      />

      {/* Smoked glass modal panel */}
      <div
        className="relative z-10 w-full max-w-md p-7 animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar"
        style={{
          background: "rgba(18,18,22,0.72)",
          backdropFilter: "blur(32px) saturate(180%)",
          borderRadius: "24px",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.14), 0 30px 80px rgba(0,0,0,0.35)",
          color: "#ffffff",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-lg font-semibold tracking-tight text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Select Profile Avatar
            </h2>
            <p className="text-xs mt-1 text-[rgba(255,255,255,0.6)]">
              Choose an identity icon from the Arqon collection
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-full text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Responsive Avatar Grid with Equal Spacing */}
        <div className="grid grid-cols-4 gap-4 my-6">
          {avatars.map((url, i) => {
            const isSelected = selected === url
            return (
              <button
                key={url}
                type="button"
                onClick={() => setSelected(url)}
                disabled={saving}
                className={`relative aspect-square rounded-full flex items-center justify-center transition-all duration-200 hover-lift focus:outline-none ${
                  isSelected ? "scale-[1.06]" : "opacity-75 hover:opacity-100"
                }`}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: isSelected ? "2.5px solid #FF3B3B" : "1.5px solid rgba(255,255,255,0.12)",
                  boxShadow: isSelected
                    ? "0 0 16px rgba(255, 59, 59, 0.55), inset 0 0 8px rgba(255, 59, 59, 0.2)"
                    : "0 4px 12px rgba(0,0,0,0.25)",
                }}
              >
                <img
                  src={url}
                  alt={`Avatar ${i + 1}`}
                  className="w-full h-full rounded-full object-cover p-0.5"
                />
                {isSelected && (
                  <span
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md z-10"
                    style={{ background: "#FF3B3B", border: "2px solid rgba(18,18,22,1)" }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Footer actions */}
        <div
          className="mt-7 pt-5 flex items-center justify-end gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-9 px-4 rounded-lg text-xs font-semibold transition-all hover:bg-white/10 disabled:opacity-50"
            style={{ color: "rgba(255,255,255,0.8)", background: "transparent", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Cancel
          </button>
          <ActionSuccessButton
            type="button"
            disabled={saving}
            onAction={async () => {
              setSaving(true)
              await onSave(selected)
            }}
            onAfterSuccess={() => {
              setSaving(false)
              onClose()
            }}
            label="Save Avatar"
            loadingLabel="Saving..."
            successLabel="Updated"
            toastTitle="Avatar Updated"
            toastMessage="Profile icon synchronized across Arqon workspace."
            className="hover-lift h-9 px-5 rounded-lg text-xs font-semibold text-white shadow-sm"
            style={{ background: "#FF3B3B", boxShadow: "0 0 14px rgba(255, 59, 59, 0.4)" }}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}

function ProfileSettings() {
  const { success } = useToast()
  const { session, updateProfile } = useAuth()
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [name, setName] = useState(session.userName || "Administrator")
  const [email, setEmail] = useState(session.userEmail || "admin@arqon.internal")
  const role = session.userRole || "Super Admin"
  const avatarUrl = session.userAvatar || "/avatars/avatar-1.png"

  useEffect(() => {
    if (session.userName && session.userName !== name) setName(session.userName)
    if (session.userEmail && session.userEmail !== email) setEmail(session.userEmail)
  }, [session.userName, session.userEmail])

  // Password change states
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errMsg, setErrMsg] = useState("")

  const member: TeamMember = {
    id: "admin-1",
    name,
    email,
    role: "Super Admin",
    status: "online",
    department: "Executive & Infrastructure",
    lastActive: "Just now",
    joined: "2024-11-01",
    avatar: "AD",
    avatarUrl,
    avatarColor: "#FF3B3B",
  }

  const handlePasswordSubmit = async (e?: React.FormEvent): Promise<boolean> => {
    if (e?.preventDefault) e.preventDefault()
    setStatus("idle")
    if (newPw !== confirmPw) {
      setErrMsg("Passwords do not match")
      setStatus("error")
      return false
    }
    if (newPw.length < 8) {
      setErrMsg("Password must be at least 8 characters")
      setStatus("error")
      return false
    }
    setCurrentPw("")
    setNewPw("")
    setConfirmPw("")
    setStatus("success")
    setTimeout(() => setStatus("idle"), 3000)
    return true
  }

  const strengthScore =
    newPw.length === 0
      ? 0
      : newPw.length < 8
      ? 1
      : newPw.length < 12
      ? 2
      : /[A-Z]/.test(newPw) && /[0-9]/.test(newPw) && /[^A-Za-z0-9]/.test(newPw)
      ? 4
      : 3

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"]
  const strengthColor = [
    "",
    "var(--color-accent)",
    "var(--color-warning)",
    "var(--color-info)",
    "var(--color-success)",
  ]

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Profile Information"
        description="Manage your admin identity, credentials, and contact details."
        footer={
          <SaveButton
            onSave={() => {
              updateProfile({ userName: name, userEmail: email })
            }}
            label="Update Profile"
          />
        }
      >
        {/* Avatar & Summary Bar */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-4">
            <Avatar member={member} size={56} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">{name}</h3>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(255, 59, 59, 0.15)",
                    color: "#FF3B3B",
                    border: "1px solid rgba(255, 59, 59, 0.25)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {role}
                </span>
              </div>
              <p
                className="text-xs text-muted mt-0.5"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAvatarModal(true)}
            className="hover-lift h-8 px-3.5 rounded-lg text-xs font-medium text-foreground transition-all shrink-0"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Change Avatar
          </button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <InputField label="Full Name" value={name} onChange={setName} />
          <InputField label="Email Address" value={email} onChange={setEmail} type="email" />
        </div>

        {/* Read-only Account Status Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] flex flex-col justify-between">
            <span className="text-xs font-medium text-muted">Account Status</span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Active</span>
            </div>
          </div>
          <div className="p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] flex flex-col justify-between">
            <span className="text-xs font-medium text-muted">Last Login</span>
            <span
              className="text-xs font-semibold text-foreground mt-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Today, 09:41 AM (EST)
            </span>
          </div>
          <div className="p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] flex flex-col justify-between">
            <span className="text-xs font-medium text-muted">Account Created</span>
            <span
              className="text-xs font-semibold text-foreground mt-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              2024-11-01
            </span>
          </div>
        </div>
      </SettingsCard>

      {/* Change Password Card */}
      <SettingsCard
        title="Security & Credentials"
        description="Update your account password and review password strength guidelines."
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-9 px-3.5 pr-10 text-sm rounded-lg outline-none"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "13px",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.border = "1px solid var(--color-border-2)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.border = "1px solid var(--color-border)")
                }
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full h-9 px-3.5 pr-10 text-sm rounded-lg outline-none"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "13px",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.border = "1px solid var(--color-border-2)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.border = "1px solid var(--color-border)")
                }
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {newPw && (
              <div className="mt-2 flex items-center gap-2.5">
                <div className="flex gap-1.5 flex-1">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className="h-1.5 flex-1 rounded-full transition-all duration-200"
                      style={{
                        background:
                          s <= strengthScore
                            ? strengthColor[strengthScore]
                            : "var(--color-border)",
                      }}
                    />
                  ))}
                </div>
                <span
                  className="text-xs font-semibold text-right min-w-16"
                  style={{
                    color: strengthColor[strengthScore],
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {strengthLabel[strengthScore]}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full h-9 px-3.5 text-sm rounded-lg outline-none"
              style={{
                background: "var(--color-surface-2)",
                border:
                  confirmPw && confirmPw !== newPw
                    ? "1px solid var(--color-accent)"
                    : "1px solid var(--color-border)",
                color: "var(--color-foreground)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
              }}
              onFocus={(e) => {
                if (!(confirmPw && confirmPw !== newPw))
                  e.currentTarget.style.border = "1px solid var(--color-border-2)"
              }}
              onBlur={(e) => {
                if (!(confirmPw && confirmPw !== newPw))
                  e.currentTarget.style.border = "1px solid var(--color-border)"
              }}
            />
          </div>

          {status === "error" && (
            <div
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium animate-fade-in"
              style={{
                background: "rgb(var(--color-accent-rgb) / 0.1)",
                border: "1px solid rgb(var(--color-accent-rgb) / 0.25)",
                color: "var(--color-accent)",
              }}
            >
              <AlertCircle size={14} className="text-accent shrink-0" />
              <span>{errMsg}</span>
            </div>
          )}

          {status === "success" && (
            <div
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium animate-fade-in"
              style={{
                background: "rgb(var(--color-success-rgb) / 0.1)",
                border: "1px solid rgb(var(--color-success-rgb) / 0.25)",
                color: "var(--color-success)",
              }}
            >
              <CheckCircle size={14} className="text-success shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          <div className="pt-2">
            <ActionSuccessButton
              type="button"
              disabled={!currentPw || !newPw || !confirmPw}
              onAction={() => handlePasswordSubmit()}
              label="Update Password"
              loadingLabel="Updating..."
              successLabel="Updated"
              toastTitle="Password Updated"
              toastMessage="Account password updated successfully."
              className="hover-lift h-9 px-6 rounded-lg text-sm font-medium shadow-sm"
            />
          </div>
        </form>
      </SettingsCard>
      {showAvatarModal && (
        <AvatarPickerModal
          currentAvatar={avatarUrl}
          onClose={() => setShowAvatarModal(false)}
          onSave={async (newAvatar) => {
            updateProfile({ userAvatar: newAvatar })
            success("Avatar updated successfully", "Profile icon synchronized across Arqon workspace.")
          }}
        />
      )}
    </div>
  )
}

// ─── Section 2: Appearance ───────────────────────────────────────────────────

function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [compactMode, setCompactMode] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [glassEffects, setGlassEffects] = useState(true)
  const [animSpeed, setAnimSpeed] = useState("normal")

  const speedOptions: SelectOption[] = [
    { value: "slow", label: "Slow (0.4s)" },
    { value: "normal", label: "Normal (0.2s)" },
    { value: "fast", label: "Fast (0.1s)" },
  ]

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Theme & Visual Identity"
        description="Select your UI interface theme and adjust glassmorphism render aesthetics."
        footer={<SaveButton onSave={() => {}} label="Save Appearance" />}
      >
        <div>
          <label className="block text-xs font-medium text-muted mb-3">
            Interface Theme
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(["light", "dark", "system"] as const).map((t) => {
              const active = theme === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={(e) => setTheme(t, { x: e.clientX, y: e.clientY })}
                  className="hover-lift p-3.5 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-2"
                  style={{
                    background: active
                      ? "rgba(255, 59, 59, 0.08)"
                      : "var(--color-surface-2)",
                    border: active
                      ? "1.5px solid #FF3B3B"
                      : "1px solid var(--color-border)",
                    boxShadow: active ? "0 0 14px rgba(255, 59, 59, 0.25)" : "none",
                  }}
                >
                  <span
                    className="text-xs font-semibold capitalize"
                    style={{
                      color: active ? "#FF3B3B" : "var(--color-foreground)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {t}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-medium text-muted mb-2">
            Accent Color Palette
          </label>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]">
            <span
              className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white"
              style={{
                background: "#FF3B3B",
                boxShadow: "0 0 10px rgba(255, 59, 59, 0.5)",
              }}
            >
              <Check size={13} strokeWidth={3} />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Arqon Red (Default)</p>
              <p className="text-xs text-muted">Primary brand accent across enterprise controls</p>
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Interface Behavior & Motion"
        description="Configure animation velocities, compact card layouts, and accessibility overrides."
      >
        <div
          className="space-y-0 rounded-lg overflow-hidden border border-[var(--color-border)]"
        >
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border)]">
            <div>
              <p className="text-sm font-medium text-foreground">Compact Mode</p>
              <p className="text-xs text-muted mt-0.5">Reduce padding and spacing in lists and analytics tables</p>
            </div>
            <Toggle enabled={compactMode} onChange={() => setCompactMode(!compactMode)} />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border)]">
            <div>
              <p className="text-sm font-medium text-foreground">Reduced Motion</p>
              <p className="text-xs text-muted mt-0.5">Disable decorative micro-animations and route transitions</p>
            </div>
            <Toggle enabled={reducedMotion} onChange={() => setReducedMotion(!reducedMotion)} />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border)]">
            <div>
              <p className="text-sm font-medium text-foreground">Glass Effects</p>
              <p className="text-xs text-muted mt-0.5">Enable background backdrop blurring on headers and modals</p>
            </div>
            <Toggle enabled={glassEffects} onChange={() => setGlassEffects(!glassEffects)} />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-foreground">Animation Speed</p>
              <p className="text-xs text-muted mt-0.5">Control transition execution duration</p>
            </div>
            <div className="w-40">
              <SelectFilter
                value={animSpeed}
                onChange={setAnimSpeed}
                options={speedOptions}
                showAllOption={false}
              />
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}

// ─── Section 3: Notifications ────────────────────────────────────────────────

function NotificationsSettings() {
  const [successNotifs, setSuccessNotifs] = useState(true)
  const [errorNotifs, setErrorNotifs] = useState(true)
  const [warningNotifs, setWarningNotifs] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)
  const [apiFailureAlerts, setApiFailureAlerts] = useState(true)
  const [teamActivity, setTeamActivity] = useState(false)
  const [providerChanges, setProviderChanges] = useState(true)
  const [modelUpdates, setModelUpdates] = useState(false)

  const items = [
    { title: "Success Notifications", desc: "Show toast notifications for completed operations and saves", val: successNotifs, set: setSuccessNotifs },
    { title: "Error Notifications", desc: "Display error alerts for routing failures and validation halts", val: errorNotifs, set: setErrorNotifs },
    { title: "Warning Notifications", desc: "Notify when rate limits approach utilization thresholds", val: warningNotifs, set: setWarningNotifs },
    { title: "Security Alerts", desc: "Immediate alarms for unauthorized access or suspicious logins", val: securityAlerts, set: setSecurityAlerts },
    { title: "API Failure Alerts", desc: "Webhook and UI alerts on upstream provider downtime", val: apiFailureAlerts, set: setApiFailureAlerts },
    { title: "Team Activity", desc: "Updates when members join, change roles, or generate tokens", val: teamActivity, set: setTeamActivity },
    { title: "Provider Changes", desc: "Notifications when fallback routing automatically trips", val: providerChanges, set: setProviderChanges },
    { title: "Model Updates", desc: "Alerts when new LLM architectures or model versions go live", val: modelUpdates, set: setModelUpdates },
  ]

  return (
    <SettingsCard
      title="Notification Preferences"
      description="Configure real-time UI toast alarms, system warnings, and webhook notification triggers."
      footer={<SaveButton onSave={() => {}} label="Save Notifications" />}
    >
      <div
        className="space-y-0 rounded-lg overflow-hidden border border-[var(--color-border)]"
      >
        {items.map((item, idx) => (
          <div
            key={item.title}
            className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-[var(--color-surface-2)]"
            style={{
              borderBottom: idx < items.length - 1 ? "1px solid var(--color-border)" : "none",
            }}
          >
            <div className="pr-4">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted mt-0.5">{item.desc}</p>
            </div>
            <Toggle enabled={item.val} onChange={() => item.set(!item.val)} />
          </div>
        ))}
      </div>
    </SettingsCard>
  )
}

// ─── Section 4: Dashboard Preferences ────────────────────────────────────────

function DashboardSettings() {
  const [landingPage, setLandingPage] = useState("overview")
  const [density, setDensity] = useState("comfortable")
  const [cardsPerRow, setCardsPerRow] = useState("4")
  const [rememberPage, setRememberPage] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [collapseSidebar, setCollapseSidebar] = useState(false)

  const landingOptions: SelectOption[] = [
    { value: "overview", label: "Overview Dashboard" },
    { value: "analytics", label: "Analytics & Telemetry" },
    { value: "models", label: "Model Catalog" },
    { value: "routing", label: "Smart Routing Rules" },
    { value: "team", label: "Team Management" },
  ]

  const densityOptions: SelectOption[] = [
    { value: "comfortable", label: "Comfortable (Default)" },
    { value: "compact", label: "Compact Layout" },
    { value: "dense", label: "Dense Enterprise View" },
  ]

  const cardOptions: SelectOption[] = [
    { value: "3", label: "3 Cards per row" },
    { value: "4", label: "4 Cards per row" },
    { value: "auto", label: "Auto-responsive grid" },
  ]

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Dashboard Layout & Defaults"
        description="Customize your startup landing view, grid density, and UI persistence preferences."
        footer={<SaveButton onSave={() => {}} label="Save Preferences" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Default Landing Page</label>
            <SelectFilter value={landingPage} onChange={setLandingPage} options={landingOptions} showAllOption={false} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Dashboard Density</label>
            <SelectFilter value={density} onChange={setDensity} options={densityOptions} showAllOption={false} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Metric Cards per Row</label>
            <SelectFilter value={cardsPerRow} onChange={setCardsPerRow} options={cardOptions} showAllOption={false} />
          </div>
        </div>

        <div
          className="space-y-0 rounded-lg overflow-hidden border border-[var(--color-border)] mt-4"
        >
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border)]">
            <div>
              <p className="text-sm font-medium text-foreground">Remember Last Active Page</p>
              <p className="text-xs text-muted mt-0.5">Automatically reopen the route you were viewing prior to closing the session</p>
            </div>
            <Toggle enabled={rememberPage} onChange={() => setRememberPage(!rememberPage)} />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border)]">
            <div>
              <p className="text-sm font-medium text-foreground">Live Telemetry Auto-Refresh</p>
              <p className="text-xs text-muted mt-0.5">Refresh throughput graphs and live request feeds every 5 seconds</p>
            </div>
            <Toggle enabled={autoRefresh} onChange={() => setAutoRefresh(!autoRefresh)} />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-foreground">Sidebar Auto-Collapse</p>
              <p className="text-xs text-muted mt-0.5">Keep desktop sidebar collapsed by default to maximize horizontal work area</p>
            </div>
            <Toggle enabled={collapseSidebar} onChange={() => setCollapseSidebar(!collapseSidebar)} />
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}

// ─── Section 5: AI Preferences ───────────────────────────────────────────────

function AISettings() {
  const [defaultProvider, setDefaultProvider] = useState("openai")
  const [defaultModel, setDefaultModel] = useState("gpt-4o")
  const [temp, setTemp] = useState("0.70")
  const [maxTokens, setMaxTokens] = useState("4096")
  const [streaming, setStreaming] = useState(true)
  const [promptHistory, setPromptHistory] = useState(true)

  // Gateway parameters preserved from original GeneralSettings
  const [apiUrl, setApiUrl] = useState("https://api.arqon.ai/v1")
  const [timeout, setTimeout_] = useState("30")
  const [retries, setRetries] = useState("3")
  const [rateLimiting, setRateLimiting] = useState(true)
  const [fallbackEnabled, setFallbackEnabled] = useState(true)

  const providerOptions: SelectOption[] = [
    { value: "openai", label: "OpenAI Platform" },
    { value: "anthropic", label: "Anthropic Claude" },
    { value: "gemini", label: "Google Gemini" },
    { value: "deepseek", label: "DeepSeek AI" },
  ]

  const modelOptions: SelectOption[] = [
    { value: "gpt-4o", label: "GPT-4o (Optimized)" },
    { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "deepseek-r1", label: "DeepSeek R1 Reasoning" },
  ]

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Default AI & Inference Parameters"
        description="Set base inference parameters applied when requests omit specific model configurations."
        footer={<SaveButton onSave={() => {}} label="Save AI Configuration" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Default Provider</label>
            <SelectFilter value={defaultProvider} onChange={setDefaultProvider} options={providerOptions} showAllOption={false} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Default Model</label>
            <SelectFilter value={defaultModel} onChange={setDefaultModel} options={modelOptions} showAllOption={false} />
          </div>
          <InputField label="Default Temperature (0.0 - 2.0)" value={temp} onChange={setTemp} type="number" mono />
          <InputField label="Default Maximum Tokens" value={maxTokens} onChange={setMaxTokens} type="number" mono />
        </div>

        <div className="space-y-0 rounded-lg overflow-hidden border border-[var(--color-border)] mt-2">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border)]">
            <div>
              <p className="text-sm font-medium text-foreground">Server-Sent Events (SSE) Streaming</p>
              <p className="text-xs text-muted mt-0.5">Stream tokens incrementally to client applications by default</p>
            </div>
            <Toggle enabled={streaming} onChange={() => setStreaming(!streaming)} />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-foreground">Persist Prompt & Completion History</p>
              <p className="text-xs text-muted mt-0.5">Log prompt inputs and model completions for audit reviews and fine-tuning</p>
            </div>
            <Toggle enabled={promptHistory} onChange={() => setPromptHistory(!promptHistory)} />
          </div>
        </div>
      </SettingsCard>

      {/* Gateway API Configuration Card (Preserving all existing general settings) */}
      <SettingsCard
        title="Gateway Routing & Resiliency"
        description="Configure edge API endpoints, timeouts, rate limiting, and automatic failover logic."
      >
        <div className="space-y-5">
          <InputField label="Gateway API Base URL" value={apiUrl} onChange={setApiUrl} mono />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Request Timeout (s)" value={timeout} onChange={setTimeout_} type="number" mono />
            <InputField label="Max Retry Attempts" value={retries} onChange={setRetries} type="number" mono />
          </div>
          <div className="space-y-0 rounded-lg overflow-hidden border border-[var(--color-border)]">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border)]">
              <div>
                <p className="text-sm font-medium text-foreground">Enforce Rate Limiting</p>
                <p className="text-xs text-muted mt-0.5">Throttle excessive traffic using token bucket backoff</p>
              </div>
              <Toggle enabled={rateLimiting} onChange={() => setRateLimiting(!rateLimiting)} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-foreground">Automatic Failover Routing</p>
                <p className="text-xs text-muted mt-0.5">Reroute requests to backup models automatically upon upstream downtime</p>
              </div>
              <Toggle enabled={fallbackEnabled} onChange={() => setFallbackEnabled(!fallbackEnabled)} />
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}

// ─── Section 6: Security (Includes Preserved API Keys) ───────────────────────

interface ApiKey {
  id: string
  label: string
  key: string
  created: string
  lastUsed: string | null
}

const initialKeys: ApiKey[] = [
  {
    id: "key-1",
    label: "Production Gateway",
    key: "arqon_sk_prod_8f3a2b1c9d4e5f6a7b8c9d0e1f2a3b4c",
    created: "2024-11-01",
    lastUsed: "2 minutes ago",
  },
  {
    id: "key-2",
    label: "Staging Integration",
    key: "arqon_sk_stg_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
    created: "2024-10-15",
    lastUsed: "3 days ago",
  },
  {
    id: "key-3",
    label: "Local Dev",
    key: "arqon_sk_dev_zz9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k",
    created: "2024-09-28",
    lastUsed: "1 week ago",
  },
]

function SecuritySettings() {
  const { success } = useToast()
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [showCreate, setShowCreate] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newKey, setNewKey] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [twoFactor, setTwoFactor] = useState(false)

  const createKey = () => {
    const generated = `arqon_sk_${Math.random().toString(36).slice(2, 8)}_${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
    const key: ApiKey = {
      id: `key-${Date.now()}`,
      label: newLabel || "New Key",
      key: generated,
      created: new Date().toISOString().slice(0, 10),
      lastUsed: null,
    }
    setKeys((k) => [...k, key])
    setNewKey(generated)
    setNewLabel("")
    setShowCreate(false)
  }

  const revokeKey = (id: string) => {
    setKeys((k) => k.filter((key) => key.id !== id))
    success("API Access Token revoked")
  }

  const toggleVisible = (id: string) => {
    setVisibleKeys((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  return (
    <div className="space-y-6">
      {/* 2FA & Active Sessions */}
      <SettingsCard
        title="Authentication & Session Security"
        description="Manage multi-factor authentication and monitor active administrative login sessions."
      >
        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ background: twoFactor ? "var(--color-success)" : "rgba(255, 59, 59, 0.15)" }}
            >
              <Lock size={18} className={twoFactor ? "text-white" : "text-[#FF3B3B]"} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Two-Factor Authentication (2FA)</p>
              <p className="text-xs text-muted">Protect administrative actions with TOTP authenticator validation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setTwoFactor(!twoFactor)
              success(twoFactor ? "2FA disabled" : "2FA enabled & verified")
            }}
            className="hover-lift h-8 px-4 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: twoFactor ? "var(--color-surface)" : "var(--color-accent)",
              color: twoFactor ? "var(--color-foreground)" : "#FFFFFF",
              border: twoFactor ? "1px solid var(--color-border)" : "none",
            }}
          >
            {twoFactor ? "Disable 2FA" : "Enable 2FA"}
          </button>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">Active Login Sessions & Trusted Devices</h3>
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor size={18} className="text-emerald-500 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">Current Browser (Chrome on Windows)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase">Active Now</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>IP: 192.168.1.140 • San Francisco, CA</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-muted shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-foreground">iPhone 15 Pro (Safari Mobile)</span>
                  <p className="text-xs text-muted mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>IP: 172.56.21.89 • Yesterday at 4:15 PM</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => success("Device session terminated")}
                className="text-xs text-muted hover:text-[#FF3B3B] transition-colors font-medium px-2 py-1"
              >
                Revoke
              </button>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => success("All remote login sessions terminated")}
              className="hover-lift h-8.5 px-4 rounded-lg text-xs font-semibold text-white transition-all shadow-sm flex items-center gap-1.5"
              style={{ background: "#FF3B3B", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Trash2 size={13} /> Terminate All Other Sessions
            </button>
          </div>
        </div>
      </SettingsCard>

      {/* API Keys Table (Preserved exactly as required) */}
      <div
        className="rounded-xl p-6 card-hover"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <SectionTitle>API Access Tokens</SectionTitle>
            <p className="text-xs text-muted mt-0.5">Manage production gateway authentication secret keys and revocation.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="hover-lift flex items-center gap-1.5 h-8.5 px-3.5 rounded-lg text-xs font-medium text-white transition-all"
            style={{
              background: "var(--color-accent)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <Plus size={14} /> Create Key
          </button>
        </div>

        {newKey && (
          <div
            className="flex items-start gap-3 p-4 rounded-lg mb-4 animate-fade-in"
            style={{
              background: "rgb(var(--color-success-rgb) / 0.08)",
              border: "1px solid rgb(var(--color-success-rgb) / 0.25)",
            }}
          >
            <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-success mb-1">
                Token generated successfully — copy it now, it won't be shown again
              </p>
              <div className="flex items-center gap-2">
                <code
                  className="text-xs break-all text-foreground"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {newKey}
                </code>
                <CopyButton text={newKey} />
              </div>
            </div>
            <button
              onClick={() => setNewKey(null)}
              className="text-muted hover:text-foreground"
            >
              <Check size={14} className="text-success" />
            </button>
          </div>
        )}

        {showCreate && (
          <div
            className="p-4 rounded-lg mb-4 animate-fade-in"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p className="text-xs font-semibold text-muted mb-3">Generate New API Key</p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Key label (e.g. Production Gateway)"
                className="flex-1 h-8.5 px-3 text-xs rounded-lg outline-none"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.border = "1px solid var(--color-border-2)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.border = "1px solid var(--color-border)")
                }
                onKeyDown={(e) => e.key === "Enter" && createKey()}
              />
              <button
                onClick={createKey}
                className="hover-lift h-8.5 px-3.5 rounded-lg text-xs font-medium text-white"
                style={{
                  background: "var(--color-accent)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Generate
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="hover-lift h-8.5 px-3.5 rounded-lg text-xs text-muted"
                style={{ background: "var(--color-border)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--color-border)" }}
        >
          {keys.length === 0 ? (
            <div className="text-center py-10">
              <Key size={20} className="text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">No API keys</p>
              <p className="text-xs text-muted mt-1">
                Create a key to authenticate gateway requests.
              </p>
            </div>
          ) : (
            keys.map((key, i) => (
              <div
                key={key.id}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--color-surface-2)]"
                style={{
                  borderBottom:
                    i < keys.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      {key.label}
                    </span>
                    <span
                      className="text-xs text-muted"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Created {key.created}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code
                      className="text-xs text-muted truncate max-w-xs"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {visibleKeys.has(key.id) ? key.key : maskKey(key.key)}
                    </code>
                    <button
                      onClick={() => toggleVisible(key.id)}
                      className="text-muted hover:text-foreground transition-colors shrink-0"
                    >
                      {visibleKeys.has(key.id) ? (
                        <EyeOff size={13} />
                      ) : (
                        <Eye size={13} />
                      )}
                    </button>
                    <CopyButton text={key.key} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-xs font-medium text-muted">
                    {key.lastUsed ? `Last used ${key.lastUsed}` : "Never used"}
                  </span>
                </div>
                <button
                  onClick={() => revokeKey(key.id)}
                  className="p-2 rounded-lg text-muted hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/10 transition-colors"
                  title="Revoke key"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Section 7: Performance ──────────────────────────────────────────────────

function PerformanceSettings() {
  const [hwAccel, setHwAccel] = useState(true)
  const [animQuality, setAnimQuality] = useState("high")
  const [bgEffects, setBgEffects] = useState(true)
  const [cacheSize, setCacheSize] = useState("1024")
  const [memOpt, setMemOpt] = useState(true)

  const qualityOptions: SelectOption[] = [
    { value: "high", label: "High (60 FPS + Smooth Shading)" },
    { value: "medium", label: "Medium (Standard 60 FPS)" },
    { value: "low", label: "Low (Basic Transitions Only)" },
  ]

  return (
    <SettingsCard
      title="System Performance Tuning"
      description="Manage GPU hardware acceleration, telemetry cache limits, and background rendering overhead."
      footer={<SaveButton onSave={() => {}} label="Save Performance Settings" />}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Animation & Shading Quality</label>
          <SelectFilter value={animQuality} onChange={setAnimQuality} options={qualityOptions} showAllOption={false} />
        </div>
        <InputField label="Telemetry In-Memory Cache Limit (MB)" value={cacheSize} onChange={setCacheSize} type="number" mono />
      </div>

      <div className="space-y-0 rounded-lg overflow-hidden border border-[var(--color-border)] mt-2">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border)]">
          <div>
            <p className="text-sm font-medium text-foreground">Hardware Acceleration</p>
            <p className="text-xs text-muted mt-0.5">Offload diagram shading and routing animations to user GPU</p>
          </div>
          <Toggle enabled={hwAccel} onChange={() => setHwAccel(!hwAccel)} />
        </div>
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border)]">
          <div>
            <p className="text-sm font-medium text-foreground">Background Flow Effects</p>
            <p className="text-xs text-muted mt-0.5">Render glowing node particles on Overview and Routing visualizers</p>
          </div>
          <Toggle enabled={bgEffects} onChange={() => setBgEffects(!bgEffects)} />
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-foreground">Memory Garbage Collection Optimization</p>
            <p className="text-xs text-muted mt-0.5">Purge inactive request payload objects from browser memory immediately</p>
          </div>
          <Toggle enabled={memOpt} onChange={() => setMemOpt(!memOpt)} />
        </div>
      </div>
    </SettingsCard>
  )
}

// ─── Section 8: Keyboard Shortcuts ───────────────────────────────────────────

function ShortcutsSettings() {
  const shortcuts = [
    { label: "Global Navigation Search", keys: ["Ctrl", "K"], desc: "Quick-jump instantly across pages, API keys, models, and docs" },
    { label: "Toggle Navigation Sidebar", keys: ["Ctrl", "B"], desc: "Expand or collapse left navigation pane on desktop" },
    { label: "Open Command Palette", keys: ["Ctrl", "Shift", "P"], desc: "Execute rapid administrative automation scripts" },
    { label: "Open Support & Help Manual", keys: ["Ctrl", "/"], desc: "Access live documentation and AI routing troubleshooting" },
  ]

  return (
    <SettingsCard
      title="Built-in Keyboard Shortcuts"
      description="Quick-action key bindings for navigating the Arqon dashboard without a mouse (Display Only)."
    >
      <div className="space-y-3">
        {shortcuts.map((sc) => (
          <div
            key={sc.label}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{sc.label}</p>
              <p className="text-xs text-muted mt-0.5">{sc.desc}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {sc.keys.map((k, idx) => (
                <React.Fragment key={k}>
                  <kbd
                    className="px-2.5 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border-2)] text-xs font-semibold text-foreground shadow-sm"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {k}
                  </kbd>
                  {idx < sc.keys.length - 1 && <span className="text-xs text-muted font-bold">+</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  )
}

// ─── Section 9: Backup & Export ──────────────────────────────────────────────

function BackupSettings() {
  const { success } = useToast()

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ arqon_version: "1.4.0", timestamp: new Date().toISOString() }))
    const dlAnchor = document.createElement("a")
    dlAnchor.setAttribute("href", dataStr)
    dlAnchor.setAttribute("download", "arqon-enterprise-backup.json")
    document.body.appendChild(dlAnchor)
    dlAnchor.click()
    dlAnchor.remove()
    success("Configuration backup exported to disk")
  }

  return (
    <SettingsCard
      title="Backup, Import & Reset Controls"
      description="Safely transfer gateway rules or restore default factory configuration parameters."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Export Preferences</h3>
            <p className="text-xs text-muted mt-1">Save your current dashboard parameters and alert rules to a JSON archive.</p>
          </div>
          <div className="mt-4 flex gap-2">
            <ActionSuccessButton
              type="button"
              onAction={handleExport}
              label="Export Settings"
              loadingLabel="Exporting..."
              successLabel="Exported"
              icon={<Download size={14} />}
              className="hover-lift h-9 px-4 rounded-lg text-xs font-semibold"
            />
            <button
              type="button"
              onClick={() => success("Configuration schema downloaded")}
              className="hover-lift h-9 px-3 rounded-lg text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-foreground transition-all"
            >
              Schema
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Import Profile</h3>
            <p className="text-xs text-muted mt-1">Restore settings from an existing Arqon backup file or team template.</p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => success("Select a valid JSON backup file to import")}
              className="hover-lift h-9 px-4 rounded-lg text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-foreground flex items-center gap-1.5 transition-all"
            >
              <Upload size={14} /> Import Settings File...
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
        <div>
          <h3 className="text-sm font-semibold text-[#FF3B3B]">Reset & Factory Default Recovery</h3>
          <p className="text-xs text-muted mt-0.5">Revert all appearance, notification toggles, and layout customizations back to initial defaults.</p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => success("Preferences reset to current session checkpoint")}
            className="hover-lift h-8.5 px-3.5 rounded-lg text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-foreground transition-all flex items-center gap-1.5"
          >
            <RotateCcw size={13} /> Reset Preferences
          </button>
          <ActionSuccessButton
            type="button"
            onAction={async () => {
              // Action simulated
            }}
            label="Restore Factory Defaults"
            loadingLabel="Restoring..."
            successLabel="Restored"
            toastTitle="Defaults Restored"
            toastMessage="Factory defaults restored successfully."
            className="hover-lift h-8.5 px-3.5 rounded-lg text-xs font-semibold bg-[#FF3B3B] text-white shadow-sm"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>
      </div>
    </SettingsCard>
  )
}

// ─── Section 10: About Arqon ─────────────────────────────────────────────────

function AboutSettings() {
  const statusItems = [
    { title: "Frontend Client", status: "Operational", color: "text-emerald-500", dot: "bg-emerald-500", icon: Monitor },
    { title: "Gateway Backend", status: "Connected", color: "text-emerald-500", dot: "bg-emerald-500", icon: Server },
    { title: "Telemetry DB", status: "Synchronized", color: "text-emerald-500", dot: "bg-emerald-500", icon: Database },
  ]

  return (
    <div className="space-y-6">
      <SettingsCard
        title="System Specifications & Architecture"
        description="Core technical attributes and active software build identification."
      >
        <div className="flex items-center gap-4 p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md"
            style={{
              background: "linear-gradient(135deg, #FF3B3B 0%, #FF6B6B 100%)",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.05em",
            }}
          >
            AQ
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Arqon AI Gateway Enterprise
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FF3B3B]/10 text-[#FF3B3B] border border-[#FF3B3B]/25">
                v1.4.0-Enterprise
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              Next-generation high-performance LLM routing, fallback orchestration, and unified API telemetry control plane.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {statusItems.map((st) => {
            const Icon = st.icon
            return (
              <div
                key={st.title}
                className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-foreground shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <span className="text-xs font-medium text-muted block">{st.title}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${st.dot} animate-pulse`} />
                    <span className={`text-xs font-bold ${st.color} uppercase tracking-wider`}>{st.status}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] mt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted block font-medium">Build Tag</span>
              <span className="font-semibold text-foreground block mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>2026.08.02-prod</span>
            </div>
            <div>
              <span className="text-muted block font-medium">Environment</span>
              <span className="font-semibold text-foreground block mt-1">Production Cluster US-East</span>
            </div>
            <div>
              <span className="text-muted block font-medium">License Type</span>
              <span className="font-semibold text-emerald-500 block mt-1">Enterprise SLA (Unlimited)</span>
            </div>
            <div>
              <span className="text-muted block font-medium">Support Tier</span>
              <span className="font-semibold text-foreground block mt-1">24/7 Dedicated Concierge</span>
            </div>
          </div>
        </div>
      </SettingsCard>

      <div className="text-center py-4">
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} Arqon AI Technologies Inc. All rights reserved. Confidential & proprietary.
        </p>
      </div>
    </div>
  )
}

// ─── Main Settings Enterprise Control Center ─────────────────────────────────

export default function Settings() {
  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "dashboard", label: "Dashboard Preferences", icon: LayoutDashboard },
    { id: "ai", label: "AI Preferences", icon: Sparkles },
    { id: "security", label: "Security", icon: Shield },
    { id: "performance", label: "Performance", icon: Zap },
    { id: "shortcuts", label: "Keyboard Shortcuts", icon: Command },
    { id: "backup", label: "Backup & Export", icon: HardDrive },
    { id: "about", label: "About Arqon", icon: Info },
  ] as const

  type SectionId = typeof sections[number]["id"]
  const [activeSection, setActiveSection] = useState<SectionId>("profile")
  const [hoveredSection, setHoveredSection] = useState<SectionId | null>(null)

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-foreground tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Enterprise Settings & Configuration
        </h1>
        <p className="text-sm text-muted mt-1">
          Manage system preferences, gateway routing, security controls, and account identity.
        </p>
      </div>

      {/* Enterprise Two-Column Layout on Desktop / Tabs on Mobile */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Column */}
        <nav
          className="w-full lg:w-64 shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none"
        >
          <div
            className="flex lg:flex-col gap-1 p-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm w-full"
          >
            {sections.map((sec) => {
              const Icon = sec.icon
              const active = activeSection === sec.id
              const hovered = hoveredSection === sec.id
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  onMouseEnter={() => setHoveredSection(sec.id)}
                  onMouseLeave={() => setHoveredSection((prev) => (prev === sec.id ? null : prev))}
                  className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shrink-0 lg:w-full text-left group cursor-pointer"
                  style={{
                    background: active
                      ? "rgba(255, 59, 59, 0.1)"
                      : "transparent",
                    color: active ? "var(--color-nav-active-text)" : hovered ? "var(--color-foreground)" : "var(--color-muted)",
                    borderLeft: active ? "3px solid #FF3B3B" : "3px solid transparent",
                    fontFamily: "'Inter', sans-serif",
                    transform: hovered ? "translateY(-1px)" : "translateY(0)",
                    transition: "background 200ms ease, color 200ms ease, transform 200ms ease, border 200ms ease",
                  }}
                >
                  {/* Premium Glassmorphism Hover Effect (Animate pure opacity & transform to preserve 60 FPS without layout shift) */}
                  <span
                    className="absolute inset-0 rounded-lg pointer-events-none transition-all duration-200 ease-out"
                    style={{
                      opacity: hovered ? 1 : 0,
                      background: "var(--color-settings-nav-hover-bg)",
                      backdropFilter: hovered ? "blur(8px) saturate(140%) brightness(1.05)" : "none",
                      WebkitBackdropFilter: hovered ? "blur(8px) saturate(140%) brightness(1.05)" : "none",
                      border: "1px solid var(--color-settings-nav-hover-border)",
                      boxShadow: hovered ? "var(--color-settings-nav-hover-shadow)" : "none",
                      zIndex: 0,
                    }}
                  />
                  <Icon
                    size={16}
                    className={`relative z-10 transition-colors duration-200 shrink-0 ${
                      active ? "nav-icon-active" : hovered ? "text-foreground" : "text-muted"
                    }`}
                    style={{
                      filter: hovered ? "brightness(1.15)" : "none",
                    }}
                  />
                  <span className="relative z-10 truncate transition-colors duration-200">
                    {sec.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Active Section Content Area */}
        <div className="flex-1 min-w-0 w-full animate-fade-in">
          {activeSection === "profile" && <ProfileSettings />}
          {activeSection === "appearance" && <AppearanceSettings />}
          {activeSection === "notifications" && <NotificationsSettings />}
          {activeSection === "dashboard" && <DashboardSettings />}
          {activeSection === "ai" && <AISettings />}
          {activeSection === "security" && <SecuritySettings />}
          {activeSection === "performance" && <PerformanceSettings />}
          {activeSection === "shortcuts" && <ShortcutsSettings />}
          {activeSection === "backup" && <BackupSettings />}
          {activeSection === "about" && <AboutSettings />}
        </div>
      </div>
    </div>
  )
}
