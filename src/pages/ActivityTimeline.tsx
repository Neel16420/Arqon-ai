/**
 * ActivityTimeline.tsx — Enterprise Chronological Ecosystem Event Stream
 *
 * Displays a visual, animated timeline of platform occurrences including provider
 * mutations, API key operations, routing adaptations, and RBAC seat changes.
 */

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  History,
  Server,
  Key,
  Layers,
  GitBranch,
  UserPlus,
  Shield,
  LogIn,
  LogOut,
  Trash2,
  Sparkles,
  Clock,
} from "lucide-react"
import { useCountUp } from "../motion/useCountUp"
import { SearchInput } from "../components/SearchInput"
import { EmptyState } from "../components/EmptyState"
import { useTeamStore, useTeamActivity } from "../store/team"
import { Users } from "lucide-react"

type ActivityCategory = "All" | "Providers" | "API Keys" | "Orchestration" | "Team & Access"

interface TimelineEvent {
  id: string
  eventType:
    | "Provider Added"
    | "Provider Deleted"
    | "API Key Created"
    | "API Key Deleted"
    | "Model Added"
    | "Routing Changed"
    | "User Invited"
    | "User Removed"
    | "Role Changed"
    | "Login"
    | "Logout"
  category: ActivityCategory
  title: string
  description: string
  timestamp: string
  exactTime: string
  user: {
    name: string
    role: string
    avatar: string
    initials: string
  }
  iconColor: string
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "evt_01",
    eventType: "Routing Changed",
    category: "Orchestration",
    title: "Primary Failover Chain Reconfigured",
    description: "Promoted Groq LLaMA-3 70B to Priority 1 above OpenAI due to downstream rate limit latency spikes.",
    timestamp: "2 mins ago",
    exactTime: "14:48:10 UTC",
    user: { name: "Sarah Jenkins", role: "Super Admin", avatar: "/avatars/avatar-1.png", initials: "SJ" },
    iconColor: "bg-blue-500 text-white shadow-blue-500/30",
  },
  {
    id: "evt_02",
    eventType: "Provider Added",
    category: "Providers",
    title: "Connected DeepSeek Enterprise Cluster",
    description: "Successfully added DeepSeek API credential with 3 model endpoints enabled for production traffic.",
    timestamp: "18 mins ago",
    exactTime: "14:32:04 UTC",
    user: { name: "Alex Rivera", role: "Admin", avatar: "/avatars/avatar-2.png", initials: "AR" },
    iconColor: "bg-emerald-500 text-white shadow-emerald-500/30",
  },
  {
    id: "evt_03",
    eventType: "API Key Created",
    category: "API Keys",
    title: "Issued Production Router Secret",
    description: "Created token key 'prod-us-east-router' with 1,500,000 daily token limit assigned to Service Accounts.",
    timestamp: "1 hour ago",
    exactTime: "13:50:22 UTC",
    user: { name: "David Kim", role: "Developer", avatar: "/avatars/avatar-3.png", initials: "DK" },
    iconColor: "bg-purple-500 text-white shadow-purple-500/30",
  },
  {
    id: "evt_04",
    eventType: "Model Added",
    category: "Orchestration",
    title: "Registered Claude 3.5 Haiku Endpoint",
    description: "Added anthropic/claude-3-5-haiku-20241022 to the active catalog with tool-calling capabilities enabled.",
    timestamp: "3 hours ago",
    exactTime: "11:15:40 UTC",
    user: { name: "Priya Patel", role: "Admin", avatar: "/avatars/avatar-6.png", initials: "PP" },
    iconColor: "bg-indigo-500 text-white shadow-indigo-500/30",
  },
  {
    id: "evt_05",
    eventType: "Role Changed",
    category: "Team & Access",
    title: "Promoted Marcus Chen to Developer Tier",
    description: "Updated RBAC permissions for marcus.chen@arqon.ai from Viewer to Developer tier.",
    timestamp: "5 hours ago",
    exactTime: "09:44:12 UTC",
    user: { name: "Sarah Jenkins", role: "Super Admin", avatar: "/avatars/avatar-1.png", initials: "SJ" },
    iconColor: "bg-amber-500 text-white shadow-amber-500/30",
  },
  {
    id: "evt_06",
    eventType: "User Invited",
    category: "Team & Access",
    title: "Invited Sophia Rodriguez (Developer)",
    description: "Dispatched enterprise onboarding invitation via email with pre-assigned Developer RBAC scope.",
    timestamp: "7 hours ago",
    exactTime: "07:22:19 UTC",
    user: { name: "Alex Rivera", role: "Admin", avatar: "/avatars/avatar-2.png", initials: "AR" },
    iconColor: "bg-teal-500 text-white shadow-teal-500/30",
  },
  {
    id: "evt_07",
    eventType: "Provider Deleted",
    category: "Providers",
    title: "Removed Legacy Azure OpenAI Region",
    description: "Revoked credentials and untethered Azure East US 2 cluster following sunsetting of preview deployments.",
    timestamp: "12 hours ago",
    exactTime: "02:10:05 UTC",
    user: { name: "Sarah Jenkins", role: "Super Admin", avatar: "/avatars/avatar-1.png", initials: "SJ" },
    iconColor: "bg-red-500 text-white shadow-red-500/30",
  },
  {
    id: "evt_08",
    eventType: "API Key Deleted",
    category: "API Keys",
    title: "Revoked Compromised Staging Secret",
    description: "Permanently deleted gateway token 'stg-debug-token' after potential leak in development CI/CD pipeline.",
    timestamp: "1 day ago",
    exactTime: "Yesterday at 22:40",
    user: { name: "David Kim", role: "Developer", avatar: "/avatars/avatar-3.png", initials: "DK" },
    iconColor: "bg-rose-600 text-white shadow-rose-600/30",
  },
  {
    id: "evt_09",
    eventType: "Login",
    category: "Team & Access",
    title: "Elena Rostova Authenticated Session",
    description: "Successful SSO challenge and MFA validation from 198.51.100.12 (Safari / macOS Sonoma).",
    timestamp: "1 day ago",
    exactTime: "Yesterday at 18:12",
    user: { name: "Elena Rostova", role: "Analyst", avatar: "/avatars/avatar-4.png", initials: "ER" },
    iconColor: "bg-sky-500 text-white shadow-sky-500/30",
  },
  {
    id: "evt_10",
    eventType: "Logout",
    category: "Team & Access",
    title: "Viktor Novak Ended Session",
    description: "Terminated active gateway JWT claims and cleared local session tokens.",
    timestamp: "2 days ago",
    exactTime: "Aug 30 at 17:00",
    user: { name: "Viktor Novak", role: "Viewer", avatar: "/avatars/avatar-7.png", initials: "VN" },
    iconColor: "bg-gray-500 text-white shadow-gray-500/30",
  },
]

