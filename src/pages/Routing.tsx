/**
 * Routing.tsx - AI Traffic Orchestration Page
 *
 * Root-cause fixes applied:
 * 1. Flow Map: SVG-based layout with fixed polar positions for providers (no absolute collisions)
 * 2. Auto Routing: Proper <button role="switch"> with CSS transition-transform thumb
 * 3. Layout: All sections are independent rows via space-y-8; Rules + Engine are now separate rows
 * 4. Rules: Pure premium cards, no table/grid-line aesthetics
 */
import { useState, useEffect, useRef, memo } from 'react'
import {
  GitBranch, Play, Plus, Activity, Zap, Shield,
  CheckCircle2, Clock, ArrowRight,
  Trash2, Copy, Edit3, X
} from 'lucide-react'
import { useCountUp } from '../motion/useCountUp'
import { ProviderIcon } from '../components/icons/ProviderLogos'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PROVIDERS = [
  { id: 'openai',    name: 'OpenAI',    latency: 312, success: 99.9, color: '#10A37F' },
  { id: 'anthropic', name: 'Anthropic', latency: 450, success: 99.8, color: '#D97706' },
  { id: 'google',    name: 'Google',    latency: 380, success: 99.5, color: '#4285F4' },
  { id: 'mistral',   name: 'Mistral',   latency: 280, success: 99.9, color: '#7C3AED' },
  { id: 'groq',      name: 'Groq',      latency: 15,  success: 100,  color: '#F55036' },
  { id: 'azure',     name: 'Azure',     latency: 420, success: 99.7, color: '#0078D4' },
]

const RULES = [
  { id: 'r1', name: 'Default Production', priority: 1, condition: 'All Traffic',   primary: 'openai',   fallback: 'anthropic', cost: '$0.002 / 1K',  status: 'active' },
  { id: 'r2', name: 'High Speed Route',   priority: 2, condition: 'Latency < 50ms',primary: 'groq',     fallback: 'mistral',   cost: '$0.0001 / 1K', status: 'active' },
  { id: 'r3', name: 'Data Privacy (EU)',  priority: 3, condition: 'Region == EU',  primary: 'mistral',  fallback: 'azure',     cost: '$0.001 / 1K',  status: 'active' },
  { id: 'r4', name: 'Experimental Lab',  priority: 4, condition: 'Tag == beta',    primary: 'google',   fallback: 'openai',    cost: '$0.0015 / 1K', status: 'paused' },
]

const DISTRIBUTIONS = [
  { provider: 'openai',    pct: 42 },
  { provider: 'anthropic', pct: 27 },
  { provider: 'google',    pct: 18 },
  { provider: 'mistral',   pct: 9  },
  { provider: 'groq',      pct: 4  },
]

const TIMELINE_STEPS = [
  { label: 'Request Received',    desc: 'Ingestion & formatting' },
  { label: 'Safety Validation',   desc: 'Content filtering & rate limits' },
  { label: 'Prompt Optimization', desc: 'Context injection & caching' },
  { label: 'Provider Selection',  desc: 'Evaluating routing rules' },
  { label: 'Response Generated',  desc: 'Streaming chunks returned' },
  { label: 'Usage Logged',        desc: 'Metrics & cost attribution' },
]

// ─── StatCard (reused pattern) ────────────────────────────────────────────────
const StatCard = memo(function StatCard({ icon, label, valueNum, valueStr, suffix = '' }: {
  icon: React.ReactNode; label: string; valueNum?: number; valueStr?: string; suffix?: string
}) {
  const decimal = valueNum !== undefined && valueNum % 1 !== 0 ? 1 : 0
  const animated = useCountUp(valueNum ?? 0, 1400, decimal)
  return (
    <div className="hover-lift flex flex-col gap-3 p-5 rounded-xl"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-center w-8 h-8 rounded-lg"
        style={{ background: 'rgb(var(--color-accent-rgb) / 0.08)', border: '1px solid rgb(var(--color-accent-rgb) / 0.15)' }}>
        {icon}
      </div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {valueNum !== undefined ? <>{animated}{suffix}</> : valueStr}
      </p>
    </div>
  )
})

// ─── ToggleSwitch — accessible, animated (fix for Issue 2) ───────────────────
function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 group focus:outline-none"
    >
      <span className="text-xs font-medium text-muted group-hover:text-foreground transition-colors select-none">{label}</span>
      {/* Track */}
      <span
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          background: checked ? 'var(--color-accent)' : 'var(--color-surface-2)',
          border: '1px solid',
          borderColor: checked ? 'var(--color-accent)' : 'var(--color-border)',
        }}
      >
        {/* Thumb */}
        <span
          className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
        />
      </span>
    </button>
  )
}

