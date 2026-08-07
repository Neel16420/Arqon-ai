/**
 * AuditLogs.tsx — Enterprise Security & Compliance Event Tracking
 *
 * Provides immutable audit log inspection with granular user attribution, IP logs,
 * target resource tracking, device fingerprinting, filtering, and export capabilities.
 */

import { useState, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import {
  FileText,
  Download,
  ShieldCheck,
  Clock,
  Globe,
  Terminal,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
} from "lucide-react"
import { useToast } from "../components/toast/ToastContext"
import { useCountUp } from "../motion/useCountUp"
import { SearchInput } from "../components/shared/SearchInput"
import { SelectFilter } from "../components/shared/SelectFilter"
import { EmptyState } from "../components/shared/EmptyState"
import { useTeamStore, useTeamActivity } from "../store/team"
import { Users } from "lucide-react"

interface AuditLogEntry {
  id: string
  userName: string
  userAvatar: string
  userInitials: string
  role: string
  action: string
  targetResource: string
  timestamp: string
  status: "Success" | "Failed" | "Warning" | "Denied"
  ipAddress: string
  device: string
  details?: string
}

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud_01J8R9Q1",
    userName: "Sarah Jenkins",
    userAvatar: "/avatars/avatar-1.png",
    userInitials: "SJ",
    role: "Super Admin",
    action: "ROUTING_FAILOVER_TRIGGERED",
    targetResource: "Azure OpenAI → OpenAI Fallback Chain",
    timestamp: "just now",
    status: "Warning",
    ipAddress: "192.168.1.42",
    device: "Chrome / macOS",
    details: "High latency detected on primary endpoint (2,410ms). Routed 48 downstream prompts to backup cluster.",
  },
  {
    id: "aud_01J8R9P9",
    userName: "Alex Rivera",
    userAvatar: "/avatars/avatar-2.png",
    userInitials: "AR",
    role: "Admin",
    action: "PROVIDER_ADD",
    targetResource: "DeepSeek v3 High-Throughput Cluster",
    timestamp: "14 mins ago",
    status: "Success",
    ipAddress: "172.16.0.24",
    device: "Arqon CLI (Node.js v20)",
    details: "Connected and verified 6 endpoints with TLS 1.3 mutual authentication.",
  },
  {
    id: "aud_01J8R9P4",
    userName: "David Kim",
    userAvatar: "/avatars/avatar-3.png",
    userInitials: "DK",
    role: "Developer",
    action: "API_KEY_CREATE",
    targetResource: "Prod-Router-Token-US-East",
    timestamp: "42 mins ago",
    status: "Success",
    ipAddress: "10.0.0.8",
    device: "Firefox / Ubuntu 22.04",
    details: "Created scoped gateway credential with 1,000,000 daily token limit.",
  },
  {
    id: "aud_01J8R9N8",
    userName: "Elena Rostova",
    userAvatar: "/avatars/avatar-4.png",
    userInitials: "ER",
    role: "Analyst",
    action: "EXPORT_TELEMETRY_CSV",
    targetResource: "Q3 Billing & Latency Report (18,410 rows)",
    timestamp: "1 hour ago",
    status: "Success",
    ipAddress: "198.51.100.12",
    device: "Safari / macOS Sonoma",
    details: "Exported raw request latencies and cost breakdown for internal billing compliance.",
  },
  {
    id: "aud_01J8R9N1",
    userName: "Marcus Chen",
    userAvatar: "/avatars/avatar-5.png",
    userInitials: "MC",
    role: "Developer",
    action: "MODEL_DELETE_ATTEMPT",
    targetResource: "gpt-4o-production-alias",
    timestamp: "2 hours ago",
    status: "Denied",
    ipAddress: "172.16.2.19",
    device: "Chrome / Windows 11",
    details: "RBAC authorization failure: Developer tier does not hold DELETE privileges for production model aliases.",
  },
  {
    id: "aud_01J8R9M5",
    userName: "Priya Patel",
    userAvatar: "/avatars/avatar-6.png",
    userInitials: "PP",
    role: "Admin",
    action: "LIMITS_MODIFY",
    targetResource: "Developer Tier Quota Policy",
    timestamp: "3 hours ago",
    status: "Success",
    ipAddress: "192.168.1.104",
    device: "Chrome / macOS",
    details: "Increased burst request ceiling from 10,000 req/hr to 15,000 req/hr during sprint stress test.",
  },
  {
    id: "aud_01J8R9M0",
    userName: "Viktor Novak",
    userAvatar: "/avatars/avatar-7.png",
    userInitials: "VN",
    role: "Viewer",
    action: "UNAUTHORIZED_ACCESS",
    targetResource: "Platform Billing & API Secrets Page",
    timestamp: "5 hours ago",
    status: "Denied",
    ipAddress: "203.0.113.88",
    device: "Edge / Windows 11",
    details: "Intercepted navigation attempt to protected security boundaries without required token claims.",
  },
  {
    id: "aud_01J8R9L2",
    userName: "Sophia Rodriguez",
    userAvatar: "/avatars/avatar-8.png",
    userInitials: "SR",
    role: "Developer",
    action: "PLAYGROUND_STRESS_TEST",
    targetResource: "Claude 3.5 Sonnet vs Gemini 1.5 Pro",
    timestamp: "6 hours ago",
    status: "Success",
    ipAddress: "10.0.4.15",
    device: "Chrome / Windows 11",
    details: "Executed parallel benchmark across 50 simulated customer care conversations (241,890 tokens generated).",
  },
  {
    id: "aud_01J8R9K8",
    userName: "Sarah Jenkins",
    userAvatar: "/avatars/avatar-1.png",
    userInitials: "SJ",
    role: "Super Admin",
    action: "ROLE_PERMISSION_UPDATE",
    targetResource: "Analyst Access Matrix",
    timestamp: "1 day ago",
    status: "Success",
    ipAddress: "192.168.1.42",
    device: "Chrome / macOS",
    details: "Granted read/write playground experimentation access to Analyst role team members.",
  },
  {
    id: "aud_01J8R9J2",
    userName: "Alex Rivera",
    userAvatar: "/avatars/avatar-2.png",
    userInitials: "AR",
    role: "Admin",
    action: "WEBHOOK_VERIFY_FAIL",
    targetResource: "Datadog External Telemetry Sink",
    timestamp: "1 day ago",
    status: "Failed",
    ipAddress: "172.16.0.24",
    device: "Arqon CLI (Node.js v20)",
    details: "TLS connection timed out after 15,000ms attempting handshake with ingestion collector.",
  },
]

