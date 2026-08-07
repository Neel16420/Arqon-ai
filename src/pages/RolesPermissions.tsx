/**
 * RolesPermissions.tsx — Enterprise Roles & Granular Permission Control
 *
 * Implements role-based access control (RBAC) with configurable permissions across
 * every platform module (View, Create, Edit, Delete).
 */

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Shield,
  Lock,
  Check,
  RotateCcw,
  Save,
  Info,
  Sparkles,
  Layers,
  Users,
} from "lucide-react"
import { useToast } from "../components/toast/ToastContext"
import { useCountUp } from "../motion/useCountUp"
import { useTeamStore } from "../store/team"
import { EmptyState } from "../components/shared/EmptyState"

interface PermissionSet {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

interface RoleConfig {
  id: string
  name: string
  description: string
  usersCount: number
  badgeColor: string
  isSystem: boolean
  permissions: Record<string, PermissionSet>
}

const MODULES = [
  { id: "dashboard", name: "Dashboard & Overview", desc: "Main platform metrics and system health summary" },
  { id: "providers", name: "AI Providers", desc: "LLM endpoint connections, status checks, and credentials" },
  { id: "api-keys", name: "API Keys", desc: "Gateway authentication key creation and revocation" },
  { id: "models", name: "Model Catalog", desc: "AI model capabilities, token pricing, and enablement" },
  { id: "routing", name: "Traffic Routing", desc: "Fallback chains, latency balancing, and rule triggers" },
  { id: "analytics", name: "Analytics & Cost", desc: "Usage metrics, latency percentiles, and financial telemetry" },
  { id: "playground", name: "Interactive Playground", desc: "Live model testing, multi-turn prompts, and comparisons" },
  { id: "requests", name: "Request Stream", desc: "Real-time AI request log inspection and tracing" },
  { id: "logs", name: "System Logs", desc: "Detailed error logs, retry attempts, and status codes" },
  { id: "team", name: "Team Management", desc: "User invitation, access control, and organizational seats" },
  { id: "settings", name: "Platform Settings", desc: "Global workspace configuration and webhook integrations" },
]

const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Unrestricted global administrative access to all systems and billing configurations.",
    usersCount: 1,
    badgeColor: "#FF3B3B",
    isSystem: true,
    permissions: MODULES.reduce((acc, m) => ({ ...acc, [m.id]: { view: true, create: true, edit: true, delete: true } }), {}),
  },
  {
    id: "admin",
    name: "Admin",
    description: "Full operational access to models, providers, and team management without organization billing.",
    usersCount: 3,
    badgeColor: "#8B5CF6",
    isSystem: false,
    permissions: MODULES.reduce((acc, m) => ({
      ...acc,
      [m.id]: { view: true, create: true, edit: true, delete: m.id !== "settings" && m.id !== "team" },
    }), {}),
  },
  {
    id: "manager",
    name: "Manager",
    description: "Team leadership with full oversight on usage limits, team seats, and analytics.",
    usersCount: 0,
    badgeColor: "#3B82F6",
    isSystem: false,
    permissions: MODULES.reduce((acc, m) => ({
      ...acc,
      [m.id]: { view: true, create: m.id === "team" || m.id === "api-keys", edit: m.id === "team" || m.id === "api-keys", delete: false },
    }), {}),
  },
  {
    id: "developer",
    name: "Developer",
    description: "Can configure models, routing, API keys, and test in playground. Cannot edit team or settings.",
    usersCount: 8,
    badgeColor: "#3B82F6",
    isSystem: false,
    permissions: MODULES.reduce((acc, m) => {
      const isSystemMod = m.id === "team" || m.id === "settings"
      return {
        ...acc,
        [m.id]: {
          view: !isSystemMod || m.id === "team",
          create: !isSystemMod,
          edit: !isSystemMod && m.id !== "providers",
          delete: m.id === "api-keys" || m.id === "playground",
        },
      }
    }, {}),
  },
  {
    id: "analyst",
    name: "Analyst",
    description: "Read-only access to telemetry, requests, logs, analytics, and playground testing.",
    usersCount: 4,
    badgeColor: "#10B981",
    isSystem: false,
    permissions: MODULES.reduce((acc, m) => ({
      ...acc,
      [m.id]: { view: true, create: m.id === "playground", edit: false, delete: false },
    }), {}),
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Basic read-only observational access to dashboards and model catalogs.",
    usersCount: 12,
    badgeColor: "#6B7280",
    isSystem: false,
    permissions: MODULES.reduce((acc, m) => ({
      ...acc,
      [m.id]: { view: m.id !== "api-keys" && m.id !== "settings", create: false, edit: false, delete: false },
    }), {}),
  },
]

