/**
 * Routing.tsx — AI Traffic Orchestration Page
 *
 * PART 3: FlowMap completely rebuilt.
 *   - Pure SVG radial layout: providers orbit Arqon in the center
 *   - NO Application node (removed per requirements)
 *   - Each provider has a curved line connecting to Arqon
 *   - Only selected provider gets the traveling glow particle
 *   - All other providers show dim static lines
 *
 * PART 5: Shared global state via useRoutingSequence singleton.
 *   Clicking a provider here updates Overview page instantly.
 *
 * PART 6: No auto-switching. User controls provider selection.
 */

import { useState, useEffect, memo } from "react"
import { createPortal } from "react-dom"

import { useToast } from "../components/toast/ToastContext"

import {
  GitBranch,
  Play,
  Plus,
  Activity,
  Zap,
  Shield,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2,
  Copy,
  Edit3,
  X,
} from "lucide-react"

import { useCountUp } from "../motion/useCountUp"

import { ProviderIcon } from "../components/icons/ProviderLogos"

import { useRoutingSequence } from "../motion/useRoutingSequence"

import {
  AnimatedParticlePath,
  useArqonImgRotation,
} from "../components/AnimatedRoutingFlow"

import { useProviders } from "../store/providers"

import { EmptyState } from "../components/EmptyState"

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const RULES = [
  {
    id: "r1",

    name: "Default Production",

    priority: 1,

    condition: "All Traffic",

    primary: "openai",

    fallback: "anthropic",

    cost: "$0.002 / 1K",

    status: "active",
  },

  {
    id: "r2",

    name: "High Speed Route",

    priority: 2,

    condition: "Latency < 50ms",

    primary: "groq",

    fallback: "mistral",

    cost: "$0.0001 / 1K",

    status: "active",
  },

  {
    id: "r3",

    name: "Data Privacy (EU)",

    priority: 3,

    condition: "Region == EU",

    primary: "mistral",

    fallback: "azure",

    cost: "$0.001 / 1K",

    status: "active",
  },

  {
    id: "r4",

    name: "Experimental Lab",

    priority: 4,

    condition: "Tag == beta",

    primary: "google",

    fallback: "openai",

    cost: "$0.0015 / 1K",

    status: "paused",
  },
]

const DISTRIBUTIONS = [
  { provider: "openai", pct: 42 },

  { provider: "anthropic", pct: 27 },

  { provider: "google", pct: 18 },

  { provider: "mistral", pct: 9 },

  { provider: "groq", pct: 4 },
]

const TIMELINE_STEPS = [
  { label: "Request Received", desc: "Ingestion & formatting" },

  { label: "Safety Validation", desc: "Content filtering & rate limits" },

  { label: "Prompt Optimization", desc: "Context injection & caching" },

  { label: "Provider Selection", desc: "Evaluating routing rules" },

  { label: "Response Generated", desc: "Streaming chunks returned" },

  { label: "Usage Logged", desc: "Metrics & cost attribution" },
]

// ─── StatCard ──────────────────────────────────────────────────────────────────