// ─── Live Flow Map — SVG-based fixed grid (fix for Issue 1) ──────────────────
/**
 * Architecture: CSS Grid positions each provider into a fixed cell.
 * A single <svg> overlay draws connection lines from the engine center
 * to each provider center using useRef'd element bounding boxes.
 * Continuous curved SVG paths with an animated fiber-optic pulse.
 */
function FlowMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef    = useRef<HTMLDivElement>(null)
  const providerRefs = useRef<(HTMLDivElement | null)[]>([])
  const [lines, setLines] = useState<Array<{ id: string; d: string; color: string }>>([])

  const recalc = () => {
    const container = containerRef.current
    const engine    = engineRef.current
    if (!container || !engine) return
    const cRect = container.getBoundingClientRect()
    const eRect = engine.getBoundingClientRect()
    const ex = eRect.left + eRect.width  / 2 - cRect.left
    const ey = eRect.top  + eRect.height / 2 - cRect.top
    const nextLines = providerRefs.current.map((el, i) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      const px = r.left + r.width  / 2 - cRect.left
      const py = r.top  + r.height / 2 - cRect.top
      const midX = (ex + px) / 2
      // Smooth cubic bezier curve
      const d = `M ${ex} ${ey} C ${midX} ${ey}, ${midX} ${py}, ${px} ${py}`
      return { id: PROVIDERS[i].id, d, color: PROVIDERS[i].color }
    }).filter(Boolean) as Array<{ id: string; d: string; color: string }>
    setLines(nextLines)
  }

  useEffect(() => {
    const t = setTimeout(recalc, 80)
    window.addEventListener('resize', recalc)
    return () => { clearTimeout(t); window.removeEventListener('resize', recalc) }
  }, [])

  const gridPositions = [
    { col: 1, row: 1 }, // OpenAI    — top-left
    { col: 3, row: 1 }, // Google    — top-right
    { col: 1, row: 3 }, // Anthropic — bottom-left
    { col: 3, row: 3 }, // Mistral   — bottom-right
    { col: 1, row: 2 }, // Groq      — middle-left
    { col: 3, row: 2 }, // Azure     — middle-right
  ]

  return (
    <div ref={containerRef} className="relative w-full" style={{ minHeight: '320px' }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <style>{`
            @keyframes fiber-pulse {
              0%   { stroke-dashoffset: 100; opacity: 0; }
              15%  { opacity: 1; }
              85%  { opacity: 1; }
              100% { stroke-dashoffset: -20; opacity: 0; }
            }
            .fiber-glow {
              animation: fiber-pulse 2.5s infinite linear;
              stroke-dasharray: 20 100;
            }
            @keyframes hub-pulse {
              0%   { transform: scale(1); opacity: 0.3; }
              20%  { transform: scale(1.05); opacity: 0.6; }
              100% { transform: scale(1); opacity: 0.3; }
            }
            .hub-glow-anim {
              animation: hub-pulse 2.5s infinite ease-out;
            }
          `}</style>
        </defs>
        {lines.map((l) => (
          <g key={l.id}>
            {/* Base continuous curved line */}
            <path d={l.d} fill="none" stroke={l.color} strokeWidth="2" strokeLinecap="round" opacity="0.15" />
            {/* Animated fiber optic pulse */}
            <path d={l.d} fill="none" stroke={l.color} strokeWidth="2" strokeLinecap="round" opacity="0.8"
                  pathLength="100" className="fiber-glow"
                  style={{ filter: `drop-shadow(0 0 6px ${l.color}80)` }} />
          </g>
        ))}
      </svg>

      <div className="relative grid grid-cols-3 grid-rows-3 gap-4" style={{ placeItems: 'center', minHeight: '320px' }}>
        {PROVIDERS.map((p, i) => {
          const pos = gridPositions[i]
          return (
            <div key={p.id} ref={el => { providerRefs.current[i] = el }}
                 className="hover-lift flex flex-col items-center gap-2 w-28 p-3 rounded-2xl text-center transition-all duration-200"
                 style={{ gridColumn: pos.col, gridRow: pos.row, background: 'var(--color-surface)', border: `1px solid ${p.color}30` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${p.color}15`, color: p.color }}>
                <ProviderIcon type={p.id} className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-foreground leading-tight">{p.name}</p>
                <p className="text-[10px] text-muted mt-0.5">{p.latency}ms</p>
                <p className="text-[10px] font-medium" style={{ color: p.color }}>{p.success}%</p>
              </div>
            </div>
          )
        })}

        {/* Arqon Engine Hub (Center) */}
        <div ref={engineRef} className="flex flex-col items-center justify-center z-10 relative" style={{ gridColumn: 2, gridRow: 2 }}>
          {/* Ambient red glow synced with routing pulse */}
          <div className="absolute inset-0 bg-accent rounded-[16px] hub-glow-anim" style={{ filter: 'blur(16px)' }} />
          {/* Black glass square with subtle red border */}
          <div className="relative w-16 h-16 rounded-[16px] flex items-center justify-center shadow-lg"
               style={{ background: 'rgba(10, 10, 14, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 59, 59, 0.25)' }}>
            <img src="/logo/arqon-mark.png" alt="Arqon" className="w-8 h-8 object-contain" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({ label, value, onChange, placeholder, mono, required }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; mono?: boolean; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-1.5">
        {label}{required && <span className="text-accent ml-0.5">*</span>}
      </label>
      <input
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full h-9 px-3 text-sm rounded-lg outline-none transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
          color: '#ffffff',
          fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = 'var(--color-accent)'
          e.currentTarget.style.boxShadow = '0 0 0 1px var(--color-accent), inset 0 2px 4px rgba(0,0,0,0.2)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
          e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'
        }}
      />
    </div>
  )
}

// ─── Rule Modal ───────────────────────────────────────────────────────────────
function RuleModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [pri, setPri]   = useState('openai')
  const [fall, setFall] = useState('anthropic')

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true"
           style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(8px)' }} />
      <div className="relative z-10 w-full max-w-xl p-7 animate-fade-in-up"
           style={{
             background: 'rgba(18,18,22,0.72)',
             backdropFilter: 'blur(32px) saturate(180%)',
             borderRadius: '24px',
             boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14), 0 30px 80px rgba(0,0,0,0.35)',
             color: '#ffffff'
           }}>
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>New Routing Rule</h2>
            <p className="text-xs mt-1 text-[rgba(255,255,255,0.6)]">Configure fallback chains and traffic conditions</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors" aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-5">
          <InputField label="Rule Name" value={name} onChange={setName} placeholder="e.g. Production Fallback" required />

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Primary Provider', state: pri, set: setPri },
              { label: 'Fallback Provider', state: fall, set: setFall },
            ].map(({ label, state, set }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-2">{label}</label>
                <div className="grid grid-cols-2 gap-2">
                  {PROVIDERS.slice(0, 4).map(p => (
                    <button key={p.id} onClick={() => set(p.id)}
                            className="flex items-center gap-2 p-2 rounded-xl transition-all duration-200"
                            style={{
                              background: state === p.id ? 'rgba(var(--color-accent-rgb), 0.1)' : 'rgba(255,255,255,0.02)',
                              border: state === p.id ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.08)',
                            }}>
                      <ProviderIcon type={p.id} className="w-4 h-4" />
                      <span className="text-[10px] font-medium" style={{ color: state === p.id ? '#fff' : 'rgba(255,255,255,0.6)' }}>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Conditions" value="All Traffic" onChange={() => {}} />
            <InputField label="Priority Level" value="1" onChange={() => {}} />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8">
          <button onClick={onClose}
                  className="flex-1 h-10 rounded-xl text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Cancel
          </button>
          <button onClick={onClose}
                  className="flex-1 h-10 rounded-xl text-sm font-medium text-white hover-lift"
                  style={{ background: 'linear-gradient(135deg, var(--color-accent), #e11d48)', boxShadow: '0 4px 12px rgba(225,29,72,0.3)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Save Rule
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Routing() {
  const [showNew, setShowNew]     = useState(false)
  const [autoRoute, setAutoRoute] = useState(true)
  const [mounted, setMounted]     = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* ── 1. Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Routing</h1>
          <p className="text-sm text-muted mt-1">AI Traffic Orchestration</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ToggleSwitch checked={autoRoute} onChange={setAutoRoute} label="Auto Routing" />
          <button className="flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <Play size={14} /> Simulation
          </button>
          <button onClick={() => setShowNew(true)}
                  className="hover-lift flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-medium text-white"
                  style={{ background: 'var(--color-accent)', fontFamily: "'Space Grotesk', sans-serif" }}>
            <Plus size={14} /> New Rule
          </button>
        </div>
      </div>

      {/* ── 2. Live Flow Map + Provider Distribution ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Flow Map — lg:col-span-2 */}
        <div className="lg:col-span-2 p-6 rounded-2xl"
             style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Live Flow Map</h2>
            <span className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'rgb(var(--color-success-rgb) / 0.08)', color: 'var(--color-success)', border: '1px solid rgb(var(--color-success-rgb) / 0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Live
            </span>
          </div>
          <FlowMap />
        </div>

        {/* Provider Distribution */}
        <div className="p-6 rounded-2xl flex flex-col"
             style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-sm font-semibold text-foreground mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Provider Distribution</h2>
          <div className="flex flex-col gap-5">
            {DISTRIBUTIONS.map(d => {
              const pObj = PROVIDERS.find(p => p.id === d.provider)!
              return (
                <div key={d.provider}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <ProviderIcon type={pObj.id} className="w-3 h-3" />
                      {pObj.name}
                    </span>
                    <span className="text-muted tabular-nums">{d.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                         style={{ width: mounted ? `${d.pct}%` : '0%', background: pObj.color, opacity: 0.8 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── 3. Summary Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<GitBranch size={16} className="text-accent"       />} label="Active Rules"    valueNum={4}    />
        <StatCard icon={<Clock      size={16} className="text-info"         />} label="Avg Latency"    valueNum={284}  suffix="ms" />
        <StatCard icon={<CheckCircle2 size={16} className="text-success"   />} label="Success Rate"   valueNum={99.8} suffix="%" />
        <StatCard icon={<Shield     size={16} className="text-warning"      />} label="Fallback Ready" valueStr="100%" />
      </div>

      {/* ── 4. Routing Rules (fix Issue 3: premium cards, no gridlines) ───── */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Routing Rules</h2>
        <div className="flex flex-col gap-3">
          {RULES.map(r => {
            const primary  = PROVIDERS.find(p => p.id === r.primary)!
            const fallback = PROVIDERS.find(p => p.id === r.fallback)!
            return (
              <div key={r.id}
                   className="group p-5 rounded-2xl transition-all duration-200 hover-lift"
                   style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>

                {/* Top row: priority badge + name + status + actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-muted"
                          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                      {r.priority}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground truncate">{r.name}</h3>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide"
                          style={{
                            background: r.status === 'active' ? 'rgb(var(--color-success-rgb) / 0.08)' : 'rgba(245,158,11,0.08)',
                            color:      r.status === 'active' ? 'var(--color-success)' : 'var(--color-warning)',
                          }}>
                      {r.status}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <button className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-[var(--color-surface-2)] transition-colors" title="Edit">
                      <Edit3 size={13} />
                    </button>
                    <button className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-[var(--color-surface-2)] transition-colors" title="Duplicate">
                      <Copy size={13} />
                    </button>
                    <button className="p-1.5 rounded-full text-muted hover:text-accent hover:bg-[var(--color-surface-2)] transition-colors" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Meta row: condition + route arrow + cost */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                       style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                    <span className="text-[10px] uppercase tracking-wider text-muted">if</span>
                    <code className="text-[11px] font-medium text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {r.condition}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                       style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                    <ProviderIcon type={primary.id}  className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium text-foreground">{primary.name}</span>
                    <ArrowRight size={10} className="text-muted" />
                    <ProviderIcon type={fallback.id} className="w-3.5 h-3.5 opacity-60" />
                    <span className="text-[11px] text-muted">{fallback.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg ml-auto"
                       style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                    <span className="text-[10px] uppercase tracking-wider text-muted">est.</span>
                    <span className="text-[11px] font-medium text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.cost}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 5. Decision Engine Timeline (fix Issue 4: own row, no overlap) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Decision Engine</h2>
          <div className="p-6 rounded-2xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="relative pl-7">
              {/* Vertical connector line */}
              <div className="absolute top-1.5 bottom-1.5 left-[10px] w-px" style={{ background: 'var(--color-border)' }} />
              <div className="flex flex-col gap-6">
                {TIMELINE_STEPS.map((step, i) => {
                  const isActive = i === 3
                  return (
                    <div key={i} className="relative">
                      {/* Node */}
                      <div className="absolute -left-7 top-0.5 w-3 h-3 rounded-full"
                           style={{
                             background:  isActive ? 'var(--color-accent)' : 'var(--color-border)',
                             boxShadow:   isActive ? '0 0 8px var(--color-accent)' : 'none',
                             outline:     `3px solid var(--color-surface)`,
                           }} />
                      <h4 className="text-xs font-semibold" style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-foreground)' }}>
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-muted mt-0.5">{step.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Architecture note card */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>How It Works</h2>
          <div className="p-6 rounded-2xl h-full" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex flex-col gap-4 h-full">
              {[
                { icon: GitBranch, title: 'Priority-Based Routing', desc: 'Rules are evaluated by priority order. The first matching rule wins.' },
                { icon: Shield,    title: 'Automatic Failover',     desc: 'If the primary fails, traffic is instantly re-routed to the fallback.' },
                { icon: Zap,       title: 'Sub-10ms Decisions',     desc: 'The decision engine resolves routes before any network request is made.' },
                { icon: Activity,  title: 'Live Telemetry',         desc: 'Latency and success rate metrics update every 30 seconds.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                    <Icon size={15} className="text-muted" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{title}</p>
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
