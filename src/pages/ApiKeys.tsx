/**
 * ApiKeys.tsx - API Key Management Page
 * Uses the existing Arqon design system with premium UI tweaks.
 */

import React, { useState, useEffect, memo, useRef } from "react"
import { createPortal } from "react-dom"

import { useToast } from "../components/toast/ToastContext"
import { motion, AnimatePresence } from "framer-motion"
import { ActionSuccessButton, StatusChangeIndicator } from "../components/SuccessFeedback"

import {
  Plus,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  Edit3,
  RefreshCw,
  X,
  Key,
  Power,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
} from "lucide-react"

import { maskKey } from "../utils"

import { useCountUp } from "../motion/useCountUp"

import { ProviderIcon } from "../components/icons/ProviderLogos"

import { PROVIDER_METADATA } from "../store/registry"

import { useProviders, type Provider } from "../store/providers"

import { EmptyState } from "../components/EmptyState"
import { SearchInput } from "../components/SearchInput"

// ─── Stat Card ───────────────────────────────────────────────────────────────

const StatCard = memo(function StatCard({
  icon,

  label,

  valueNum,

  valueStr,
}: {
  icon: React.ReactNode

  label: string

  valueNum?: number

  valueStr?: string
}) {
  const animated = useCountUp(valueNum ?? 0, 1400)

  return (
    <div
      className="hover-lift relative flex flex-col gap-3 p-5 rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface)",

        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg"
        style={{
          background: `rgb(var(--color-accent-rgb) / 0.08)`,

          border: `1px solid rgb(var(--color-accent-rgb) / 0.15)`,
        }}
      >
        {icon}
      </div>
      <p className="text-xs text-muted relative z-10">{label}</p>
      <p
        className="relative z-10 text-2xl font-semibold text-foreground tracking-tight"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {valueNum !== undefined ? animated : valueStr}
      </p>
    </div>
  )
})

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, {
    bg: string
    color: string
    label: string
    Icon: React.ElementType
  }> = {
    // Provider status values

    healthy: {
      bg: "rgb(var(--color-success-rgb) / 0.08)",

      color: "var(--color-success)",

      label: "Active",

      Icon: CheckCircle2,
    },

    active: {
      bg: "rgb(var(--color-success-rgb) / 0.08)",

      color: "var(--color-success)",

      label: "Active",

      Icon: CheckCircle2,
    },

    warning: {
      bg: "rgba(245,158,11,0.08)",

      color: "var(--color-warning)",

      label: "Degraded",

      Icon: AlertTriangle,
    },

    error: {
      bg: "rgba(239,68,68,0.08)",

      color: "#EF4444",

      label: "Error",

      Icon: XCircle,
    },

    disabled: {
      bg: "rgba(245,158,11,0.08)",

      color: "var(--color-warning)",

      label: "Disabled",

      Icon: AlertTriangle,
    },

    expired: {
      bg: "rgba(82,82,91,0.08)",

      color: "#71717A",

      label: "Expired",

      Icon: XCircle,
    },
  }

  const entry = cfg[status] ?? cfg.healthy

  const Icon = entry.Icon

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: entry.bg,

        color: entry.color,

        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <Icon size={10} />
      {entry.label}
    </span>
  )
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text, size = 13 }: { text: string, size?: number }) {
  const { success } = useToast()

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {})

        success("Copied to clipboard", "API key has been copied.")
      }}
      className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-[var(--color-surface-2)] transition-colors"
      aria-label="Copy to clipboard"
    >
      <Copy size={size} />
    </button>
  )
}

// ─── Input Field ──────────────────────────────────────────────────────────────