const StatCard = memo(function StatCard({
  icon,

  label,

  valueNum,

  valueStr,

  suffix = "",
}: {
  icon: React.ReactNode

  label: string

  valueNum?: number

  valueStr?: string

  suffix?: string
}) {
  const decimal = valueNum !== undefined && valueNum % 1 !== 0 ? 1 : 0

  const animated = useCountUp(valueNum ?? 0, 1400, decimal)

  return (
    <div
      className="hover-lift flex flex-col gap-3 p-5 rounded-xl"
      style={{
        background: "var(--color-surface)",

        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg"
        style={{
          background: "rgb(var(--color-accent-rgb) / 0.08)",

          border: "1px solid rgb(var(--color-accent-rgb) / 0.15)",
        }}
      >
        {icon}
      </div>
      <p className="text-xs text-muted">{label}</p>
      <p
        className="text-2xl font-semibold text-foreground tracking-tight"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {valueNum !== undefined ? (
          <>
            {animated}
            {suffix}
          </>
        ) : (
          valueStr
        )}
      </p>
    </div>
  )
})

// ─── ToggleSwitch ─────────────────────────────────────────────────────────────

function ToggleSwitch({
  checked,

  onChange,

  label,
}: {
  checked: boolean

  onChange: (v: boolean) => void

  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 group focus:outline-none"
    >
      <span className="text-xs font-medium text-muted group-hover:text-foreground transition-colors select-none">
        {label}
      </span>
      <span
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200"
        style={{
          background: checked
            ? "var(--color-accent)"
            : "var(--color-surface-2)",

          border: "1px solid",

          borderColor: checked ? "var(--color-accent)" : "var(--color-border)",
        }}
      >
        <span
          className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{
            transform: checked ? "translateX(18px)" : "translateX(2px)",
          }}
        />
      </span>
    </button>
  )
}

// ─── FlowMap — Pure SVG radial layout ────────────────────────────────────────

/**
 * REBUILT from scratch per Part 3 requirements.
 *
 * Layout: Arqon logo in the exact center of an SVG viewport.
 * 6 providers arranged in a radial/spoke pattern around it.
 * Each provider is connected by a curved Bezier line.
 *
 * Animation:
 *   - Selected provider: traveling glow particle
 *   - Other providers: dim static line only
 *   - Arqon logo: rotates exactly once when glow reaches center
 *   - NO Application node
 *
 * The logo rotation uses direct DOM style manipulation:
 *   transform-box: fill-box
 *   transform-origin: center
 * This is the only correct way to rotate an SVG <image> around its center.
 */

// SVG viewport dimensions

const VW = 500

const VH = 400

const CX = VW / 2 // 250 — center X

const CY = VH / 2 // 200 — center Y

const ENGINE_R = 36 // Hexagon radius

const ORBIT_R = 145 // Distance from center to provider nodes

// (Provider angles are now computed dynamically)

function degToRad(deg: number) {
  return (deg * Math.PI) / 180
}

function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = degToRad(60 * i - 90)

    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  }).join(" ")
}

// Compute provider SVG position from angle

function providerPos(angle: number, orbit: number) {
  const rad = degToRad(angle)

  return {
    x: CX + orbit * Math.cos(rad),

    y: CY + orbit * Math.sin(rad),
  }
}

// Build a smooth cubic bezier path from provider to engine edge

function makePath(px: number, py: number): string {
  // Control point is halfway between provider and center, pulled slightly inward

  const dx = CX - px

  const dy = CY - py

  const len = Math.sqrt(dx * dx + dy * dy)

  const nx = dx / len // unit vector toward center

  const ny = dy / len

  // Engine edge point (where the line meets the hexagon perimeter)

  const ex = CX - nx * ENGINE_R

  const ey = CY - ny * ENGINE_R

  // Mid control points for a smooth S-curve feel

  const cp1x = px + dx * 0.35

  const cp1y = py + dy * 0.35

  const cp2x = ex - dx * 0.15

  const cp2y = ey - dy * 0.15

  return `M ${px} ${py} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`
}

const LOGO_SIZE = 44

const LOGO_X = CX - LOGO_SIZE / 2

const LOGO_Y = CY - LOGO_SIZE / 2

