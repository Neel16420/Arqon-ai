/**
 * UsageLimits.tsx — Enterprise Quota & Traffic Enforcement Policy
 *
 * Configures token consumption ceilings, rate limits, concurrent request bounds,
 * model/provider whitelist restrictions, and storage boundaries. Backend-ready data model.
 */

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ShieldAlert,
  Gauge,
  Sliders,
  Terminal,
  Save,
  RotateCcw,
  AlertTriangle,
  Zap,
  Server,
  Lock,
} from "lucide-react"
import { useToast } from "../components/toast/ToastContext"
import { useCountUp } from "../motion/useCountUp"
import { SelectFilter } from "../components/SelectFilter"
import { useTeamStore } from "../store/team"
import { EmptyState } from "../components/EmptyState"
import { Users } from "lucide-react"

interface UsagePolicy {
  id: string
  policyName: string
  dailyTokenLimit: number
  monthlyTokenLimit: number
  hourlyRequestLimit: number
  concurrentRequestLimit: number
  playgroundAccess: boolean
  playgroundDailyQuota: number
  fileUploadLimitMB: number
  maxStorageGB: number
  allowedProviders: Record<string, boolean>
  allowedModels: Record<string, boolean>
}

const DEFAULT_POLICY: UsagePolicy = {
  id: "policy_enterprise_default",
  policyName: "Enterprise Standard Tier",
  dailyTokenLimit: 5000000,
  monthlyTokenLimit: 120000000,
  hourlyRequestLimit: 15000,
  concurrentRequestLimit: 80,
  playgroundAccess: true,
  playgroundDailyQuota: 500000,
  fileUploadLimitMB: 50,
  maxStorageGB: 10,
  allowedProviders: {
    openai: true,
    anthropic: true,
    google: true,
    azure: true,
    groq: true,
    deepseek: true,
    mistral: false,
    openrouter: false,
  },
  allowedModels: {
    "gpt-4o": true,
    "gpt-4o-mini": true,
    "claude-3-5-sonnet-20241022": true,
    "gemini-1.5-pro": true,
    "deepseek-r1": true,
    "mistral-large": false,
  },
}