function InputField({
  label,

  value,

  onChange,

  type = "text",

  placeholder,

  hint,

  mono,

  required,
}: {
  label: string

  value: string

  onChange: (v: string) => void

  type?: string

  placeholder?: string

  hint?: string

  mono?: boolean

  required?: boolean
}) {
  return (
    <div className="group">
      <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-1.5">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full h-9 px-3 text-sm rounded-lg outline-none transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.03)",

          border: "1px solid rgba(255,255,255,0.1)",

          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",

          color: "#ffffff",

          fontFamily: mono
            ? "'JetBrains Mono', monospace"
            : "'Inter', sans-serif",

          fontSize: mono ? "12px" : undefined,
        }}
        onMouseOver={(e) => {
          if (document.activeElement !== e.currentTarget) {
            e.currentTarget.style.boxShadow =
              "inset 0 2px 4px rgba(0,0,0,0.2), 0 0 8px rgba(255,255,255,0.05)"

            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"
          }
        }}
        onMouseOut={(e) => {
          if (document.activeElement !== e.currentTarget) {
            e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2)"

            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
          }
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-accent)"

          e.currentTarget.style.boxShadow =
            "0 0 0 1px var(--color-accent), inset 0 2px 4px rgba(0,0,0,0.2)"
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"

          e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2)"
        }}
      />
      {hint && (
        <p className="text-[10px] text-[rgba(255,255,255,0.4)] mt-1.5">
          {hint}
        </p>
      )}
    </div>
  )
}

// ─── Create/Edit Modal ────────────────────────────────────────────────────────

