/**
 * TeamManagement.tsx — Enterprise Team Management Page
 * Uses the existing Arqon design language: glass cards, hover-lift,
 * card-hover, animate-fade-in-up, useCountUp, CSS design tokens.
 */

import React, {
  useState,
  useMemo,
  useCallback,
  memo,
  useRef,
  useEffect,
} from "react"

import { useToast } from "../components/toast/ToastContext"

import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  Shield,
  ShieldCheck,
  UserX,
  UserCheck,
  RefreshCw,
  X,
  Check,
  Clock,
  Activity,
  Mail,
  Building2,
  CheckCircle2,
  Wifi,
  Crown,
  Code2,
  Eye,
  Settings,
  Send,
  Loader2,
} from "lucide-react"

import { useCountUp } from "../motion/useCountUp"
import { motion, AnimatePresence } from "framer-motion"
import { ActionSuccessButton } from "../components/shared/SuccessFeedback"

import { EmptyState } from "../components/shared/EmptyState"
import { SearchInput as TeamSearchInput } from "../components/shared/SearchInput"
import { SelectFilter } from "../components/shared/SelectFilter"
import { useTeamStore, useTeamActivity, type Role, type MemberStatus, type TeamMember, type ActivityEvent } from "../store/team"
import { useAuth } from "../hooks/useAuth"

// ─── Types ────────────────────────────────────────────────────────────────────
type SortKey = "newest" | "oldest" | "last_active"

const ROLE_OPTIONS: Role[] = ["Super Admin", "Administrator", "Manager", "Developer", "Analyst", "Viewer"]

// ─── Role Badge ───────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, {
  bg: string
  color: string
  Icon: React.ElementType
}> = {
  "Super Admin": {
    bg: "rgba(255, 59, 59, 0.15)",
    color: "#FF3B3B",
    Icon: Crown,
  },
  Administrator: {
    bg: "rgba(255, 59, 59, 0.1)",
    color: "#FF3B3B",
    Icon: Crown,
  },
  Admin: {
    bg: "rgba(255, 59, 59, 0.1)",
    color: "#FF3B3B",
    Icon: Crown,
  },

  Manager: { bg: "rgba(59, 130, 246, 0.1)", color: "#3B82F6", Icon: Shield },

  Developer: { bg: "rgba(34, 197, 94, 0.1)", color: "#22C55E", Icon: Code2 },

  Analyst: { bg: "rgba(16, 185, 129, 0.1)", color: "#10B981", Icon: Eye },

  Viewer: { bg: "rgba(161, 161, 170, 0.1)", color: "#A1A1AA", Icon: Eye },
}