export default function ActivityTimeline() {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>("All")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [members] = useTeamStore()
  const [activityEvents] = useTeamActivity()

  const syncedEvents: TimelineEvent[] = useMemo(() => {
    if (members.length === 0) return []
    const converted: TimelineEvent[] = activityEvents.map((evt) => {
      const member = members.find((m) => m.name === evt.actor) || members[0]
      return {
        id: `syn_${evt.id}`,
        eventType: evt.type === "remove" ? "User Removed" : evt.type === "invite" ? "User Invited" : "Role Changed",
        category: "Team & Access",
        title: `${evt.actor} ${evt.detail}`,
        description: `Team access modification on resource target: ${evt.target || "Organization workspace"}.`,
        timestamp: evt.time,
        exactTime: `${evt.time}`,
        user: {
          name: member ? member.name : evt.actor,
          role: member ? member.role : "Admin",
          avatar: member ? member.avatarUrl || "" : "",
          initials: member ? member.avatar || "AC" : "AC",
        },
        iconColor: evt.type === "remove" ? "bg-red-500 text-white shadow-red-500/30" : "bg-purple-500 text-white shadow-purple-500/30",
      }
    })

    const syncedDefaults: TimelineEvent[] = TIMELINE_EVENTS.map((evt, idx) => {
      const member = members[idx % members.length]
      if (!member) return evt
      return {
        ...evt,
        user: {
          name: member.name,
          role: member.role,
          avatar: member.avatarUrl || "",
          initials: member.avatar || evt.user.initials,
        },
      }
    })

    return [...converted, ...syncedDefaults]
  }, [members, activityEvents])

  // Animated header stats
  const total24h = useCountUp(syncedEvents.length + 112, 1200)
  const activeUsersCount = useCountUp(members.length, 1200)
  const mutationsCount = useCountUp(activityEvents.length + 14, 1200)

  const filteredEvents = useMemo(() => {
    return syncedEvents.filter((evt) => {
      const matchesCat = selectedCategory === "All" || evt.category === selectedCategory
      const matchesSearch =
        searchQuery === "" ||
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCat && matchesSearch
    })
  }, [syncedEvents, selectedCategory, searchQuery])

  const getEventIcon = (eventType: TimelineEvent["eventType"]) => {
    switch (eventType) {
      case "Provider Added":
        return <Server size={15} />
      case "Provider Deleted":
        return <Trash2 size={15} />
      case "API Key Created":
        return <Key size={15} />
      case "API Key Deleted":
        return <Trash2 size={15} />
      case "Model Added":
        return <Layers size={15} />
      case "Routing Changed":
        return <GitBranch size={15} />
      case "User Invited":
        return <UserPlus size={15} />
      case "Role Changed":
        return <Shield size={15} />
      case "Login":
        return <LogIn size={15} />
      case "Logout":
        return <LogOut size={15} />
      default:
        return <Clock size={15} />
    }
  }

  const categories: ActivityCategory[] = ["All", "Providers", "API Keys", "Orchestration", "Team & Access"]

  if (members.length === 0) {
    return (
      <div className="animate-fade-in py-8">
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="No Active Team Members"
          subtitle="Invite teammates to track system mutations and organizational events."
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
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">24h Ecosystem Events</p>
            <div className="text-3xl font-bold text-foreground font-space flex items-baseline gap-2">
              {total24h} <span className="text-xs font-normal text-muted">actions recorded</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-accent-rgb)/0.1)] text-accent flex items-center justify-center shrink-0">
            <History size={24} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl glass-elevated glass-border glass-shadow card-hover flex items-center justify-between"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">Active Operators</p>
            <div className="text-3xl font-bold text-foreground font-space flex items-baseline gap-2">
              {activeUsersCount} <span className="text-xs font-normal text-muted">teammates in studio</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <UserPlus size={24} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl glass-elevated glass-border glass-shadow card-hover flex items-center justify-between"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">System Mutations</p>
            <div className="text-3xl font-bold text-foreground font-space flex items-baseline gap-2">
              {mutationsCount} <span className="text-xs font-normal text-muted">config changes today</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <GitBranch size={24} />
          </div>
        </motion.div>
      </div>

      {/* Main Timeline Card Container */}
      <div
        className="rounded-2xl glass-elevated glass-border glass-shadow p-6 md:p-8"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        {/* Toolbar & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-8 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <h2 className="text-lg font-bold text-foreground font-space flex items-center gap-2">
              <Sparkles size={18} className="text-accent" /> Chronological Activity Feed
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Review real-time administrative actions, gateway operations, and access events from across your organization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="w-full sm:w-72">
              <SearchInput
                value={searchQuery}
                onChange={(val) => setSearchQuery(val)}
                placeholder="Search timeline events or users…"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-accent text-white shadow-md shadow-accent/20"
                        : "bg-[var(--color-surface-2)] text-muted hover:text-foreground border border-[var(--color-border)]"
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Vertical Timeline Structure */}
        <div className="pt-8 relative max-w-4xl mx-auto">
          {/* Vertical connecting neon guideline */}
          <div
            className="absolute top-12 bottom-12 left-6 sm:left-40 w-0.5 bg-gradient-to-b from-accent via-accent/40 to-transparent -z-0"
            aria-hidden="true"
          />

          {filteredEvents.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={<History className="w-7 h-7" />}
                title="No Timeline Events"
                subtitle={
                  searchQuery || selectedCategory !== "All"
                    ? "No timeline activities match your current search filters."
                    : "No activity has been recorded yet."
                }
              />
            </div>
          ) : (
            <div className="space-y-8 relative z-10">
              {filteredEvents.map((evt, idx) => {
                return (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 group"
                  >
                    {/* Timestamp column on Desktop */}
                    <div className="hidden sm:block w-32 text-right shrink-0 pt-1">
                      <span className="text-xs font-bold text-foreground block group-hover:text-accent transition-colors">
                        {evt.timestamp}
                      </span>
                      <span className="text-[10px] font-mono text-muted mt-0.5 block">{evt.exactTime}</span>
                    </div>

                    {/* Node Circular Icon */}
                    <div className="flex items-center gap-3 sm:gap-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg ring-4 ring-[var(--color-surface)] transition-transform duration-200 group-hover:scale-110 ${evt.iconColor}`}
                      >
                        {getEventIcon(evt.eventType)}
                      </div>

                      {/* Timestamp inline on mobile only */}
                      <div className="sm:hidden">
                        <span className="text-xs font-bold text-foreground block">{evt.timestamp}</span>
                        <span className="text-[10px] font-mono text-muted">{evt.exactTime}</span>
                      </div>
                    </div>

                    {/* Content Card */}
                    <div
                      className="flex-1 p-5 rounded-2xl bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] hover:border-accent/40 transition-all duration-200 card-hover space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--color-border)" }}>
                        <div>
                          <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[var(--color-surface)] text-accent border border-accent/20 mb-1">
                            {evt.eventType}
                          </span>
                          <h4 className="text-sm font-bold text-foreground font-space group-hover:text-accent transition-colors">
                            {evt.title}
                          </h4>
                        </div>

                        {/* User Pill */}
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] self-start sm:self-auto shrink-0">
                          <img
                            src={evt.user.avatar}
                            alt={evt.user.name}
                            className="w-5 h-5 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none"
                            }}
                          />
                          <span className="text-xs font-medium text-foreground">{evt.user.name}</span>
                          <span className="text-[10px] text-muted font-mono">({evt.user.role})</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted leading-relaxed font-sans">{evt.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