function ApiKeyModal({
  isEdit,

  initialData,

  onSave,

  onClose,
}: {
  isEdit: boolean

  initialData?: Provider

  onSave: (k: Provider) => void

  onClose: () => void
}) {
  const [provider, setProvider] = useState(
    initialData?.type ?? PROVIDER_METADATA[0]?.id ?? "openai",
  )

  const [name, setName] = useState(initialData?.displayName ?? "")

  const [keyStr, setKeyStr] = useState(initialData?.apiKey ?? "")

  const [env, setEnv] = useState<Provider["environment"]>(
    initialData?.environment ?? "development",
  )

  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
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
  }, [onClose])

  const pObj = PROVIDER_METADATA.find((p) => p.id === provider) ||
    PROVIDER_METADATA[0] || { id: "unknown", name: "Unknown" }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
        style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)" }}
      />

      {/* Smoked glass modal panel */}
      <div
        className="relative z-10 w-full max-w-lg p-7 animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar"
        style={{
          background: "rgba(18,18,22,0.72)",

          backdropFilter: "blur(32px) saturate(180%)",

          borderRadius: "24px",

          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.14), 0 30px 80px rgba(0,0,0,0.35)",

          color: "#ffffff",
        }}
      >
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2
              className="text-lg font-semibold tracking-tight text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {isEdit ? "Edit API Key" : "Create API Key"}
            </h2>
            <p className="text-xs mt-1 text-[rgba(255,255,255,0.6)]">
              {isEdit
                ? "Update key configuration"
                : "Add a new provider credential"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-5">
          {/* All Providers */}
          <div>
            <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-2">
              Supported Providers
            </label>
            <div className="grid grid-cols-4 gap-2.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {PROVIDER_METADATA.map((p) => {
                const isSelected = provider === p.id

                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className="flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all duration-200"
                    style={{
                      background: isSelected
                        ? "rgba(var(--color-accent-rgb), 0.1)"
                        : "rgba(255,255,255,0.02)",

                      border: isSelected
                        ? "1px solid var(--color-accent)"
                        : "1px solid rgba(255,255,255,0.08)",

                      boxShadow: isSelected
                        ? "0 4px 12px rgba(var(--color-accent-rgb), 0.2)"
                        : "none",

                      transform: isSelected ? "translateY(-1px)" : "none",
                    }}
                  >
                    <ProviderIcon type={p.type} className="w-5 h-5" />
                    <span
                      className="text-[10px] font-medium truncate w-full text-center"
                      style={{
                        color: isSelected ? "#fff" : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {p.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <InputField
            label="Display Name"
            value={name}
            onChange={setName}
            placeholder={`${pObj.name} Key`}
            required
          />

          <div>
            <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-1.5">
              Secret Key <span className="text-accent">*</span>
            </label>
            <div className="relative group">
              <input
                type={showKey ? "text" : "password"}
                value={keyStr}
                onChange={(e) => setKeyStr(e.target.value)}
                placeholder="sk-..."
                required
                className="w-full h-9 px-3 pr-10 text-sm rounded-lg outline-none transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",

                  border: "1px solid rgba(255,255,255,0.1)",

                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",

                  color: "#ffffff",

                  fontFamily: "'JetBrains Mono', monospace",

                  fontSize: "12px",
                }}
                onMouseOver={(e) => {
                  if (document.activeElement !== e.currentTarget) {
                    e.currentTarget.style.boxShadow =
                      "inset 0 2px 4px rgba(0,0,0,0.2), 0 0 8px rgba(255,255,255,0.05)"

                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"
                  }
                }}
                onMouseOut={(e) => {
                  if (document.activeElement !== e.currentTarget) {
                    e.currentTarget.style.boxShadow =
                      "inset 0 2px 4px rgba(0,0,0,0.2)"

                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-accent)"

                  e.currentTarget.style.boxShadow =
                    "0 0 0 1px var(--color-accent), inset 0 2px 4px rgba(0,0,0,0.2)"
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"

                  e.currentTarget.style.boxShadow =
                    "inset 0 2px 4px rgba(0,0,0,0.2)"
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.5)] hover:text-white transition-colors"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-2">
              Environment
            </label>
            <div className="flex gap-2">
              {(["development", "staging", "production"] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setEnv(e)}
                  className="flex-1 h-9 rounded-lg text-xs font-medium transition-all duration-200 capitalize"
                  style={{
                    background:
                      env === e
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(255,255,255,0.02)",

                    border:
                      env === e
                        ? "1px solid rgba(255,255,255,0.2)"
                        : "1px solid rgba(255,255,255,0.05)",

                    color: env === e ? "#ffffff" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <InputField
            label="Tags"
            value={initialData?.tags.join(", ") ?? ""}
            onChange={() => {}}
            placeholder="e.g. core, billing, sandbox"
            hint="Comma separated for organizing keys"
          />
          <InputField
            label="Permissions"
            value={initialData?.permissions.join(", ") ?? ""}
            onChange={() => {}}
            placeholder="e.g. chat, completions, embeddings"
            hint="Restrict the scope of what this key can access"
          />
        </div>

        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.1)]"
            style={{
              background: "rgba(255,255,255,0.05)",

              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Cancel
          </button>
          <ActionSuccessButton
            onAction={() => {
              if (!name || !keyStr) return false

              const meta =
                PROVIDER_METADATA.find((p) => p.id === provider) ||
                PROVIDER_METADATA[0]

              onSave({
                id: initialData?.id ?? `k${Date.now()}`,
                name: meta.name,
                type: meta.type,
                color: meta.brandColor,
                letter: meta.name.substring(0, 2).toUpperCase(),
                enabled: true,
                status: initialData?.status ?? "healthy",
                latency:
                  initialData?.latency ??
                  (meta.type === "openai"
                    ? 240
                    : meta.type === "anthropic"
                      ? 350
                      : meta.type === "google"
                        ? 290
                        : meta.type === "azure"
                          ? 210
                          : meta.type === "deepseek"
                            ? 180
                            : meta.type === "groq"
                              ? 18
                              : meta.type === "mistral"
                                ? 190
                                : 250),
                requestsToday: initialData?.requestsToday ?? 12500,
                failureRate: initialData?.failureRate ?? 0.05,
                quota: initialData?.quota ?? 1000000,
                quotaUsed: initialData?.quotaUsed ?? 24500,
                cooldown: initialData?.cooldown ?? null,
                priority: initialData?.priority ?? 99,
                apiKey: keyStr,
                displayName: name,
                lastUsed: initialData?.lastUsed ?? "Never",
                created: initialData?.created ?? "Just now",
                environment: env,
                tags: ["new"],
                permissions: ["all"],
                supportsStreaming: meta.supportsStreaming ?? false,
                supportsVision: meta.supportsVision ?? false,
                supportsEmbeddings: meta.supportsEmbeddings ?? false,
                supportsFunctionCalling: meta.supportsFunctionCalling ?? false,
                supportsReasoning: meta.supportsReasoning ?? false,
                supportsImageGeneration: meta.supportsImageGeneration ?? false,
              })
              return true
            }}
            onAfterSuccess={onClose}
            disabled={!name || !keyStr}
            label="Save"
            loadingLabel="Saving..."
            successLabel="Saved"
            className="flex-1 h-10 rounded-xl text-sm font-medium text-white shadow-md"
            style={{
              background: "linear-gradient(135deg, var(--color-accent), #e11d48)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ─── Refresh Action Button ────────────────────────────────────────────────────

function RefreshActionButton({ onRefresh }: { onRefresh: () => void }) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle")

  const [hover, setHover] = useState(false)

  const onRefreshRef = useRef(onRefresh)

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>

    let t2: ReturnType<typeof setTimeout>

    if (state === "loading") {
      t1 = setTimeout(() => {
        setState("success")

        onRefreshRef.current()
      }, 1000)
    } else if (state === "success") {
      t2 = setTimeout(() => {
        setState("idle")
      }, 500)
    }

    return () => {
      clearTimeout(t1)

      clearTimeout(t2)
    }
  }, [state])

  const handleClick = () => {
    if (state !== "idle") return

    setState("loading")
  }

  return (
    <button
      onClick={handleClick}
      disabled={state !== "idle"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="p-2 rounded-full transition-all duration-300 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-accent"
      style={{
        color:
          state === "loading"
            ? "var(--color-accent)"
            : state === "success"
              ? "var(--color-success)"
              : hover
                ? "var(--color-accent)"
                : "var(--color-muted)",

        transform: hover && state === "idle" ? "scale(1.05)" : "scale(1)",

        background:
          hover && state === "idle" ? "var(--color-surface-2)" : "transparent",

        filter:
          hover && state === "idle"
            ? "drop-shadow(0 0 4px rgba(255, 59, 59, 0.4))"
            : "none",
      }}
      title="Refresh API Key"
    >
      <div className="relative w-[14px] h-[14px] flex items-center justify-center">
        <Check
          size={14}
          className="absolute transition-all duration-200"
          style={{
            transform: state === "success" ? "scale(1)" : "scale(0)",

            opacity: state === "success" ? 1 : 0,
          }}
        />
        <RefreshCw
          size={14}
          className={`absolute transition-all duration-200 ${
            state === "loading" ? "animate-spin" : ""
          }`}
          style={{
            transform: state === "success" ? "scale(0)" : "scale(1)",

            opacity: state === "success" ? 0 : 1,
          }}
        />
      </div>
    </button>
  )
}

// ─── Power Toggle ─────────────────────────────────────────────────────────────

const POWER_TOGGLE_STYLE = `
@keyframes powerToggle {
  0% { transform: rotate(0deg) scale(1); filter: brightness(1); }
  25% { transform: rotate(-15deg) scale(1.1); filter: brightness(1.2); }
  50% { transform: rotate(15deg) scale(0.95); filter: brightness(1.4); }
  75% { transform: rotate(0deg) scale(1.15); filter: brightness(1.2); }
  100% { transform: rotate(0deg) scale(1); filter: brightness(1); }
}
.animate-power-toggle {
  animation: powerToggle 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
`

function PowerToggleButton({
  isActive,

  onClick,

  animating,
}: {
  isActive: boolean

  onClick: () => void

  animating: boolean
}) {
  const [hover, setHover] = useState(false)

  const activeColor = "#22C55E"

  const disabledColor = "#EF4444"

  const color = isActive ? activeColor : disabledColor

  const title = isActive ? "Disable API Key" : "Enable API Key"

  return (
    <StatusChangeIndicator active={isActive} className="inline-flex">
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="p-2 rounded-full transition-all duration-300 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{
          color: hover || animating ? color : "var(--color-muted)",
          transform: hover && !animating ? "scale(1.05)" : "scale(1)",
          background: hover ? "var(--color-surface-2)" : "transparent",
          filter: hover || animating ? `drop-shadow(0 0 4px ${color}66)` : "none",
        }}
        title={title}
        aria-label={title}
      >
        <Power
          size={14}
          className={animating ? "animate-power-toggle" : ""}
          style={{ transition: "color 0.3s ease" }}
        />
      </button>
    </StatusChangeIndicator>
  )
}

function ConfirmToggleModal({
  isActive,

  onConfirm,

  onClose,
}: {
  isActive: boolean

  onConfirm: () => void

  onClose: () => void
}) {
  useEffect(() => {
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
  }, [onClose])

  const title = isActive ? "Disable API Key?" : "Enable API Key?"

  const desc = isActive
    ? "This API key will stop handling requests until it is enabled again."
    : "This API key will begin accepting requests immediately."

  const primaryText = isActive ? "Disable Key" : "Enable Key"

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 transition-opacity"
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)" }}
      />
      <div
        className="relative z-10 w-full max-w-sm p-6 animate-fade-in-up text-center"
        style={{
          background: "rgba(18,18,22,0.72)",

          backdropFilter: "blur(32px) saturate(180%)",

          borderRadius: "24px",

          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.14), 0 30px 80px rgba(0,0,0,0.35)",

          color: "#ffffff",
        }}
      >
        <h2
          className="text-lg font-semibold tracking-tight text-white mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </h2>
        <p className="text-sm text-[rgba(255,255,255,0.7)] mb-6">{desc}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.1)]"
            style={{
              background: "rgba(255,255,255,0.05)",

              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Cancel
          </button>
          <ActionSuccessButton
            onAction={onConfirm}
            onAfterSuccess={onClose}
            label={primaryText}
            loadingLabel={isActive ? "Disabling..." : "Enabling..."}
            successLabel={isActive ? "Disabled" : "Enabled"}
            variant={isActive ? "danger" : "success"}
            className="flex-1 h-10 rounded-xl text-sm font-medium shadow-sm"
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApiKeys() {
  const [providers, setProviders] = useProviders()

  const { success, warning } = useToast()

  const [search, setSearch] = useState("")

  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  const [editTarget, setEditTarget] = useState<Provider | null>(null)

  const [showCreate, setShowCreate] = useState(false)

  const [toggleTarget, setToggleTarget] = useState<Provider | null>(null)

  const [animatingToggle, setAnimatingToggle] = useState<string | null>(null)

  const handleReveal = (id: string) => {
    setRevealed((prev) => {
      const n = new Set(prev)

      n.has(id) ? n.delete(id) : n.add(id)

      return n
    })
  }

  const handleDelete = (id: string) => {
    setProviders((ps) => ps.filter((p) => p.id !== id))

    warning("API Key Revoked", "The key has been permanently deleted")
  }

  const handleRefresh = (id: string) => {
    setProviders((ps) =>
      ps.map((p) =>
        p.id === id ? { ...p, status: "healthy", lastUsed: "Just now" } : p,
      ),
    )

    success("Key Refreshed", "API key status updated successfully")
  }

  const handleConfirmToggle = () => {
    if (!toggleTarget) return

    const id = toggleTarget.id
    const newEnabled = !toggleTarget.enabled
    const newStatus = newEnabled ? "healthy" : "disabled"
    const msg = newEnabled ? "API key enabled and active for routing." : "API key disabled."

    setProviders((ps) =>
      ps.map((p) =>
        p.id === id ? { ...p, enabled: newEnabled, status: newStatus } : p,
      ),
    )

    setAnimatingToggle(id)
    success(newEnabled ? "Key Activated" : "Key Deactivated", msg)

    setTimeout(() => {
      setAnimatingToggle(null)
    }, 600)
  }

  const handleSave = (p: Provider) => {
    setProviders((ps) => {
      const idx = ps.findIndex((x) => x.id === p.id)

      if (idx >= 0) {
        const n = [...ps]

        n[idx] = p

        return n
      }

      const nextPriority = p.priority === 99 ? ps.length + 1 : p.priority

      return [{ ...p, priority: nextPriority }, ...ps]
    })

    success(
      editTarget ? "API Key Updated" : "API Key Created",
      "Your changes have been saved successfully",
    )
  }

  const validKeys = providers.filter((p) => !!p.apiKey)

  const filtered = validKeys.filter(
    (p) =>
      !search ||
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <style>{POWER_TOGGLE_STYLE}</style>

      {validKeys.length === 0 ? (
        <EmptyState
          icon={<Key className="w-7 h-7" />}
          title="No API Keys"
          subtitle="Connect your first AI provider to start routing requests."
          actionLabel="Connect API Key"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1
                className="text-xl font-bold text-foreground tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                API Keys
              </h1>
              <p className="text-sm text-muted mt-1">
                Manage provider credentials securely.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors"
                style={{
                  background: "var(--color-surface)",

                  border: "1px solid var(--color-border)",
                }}
              >
                <FileText size={14} /> Documentation
              </button>
              <button
                className="flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors"
                style={{
                  background: "var(--color-surface)",

                  border: "1px solid var(--color-border)",
                }}
              >
                <Upload size={14} /> Import
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="hover-lift flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-medium text-white"
                style={{
                  background: "var(--color-accent)",

                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                <Plus size={14} /> Create API Key
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Key size={16} className="text-accent" />}
              label="Total Keys"
              valueNum={validKeys.length}
            />

            <StatCard
              icon={<CheckCircle2 size={16} className="text-success" />}
              label="Active Keys"
              valueNum={
                validKeys.filter((k) => k.status === "healthy" || k.enabled)
                  .length
              }
            />

            <StatCard
              icon={<AlertTriangle size={16} className="text-warning" />}
              label="Expiring Soon"
              valueNum={1}
            />

            <StatCard
              icon={<Clock size={16} className="text-info" />}
              label="Last Updated"
              valueStr="2 min ago"
            />
          </div>

          {/* Provider Table Area */}
          <div className="mt-4">
            <div
              className="pb-4 flex items-center justify-between border-b mb-2"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h2
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Provider Keys
              </h2>
              <div className="w-full sm:w-auto">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search keys…"
                />
              </div>
            </div>

            <div className="overflow-x-auto pb-4">
              <table
                className="w-full text-left"
                style={{
                  borderCollapse: "separate",

                  borderSpacing: "0 8px",

                  minWidth: "850px",
                }}
              >
                <thead>
                  <tr>
                    <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">
                      Provider
                    </th>
                    <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">
                      Key Name
                    </th>
                    <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">
                      Secret Key
                    </th>
                    <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">
                      Environment
                    </th>
                    <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">
                      Last Used
                    </th>
                    <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">
                      Created
                    </th>
                    <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                  {filtered.map((k) => {
                    const pObj = k

                    return (
                      <motion.tr
                        layout="position"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        key={k.id}
                        className="group transition-all duration-200"
                        style={{ background: "transparent" }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background =
                            "var(--color-surface)"

                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.03)"

                          e.currentTarget.style.transform = "translateY(-1px)"
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "transparent"

                          e.currentTarget.style.boxShadow = "none"

                          e.currentTarget.style.transform = "none"
                        }}
                      >
                        {/* Provider */}
                        <td className="px-5 py-4 whitespace-nowrap rounded-l-[12px]">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                background: `${pObj.color}15`,

                                border: `1px solid ${pObj.color}40`,

                                color: pObj.color,
                              }}
                            >
                              <ProviderIcon
                                type={pObj.type}
                                className="w-4 h-4"
                              />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {pObj.name}
                            </span>
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={k.status} />
                        </td>
                        {/* Key Name */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm text-foreground font-medium">
                            {k.displayName}
                          </span>
                        </td>
                        {/* Masked Key */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 max-w-[200px]">
                            <code
                              className="text-xs text-muted truncate bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded"
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {revealed.has(k.id)
                                ? k.apiKey
                                : maskKey(k.apiKey)}
                            </code>
                            <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleReveal(k.id)}
                                className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-[var(--color-surface-2)] transition-colors"
                              >
                                {revealed.has(k.id) ? (
                                  <EyeOff size={13} />
                                ) : (
                                  <Eye size={13} />
                                )}
                              </button>
                              <CopyButton text={k.apiKey} size={13} />
                            </div>
                          </div>
                        </td>
                        {/* Environment */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="capitalize text-xs text-muted bg-[var(--color-surface-2)] px-2 py-1 rounded-md">
                            {k.environment}
                          </span>
                        </td>
                        {/* Last Used */}
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-muted">
                          {k.lastUsed}
                        </td>
                        {/* Created */}
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-muted">
                          {k.created}
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap text-right rounded-r-[12px]">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditTarget(k)}
                              className="p-2 rounded-full text-muted hover:text-foreground hover:bg-[var(--color-surface-2)] transition-all"
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <RefreshActionButton
                              onRefresh={() => handleRefresh(k.id)}
                            />
                            <PowerToggleButton
                              isActive={k.enabled}
                              onClick={() => setToggleTarget(k)}
                              animating={animatingToggle === k.id}
                            />
                            <button
                              onClick={() => handleDelete(k.id)}
                              className="p-2 rounded-full text-muted hover:text-white hover:bg-accent transition-all"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                  </AnimatePresence>
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-16 text-center text-sm text-muted"
                      >
                        No API keys found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              {
                title: "Encrypted Storage",

                desc: "AES-256-GCM encryption at rest",

                icon: ShieldCheck,

                color: "var(--color-success)",
              },

              {
                title: "Rotation Reminder",

                desc: "Keys over 90 days are flagged",

                icon: Clock,

                color: "var(--color-warning)",
              },

              {
                title: "Key Validation",

                desc: "Automated syntax & live checking",

                icon: CheckCircle2,

                color: "var(--color-info)",
              },

              {
                title: "Audit Logs",

                desc: "All key actions are permanently logged",

                icon: FileText,

                color: "var(--color-muted)",
              },
            ].map((s) => (
              <div
                className="p-5 rounded-2xl flex items-start gap-4 h-full"
                style={{
                  background: "var(--color-surface)",

                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-surface-2)",

                    border: "1px solid var(--color-border)",

                    color: s.color,
                  }}
                >
                  <s.icon size={18} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold text-foreground"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {s.title}
                  </p>
                  <p className="text-xs text-muted mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals placed outside conditional so they always open on demand */}
      {(showCreate || editTarget) && (
        <ApiKeyModal
          isEdit={!!editTarget}
          initialData={editTarget || undefined}
          onSave={handleSave}
          onClose={() => {
            setShowCreate(false)

            setEditTarget(null)
          }}
        />
      )}
      {toggleTarget && (
        <ConfirmToggleModal
          isActive={toggleTarget.enabled}
          onConfirm={handleConfirmToggle}
          onClose={() => setToggleTarget(null)}
        />
      )}
    </div>
  )
}