function RoleBadge({ role }: { role: Role }) {
  const style = ROLE_STYLES[role as string] || ROLE_STYLES.Developer
  const Icon = style?.Icon || Code2
  const [hovered, setHovered] = useState(false)

  const hoverBg = role === "Administrator" 
    ? "rgba(255, 59, 59, 0.22)" 
    : role === "Manager" 
    ? "rgba(59, 130, 246, 0.22)" 
    : role === "Developer" 
    ? "rgba(34, 197, 94, 0.22)" 
    : "rgba(161, 161, 170, 0.22)"

  const hoverShadow = role === "Administrator"
    ? "0 0 12px rgba(255, 59, 59, 0.35)"
    : role === "Manager"
    ? "0 0 12px rgba(59, 130, 246, 0.35)"
    : role === "Developer"
    ? "0 0 12px rgba(34, 197, 94, 0.35)"
    : "0 0 10px rgba(161, 161, 170, 0.25)"

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ease-out select-none transform hover:scale-[1.05]"
      style={{
        background: hovered ? hoverBg : style.bg,
        color: style.color,
        fontFamily: "'Space Grotesk', sans-serif",
        border: hovered ? `1px solid ${style.color}` : `1px solid transparent`,
        boxShadow: hovered ? hoverShadow : "none",
        minWidth: "105px",
      }}
    >
      <Icon size={12} className="shrink-0 transition-transform duration-200 transform group-hover:scale-110" />
      <span className="leading-none tracking-wide">{role}</span>
    </span>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<MemberStatus, {
  bg: string
  color: string
  label: string
}> = {
  online: { bg: "rgba(34, 197, 94, 0.1)", color: "#22C55E", label: "Online" },

  offline: {
    bg: "rgba(113, 113, 122, 0.1)",
    color: "#71717A",
    label: "Offline",
  },

  invited: {
    bg: "rgba(245, 158, 11, 0.1)",
    color: "#F59E0B",
    label: "Invited",
  },

  suspended: {
    bg: "rgba(255, 59, 59, 0.1)",
    color: "#FF3B3B",
    label: "Suspended",
  },
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const style = STATUS_STYLES[status]

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        background: style.bg,
        color: style.color,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {status === "online" && (
          <span
            className="animate-breathe-green absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ background: style.color }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-1.5 w-1.5"
          style={{ background: style.color }}
        />
      </span>
      {style.label}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export function Avatar({ member, size = 34 }: { member: TeamMember, size?: number }) {
  const { session } = useAuth()
  const [imgError, setImgError] = useState(false)
  const isCurrentUser = session.isAuthenticated && member.email.toLowerCase() === session.userEmail.toLowerCase()
  const activeAvatarUrl = isCurrentUser ? session.userAvatar : member.avatarUrl
  const activeName = isCurrentUser ? session.userName : member.name

  return (
    <div
      className="relative rounded-full shrink-0 flex items-center justify-center font-bold overflow-visible transition-transform duration-200 ease-out transform hover:scale-[1.05] group-hover/row:scale-[1.03] group"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Soft red glow ring using transform & opacity solely (Phase 5 & 12) */}
      <div
        className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          boxShadow: "0 0 14px 2px rgba(255, 59, 59, 0.55)",
          border: "1.5px solid rgba(255, 59, 59, 0.8)",
        }}
      />

      <div
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center transition-all duration-200"
        style={{
          background: `${member.avatarColor || "#FF3B3B"}22`,
          border: "1.5px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        {activeAvatarUrl && !imgError ? (
          <img
            src={activeAvatarUrl}
            alt={activeName}
            className="w-full h-full object-cover rounded-full select-none block transition-opacity duration-200 opacity-100"
            style={{ imageRendering: "auto" }}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{ color: member.avatarColor || "#FF3B3B" }}>
            {member.avatar || (activeName ? activeName.slice(0, 2).toUpperCase() : "AD")}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = memo(function StatCard({
  icon,

  label,

  value,

  color = "var(--color-accent)",
}: {
  icon: React.ReactNode

  label: string

  value: number

  color?: string
}) {
  const animated = useCountUp(value, 1200)

  return (
    <div
      className="hover-lift card-hover animate-fade-in-up relative flex flex-col gap-3 p-5 rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg"
        style={{
          background: `${color}14`,
          border: `1px solid ${color}26`,
          color,
        }}
      >
        {icon}
      </div>
      <p className="text-xs text-muted">{label}</p>
      <p
        className="text-2xl font-semibold text-foreground tracking-tight"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {animated}
      </p>
    </div>
  )
})

// ─── Activity Timeline ────────────────────────────────────────────────────────

const ACTIVITY_ICONS: Record<ActivityEvent["type"], {
  Icon: React.ElementType
  color: string
}> = {
  invite: { Icon: UserPlus, color: "#3B82F6" },

  join: { Icon: UserCheck, color: "#22C55E" },

  role_change: { Icon: Shield, color: "#F59E0B" },

  remove: { Icon: UserX, color: "#FF3B3B" },

  api_key: { Icon: Settings, color: "#8B5CF6" },

  provider: { Icon: Activity, color: "#22C55E" },
}

function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <h2
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Recent Activity
        </h2>
        <Clock size={14} className="text-muted" />
      </div>
      <div className="flex flex-col px-4 py-3">
        {events.map((event, idx) => {
          const { Icon, color } = ACTIVITY_ICONS[event.type]

          return (
            <div
              key={event.id}
              className="flex gap-3 py-3 animate-fade-in-up"
              style={{
                animationDelay: `${idx * 40}ms`,

                borderBottom:
                  idx < events.length - 1
                    ? "1px solid var(--color-border)"
                    : "none",
              }}
            >
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: `${color}18`, color }}
                >
                  <Icon size={11} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-snug">
                  {event.detail}
                </p>
                <p
                  className="text-[11px] text-muted mt-0.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {event.time}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Three-Dot Member Menu ────────────────────────────────────────────────────

interface MemberMenuProps {
  member: TeamMember

  onEdit: (m: TeamMember) => void

  onSuspend: (id: string) => void

  onDeactivate: (id: string) => void

  onRemove: (id: string) => void

  onCopyEmail: (email: string) => void

  onResetInvitation: (id: string) => void
}

function MemberMenu({
  member,

  onEdit,

  onSuspend,

  onDeactivate,

  onRemove,

  onCopyEmail,

  onResetInvitation,
}: MemberMenuProps) {
  const [open, setOpen] = useState(false)

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }

    document.addEventListener("mousedown", handleClick)

    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-md text-muted hover:text-foreground transition-colors"
        style={{ background: open ? "var(--color-surface-2)" : "transparent" }}
        aria-label="Member actions"
        aria-expanded={open}
      >
        <MoreHorizontal size={15} />
      </button>

      <div
        className={`absolute right-0 top-8 z-50 w-44 rounded-xl overflow-hidden glass-surface glass-border glass-shadow p-1 transition-all duration-[180ms] ease-out origin-top-right ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1.5 pointer-events-none"
        }`}
        style={{ background: "var(--color-surface)", backdropFilter: "blur(16px)" }}
        role="menu"
      >
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-muted hover:text-foreground hover:bg-white/5 transition-colors text-left rounded-lg"
          role="menuitem"
          onClick={() => {
            onEdit(member)
            setOpen(false)
          }}
        >
          <Edit3 size={13} /> Edit
        </button>
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-muted hover:text-foreground hover:bg-white/5 transition-colors text-left rounded-lg"
          role="menuitem"
          onClick={() => {
            onSuspend(member.id)
            setOpen(false)
          }}
        >
          {member.status === "suspended" ? <UserCheck size={13} /> : <UserX size={13} />}
          {member.status === "suspended" ? "Reactivate" : "Suspend"}
        </button>
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-muted hover:text-foreground hover:bg-white/5 transition-colors text-left rounded-lg"
          role="menuitem"
          onClick={() => {
            onDeactivate(member.id)
            setOpen(false)
          }}
        >
          <Clock size={13} /> Deactivate
        </button>
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-muted hover:text-foreground hover:bg-white/5 transition-colors text-left rounded-lg"
          role="menuitem"
          onClick={() => {
            onCopyEmail(member.email)
            setOpen(false)
          }}
        >
          <Mail size={13} /> Copy Email
        </button>
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-muted hover:text-foreground hover:bg-white/5 transition-colors text-left rounded-lg"
          role="menuitem"
          onClick={() => {
            onResetInvitation(member.id)
            setOpen(false)
          }}
        >
          <RefreshCw size={13} /> Reset Invitation
        </button>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "4px 0" }} />
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-white/5 transition-colors text-left rounded-lg font-medium"
          style={{ color: "#FF3B3B" }}
          role="menuitem"
          onClick={() => {
            onRemove(member.id)
            setOpen(false)
          }}
        >
          <Trash2 size={13} /> Remove
        </button>
      </div>
    </div>
  )
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

interface InviteModalProps {
  onClose: () => void

  onSuccess: (data: { name: string, email: string, role: Role, department: string }) => void
}

function InviteModal({ onClose, onSuccess }: InviteModalProps) {
  const [form, setForm] = useState({
    email: "",
    name: "",
    role: "Developer" as Role,
    department: "",
    message: "",
  })

  const [mounted, setMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)

  const handleSmoothClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(onClose, 220)
  }, [onClose])

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
    emailRef.current?.focus()

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSmoothClose()
    }

    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [handleSmoothClose])

  const handleSend = () => {
    if (!form.email || !form.name || loading) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setDone(true)
      onSuccess({
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department,
      })
      setTimeout(() => {
        handleSmoothClose()
      }, 800)
    }, 600)
  }

  const fieldStyle = {
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-[250ms] ease-out"
      style={{ opacity: mounted && !isClosing ? 1 : 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
    >
      <div
        className="absolute inset-0 glass-overlay backdrop-blur-md transition-opacity duration-[250ms]"
        onClick={handleSmoothClose}
        aria-hidden="true"
      />
      <div className={`relative z-10 w-full max-w-md p-7 rounded-2xl glass-elevated glass-border glass-shadow glass-highlight transition-all duration-[250ms] ease-out transform ${mounted && !isClosing ? "scale-100 translate-y-0 opacity-100" : "scale-[0.95] translate-y-2 opacity-0"}`}>
        {done ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center animate-fade-in-up"
              style={{
                background: "rgba(34, 197, 94, 0.12)",

                border: "1px solid rgba(34, 197, 94, 0.3)",

                boxShadow: "0 0 24px rgba(34, 197, 94, 0.2)",
              }}
            >
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <div className="text-center">
              <p
                className="text-base font-semibold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Invitation Sent
              </p>
              <p className="text-sm text-muted mt-1">
                {form.name} will receive an email shortly.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  id="invite-modal-title"
                  className="text-base font-semibold text-foreground"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Invite Member
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Send an invitation to join your team.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"
                style={{ background: "var(--color-surface-2)" }}
                aria-label="Close modal"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Email <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <Mail
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                  />
                  <input
                    ref={emailRef}
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="colleague@company.com"
                    className="w-full h-9 pl-8 pr-3 text-sm rounded-lg outline-none transition-colors"
                    style={fieldStyle}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--color-accent)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--color-border)")
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Full Name <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Jane Smith"
                  className="w-full h-9 px-3 text-sm rounded-lg outline-none transition-colors"
                  style={fieldStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-border)")
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map((r) => {
                    const s = ROLE_STYLES[r]

                    const Icon = s.Icon

                    const selected = form.role === r

                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, role: r }))}
                        className="flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-medium transition-all duration-150 text-left"
                        style={{
                          background: selected
                            ? `${s.color}16`
                            : "var(--color-surface-2)",

                          border: selected
                            ? `1px solid ${s.color}40`
                            : "1px solid var(--color-border)",

                          color: selected ? s.color : "var(--color-muted)",
                        }}
                      >
                        <Icon size={12} /> {r}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Department <span className="opacity-40">(optional)</span>
                </label>
                <div className="relative">
                  <Building2
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                  />
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, department: e.target.value }))
                    }
                    placeholder="Engineering, Design\u2026"
                    className="w-full h-9 pl-8 pr-3 text-sm rounded-lg outline-none transition-colors"
                    style={fieldStyle}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--color-accent)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--color-border)")
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Message <span className="opacity-40">(optional)</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="Hey, join us on Arqon!"
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-colors resize-none"
                  style={{ ...fieldStyle, fontFamily: "'Inter', sans-serif" }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-border)")
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSmoothClose}
                className="flex-1 h-10 rounded-xl text-sm font-medium text-muted hover:text-foreground transition-colors"
                style={{
                  background: "var(--color-surface-2)",

                  border: "1px solid var(--color-border)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!form.email || !form.name || done || loading}
                className="hover-lift flex-1 h-10 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  background: "#FF3B3B",
                  boxShadow: "0 4px 16px rgba(255, 59, 59, 0.3)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-white" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Invite</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Edit Member Modal ────────────────────────────────────────────────────────

interface EditModalProps {
  member: TeamMember

  onSave: (updated: TeamMember) => void

  onClose: () => void
}

function EditMemberModal({ member, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState({
    role: member.role,

    status: member.status,

    department: member.department,

    notes: member.notes || "",
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handler)

    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const fieldStyle = {
    background: "var(--color-surface-2)",

    border: "1px solid var(--color-border)",

    color: "var(--color-foreground)",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 glass-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md p-7 rounded-2xl animate-fade-in-up glass-elevated glass-border glass-shadow glass-highlight">
        <div className="flex items-center gap-3 mb-6">
          <Avatar member={member} size={36} />
          <div>
            <h2
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Edit {member.name}
            </h2>
            <p className="text-xs text-muted">{member.email}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"
            style={{ background: "var(--color-surface-2)" }}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((r) => {
                const s = ROLE_STYLES[r]

                const Icon = s.Icon

                const selected = form.role === r

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r }))}
                    className="flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-medium transition-all duration-150"
                    style={{
                      background: selected
                        ? `${s.color}16`
                        : "var(--color-surface-2)",

                      border: selected
                        ? `1px solid ${s.color}40`
                        : "1px solid var(--color-border)",

                      color: selected ? s.color : "var(--color-muted)",
                    }}
                  >
                    <Icon size={12} /> {r}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["online", "offline", "suspended"] as MemberStatus[]).map(
                (s) => {
                  const style = STATUS_STYLES[s]

                  const selected = form.status === s

                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className="flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-medium transition-all duration-150 capitalize"
                      style={{
                        background: selected
                          ? `${style.color}16`
                          : "var(--color-surface-2)",

                        border: selected
                          ? `1px solid ${style.color}40`
                          : "1px solid var(--color-border)",

                        color: selected ? style.color : "var(--color-muted)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: style.color }}
                      />
                      {style.label}
                    </button>
                  )
                },
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Department
            </label>
            <input
              type="text"
              value={form.department}
              onChange={(e) =>
                setForm((f) => ({ ...f, department: e.target.value }))
              }
              className="w-full h-9 px-3 text-sm rounded-lg outline-none transition-colors"
              style={fieldStyle}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-accent)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-border)")
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={2}
              placeholder="Internal notes about this member\u2026"
              className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-colors resize-none"
              style={{ ...fieldStyle, fontFamily: "'Inter', sans-serif" }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-accent)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-border)")
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl text-sm font-medium text-muted transition-colors"
            style={{
              background: "var(--color-surface-2)",

              border: "1px solid var(--color-border)",
            }}
          >
            Cancel
          </button>
          <ActionSuccessButton
            onAction={() => onSave({ ...member, ...form })}
            onAfterSuccess={onClose}
            label="Save Changes"
            loadingLabel="Saving..."
            successLabel="Saved"
            icon={<Check size={14} />}
            className="flex-1 h-10 rounded-xl text-sm font-medium text-white shadow-md"
            style={{
              background: "var(--color-accent)",
              boxShadow: "0 4px 14px rgba(255,59,59,0.25)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Member Detail Drawer ─────────────────────────────────────────────────────

interface MemberDetailDrawerProps {
  member: TeamMember | null
  onClose: () => void
}

function MemberDetailDrawer({ member, onClose }: MemberDetailDrawerProps) {
  const [isClosing, setIsClosing] = useState(false)

  const handleSmoothClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    if (!member) return
    setIsClosing(false)
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSmoothClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [member, handleSmoothClose])

  if (!member) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end transition-opacity duration-200" style={{ opacity: isClosing ? 0 : 1 }}>
      <div
        className="absolute inset-0 glass-overlay backdrop-blur-sm transition-opacity duration-200"
        onClick={handleSmoothClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 w-full max-w-md h-full flex flex-col glass-elevated glass-border glass-shadow p-6 overflow-y-auto transition-transform duration-200 ease-out transform ${
          isClosing ? "translate-x-full" : "translate-x-0"
        }`}
        style={{
          background: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
        }}
        role="dialog"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] shrink-0">
          <h2 id="drawer-title" className="text-base font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Member Details
          </h2>
          <button
            onClick={handleSmoothClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"
            style={{ background: "var(--color-surface-2)" }}
            aria-label="Close drawer"
          >
            <X size={14} />
          </button>
        </div>

        {/* User profile section */}
        <div className="flex items-center gap-4 py-6 border-b border-[var(--color-border)] shrink-0">
          <Avatar member={member} size={56} />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {member.name}
            </h3>
            <p className="text-xs text-muted truncate mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {member.email}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <RoleBadge role={member.role} />
              <StatusBadge status={member.status} />
            </div>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="py-5 border-b border-[var(--color-border)] grid grid-cols-2 gap-4 shrink-0">
          <div className="p-3 rounded-xl" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
            <p className="text-[11px] font-medium text-muted mb-1 flex items-center gap-1.5">
              <Building2 size={12} /> Department
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              {member.department || "General"}
            </p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
            <p className="text-[11px] font-medium text-muted mb-1 flex items-center gap-1.5">
              <Clock size={12} /> Joined Date
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              {member.joined}
            </p>
          </div>
          <div className="p-3 rounded-xl col-span-2" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
            <p className="text-[11px] font-medium text-muted mb-1 flex items-center gap-1.5">
              <Activity size={12} /> Last Login
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              {member.lastActive}
            </p>
          </div>
        </div>

        {/* Placeholder Sections */}
        <div className="py-5 space-y-4 flex-1">
          {/* Permissions */}
          <div className="p-4 rounded-xl border border-[var(--color-border)] card-hover" style={{ background: "var(--color-surface-2)" }}>
            <div className="flex items-center gap-2 mb-2 text-foreground font-semibold text-xs uppercase tracking-wider">
              <Shield size={14} className="text-accent" /> Permissions
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Default role-based access control enabled for <strong className="text-foreground">{member.role}</strong>. Granular resource scoping & custom endpoint policies coming soon.
            </p>
          </div>

          {/* Usage */}
          <div className="p-4 rounded-xl border border-[var(--color-border)] card-hover" style={{ background: "var(--color-surface-2)" }}>
            <div className="flex items-center gap-2 mb-2 text-foreground font-semibold text-xs uppercase tracking-wider">
              <Code2 size={14} className="text-blue-500" /> Usage & Limits
            </div>
            <div className="flex justify-between items-center text-xs py-1 text-muted border-b border-[var(--color-border)]">
              <span>API Calls (This Month)</span>
              <span className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>0 / 100,000</span>
            </div>
            <div className="flex justify-between items-center text-xs py-1 mt-1 text-muted">
              <span>Token Consumption</span>
              <span className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>0 tokens</span>
            </div>
          </div>

          {/* Activity */}
          <div className="p-4 rounded-xl border border-[var(--color-border)] card-hover" style={{ background: "var(--color-surface-2)" }}>
            <div className="flex items-center gap-2 mb-2 text-foreground font-semibold text-xs uppercase tracking-wider">
              <Activity size={14} className="text-emerald-500" /> Activity Log
            </div>
            <p className="text-xs text-muted italic">
              No anomalous actions recorded in the past 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

// ─── Bulk Action Bar ──────────────────────────────────────────────────────────

function BulkActionBar({
  count,

  onAssignRole,

  onDeactivate,

  onDelete,

  onClear,
}: {
  count: number

  onAssignRole: () => void

  onDeactivate: () => void

  onDelete: () => void

  onClear: () => void
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl animate-fade-in-up"
      style={{
        background: "var(--color-surface)",

        border: "1px solid var(--color-border)",

        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      <span className="text-xs text-muted">
        <span className="font-semibold text-foreground">{count}</span> selected
      </span>
      <div
        style={{ width: 1, height: 16, background: "var(--color-border)" }}
      />
      <button
        onClick={onAssignRole}
        className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-white/5 transition-colors"
      >
        <Shield size={12} /> Assign Role
      </button>
      <button
        onClick={onDeactivate}
        className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-white/5 transition-colors"
      >
        <UserX size={12} /> Deactivate
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-colors"
        style={{ color: "#FF3B3B" }}
      >
        <Trash2 size={12} /> Delete
      </button>
      <button
        onClick={onClear}
        className="ml-auto p-1 rounded text-muted hover:text-foreground transition-colors"
        aria-label="Clear selection"
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ─── Member Table ─────────────────────────────────────────────────────────────

interface MemberTableProps {
  members: TeamMember[]

  selected: Set<string>

  onToggleSelect: (id: string) => void

  onToggleAll: () => void

  onEdit: (m: TeamMember) => void

  onSuspend: (id: string) => void

  onDeactivate: (id: string) => void

  onRemove: (id: string) => void

  onCopyEmail: (email: string) => void

  onResetInvitation: (id: string) => void

  onSelectMember: (member: TeamMember) => void
}

function MemberTable({
  members,

  selected,

  onToggleSelect,

  onToggleAll,

  onEdit,

  onSuspend,

  onDeactivate,

  onRemove,

  onCopyEmail,

  onResetInvitation,

  onSelectMember,
}: MemberTableProps) {
  const allSelected =
    members.length > 0 && members.every((m) => selected.has(m.id))

  if (members.length === 0) {
    return (
      <EmptyState
        icon={<Search className="w-7 h-7" />}
        title="No Results Found"
        subtitle="Try adjusting your search query or filters."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-left"
        style={{
          borderCollapse: "separate",
          borderSpacing: "0 4px",
          minWidth: 760,
        }}
      >
        <thead>
          <tr>
            <th className="px-4 py-2 w-8">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                className="w-3.5 h-3.5 rounded cursor-pointer"
                style={{ accentColor: "var(--color-accent)" }}
                aria-label="Select all members"
              />
            </th>
            {[
              "Member",
              "Role",
              "Status",
              "Department",
              "Joined",
              "Last Active",
              "",
            ].map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-xs font-medium text-muted whitespace-nowrap"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
          {members.map((member, idx) => {
            const isSelected = selected.has(member.id)

            return (
              <motion.tr
                layout="position"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                key={member.id}
                onClick={() => onSelectMember(member)}
                className="group group/row transition-all duration-200 cursor-pointer transform hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(255,59,59,0.08)] relative z-0 hover:z-10"
                style={{
                  animationDelay: `${idx * 25}ms`,
                  background: isSelected ? "rgba(255,59,59,0.06)" : "transparent",
                  borderRadius: "12px",
                  boxShadow: isSelected ? "inset 0 0 16px rgba(255,59,59,0.08)" : "none",
                  outline: isSelected ? "1px solid rgba(255,59,59,0.4)" : "1px solid transparent",
                }}
                onMouseOver={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "var(--color-surface)"
                    e.currentTarget.style.outline = "1px solid rgba(255,59,59,0.25)"
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.outline = "1px solid transparent"
                  }
                }}
              >
                <td className="px-4 py-3.5 rounded-l-xl border-y border-l transition-colors" style={{ borderColor: isSelected ? "rgba(255,59,59,0.45)" : "rgba(255,255,255,0.04)" }} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(member.id)}
                    className="w-3.5 h-3.5 rounded cursor-pointer transition-transform duration-150 hover:scale-110"
                    style={{ accentColor: "#FF3B3B" }}
                    aria-label={`Select ${member.name}`}
                  />
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap border-y transition-colors" style={{ borderColor: isSelected ? "rgba(255,59,59,0.45)" : "rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-3">
                    <Avatar member={member} size={32} />
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight group-hover/row:text-[#FF3B3B] transition-colors duration-200">
                        {member.name}
                      </p>
                      <p
                        className="text-[11px] text-muted tracking-tight mt-0.5"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {member.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap border-y transition-colors" style={{ borderColor: isSelected ? "rgba(255,59,59,0.45)" : "rgba(255,255,255,0.04)" }}>
                  <RoleBadge role={member.role} />
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap border-y transition-colors" style={{ borderColor: isSelected ? "rgba(255,59,59,0.45)" : "rgba(255,255,255,0.04)" }}>
                  <StatusBadge status={member.status} />
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap text-xs text-muted border-y transition-colors font-medium" style={{ borderColor: isSelected ? "rgba(255,59,59,0.45)" : "rgba(255,255,255,0.04)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {member.department || "\u2014"}
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap text-xs text-muted border-y transition-colors" style={{ borderColor: isSelected ? "rgba(255,59,59,0.45)" : "rgba(255,255,255,0.04)" }}>
                  {member.joined}
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap text-xs text-muted border-y transition-colors" style={{ borderColor: isSelected ? "rgba(255,59,59,0.45)" : "rgba(255,255,255,0.04)" }}>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[11px]">
                    <Clock size={10} className="text-muted" />
                    {member.lastActive}
                  </span>
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap text-right rounded-r-xl border-y border-r transition-colors" style={{ borderColor: isSelected ? "rgba(255,59,59,0.45)" : "rgba(255,255,255,0.04)" }} onClick={(e) => e.stopPropagation()}>
                  <div className="opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 flex items-center justify-end">
                    <MemberMenu
                      member={member}
                      onEdit={onEdit}
                      onSuspend={onSuspend}
                      onDeactivate={onDeactivate}
                      onRemove={onRemove}
                      onCopyEmail={onCopyEmail}
                      onResetInvitation={onResetInvitation}
                    />
                  </div>
                </td>
              </motion.tr>
            )
          })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}

// ─── Pagination Component ─────────────────────────────────────────────────────

function TeamPagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}: {
  currentPage: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.ceil(totalCount / pageSize)
  if (totalPages <= 1) return null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" && currentPage > 1) {
      onPageChange(currentPage - 1)
    } else if (e.key === "ArrowRight" && currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]/40 text-xs rounded-b-xl"
      role="navigation"
      aria-label="Pagination"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="text-muted font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Showing <span className="text-foreground font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{" "}
        <span className="text-foreground font-semibold">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
        <span className="text-foreground font-semibold">{totalCount}</span> team members
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg font-medium transition-all duration-150 ease-out hover:bg-white/5 hover:text-foreground text-muted disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          style={{ border: "1px solid var(--color-border)" }}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
          const isActive = num === currentPage
          return (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className="w-8 h-8 rounded-lg font-bold transition-all duration-200 ease-out transform hover:scale-105 select-none"
              style={{
                background: isActive ? "#FF3B3B" : "transparent",
                color: isActive ? "#ffffff" : "var(--color-muted)",
                boxShadow: isActive ? "0 0 16px rgba(255, 59, 59, 0.4)" : "none",
                border: isActive ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              {num}
            </button>
          )
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg font-medium transition-all duration-150 ease-out hover:bg-white/5 hover:text-foreground text-muted disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          style={{ border: "1px solid var(--color-border)" }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeamManagement() {
  const { success } = useToast()
  const { session } = useAuth()

  const [rawMembers, setMembers] = useTeamStore()
  const [activityEvents] = useTeamActivity()

  const members = useMemo(() => {
    return rawMembers.map((m) => {
      if (session.isAuthenticated && m.email.toLowerCase() === session.userEmail.toLowerCase()) {
        return {
          ...m,
          name: session.userName,
          avatarUrl: session.userAvatar,
        }
      }
      return m
    })
  }, [rawMembers, session.isAuthenticated, session.userEmail, session.userName, session.userAvatar])

  const [search, setSearch] = useState("")

  const [roleFilter, setRoleFilter] = useState<string>("")

  const [statusFilter, setStatusFilter] = useState<string>("")

  const [departmentFilter, setDepartmentFilter] = useState<string>("")

  const [sort, setSort] = useState<SortKey>("newest")

  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [showInvite, setShowInvite] = useState(false)

  const [editMember, setEditMember] = useState<TeamMember | null>(null)
  const [detailMember, setDetailMember] = useState<TeamMember | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    setCurrentPage(1)
  }, [search, roleFilter, statusFilter, departmentFilter])

  const showToast = useCallback(
    (msg: string) => {
      success(msg)
    },
    [success],
  )

  const totalMembers = members.length

  const onlineNow = members.filter((m) => m.status === "online").length

  const pendingInvites = members.filter((m) => m.status === "invited").length

  const admins = members.filter((m) => m.role === "Administrator").length

  const filtered = useMemo(() => {
    let list = [...members]

    if (search) {
      const q = search.toLowerCase()

      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.department.toLowerCase().includes(q),
      )
    }

    if (roleFilter) list = list.filter((m) => m.role === roleFilter)

    if (statusFilter) list = list.filter((m) => m.status === statusFilter)

    if (departmentFilter) list = list.filter((m) => m.department === departmentFilter)

    return list
  }, [members, search, roleFilter, statusFilter, departmentFilter])

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const handleToggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const n = new Set(prev)

      n.has(id) ? n.delete(id) : n.add(id)

      return n
    })
  }, [])

  const handleToggleAll = useCallback(() => {
    if (filtered.every((m) => selected.has(m.id))) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((m) => m.id)))
    }
  }, [filtered, selected])

  const handleSuspend = useCallback(
    (id: string) => {
      setMembers((ms) =>
        ms.map((m) =>
          m.id === id
            ? {
                ...m,
                status:
                  m.status === "suspended"
                    ? "online" as MemberStatus
                    : "suspended" as MemberStatus,
              }
            : m,
        ),
      )

      showToast("Member status updated")
    },

    [showToast],
  )

  const handleDeactivate = useCallback(
    (id: string) => {
      setMembers((ms) =>
        ms.map((m) =>
          m.id === id
            ? {
                ...m,
                status: "offline" as MemberStatus,
              }
            : m,
        ),
      )

      showToast("Member deactivated")
    },

    [showToast],
  )

  const handleRemove = useCallback(
    (id: string) => {
      setMembers((ms) => ms.filter((m) => m.id !== id))

      setSelected((prev) => {
        const n = new Set(prev)

        n.delete(id)

        return n
      })

      showToast("Member removed")
    },

    [showToast],
  )

  const handleCopyEmail = useCallback(
    (email: string) => {
      navigator.clipboard?.writeText(email)
      showToast("Email copied to clipboard")
    },

    [showToast],
  )

  const handleResetInvitation = useCallback(
    (id: string) => {
      setMembers((ms) =>
        ms.map((m) =>
          m.id === id
            ? {
                ...m,
                status: "invited" as MemberStatus,
                lastActive: "Reset",
              }
            : m,
        ),
      )
      showToast("Invitation reset and resent")
    },

    [showToast],
  )

  const handleEdit = useCallback((m: TeamMember) => {
    setEditMember(m)
  }, [])

  const handleSaveEdit = useCallback(
    (updated: TeamMember) => {
      setMembers((ms) => ms.map((m) => (m.id === updated.id ? updated : m)))

      showToast("Member updated successfully")
    },

    [showToast],
  )

  const handleInviteSuccess = useCallback(
    ({ name, email, role, department }: { name: string, email: string, role: Role, department: string }) => {
      const initials = name
        .split(" ")
        .map((n) => n[0] ?? "")
        .join("")
        .toUpperCase()
        .slice(0, 2)

      const newMember: TeamMember = {
        id: `m${Date.now()}`,

        name,

        email,

        role,

        status: "invited",

        department,

        avatar: initials,

        avatarColor: "#8B5CF6",

        joined: "Just now",

        lastActive: "Never",
      }

      setMembers((ms) => [newMember, ...ms])

      showToast(`Invitation sent to ${name}`)
    },

    [showToast],
  )

  const handleBulkDeactivate = () => {
    const count = selected.size

    setMembers((ms) =>
      ms.map((m) =>
        selected.has(m.id) ? { ...m, status: "suspended" as MemberStatus } : m,
      ),
    )

    setSelected(new Set())

    showToast(`${count} member${count > 1 ? "s" : ""} deactivated`)
  }

  const handleBulkDelete = () => {
    const count = selected.size

    setMembers((ms) => ms.filter((m) => !selected.has(m.id)))

    setSelected(new Set())

    showToast(`${count} member${count > 1 ? "s" : ""} removed`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl font-bold text-foreground tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Team Management
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage organization members, roles and permissions.
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="hover-lift flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-medium text-white transition-all self-start sm:self-auto"
          style={{
            background: "var(--color-accent)",

            boxShadow: "0 4px 14px rgba(255, 59, 59, 0.25)",

            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <UserPlus size={14} /> Invite Member
        </button>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={16} />}
          label="Members"
          value={totalMembers}
          color="var(--color-accent)"
        />
        <StatCard
          icon={<ShieldCheck size={16} />}
          label="Administrators"
          value={admins}
          color="#3B82F6"
        />
        <StatCard
          icon={<Wifi size={16} />}
          label="Active Members"
          value={onlineNow}
          color="#22C55E"
        />
        <StatCard
          icon={<Mail size={16} />}
          label="Pending Invitations"
          value={pendingInvites}
          color="#F59E0B"
        />
      </div>

      {/* Main Layout */}
      {members.length === 0 ? (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full py-4"
        >
          <EmptyState
            icon={<Users className="w-7 h-7" />}
            title="No Team Members"
            subtitle="Invite your first teammate."
            actionLabel="Invite Member"
            onAction={() => setShowInvite(true)}
          />
        </motion.div>
      ) : (
        <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }} className="flex flex-col xl:flex-row gap-6">
          {/* Left: Table area */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Bulk bar */}
          {selected.size > 0 && (
            <BulkActionBar
              count={selected.size}
              onAssignRole={() =>
                showToast("Use Edit to assign individual roles")
              }
              onDeactivate={handleBulkDeactivate}
              onDelete={handleBulkDelete}
              onClear={() => setSelected(new Set())}
            />
          )}

          {/* Toolbar */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
            style={{
              background: "var(--color-surface)",

              border: "1px solid var(--color-border)",
            }}
          >
            <div className="w-full sm:w-auto flex-1 max-w-xs">
              <TeamSearchInput value={search} onChange={setSearch} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <SelectFilter
                value={roleFilter}
                onChange={setRoleFilter}
                placeholder="All Roles"
                options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))}
              />
              <SelectFilter
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="All Status"
                options={[
                  { value: "online", label: "Online" },
                  { value: "offline", label: "Offline" },
                  { value: "invited", label: "Invited" },
                  { value: "suspended", label: "Suspended" },
                ]}
              />
              <SelectFilter
                value={departmentFilter}
                onChange={setDepartmentFilter}
                placeholder="All Departments"
                options={[
                  { value: "Engineering", label: "Engineering" },
                  { value: "Product", label: "Product" },
                  { value: "Design", label: "Design" },
                  { value: "Operations", label: "Operations" },
                ]}
              />
              <SelectFilter
                value={sort}
                onChange={(v) => setSort(v as SortKey)}
                placeholder="Sort"
                options={[
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" },
                  { value: "last_active", label: "Last Active" },
                ]}
              />
              {(search || roleFilter || statusFilter || departmentFilter) && (
                <button
                  onClick={() => {
                    setSearch("")
                    setRoleFilter("")
                    setStatusFilter("")
                    setDepartmentFilter("")
                  }}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium text-muted hover:text-foreground transition-all duration-150 hover:bg-white/5 border border-transparent hover:border-white/10"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Table */}

          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--color-surface)",

              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <h2
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Members
              </h2>
              <span className="text-xs text-muted">
                {filtered.length} of {members.length}
              </span>
            </div>
            <div className={`p-2 flex flex-col justify-between transition-all duration-300 ${filtered.length > 0 ? "min-h-[440px]" : "py-8"}`}>
              {filtered.length === 0 ? (
                <EmptyState
                  icon={<Search className="w-7 h-7" />}
                  title="No Results Found"
                  subtitle="No team members match your active filters."
                  actionLabel="Clear Filters"
                  onAction={() => {
                    setSearch("")
                    setRoleFilter("")
                    setStatusFilter("")
                    setDepartmentFilter("")
                  }}
                />
              ) : (
                <>
                  <div className="flex-1">
                    <MemberTable
                      members={paginatedMembers}
                      selected={selected}
                      onToggleSelect={handleToggleSelect}
                      onToggleAll={handleToggleAll}
                      onEdit={handleEdit}
                      onSuspend={handleSuspend}
                      onDeactivate={handleDeactivate}
                      onRemove={handleRemove}
                      onCopyEmail={handleCopyEmail}
                      onResetInvitation={handleResetInvitation}
                      onSelectMember={setDetailMember}
                    />
                  </div>
                  <TeamPagination
                    currentPage={currentPage}
                    totalCount={filtered.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </div>
          </div>
        </div>

          {/* Right: Activity */}
          <div className="xl:w-72 shrink-0">
            <ActivityTimeline events={activityEvents} />
          </div>
        </motion.div>
      )}

      {/* Modals */}
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
      {editMember && (
        <EditMemberModal
          member={editMember}
          onSave={handleSaveEdit}
          onClose={() => setEditMember(null)}
        />
      )}
      <MemberDetailDrawer
        member={detailMember}
        onClose={() => setDetailMember(null)}
      />

      {/* Toast */}
    </div>
  )
}
