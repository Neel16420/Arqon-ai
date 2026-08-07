import { useState, useEffect } from "react"

import { useToast } from "../components/toast/ToastContext"
import { StatusChangeIndicator } from "../components/shared/SuccessFeedback"

import { RefreshCw, Wifi, WifiOff, ChevronUp, ChevronDown, Server } from "lucide-react"
import { EmptyState } from "../components/shared/EmptyState"

import { useCountUp } from "../motion/useCountUp"

import { useReducedMotion } from "../motion/useReducedMotion"

import { ProviderIcon } from "../components/icons/ProviderLogos"

function AnimatedNumber({
  value,

  decimals = 0,
}: {
  value: number

  decimals?: number
}) {
  const animatedValue = useCountUp(value, 1000, decimals)

  return <>{animatedValue}</>
}

import { useProviders } from "../store/providers"

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string, color: string, label: string }> = {
    healthy: {
      bg: "rgb(var(--color-success-rgb) / 0.08)",

      color: "var(--color-success)",

      label: "Healthy",
    },

    warning: {
      bg: "rgba(245,158,11,0.08)",

      color: "var(--color-warning)",

      label: "Degraded",
    },

    error: {
      bg: "rgb(var(--color-accent-rgb) / 0.08)",

      color: "var(--color-accent)",

      label: "Error",
    },

    disabled: {
      bg: "rgba(82,82,91,0.08)",

      color: "#71717A",

      label: "Disabled",
    },
  }

  const c = cfg[status] || cfg.disabled

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: c.bg,

        color: c.color,

        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status !== "disabled" && (
          <span
            className="animate-pulse-slow absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ background: c.color }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-1.5 w-1.5"
          style={{ background: c.color }}
        />
      </span>
      {c.label}
    </span>
  )
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: () => void
}) {
  return (
    <StatusChangeIndicator active={enabled}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onChange()
        }}
        className="relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200"
        style={{
          background: enabled ? "var(--color-accent)" : "var(--color-border)",
        }}
        aria-label={enabled ? "Disable provider" : "Enable provider"}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
          style={{ transform: enabled ? "translateX(16px)" : "translateX(0)" }}
        />
      </button>
    </StatusChangeIndicator>
  )
}

// Removed AddProviderModal