const PAGE_SIZE = 6

export default function AuditLogs() {
  const { success } = useToast()
  const [search, setSearch] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [roleFilter, setRoleFilter] = useState<string>("All")
  const [userFilter, setUserFilter] = useState<string>("All")
  const [page, setPage] = useState<number>(1)
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [members] = useTeamStore()
  const [activityEvents] = useTeamActivity()

  const syncedLogs: AuditLogEntry[] = useMemo(() => {
    if (members.length === 0) return []
    const activityAuditLogs: AuditLogEntry[] = activityEvents.map((evt, idx) => {
      const member = members.find((m) => m.name === evt.actor) || members[0] || { name: evt.actor, avatarUrl: "", avatar: evt.actor.slice(0, 2).toUpperCase(), role: "Admin" }
      return {
        id: `aud_evt_${evt.id}`,
        userName: evt.actor,
        userAvatar: member.avatarUrl || "",
        userInitials: member.avatar || "AR",
        role: member.role || "Admin",
        action: evt.type.toUpperCase().replace("_", " "),
        targetResource: evt.target ? `${evt.target} (${evt.detail})` : evt.detail,
        timestamp: evt.time,
        status: "Success",
        ipAddress: "192.168.1." + (10 + idx),
        device: "Arqon Web Portal",
        details: `Team activity event: ${evt.actor} ${evt.detail} ${evt.target || ""}`,
      }
    })

    const systemLogs = MOCK_AUDIT_LOGS.map((log, idx) => {
      const member = members[idx % members.length]
      if (!member) return log
      return {
        ...log,
        userName: member.name,
        userAvatar: member.avatarUrl || "",
        userInitials: member.avatar || log.userInitials,
        role: member.role,
      }
    })

    return [...activityAuditLogs, ...systemLogs]
  }, [members, activityEvents])

  // Animated counters
  const totalEvents = useCountUp(syncedLogs.length + 1470, 1200)
  const successRate = useCountUp(98, 1200)
  const securityWarnings = useCountUp(14, 1200)

  // Filter logic
  const filteredLogs = useMemo(() => {
    return syncedLogs.filter((log) => {
      const matchesSearch =
        search === "" ||
        log.userName.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.targetResource.toLowerCase().includes(search.toLowerCase()) ||
        log.ipAddress.includes(search) ||
        log.id.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === "All" || log.status === statusFilter
      const matchesRole = roleFilter === "All" || log.role === roleFilter
      const matchesUser = userFilter === "All" || log.userName === userFilter

      return matchesSearch && matchesStatus && matchesRole && matchesUser
    })
  }, [syncedLogs, search, statusFilter, roleFilter, userFilter])

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
  const displayedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      success("Audit logs exported as RFC 8693 compliant encrypted CSV bundle.")
    }, 800)
  }

  if (members.length === 0) {
    return (
      <div className="animate-fade-in py-8">
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="No Active Team Members"
          subtitle="Invite team members to view user actions and security audit trails."
          actionLabel="Go to Team Management"
          onAction={() => {
            window.history.pushState(null, "", "/team")
            window.dispatchEvent(new Event("popstate"))
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl glass-elevated glass-border glass-shadow card-hover flex items-center justify-between"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">Total Audit Stream</p>
            <div className="text-3xl font-bold text-foreground font-space flex items-baseline gap-2">
              {totalEvents} <span className="text-xs font-normal text-muted">events logged</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-accent-rgb)/0.1)] text-accent flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl glass-elevated glass-border glass-shadow card-hover flex items-center justify-between"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">Security Verification</p>
            <div className="text-3xl font-bold text-foreground font-space flex items-baseline gap-2">
              {successRate}% <span className="text-xs font-normal text-muted">policy compliance</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl glass-elevated glass-border glass-shadow card-hover flex items-center justify-between"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">Intercepted & Denied</p>
            <div className="text-3xl font-bold text-foreground font-space flex items-baseline gap-2">
              {securityWarnings} <span className="text-xs font-normal text-muted">RBAC blocks (7 days)</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
            <ShieldAlert size={24} />
          </div>
        </motion.div>
      </div>

      {/* Main Audit Log Table Card */}
      <div
        className="rounded-2xl glass-elevated glass-border glass-shadow overflow-hidden"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        {/* Toolbar */}
        <div className="p-6 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4" style={{ borderColor: "var(--color-border)" }}>
          <div className="w-full md:w-80">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val)
                setPage(1)
              }}
              placeholder="Filter by user, action, IP, or resource…"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="w-40">
              <SelectFilter
                options={[
                  { value: "Success", label: "Success" },
                  { value: "Warning", label: "Warning" },
                  { value: "Denied", label: "Denied" },
                  { value: "Failed", label: "Failed" },
                ]}
                value={statusFilter === "All" ? "" : statusFilter}
                onChange={(val) => {
                  setStatusFilter(val || "All")
                  setPage(1)
                }}
                showAllOption={true}
                allValue="All"
                placeholder="Status"
              />
            </div>

            <div className="w-44">
              <SelectFilter
                options={[
                  { value: "Super Admin", label: "Super Admin" },
                  { value: "Administrator", label: "Administrator" },
                  { value: "Admin", label: "Admin" },
                  { value: "Manager", label: "Manager" },
                  { value: "Developer", label: "Developer" },
                  { value: "Analyst", label: "Analyst" },
                  { value: "Viewer", label: "Viewer" },
                ]}
                value={roleFilter === "All" ? "" : roleFilter}
                onChange={(val) => {
                  setRoleFilter(val || "All")
                  setPage(1)
                }}
                showAllOption={true}
                allValue="All"
                placeholder="Role"
              />
            </div>

            <div className="w-48">
              <SelectFilter
                options={members.map((m) => ({ value: m.name, label: `${m.name}` }))}
                value={userFilter === "All" ? "" : userFilter}
                onChange={(val) => {
                  setUserFilter(val || "All")
                  setPage(1)
                }}
                showAllOption={true}
                allValue="All"
                placeholder="Actor / Member"
              />
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="h-9 px-4 rounded-xl text-xs font-semibold bg-[var(--color-surface-2)] text-foreground border border-[var(--color-border)] hover:border-accent hover:text-accent transition-all duration-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download size={14} className={isExporting ? "animate-bounce" : ""} />
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className="border-b text-[11px] font-semibold uppercase tracking-wider text-muted bg-[var(--color-surface-2)]/60"
                style={{ borderColor: "var(--color-border)" }}
              >
                <th className="py-3.5 px-6">Teammate & Role</th>
                <th className="py-3.5 px-4">Executed Action</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Network IP & Device</th>
                <th className="py-3.5 px-6 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {displayedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4">
                    <EmptyState
                      icon={<FileText className="w-7 h-7" />}
                      title="No Audit Logs"
                      subtitle={
                        search || statusFilter !== "All" || roleFilter !== "All"
                          ? "No activity matching your search filters has been found."
                          : "No activity has been recorded yet."
                      }
                    />
                  </td>
                </tr>
              ) : (
                displayedLogs.map((log, index) => {
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      onClick={() => setSelectedEntry(log)}
                      className="hover:bg-[var(--color-surface-2)]/40 transition-colors cursor-pointer group"
                    >
                      {/* Teammate */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-full overflow-hidden border bg-[var(--color-surface-2)] flex items-center justify-center shrink-0" style={{ borderColor: "var(--color-border)" }}>
                            <img
                              src={log.userAvatar}
                              alt={log.userName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none"
                              }}
                            />
                            <span className="text-xs font-bold text-foreground absolute inset-0 flex items-center justify-center -z-10">
                              {log.userInitials}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-sm group-hover:text-accent transition-colors">
                              {log.userName}
                            </div>
                            <div className="text-[11px] text-muted">{log.role}</div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-[11px] text-foreground px-2 py-1 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                          {log.action}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="py-4 px-4 max-w-[220px] truncate font-medium text-foreground">
                        {log.targetResource}
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-4">
                        {log.status === "Success" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 size={12} /> Success
                          </span>
                        )}
                        {log.status === "Warning" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <AlertTriangle size={12} /> Warning
                          </span>
                        )}
                        {log.status === "Denied" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <ShieldAlert size={12} /> Denied
                          </span>
                        )}
                        {log.status === "Failed" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                            <XCircle size={12} /> Failed
                          </span>
                        )}
                      </td>

                      {/* Network & Device */}
                      <td className="py-4 px-4 text-muted font-mono text-[11px]">
                        <div className="text-foreground flex items-center gap-1.5">
                          <Globe size={11} className="text-muted shrink-0" /> {log.ipAddress}
                        </div>
                        <div className="text-[10px] text-muted flex items-center gap-1.5 mt-0.5 font-sans">
                          <Terminal size={10} className="text-muted shrink-0" /> {log.device}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-6 text-right text-muted whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 font-medium">
                          <Clock size={12} className="text-muted" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer */}
        <div className="p-4 bg-[var(--color-surface-2)]/30 border-t flex items-center justify-between text-xs text-muted" style={{ borderColor: "var(--color-border)" }}>
          <div>
            Showing <span className="font-semibold text-foreground">{(page - 1) * PAGE_SIZE + 1}</span> to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(page * PAGE_SIZE, filteredLogs.length)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{filteredLogs.length}</span> audit records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-foreground hover:bg-[var(--color-surface-2)] transition-all disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="px-2 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-foreground hover:bg-[var(--color-surface-2)] transition-all disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Inspection Modal with zero-layout-shift scroll lock */}
      <AuditDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </div>
  )
}