export default function UsageLimits() {
  const { success, info } = useToast()
  const [policy, setPolicy] = useState<UsagePolicy>(DEFAULT_POLICY)
  const [selectedTier, setSelectedTier] = useState<string>("Enterprise Standard")
  const [isModified, setIsModified] = useState<boolean>(false)
  const [members] = useTeamStore()

  // Animated numbers for stats header
  const animDaily = useCountUp(policy.dailyTokenLimit / 1000, 1200)
  const animHourly = useCountUp(policy.hourlyRequestLimit, 1200)
  const animConcurrency = useCountUp(policy.concurrentRequestLimit, 1200)

  const handleInputChange = (field: keyof UsagePolicy, value: any) => {
    setPolicy((prev) => ({ ...prev, [field]: value }))
    setIsModified(true)
  }

  const handleToggleProvider = (providerId: string) => {
    setPolicy((prev) => ({
      ...prev,
      allowedProviders: {
        ...prev.allowedProviders,
        [providerId]: !prev.allowedProviders[providerId],
      },
    }))
    setIsModified(true)
  }

  const handleToggleModel = (modelId: string) => {
    setPolicy((prev) => ({
      ...prev,
      allowedModels: {
        ...prev.allowedModels,
        [modelId]: !prev.allowedModels[modelId],
      },
    }))
    setIsModified(true)
  }

  const handleSave = () => {
    setIsModified(false)
    success(`Usage limits and quota policy saved for tier: ${selectedTier}`)
  }

  const handleReset = () => {
    setPolicy(DEFAULT_POLICY)
    setIsModified(false)
    info("Reverted usage limit configuration to system defaults.")
  }

  if (members.length === 0) {
    return (
      <div className="animate-fade-in py-8">
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="No Active Team Members"
          subtitle="Invite team members to configure individual and tier-based usage quotas."
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
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl glass-elevated glass-border glass-shadow card-hover flex items-center justify-between"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">Daily Token Cap</p>
            <div className="text-3xl font-bold text-foreground font-space flex items-baseline gap-1">
              {animDaily}k <span className="text-xs font-normal text-muted">tokens / day / user</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Zap size={24} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl glass-elevated glass-border glass-shadow card-hover flex items-center justify-between"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">Burst Rate Threshold</p>
            <div className="text-3xl font-bold text-foreground font-space flex items-baseline gap-1">
              {animHourly} <span className="text-xs font-normal text-muted">req / hr</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Gauge size={24} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl glass-elevated glass-border glass-shadow card-hover flex items-center justify-between"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">Peak Concurrency</p>
            <div className="text-3xl font-bold text-foreground font-space flex items-baseline gap-1">
              {animConcurrency} <span className="text-xs font-normal text-muted">simultaneous slots</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <ShieldAlert size={24} />
          </div>
        </motion.div>
      </div>

      {/* Main Policy Configuration Area */}
      <div
        className="rounded-2xl glass-elevated glass-border glass-shadow overflow-hidden"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        {/* Top Control Bar */}
        <div className="p-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-foreground font-space flex items-center gap-2">
                <Sliders size={18} className="text-accent" /> Governance & Quota Enforcement
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Configure hard bounds for token throughput, API burst frequency, and model availability.
              </p>
            </div>
            <div className="w-64 mt-2 sm:mt-0">
              <SelectFilter
                options={[
                  { value: "Enterprise Standard", label: "Enterprise Standard Tier" },
                  { value: "Developer Tier", label: "Developer Tier" },
                  { value: "Service Accounts", label: "Service Accounts" },
                  ...members.map((m) => ({ value: `Member: ${m.name}`, label: `${m.name} (${m.role})` })),
                ]}
                value={selectedTier}
                onChange={(val) => {
                  if (!val) return
                  setSelectedTier(val)
                  info(`Switched editing scope to ${val}`)
                }}
                showAllOption={false}
                placeholder="Select Tier"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {isModified && (
              <button
                onClick={handleReset}
                className="h-9 px-3.5 rounded-xl text-xs font-medium text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
              >
                <RotateCcw size={14} /> Reset
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!isModified}
              className={`h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                isModified
                  ? "bg-accent text-white hover:bg-accent/90 hover-lift cursor-pointer shadow-accent/20"
                  : "bg-surface-2 text-muted cursor-not-allowed border border-border/40"
              }`}
            >
              <Save size={14} /> Apply Policy
            </button>
          </div>
        </div>

        {/* Active Members Quota Scope Banner */}
        <div className="px-6 py-3 bg-[var(--color-surface-2)]/30 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Policy Scope Teammates:</span>
            <span className="text-muted">Applying usage limits to {members.length} organization {members.length === 1 ? "member" : "members"}.</span>
          </div>
          <div className="flex -space-x-1.5 overflow-hidden">
            {members.slice(0, 8).map((m) => (
              <div key={m.id} className="w-6 h-6 rounded-full overflow-hidden border border-[var(--color-surface)] flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0" style={{ backgroundColor: m.avatarColor }} title={`${m.name} (${m.role})`}>
                {m.avatarUrl ? <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" /> : m.avatar}
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-10">
          {/* SECTION 1: Token & Request Rate Limits */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
              <Zap size={15} className="text-amber-500" /> Token & Request Rate Ceilings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 rounded-xl bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] space-y-2">
                <label className="text-xs font-semibold text-foreground block">Daily Token Limit</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={policy.dailyTokenLimit}
                    onChange={(e) => handleInputChange("dailyTokenLimit", parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 pr-14 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-space text-foreground focus:outline-none focus:border-accent"
                  />
                  <span className="absolute right-3 text-xs text-muted">tok/d</span>
                </div>
                <p className="text-[11px] text-muted">Total prompt + completion tokens allowed per user daily.</p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] space-y-2">
                <label className="text-xs font-semibold text-foreground block">Monthly Token Limit</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={policy.monthlyTokenLimit}
                    onChange={(e) => handleInputChange("monthlyTokenLimit", parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 pr-14 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-space text-foreground focus:outline-none focus:border-accent"
                  />
                  <span className="absolute right-3 text-xs text-muted">tok/m</span>
                </div>
                <p className="text-[11px] text-muted">Organization billing cycle threshold before throttling.</p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] space-y-2">
                <label className="text-xs font-semibold text-foreground block">Hourly Request Limit</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={policy.hourlyRequestLimit}
                    onChange={(e) => handleInputChange("hourlyRequestLimit", parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 pr-14 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-space text-foreground focus:outline-none focus:border-accent"
                  />
                  <span className="absolute right-3 text-xs text-muted">req/h</span>
                </div>
                <p className="text-[11px] text-muted">Max API invocations per key every rolling hour.</p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] space-y-2">
                <label className="text-xs font-semibold text-foreground block">Concurrent Requests</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={policy.concurrentRequestLimit}
                    onChange={(e) => handleInputChange("concurrentRequestLimit", parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 pr-12 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-space text-foreground focus:outline-none focus:border-accent"
                  />
                  <span className="absolute right-3 text-xs text-muted">slots</span>
                </div>
                <p className="text-[11px] text-muted">Max simultaneous in-flight connections per workspace.</p>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: "var(--color-border)" }} />

          {/* SECTION 2: Provider Restrictions */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
              <Server size={15} className="text-blue-500" /> Provider Restrictions & Routing Whitelist
            </h3>
            <p className="text-xs text-muted mb-4">
              Disable experimental or high-latency provider endpoints for this tier. Blocked providers are skipped automatically during fallback routing.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.keys(policy.allowedProviders).map((prov) => {
                const isEnabled = policy.allowedProviders[prov]
                return (
                  <button
                    key={prov}
                    onClick={() => handleToggleProvider(prov)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isEnabled
                        ? "bg-[rgb(var(--color-accent-rgb)/0.08)] border-accent/40 text-foreground"
                        : "bg-[var(--color-surface-2)]/40 border-[var(--color-border)] text-muted opacity-70"
                    }`}
                  >
                    <span className="capitalize font-semibold text-xs">{prov}</span>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isEnabled ? "bg-accent text-white" : "bg-[var(--color-border)] text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <hr style={{ borderColor: "var(--color-border)" }} />

          {/* SECTION 3: Allowed Models */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
              <Lock size={15} className="text-purple-500" /> Allowed Models Governance
            </h3>
            <p className="text-xs text-muted mb-4">
              Restrict usage of specific high-cost reasoning models or legacy engines for users on this tier.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.keys(policy.allowedModels).map((modelName) => {
                const allowed = policy.allowedModels[modelName]
                return (
                  <button
                    key={modelName}
                    onClick={() => handleToggleModel(modelName)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      allowed
                        ? "bg-[rgb(var(--color-accent-rgb)/0.06)] border-accent/30 text-foreground shadow-sm font-semibold"
                        : "bg-[var(--color-surface-2)]/30 border-[var(--color-border)] text-muted line-through opacity-60"
                    }`}
                  >
                    <span className="text-xs font-mono">{modelName}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <hr style={{ borderColor: "var(--color-border)" }} />

          {/* SECTION 4: Playground & File Storage */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
              <Terminal size={15} className="text-emerald-500" /> Playground Access & Storage Bounds
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Interactive Playground</h4>
                  <p className="text-[11px] text-muted mt-0.5">Allow interactive prompt experimentation inside Arqon studio.</p>
                </div>
                <button
                  onClick={() => handleInputChange("playgroundAccess", !policy.playgroundAccess)}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 inline-flex items-center px-0.5 cursor-pointer shrink-0 ${
                    policy.playgroundAccess ? "bg-accent" : "bg-[var(--color-border)]"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      policy.playgroundAccess ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="p-5 rounded-xl bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>File Upload Size Limit</span>
                  <span className="font-mono text-accent">{policy.fileUploadLimitMB} MB</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={policy.fileUploadLimitMB}
                  onChange={(e) => handleInputChange("fileUploadLimitMB", parseInt(e.target.value) || 10)}
                  className="w-full accent-accent cursor-pointer"
                />
                <p className="text-[11px] text-muted">Max file attachment size for RAG and vision ingestion.</p>
              </div>

              <div className="p-5 rounded-xl bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Total Workspace Storage Cap</span>
                  <span className="font-mono text-accent">{policy.maxStorageGB} GB</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={policy.maxStorageGB}
                  onChange={(e) => handleInputChange("maxStorageGB", parseInt(e.target.value) || 1)}
                  className="w-full accent-accent cursor-pointer"
                />
                <p className="text-[11px] text-muted">Max disk storage reserved for vector indices and logs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-5 bg-[var(--color-surface-2)]/30 border-t flex items-center justify-between text-xs text-muted" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <span>Exceeding concurrency or hourly limits triggers an automated HTTP 429 exponential backoff response.</span>
          </div>
          <span className="font-mono text-[11px]">Enforcement Engine: v2.4-active</span>
        </div>
      </div>
    </div>
  )
}