export default function Providers() {
  const { success } = useToast()

  const [providers, setProviders] = useProviders()

  // Animation state for progress bars

  const [animated, setAnimated] = useState(false)

  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      setAnimated(true)

      return
    }

    const timer = setTimeout(() => {
      setAnimated(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [reduced])

  const toggleProvider = (id: string) => {
    setProviders((ps) =>
      ps.map((p) =>
        p.id === id
          ? {
              ...p,

              enabled: !p.enabled,

              status: !p.enabled ? "healthy" : "disabled",
            }
          : p,
      ),
    )

    const target = providers.find((p) => p.id === id)

    if (target) {
      const isEnabling = !target.enabled
      success(
        isEnabling ? "Provider Activated" : "Provider Deactivated",
        `${target.name} has been ${isEnabling ? "activated" : "deactivated"} for routing.`,
      )
    }
  }

  const movePriority = (id: string, dir: -1 | 1) => {
    setProviders((ps) => {
      const sorted = [...ps].sort((a, b) => a.priority - b.priority)

      const idx = sorted.findIndex((p) => p.id === id)

      const newIdx = idx + dir

      if (newIdx < 0 || newIdx >= sorted.length) return ps

      const copy = [...sorted]
      ;[copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]]

      return copy.map((p, i) => ({ ...p, priority: i + 1 }))
    })

    success("Priority Updated", "Provider routing order has been changed.")
  }

  const sorted = [...providers].sort((a, b) => a.priority - b.priority)

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={<Server className="w-7 h-7" />}
        title="No Providers"
        subtitle="Connect an API Key to activate providers."
        actionLabel="Go to API Keys"
        onAction={() => {
          window.history.pushState(null, "", "/api-keys")
          window.dispatchEvent(new Event("popstate"))
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">
            {providers.filter((p) => p.enabled).length} of {providers.length}{" "}
            providers active
          </p>
        </div>
      </div>

      {/* Provider grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((provider, idx) => (
          <div
            className="relative flex flex-col gap-4 p-5 rounded-xl hover-lift cursor-default h-full"
            style={{
              background: "var(--color-surface)",

              border: "1px solid var(--color-border)",

              opacity: provider.enabled ? 1 : 0.6,
            }}
          >
            {/* Priority badge */}
            <div className="absolute top-3 right-3 flex items-center gap-0.5">
              <button
                onClick={() => movePriority(provider.id, -1)}
                disabled={idx === 0}
                className="p-0.5 text-muted hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronUp size={13} />
              </button>
              <span
                className="text-xs text-muted w-4 text-center"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {provider.priority}
              </span>
              <button
                onClick={() => movePriority(provider.id, 1)}
                disabled={idx === sorted.length - 1}
                className="p-0.5 text-muted hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronDown size={13} />
              </button>
            </div>

            {/* Provider header */}
            <div className="flex items-center gap-3 pr-16 group/header">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 shadow-sm"
                style={
                  {
                    background: `${provider.color}18`,

                    border: `1px solid ${provider.color}40`,

                    color: provider.color,

                    "--hover-glow": `0 0 12px ${provider.color}40`,

                    "--hover-border": `${provider.color}80`,
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 12px ${provider.color}50`

                  e.currentTarget.style.borderColor = `${provider.color}90`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)"

                  e.currentTarget.style.borderColor = `${provider.color}40`
                }}
              >
                <ProviderIcon
                  type={provider.type}
                  className="w-5 h-5 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {provider.name}
                </p>
                <StatusBadge status={provider.status} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted mb-1">Latency</p>
                <p
                  className={`text-sm font-medium ${
                    provider.latency > 3000
                      ? "text-accent"
                      : provider.latency > 1500
                        ? "text-warning"
                        : "text-foreground"
                  }`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {provider.enabled && provider.latency > 0 ? (
                    <>
                      <AnimatedNumber value={provider.latency} />
                      ms
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Today</p>
                <p
                  className="text-sm font-medium text-foreground"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {provider.enabled ? (
                    provider.requestsToday >= 1000 ? (
                      <>
                        <AnimatedNumber
                          value={provider.requestsToday / 1000}
                          decimals={0}
                        />
                        K
                      </>
                    ) : (
                      <AnimatedNumber value={provider.requestsToday} />
                    )
                  ) : (
                    "—"
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Failures</p>
                <p
                  className={`text-sm font-medium ${
                    provider.failureRate > 5
                      ? "text-accent"
                      : provider.failureRate > 1
                        ? "text-warning"
                        : "text-success"
                  }`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {provider.enabled ? (
                    <>
                      <AnimatedNumber
                        value={provider.failureRate}
                        decimals={1}
                      />
                      %
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>

            {/* Quota bar */}
            {provider.enabled && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted">Quota</span>
                  <span
                    className="text-xs text-muted"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <AnimatedNumber
                      value={Math.round(
                        (provider.quotaUsed / provider.quota) * 100,
                      )}
                    />
                    %
                  </span>
                </div>
                <div
                  className="w-full h-1 rounded-full overflow-hidden"
                  style={{ background: "var(--color-border)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${
                        animated
                          ? (provider.quotaUsed / provider.quota) * 100
                          : 0
                      }%`,

                      transition: `width 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) ${idx * 80}ms`,

                      background:
                        provider.quotaUsed / provider.quota > 0.9
                          ? "var(--color-accent)"
                          : provider.quotaUsed / provider.quota > 0.7
                            ? "var(--color-warning)"
                            : "var(--color-success)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Cooldown */}
            {provider.cooldown && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: "rgb(var(--color-accent-rgb) / 0.06)",

                  border: "1px solid rgb(var(--color-accent-rgb) / 0.15)",
                }}
              >
                <RefreshCw size={12} className="text-accent" />
                <span className="text-xs text-accent">
                  Cooldown: {Math.floor(provider.cooldown / 60)}m{" "}
                  {provider.cooldown % 60}s remaining
                </span>
              </div>
            )}

            {/* Footer */}
            <div
              className="flex items-center justify-between pt-3"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <div className="flex items-center gap-2">
                {provider.enabled ? (
                  <Wifi size={13} className="text-success" />
                ) : (
                  <WifiOff size={13} className="text-muted" />
                )}
                <span className="text-xs text-muted">
                  {provider.enabled ? "Active" : "Inactive"}
                </span>
              </div>
              <Toggle
                enabled={provider.enabled}
                onChange={() => toggleProvider(provider.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