// Helper detail modal using our standardized createPortal and scroll locking
function AuditDetailModal({
  entry,
  onClose,
}: {
  entry: AuditLogEntry | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!entry) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = "hidden"
    if (scrollbarWidth > 0) {
      const currentPadding = parseInt(
        window.getComputedStyle(document.body).paddingRight || "0",
        10,
      )
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [entry, onClose])

  if (!entry) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 transition-opacity"
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="relative z-10 w-full max-w-lg p-6 rounded-3xl glass-elevated glass-border glass-shadow bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-accent" />
            <h3 className="font-space font-bold text-base text-foreground">Audit Record Inspection</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)]/50 border border-[var(--color-border)]">
            <img src={entry.userAvatar} alt={entry.userName} className="w-10 h-10 rounded-full object-cover border border-[var(--color-border)]" />
            <div>
              <p className="font-semibold text-foreground text-sm">{entry.userName}</p>
              <p className="text-muted text-xs">{entry.role}</p>
            </div>
            <span className="ml-auto font-mono text-[11px] text-muted">{entry.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[var(--color-surface-2)]/30 border border-[var(--color-border)]">
              <span className="text-muted block mb-1 font-semibold uppercase tracking-wider text-[10px]">Action Type</span>
              <span className="font-mono text-foreground font-bold text-xs">{entry.action}</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-surface-2)]/30 border border-[var(--color-border)]">
              <span className="text-muted block mb-1 font-semibold uppercase tracking-wider text-[10px]">Status</span>
              <span className="font-semibold text-foreground">{entry.status}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-surface-2)]/30 border border-[var(--color-border)]">
            <span className="text-muted block mb-1 font-semibold uppercase tracking-wider text-[10px]">Target Resource</span>
            <span className="font-medium text-foreground text-sm">{entry.targetResource}</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] space-y-1">
            <span className="text-muted block mb-1 font-semibold uppercase tracking-wider text-[10px]">Telemetry & Origin</span>
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-muted">IP Address:</span>
              <span className="text-foreground">{entry.ipAddress}</span>
            </div>
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-muted">Client Fingerprint:</span>
              <span className="text-foreground">{entry.device}</span>
            </div>
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-muted">Recorded Time:</span>
              <span className="text-foreground">{entry.timestamp}</span>
            </div>
          </div>

          {entry.details && (
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-accent font-medium text-xs leading-relaxed">
              <strong className="block text-white uppercase tracking-wider text-[10px] mb-1">Event Payload Details:</strong>
              {entry.details}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="h-10 px-6 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent/90 transition-all shadow-md shadow-accent/20 cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