function FlowMap() {
  const [providers] = useProviders()

  const { selectedProviderId, phase, phaseStartTime, setSelectedProviderId } =
    useRoutingSequence()

  const logoRef = useArqonImgRotation(phase, phaseStartTime)

  const displayProviders = providers.filter((p) => p.enabled)

  const N = displayProviders.length

  const providerData = displayProviders.map((p, i) => {
    const total = displayProviders.length

    // Start at -90 (top center) and distribute evenly

    const angle = total === 1 ? -90 : -90 + i * (360 / total)

    const pos = providerPos(angle, ORBIT_R)

    const path = makePath(pos.x, pos.y)

    return { ...p, angle, pos, path }
  })

  return (
    <div className="w-full flex items-center justify-center">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full"
        style={{ maxHeight: 380 }}
        aria-label="Arqon Live Flow Map"
      >
        <defs>
          <filter id="fm-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="fm-engine-glow"
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
          >
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Connection lines + particles ── */}
        {N > 0 &&
          providerData.map((p) => {
            const isActive = p.id === selectedProviderId

            return (
              <AnimatedParticlePath
                key={p.id}
                d={p.path}
                color={p.color}
                isActive={isActive}
                phase={phase}
                phaseStartTime={phaseStartTime}
                type="inbound"
              />
            )
          })}

        {/* ── Arqon engine center ── */}
        {N > 0 && (
          <>
            {/* Outer glow ring */}
            <circle
              cx={CX}
              cy={CY}
              r={ENGINE_R + 16}
              fill="none"
              stroke="rgba(220, 38, 38, 0.15)"
              strokeWidth="1"
              filter="url(#fm-engine-glow)"
            />

            {/* Hexagon frame */}
            <polygon
              points={hexPoints(CX, CY, ENGINE_R)}
              fill="rgba(10, 10, 14, 0.7)"
              stroke="rgba(220, 38, 38, 0.4)"
              strokeWidth="1.5"
              filter="url(#fm-engine-glow)"
            />
          </>
        )}

        {/*
          ── ARQON LOGO ────────────────────────────────────────
          Plain SVG <image> with a ref.
          Rotation applied via useArqonImgRotation:
            element.style.transform = rotate(Ndeg)
            element.style.transformBox = 'fill-box'
            element.style.transformOrigin = 'center'
          
          The logo is a DIRECT CHILD of the SVG root — not inside any
          <g> that has transforms. Zero parent transform inheritance.
        */}
        <image
          ref={logoRef as unknown as React.RefObject<SVGImageElement>}
          href="/logo/arqon-mark.png"
          x={LOGO_X}
          y={LOGO_Y}
          width={LOGO_SIZE}
          height={LOGO_SIZE}
          preserveAspectRatio="xMidYMid meet"
          style={{
            transformBox: "fill-box",

            transformOrigin: "center",

            willChange: "transform",
          }}
        />

        {/* Engine center label */}
        {N > 0 && (
          <>
            <text
              x={CX}
              y={CY + ENGINE_R + 18}
              textAnchor="middle"
              fill="var(--color-foreground)"
              fontSize="11"
              fontWeight="600"
              fontFamily="'Space Grotesk', sans-serif"
            >
              ARQON AI
            </text>
            <text
              x={CX}
              y={CY + ENGINE_R + 30}
              textAnchor="middle"
              fill="var(--color-muted)"
              fontSize="8"
              fontFamily="'Inter', sans-serif"
            >
              Routing Engine
            </text>
          </>
        )}

        {/* Empty state message */}
        {N === 0 && (
          <text
            x={CX}
            y={CY + ENGINE_R + 25}
            textAnchor="middle"
            fill="var(--color-muted)"
            fontSize="12"
            fontFamily="'Inter', sans-serif"
          >
            No Providers Connected
          </text>
        )}

        {/* ── Provider nodes ── */}
        {providerData.map((p) => {
          const isActive = p.id === selectedProviderId

          const { x, y } = p.pos

          return (
            <g
              key={p.id}
              onClick={() => setSelectedProviderId(p.id)}
              style={{ cursor: "pointer" }}
            >
              {/* Node background */}
              <circle
                cx={x}
                cy={y}
                r={isActive ? 26 : 23}
                fill="var(--color-surface)"
                stroke={isActive ? p.color : `${p.color}30`}
                strokeWidth={isActive ? 1.5 : 1}
                style={{ transition: "all 0.3s ease" }}
                filter={isActive ? "url(#fm-glow)" : undefined}
              />

              {/* Provider icon */}
              <ProviderIcon
                type={p.id}
                x={x - 10}
                y={y - 16}
                width={20}
                height={20}
                style={{
                  color: p.color,

                  opacity: isActive ? 1 : 0.5,

                  pointerEvents: "none",

                  transition: "opacity 0.3s ease",
                }}
              />

              {/* Provider name */}
              <text
                x={x}
                y={y + 10}
                textAnchor="middle"
                fill={
                  isActive ? "var(--color-foreground)" : "var(--color-muted)"
                }
                fontSize="8"
                fontFamily="'Inter', sans-serif"
                fontWeight={isActive ? "600" : "400"}
                style={{ transition: "fill 0.3s ease", pointerEvents: "none" }}
              >
                {p.name}
              </text>

              <text
                x={x}
                y={y + 19}
                textAnchor="middle"
                fill={isActive ? p.color : "var(--color-muted)"}
                fontSize="7"
                fontFamily="'JetBrains Mono', monospace"
                style={{ transition: "fill 0.3s ease", pointerEvents: "none" }}
              >
                {{
                  openai: 312,

                  anthropic: 450,

                  google: 380,

                  mistral: 280,

                  groq: 15,

                  azure: 420,

                  deepseek: 900,

                  openrouter: 500,

                  cohere: 200,
                }[p.id] || 200}
                ms
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Input Field ──────────────────────────────────────────────────────────────

function InputField({
  label,

  value,

  onChange,

  placeholder,

  mono,

  required,
}: {
  label: string

  value: string

  onChange: (v: string) => void

  placeholder?: string

  mono?: boolean

  required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-1.5">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      <input
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
    </div>
  )
}

// ─── Rule Modal ───────────────────────────────────────────────────────────────

function RuleModal({ onClose }: { onClose: () => void }) {
  const [providers] = useProviders()

  const [name, setName] = useState("")

  const [pri, setPri] = useState("openai")

  const [fall, setFall] = useState("anthropic")

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

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
        style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)" }}
      />
      <div
        className="relative z-10 w-full max-w-xl p-7 animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar"
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
              New Routing Rule
            </h2>
            <p className="text-xs mt-1 text-[rgba(255,255,255,0.6)]">
              Configure fallback chains and traffic conditions
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
          <InputField
            label="Rule Name"
            value={name}
            onChange={setName}
            placeholder="e.g. Production Fallback"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Primary Provider", state: pri, set: setPri },

              { label: "Fallback Provider", state: fall, set: setFall },
            ].map(({ label, state, set }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-2">
                  {label}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {providers.slice(0, 4).map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => set(p.id)}
                      className="flex items-center gap-2 p-2 rounded-xl transition-all duration-200"
                      style={{
                        background:
                          state === p.id
                            ? "rgba(var(--color-accent-rgb), 0.1)"
                            : "rgba(255,255,255,0.02)",

                        border:
                          state === p.id
                            ? "1px solid var(--color-accent)"
                            : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <ProviderIcon type={p.type || p.id} className="w-4 h-4" />
                      <span
                        className="text-[10px] font-medium"
                        style={{
                          color:
                            state === p.id ? "#fff" : "rgba(255,255,255,0.6)",
                        }}
                      >
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Conditions"
              value="All Traffic"
              onChange={() => {}}
            />
            <InputField label="Priority Level" value="1" onChange={() => {}} />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",

              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl text-sm font-medium text-white hover-lift"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent), #e11d48)",

              boxShadow: "0 4px 12px rgba(225,29,72,0.3)",

              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Save Rule
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Routing() {
  const { success } = useToast()

  const [showNew, setShowNew] = useState(false)

  const [autoRoute, setAutoRoute] = useState(true)

  const [mounted, setMounted] = useState(false)

  const [providers] = useProviders()

  const activeProviders = providers.filter((p) => p.enabled)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (activeProviders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-6 animate-fade-in-up">
        <EmptyState
          icon={<GitBranch className="w-7 h-7" />}
          title="No Active Providers"
          subtitle="Connect an API Key to activate providers."
          actionLabel="Go to API Keys"
          onAction={() => {
            window.history.pushState(null, "", "/api-keys")

            window.dispatchEvent(new Event("popstate"))
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── 1. Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl font-bold text-foreground tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Routing
          </h1>
          <p className="text-sm text-muted mt-1">AI Traffic Orchestration</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ToggleSwitch
            checked={autoRoute}
            onChange={setAutoRoute}
            label="Auto Routing"
          />
          <button
            onClick={() =>
              success(
                "Simulation Started",
                "Route simulation is running across active providers.",
              )
            }
            className="flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors"
            style={{
              background: "var(--color-surface)",

              border: "1px solid var(--color-border)",
            }}
          >
            <Play size={14} /> Simulation
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="hover-lift flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-medium text-white"
            style={{
              background: "var(--color-accent)",

              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <Plus size={14} /> New Rule
          </button>
        </div>
      </div>

      {/* ── 2. Live Flow Map + Provider Distribution ──────────────────── */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flow Map — lg:col-span-2 */}
        <div
          className="lg:col-span-2 p-6 rounded-2xl"
          style={{
            background: "var(--color-surface)",

            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Live Flow Map
            </h2>
            <span
              className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "rgb(var(--color-success-rgb) / 0.08)",

                color: "var(--color-success)",

                border: "1px solid rgb(var(--color-success-rgb) / 0.2)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Live
            </span>
          </div>
          <FlowMap />
        </div>

        {/* Provider Distribution */}
        <div
          className="p-6 rounded-2xl flex flex-col"
          style={{
            background: "var(--color-surface)",

            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="text-sm font-semibold text-foreground mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Provider Distribution
          </h2>
          <div className="flex flex-col gap-5">
            {DISTRIBUTIONS.map((d) => {
              const pObj = providers.find((p) => p.id === d.provider) || {
                id: d.provider,

                name: d.provider,

                type: d.provider,

                color: "#ccc",
              }

              return (
                <div key={d.provider}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <ProviderIcon
                        type={pObj.type || pObj.id}
                        className="w-3 h-3"
                      />
                      {pObj.name}
                    </span>
                    <span className="text-muted tabular-nums">{d.pct}%</span>
                  </div>
                  <div
                    className="h-1.5 w-full rounded-full overflow-hidden"
                    style={{ background: "var(--color-surface-2)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: mounted ? `${d.pct}%` : "0%",

                        background: pObj.color,

                        opacity: 0.8,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── 3. Summary Stats ──────────────────────────────────────────── */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<GitBranch size={16} className="text-accent" />}
          label="Active Rules"
          valueNum={4}
        />
        <StatCard
          icon={<Clock size={16} className="text-info" />}
          label="Avg Latency"
          valueNum={284}
          suffix="ms"
        />
        <StatCard
          icon={<CheckCircle2 size={16} className="text-success" />}
          label="Success Rate"
          valueNum={99.8}
          suffix="%"
        />
        <StatCard
          icon={<Shield size={16} className="text-warning" />}
          label="Fallback Ready"
          valueStr="100%"
        />
      </div>

      {/* ── 4. Routing Rules ──────────────────────────────────────────── */}

      <div>
        <h2
          className="text-sm font-semibold text-foreground mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Routing Rules
        </h2>
        <div className="flex flex-col gap-3">
          {RULES.length === 0 ? (
            <EmptyState
              icon={<GitBranch className="w-7 h-7" />}
              title="No Routing Rules"
              subtitle="No routing rules configured."
              actionLabel="Create Rule"
              onAction={() => setShowNew(true)}
            />
          ) : (
            RULES.map((r) => {
            const primary = providers.find((p) => p.id === r.primary) || {
              id: r.primary,

              name: r.primary,

              type: r.primary,
            }

            const fallback = providers.find((p) => p.id === r.fallback) || {
              id: r.fallback,

              name: r.fallback,

              type: r.fallback,
            }

            return (
              <div
                key={r.id}
                className="group p-5 rounded-2xl transition-all duration-200 hover-lift"
                style={{
                  background: "var(--color-surface)",

                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-muted"
                      style={{
                        background: "var(--color-surface-2)",

                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {r.priority}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {r.name}
                    </h3>
                    <span
                      className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide"
                      style={{
                        background:
                          r.status === "active"
                            ? "rgb(var(--color-success-rgb) / 0.08)"
                            : "rgba(245,158,11,0.08)",

                        color:
                          r.status === "active"
                            ? "var(--color-success)"
                            : "var(--color-warning)",
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <button className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-[var(--color-surface-2)] transition-colors">
                      <Edit3 size={13} />
                    </button>
                    <button className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-[var(--color-surface-2)] transition-colors">
                      <Copy size={13} />
                    </button>
                    <button className="p-1.5 rounded-full text-muted hover:text-accent hover:bg-[var(--color-surface-2)] transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{
                      background: "var(--color-surface-2)",

                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <span className="text-[10px] uppercase tracking-wider text-muted">
                      if
                    </span>
                    <code
                      className="text-[11px] font-medium text-foreground"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {r.condition}
                    </code>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{
                      background: "var(--color-surface-2)",

                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <ProviderIcon
                      type={primary.type || primary.id}
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-[11px] font-medium text-foreground">
                      {primary.name}
                    </span>
                    <ArrowRight size={10} className="text-muted" />
                    <ProviderIcon
                      type={fallback.type || fallback.id}
                      className="w-3.5 h-3.5 opacity-60"
                    />
                    <span className="text-[11px] text-muted">
                      {fallback.name}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg ml-auto"
                    style={{
                      background: "var(--color-surface-2)",

                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <span className="text-[10px] uppercase tracking-wider text-muted">
                      est.
                    </span>
                    <span
                      className="text-[11px] font-medium text-foreground"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {r.cost}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
          )}
        </div>
      </div>

      {/* ── 5. Decision Engine + How It Works ────────────────────────── */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2
            className="text-sm font-semibold text-foreground mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Decision Engine
          </h2>
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "var(--color-surface)",

              border: "1px solid var(--color-border)",
            }}
          >
            <div className="relative pl-7">
              <div
                className="absolute top-1.5 bottom-1.5 left-[10px] w-px"
                style={{ background: "var(--color-border)" }}
              />
              <div className="flex flex-col gap-6">
                {TIMELINE_STEPS.map((step, i) => {
                  const isActive = i === 3

                  return (
                    <div key={i} className="relative">
                      <div
                        className="absolute -left-7 top-0.5 w-3 h-3 rounded-full"
                        style={{
                          background: isActive
                            ? "var(--color-accent)"
                            : "var(--color-border)",

                          boxShadow: isActive
                            ? "0 0 8px var(--color-accent)"
                            : "none",

                          outline: `3px solid var(--color-surface)`,
                        }}
                      />
                      <h4
                        className="text-xs font-semibold"
                        style={{
                          color: isActive
                            ? "var(--color-accent)"
                            : "var(--color-foreground)",
                        }}
                      >
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-muted mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2
            className="text-sm font-semibold text-foreground mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            How It Works
          </h2>
          <div
            className="p-6 rounded-2xl h-full"
            style={{
              background: "var(--color-surface)",

              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: GitBranch,

                  title: "Priority-Based Routing",

                  desc: "Rules are evaluated by priority order. The first matching rule wins.",
                },

                {
                  icon: Shield,

                  title: "Automatic Failover",

                  desc: "If the primary fails, traffic is instantly re-routed to the fallback.",
                },

                {
                  icon: Zap,

                  title: "Sub-10ms Decisions",

                  desc: "The decision engine resolves routes before any network request is made.",
                },

                {
                  icon: Activity,

                  title: "Live Telemetry",

                  desc: "Latency and success rate metrics update every 30 seconds.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: "var(--color-surface-2)",

                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <Icon size={15} className="text-muted" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {title}
                    </p>
                    <p className="text-[10px] text-muted mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showNew && <RuleModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