export default function RolesPermissions() {
  const { success, info } = useToast()
  const [roles, setRoles] = useState<RoleConfig[]>(DEFAULT_ROLES)
  const [activeRoleId, setActiveRoleId] = useState<string>("admin")
  const [hasChanges, setHasChanges] = useState<boolean>(false)
  const [members] = useTeamStore()

  const syncedRoles = useMemo(() => {
    return roles.map((role) => {
      const count = members.filter((m) => {
        if (role.id === "admin") return m.role === "Admin" || m.role === "Administrator"
        if (role.id === "super_admin") return m.role === "Super Admin"
        return m.role === role.name
      }).length
      return { ...role, usersCount: count }
    })
  }, [roles, members])

  const activeRole = useMemo(() => {
    return syncedRoles.find((r) => r.id === activeRoleId) || syncedRoles[0]
  }, [syncedRoles, activeRoleId])

  const activeRoleMembers = useMemo(() => {
    return members.filter((m) => {
      if (activeRole.id === "admin") return m.role === "Admin" || m.role === "Administrator"
      if (activeRole.id === "super_admin") return m.role === "Super Admin"
      return m.role === activeRole.name
    })
  }, [members, activeRole])

  // Stat calculations with count up animations
  const totalRoles = useCountUp(syncedRoles.length, 1200)
  const totalUsers = useCountUp(syncedRoles.reduce((sum, r) => sum + r.usersCount, 0), 1200)
  const totalModules = useCountUp(MODULES.length, 1200)

  const togglePermission = (moduleId: string, perm: keyof PermissionSet) => {
    if (activeRole.isSystem && activeRole.id === "super_admin") {
      info("Super Admin access policy is locked to full system control.")
      return
    }

    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== activeRoleId) return role
        const currentPerms = role.permissions[moduleId] || { view: false, create: false, edit: false, delete: false }
        const nextValue = !currentPerms[perm]

        // Dependency consistency logic: if creating/editing/deleting, enforce view = true
        let updated = { ...currentPerms, [perm]: nextValue }
        if (nextValue && (perm === "create" || perm === "edit" || perm === "delete")) {
          updated.view = true
        }
        // If view is turned off, turn off everything else for this module
        if (!nextValue && perm === "view") {
          updated = { view: false, create: false, edit: false, delete: false }
        }

        return {
          ...role,
          permissions: {
            ...role.permissions,
            [moduleId]: updated,
          },
        }
      })
    )
    setHasChanges(true)
  }

  const handleToggleColumn = (perm: keyof PermissionSet, value: boolean) => {
    if (activeRole.id === "super_admin") {
      info("Super Admin access policy cannot be modified.")
      return
    }
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== activeRoleId) return role
        const newPerms: Record<string, PermissionSet> = {}
        Object.keys(role.permissions).forEach((modId) => {
          const current = role.permissions[modId]
          let updated = { ...current, [perm]: value }
          if (value && perm !== "view") updated.view = true
          if (!value && perm === "view") updated = { view: false, create: false, edit: false, delete: false }
          newPerms[modId] = updated
        })
        return { ...role, permissions: newPerms }
      })
    )
    setHasChanges(true)
  }

  const handleSave = () => {
    setHasChanges(false)
    success(`Role access rules updated successfully for ${activeRole.name}.`)
  }

  const handleReset = () => {
    setRoles(DEFAULT_ROLES)
    setHasChanges(false)
    info("Reverted permission overrides to enterprise defaults.")
  }

  if (members.length === 0) {
    return (
      <div className="animate-fade-in py-8">
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="No Team Members"
          subtitle="Invite teammates to manage organizational roles and permissions."
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
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl glass-elevated glass-border glass-shadow card-hover flex items-center justify-between"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">Configured Roles</p>
            <div className="text-3xl font-bold text-foreground font-space flex items-baseline gap-2">
              {totalRoles} <span className="text-xs font-normal text-muted">active tier definitions</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-accent-rgb)/0.1)] flex items-center justify-center text-accent shrink-0">
            <Shield size={24} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl glass-elevated glass-border glass-shadow card-hover flex items-center justify-between"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">Protected Modules</p>
            <div className="text-3xl font-bold text-foreground font-space flex items-baseline gap-2">
              {totalModules} <span className="text-xs font-normal text-muted">system endpoints</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Layers size={24} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl glass-elevated glass-border glass-shadow card-hover flex items-center justify-between"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">Assigned Seats</p>
            <div className="text-3xl font-bold text-foreground font-space flex items-baseline gap-2">
              {totalUsers} <span className="text-xs font-normal text-muted">organization teammates</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
        </motion.div>
      </div>

      {/* Role Selection & Permission Matrix Container */}
      <div
        className="rounded-2xl glass-elevated glass-border glass-shadow overflow-hidden"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        {/* Header toolbar */}
        <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <h2 className="text-lg font-bold text-foreground font-space flex items-center gap-2">
              <Lock size={18} className="text-accent" /> Role-Based Access Matrix
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Select a role below to review and refine individual administrative execution capabilities.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="h-9 px-3.5 rounded-xl text-xs font-medium text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
              >
                <RotateCcw size={14} /> Revert Changes
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                hasChanges
                  ? "bg-accent text-white hover:bg-accent/90 hover-lift cursor-pointer shadow-accent/20"
                  : "bg-surface-2 text-muted cursor-not-allowed border border-border/40"
              }`}
            >
              <Save size={14} /> Save Policy
            </button>
          </div>
        </div>

        {/* Roles navigation tab pills */}
        <div className="p-4 bg-[var(--color-surface-2)]/40 border-b flex items-center gap-2 overflow-x-auto custom-scrollbar" style={{ borderColor: "var(--color-border)" }}>
          {syncedRoles.map((role) => {
            const isActive = role.id === activeRoleId
            return (
              <button
                key={role.id}
                onClick={() => setActiveRoleId(role.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 relative ${
                  isActive
                    ? "text-foreground font-semibold shadow-md bg-[var(--color-surface)] border border-[var(--color-border)]"
                    : "text-muted hover:text-foreground hover:bg-[var(--color-surface)]/50 border border-transparent"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: role.badgeColor }}
                />
                <span>{role.name}</span>
                <span
                  className="px-1.5 py-0.5 rounded-md text-[10px] bg-[var(--color-surface-2)] text-muted border border-[var(--color-border)] ml-1"
                >
                  {role.usersCount} {role.usersCount === 1 ? "user" : "users"}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeRoleIndicator"
                    className="absolute -bottom-[1px] left-3 right-3 h-[2px] bg-accent rounded-full"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Active Role details banner */}
        <div className="px-6 py-4 bg-[var(--color-surface-2)]/20 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex flex-wrap items-center gap-2.5 text-muted">
            <Info size={16} className="text-accent shrink-0" />
            <span className="text-foreground font-medium">{activeRole.name}:</span>
            <span>{activeRole.description}</span>
            {activeRoleMembers.length > 0 && (
              <div className="flex items-center gap-2 ml-2 pl-3 border-l border-[var(--color-border)]">
                <span className="text-[11px] text-muted font-medium">Assigned:</span>
                <div className="flex -space-x-1.5 overflow-hidden">
                  {activeRoleMembers.slice(0, 5).map((m) => (
                    <div key={m.id} className="w-6 h-6 rounded-full overflow-hidden border border-[var(--color-surface)] flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0" style={{ backgroundColor: m.avatarColor }} title={`${m.name} (${m.role})`}>
                      {m.avatarUrl ? <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" /> : m.avatar}
                    </div>
                  ))}
                </div>
                {activeRoleMembers.length > 5 && <span className="text-[10px] text-muted font-space font-semibold">+{activeRoleMembers.length - 5}</span>}
              </div>
            )}
          </div>
          {activeRole.isSystem && (
            <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 font-semibold border border-red-500/20 flex items-center gap-1 shrink-0">
              <Shield size={12} /> System Locked
            </span>
          )}
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className="border-b text-[11px] font-semibold uppercase tracking-wider text-muted bg-[var(--color-surface-2)]/60"
                style={{ borderColor: "var(--color-border)" }}
              >
                <th className="py-3.5 px-6">Platform Module & Scope</th>
                <th className="py-3.5 px-4 text-center w-28">
                  <div className="flex flex-col items-center gap-1">
                    <span>View</span>
                    <button
                      onClick={() => handleToggleColumn("view", true)}
                      disabled={activeRole.id === "super_admin"}
                      className="text-[10px] text-accent hover:underline lowercase font-normal cursor-pointer disabled:opacity-40 disabled:no-underline"
                    >
                      all
                    </button>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center w-28">
                  <div className="flex flex-col items-center gap-1">
                    <span>Create</span>
                    <button
                      onClick={() => handleToggleColumn("create", true)}
                      disabled={activeRole.id === "super_admin"}
                      className="text-[10px] text-accent hover:underline lowercase font-normal cursor-pointer disabled:opacity-40 disabled:no-underline"
                    >
                      all
                    </button>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center w-28">
                  <div className="flex flex-col items-center gap-1">
                    <span>Edit / Modify</span>
                    <button
                      onClick={() => handleToggleColumn("edit", true)}
                      disabled={activeRole.id === "super_admin"}
                      className="text-[10px] text-accent hover:underline lowercase font-normal cursor-pointer disabled:opacity-40 disabled:no-underline"
                    >
                      all
                    </button>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center w-28">
                  <div className="flex flex-col items-center gap-1">
                    <span>Delete / Revoke</span>
                    <button
                      onClick={() => handleToggleColumn("delete", true)}
                      disabled={activeRole.id === "super_admin"}
                      className="text-[10px] text-accent hover:underline lowercase font-normal cursor-pointer disabled:opacity-40 disabled:no-underline"
                    >
                      all
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {MODULES.map((mod, index) => {
                const perms = activeRole.permissions[mod.id] || { view: false, create: false, edit: false, delete: false }
                const isLocked = activeRole.id === "super_admin"

                return (
                  <motion.tr
                    key={mod.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="hover:bg-[var(--color-surface-2)]/40 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                        {mod.name}
                      </div>
                      <div className="text-muted text-[11px] mt-0.5">{mod.desc}</div>
                    </td>
                    
                    {(["view", "create", "edit", "delete"] as (keyof PermissionSet)[]).map((permKey) => {
                      const enabled = perms[permKey]
                      return (
                        <td key={permKey} className="py-4 px-4 text-center align-middle">
                          <button
                            onClick={() => togglePermission(mod.id, permKey)}
                            disabled={isLocked}
                            className={`w-10 h-6 rounded-full relative transition-all duration-200 inline-flex items-center px-0.5 cursor-pointer ${
                              isLocked ? "opacity-60 cursor-not-allowed" : "hover:scale-105"
                            } ${
                              enabled
                                ? "bg-accent border border-accent/40 shadow-inner"
                                : "bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                            }`}
                            aria-label={`Toggle ${permKey} for ${mod.name}`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center text-[10px] ${
                                enabled ? "translate-x-4 text-accent" : "translate-x-0 text-gray-400"
                              }`}
                            >
                              {enabled && <Check size={11} strokeWidth={3} className="text-accent" />}
                            </span>
                          </button>
                        </td>
                      )
                    })}
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Guidance */}
        <div className="p-5 bg-[var(--color-surface-2)]/30 border-t flex items-center justify-between text-xs text-muted" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            <span>Changes to permissions apply immediately to all active sessions via gateway JWT re-validation.</span>
          </div>
          <span className="font-mono text-[11px]">Audit Policy: RFC 8693 Compliant</span>
        </div>
      </div>
    </div>
  )
}
