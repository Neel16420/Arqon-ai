"""Generates src/pages/Routing.tsx."""
import pathlib

content = r"""/**
 * Routing.tsx - AI Traffic Orchestration Page
 */
import { useState, useEffect, memo } from 'react'
import {
  GitBranch, Play, Plus, Server, Activity, Zap, Shield, 
  CheckCircle2, Clock, AlertTriangle, ArrowRight, Settings2,
  Trash2, Copy, Edit3, X, ChevronRight, BarChart2
} from 'lucide-react'
import { useCountUp } from '../motion/useCountUp'
import { ProviderIcon } from '../components/icons/ProviderLogos'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', latency: 312, success: 99.9, color: '#10A37F' },
  { id: 'anthropic', name: 'Anthropic', latency: 450, success: 99.8, color: '#D97706' },
  { id: 'google', name: 'Google', latency: 380, success: 99.5, color: '#4285F4' },
  { id: 'mistral', name: 'Mistral', latency: 280, success: 99.9, color: '#7C3AED' },
  { id: 'groq', name: 'Groq', latency: 15, success: 100, color: '#F55036' },
  { id: 'azure', name: 'Azure', latency: 420, success: 99.7, color: '#0078D4' },
]

const RULES = [
  { id: 'r1', name: 'Default Production', priority: 1, condition: 'All Traffic', primary: 'openai', fallback: 'anthropic', cost: '$0.002 / 1K', status: 'active' },
  { id: 'r2', name: 'High Speed Route', priority: 2, condition: 'Latency < 50ms', primary: 'groq', fallback: 'mistral', cost: '$0.0001 / 1K', status: 'active' },
  { id: 'r3', name: 'Data Privacy (EU)', priority: 3, condition: 'Region == EU', primary: 'mistral', fallback: 'azure', cost: '$0.001 / 1K', status: 'active' },
  { id: 'r4', name: 'Experimental Lab', priority: 4, condition: 'Tag == beta', primary: 'google', fallback: 'openai', cost: '$0.0015 / 1K', status: 'paused' },
]

const DISTRIBUTIONS = [
  { provider: 'openai', pct: 42 },
  { provider: 'anthropic', pct: 27 },
  { provider: 'google', pct: 18 },
  { provider: 'mistral', pct: 9 },
  { provider: 'groq', pct: 4 },
]

const TIMELINE_STEPS = [
  { label: 'Request Received', desc: 'Ingestion & formatting' },
  { label: 'Safety Validation', desc: 'Content filtering & rate limits' },
  { label: 'Prompt Optimization', desc: 'Context injection & caching' },
  { label: 'Provider Selection', desc: 'Evaluating routing rules' },
  { label: 'Response Generated', desc: 'Streaming chunks returned' },
  { label: 'Usage Logged', desc: 'Metrics & cost attribution' },
]

// ─── Stat Card (Reused) ───────────────────────────────────────────────────────
const StatCard = memo(function StatCard({ icon, label, valueNum, valueStr, suffix = '' }: {
  icon: React.ReactNode; label: string; valueNum?: number; valueStr?: string; suffix?: string
}) {
  const animated = useCountUp(valueNum ?? 0, 1400, valueNum && valueNum % 1 !== 0 ? 1 : 0)
  return (
    <div className="hover-lift relative flex flex-col gap-3 p-5 rounded-xl overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-center w-8 h-8 rounded-lg"
        style={{ background: `rgb(var(--color-accent-rgb) / 0.08)`, border: `1px solid rgb(var(--color-accent-rgb) / 0.15)` }}>
        {icon}
      </div>
      <p className="text-xs text-muted relative z-10">{label}</p>
      <p className="relative z-10 text-2xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {valueNum !== undefined ? <>{animated}{suffix}</> : valueStr}
      </p>
    </div>
  )
})

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({ label, value, onChange, type = 'text', placeholder, hint, mono, required }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; hint?: string; mono?: boolean; required?: boolean
}) {
  return (
    <div className="group">
      <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-1.5">
        {label}{required && <span className="text-accent ml-0.5">*</span>}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
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
      {hint && <p className="text-[10px] text-[rgba(255,255,255,0.4)] mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── Rule Modal ───────────────────────────────────────────────────────────────
function RuleModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [pri, setPri] = useState('openai')
  const [fall, setFall] = useState('anthropic')

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 transition-opacity" onClick={onClose} aria-hidden="true" 
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
          <button onClick={onClose} className="p-2 rounded-full text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-5">
          <InputField label="Rule Name" value={name} onChange={setName} placeholder="e.g. Production Fallback" required />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-2">Primary Provider</label>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.slice(0, 4).map(p => (
                  <button key={p.id} onClick={() => setPri(p.id)}
                    className="flex items-center gap-2 p-2 rounded-xl transition-all duration-200"
                    style={{
                      background: pri === p.id ? 'rgba(var(--color-accent-rgb), 0.1)' : 'rgba(255,255,255,0.02)',
                      border: pri === p.id ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.08)',
                    }}>
                    <ProviderIcon type={p.id} className="w-4 h-4" />
                    <span className="text-[10px] font-medium" style={{ color: pri === p.id ? '#fff' : 'rgba(255,255,255,0.6)' }}>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-2">Fallback Provider</label>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.slice(0, 4).map(p => (
                  <button key={p.id} onClick={() => setFall(p.id)}
                    className="flex items-center gap-2 p-2 rounded-xl transition-all duration-200"
                    style={{
                      background: fall === p.id ? 'rgba(var(--color-accent-rgb), 0.1)' : 'rgba(255,255,255,0.02)',
                      border: fall === p.id ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.08)',
                    }}>
                    <ProviderIcon type={p.id} className="w-4 h-4" />
                    <span className="text-[10px] font-medium" style={{ color: fall === p.id ? '#fff' : 'rgba(255,255,255,0.6)' }}>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Conditions" value="All Traffic" onChange={() => {}} />
            <InputField label="Priority Level" value="1" onChange={() => {}} />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.1)]"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Cancel
          </button>
          <button onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-medium text-white transition-all hover-lift"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), #e11d48)', boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Save Rule
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Routing() {
  const [showNew, setShowNew] = useState(false)
  const [autoRoute, setAutoRoute] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Routing</h1>
          <p className="text-sm text-muted mt-1">AI Traffic Orchestration</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer mr-2">
            <span className="text-xs font-medium text-muted">Auto Routing</span>
            <div className="relative w-8 h-4 rounded-full transition-colors"
                 style={{ background: autoRoute ? 'var(--color-success)' : 'var(--color-surface-2)' }}
                 onClick={() => setAutoRoute(!autoRoute)}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${autoRoute ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
          </label>
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

      {/* Live Flow Map & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Map */}
        <div className="lg:col-span-2 p-6 rounded-2xl flex flex-col justify-between overflow-hidden relative"
             style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', minHeight: '360px' }}>
          <h2 className="text-sm font-semibold text-foreground mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Live Flow Map</h2>
          
          <div className="flex items-center justify-between w-full max-w-3xl mx-auto flex-1 relative z-10">
            {/* User */}
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-sm">
                <Activity size={20} className="text-muted" />
              </div>
              <span className="text-[10px] font-medium text-muted uppercase tracking-wider">User</span>
            </div>

            {/* Line 1 */}
            <div className="flex-1 h-[2px] mx-2 relative overflow-hidden bg-[var(--color-border)] opacity-50">
              <div className="absolute inset-y-0 left-0 w-1/3 bg-accent opacity-50 animate-pulse-slow" />
            </div>

            {/* Arqon Engine */}
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center border shadow-lg relative"
                   style={{ background: 'var(--color-background)', borderColor: 'var(--color-accent)' }}>
                <div className="absolute inset-0 bg-accent/5 rounded-3xl animate-pulse" />
                <Zap size={24} className="text-accent" />
              </div>
              <span className="text-xs font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Arqon Engine</span>
            </div>

            {/* Line 2 branching */}
            <div className="flex-1 mx-4 relative flex flex-col justify-center gap-4 h-[200px]">
              {PROVIDERS.slice(0, 3).map((p, i) => (
                <div key={p.id} className="relative flex items-center w-full">
                  <div className="absolute left-0 right-4 h-[1px] bg-[var(--color-border)] opacity-30" 
                       style={{ transform: `rotate(${i === 0 ? -15 : i === 2 ? 15 : 0}deg)`, transformOrigin: 'left center' }} />
                  {/* Provider Node */}
                  <div className="absolute right-0 w-32 p-2 rounded-xl flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] hover-lift"
                       style={{ transform: `translateY(${i === 0 ? -40 : i === 2 ? 40 : 0}px)` }}>
                     <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `${p.color}15`, color: p.color }}>
                       <ProviderIcon type={p.id} className="w-3.5 h-3.5" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-[10px] font-semibold text-foreground truncate">{p.name}</p>
                       <p className="text-[9px] text-muted">{p.latency}ms • {p.success}%</p>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div className="p-6 rounded-2xl flex flex-col h-full" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-sm font-semibold text-foreground mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Provider Distribution</h2>
          <div className="flex-1 flex flex-col justify-center gap-5">
            {DISTRIBUTIONS.map(d => {
              const pObj = PROVIDERS.find(p => p.id === d.provider)!
              return (
                <div key={d.provider} className="group">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <ProviderIcon type={pObj.id} className="w-3 h-3" /> {pObj.name}
                    </span>
                    <span className="text-muted">{d.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                         style={{ width: mounted ? `${d.pct}%` : '0%', background: pObj.color, opacity: 0.8 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<GitBranch size={16} className="text-accent" />} label="Active Rules" valueNum={4} />
        <StatCard icon={<Clock size={16} className="text-info" />} label="Average Latency" valueNum={284} suffix="ms" />
        <StatCard icon={<CheckCircle2 size={16} className="text-success" />} label="Success Rate" valueNum={99.8} suffix="%" />
        <StatCard icon={<Shield size={16} className="text-warning" />} label="Fallback Ready" valueStr="100%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rules Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-foreground mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Routing Rules</h2>
          {RULES.map(r => {
            const pri = PROVIDERS.find(p => p.id === r.primary)!
            const fall = PROVIDERS.find(p => p.id === r.fallback)!
            return (
              <div key={r.id} className="p-5 rounded-2xl group transition-all duration-200 hover-lift relative"
                   style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[10px] font-bold text-muted border border-[var(--color-border)]">
                      {r.priority}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">{r.name}</h3>
                    {r.status === 'active' 
                      ? <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-success/10 text-success uppercase tracking-wider">Active</span>
                      : <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-warning/10 text-warning uppercase tracking-wider">Paused</span>
                    }
                  </div>
                  
                  {/* Actions - visible on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-[var(--color-surface-2)]"><Edit3 size={13}/></button>
                    <button className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-[var(--color-surface-2)]"><Copy size={13}/></button>
                    <button className="p-1.5 rounded-full text-muted hover:text-accent hover:bg-[var(--color-surface-2)]"><Trash2 size={13}/></button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-3 rounded-xl bg-[var(--color-surface-2)]/50 border border-[var(--color-border)]/50">
                  <div>
                    <p className="text-[10px] text-muted mb-1 uppercase tracking-wider">Condition</p>
                    <p className="text-xs font-medium text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.condition}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted mb-1 uppercase tracking-wider">Route</p>
                    <div className="flex items-center gap-2">
                      <ProviderIcon type={pri.id} className="w-3.5 h-3.5" />
                      <ArrowRight size={10} className="text-muted" />
                      <ProviderIcon type={fall.id} className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted mb-1 uppercase tracking-wider">Est. Cost</p>
                    <p className="text-xs font-medium text-foreground">{r.cost}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Decision Timeline */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Decision Engine</h2>
          <div className="p-6 rounded-2xl h-fit" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="relative pl-6 space-y-6">
              {/* Vertical line connecting nodes */}
              <div className="absolute top-2 bottom-2 left-[9px] w-[1px] bg-[var(--color-border)]" />
              
              {TIMELINE_STEPS.map((step, i) => (
                <div key={i} className="relative">
                  {/* Node dot */}
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-[2px] border-[var(--color-surface)]"
                       style={{ background: i === 3 ? 'var(--color-accent)' : 'var(--color-muted)', 
                                boxShadow: i === 3 ? '0 0 8px var(--color-accent)' : 'none', zIndex: 10 }} />
                  
                  <h4 className="text-xs font-semibold text-foreground" style={{ color: i === 3 ? 'var(--color-accent)' : undefined }}>
                    {step.label}
                  </h4>
                  <p className="text-[10px] text-muted mt-0.5">{step.desc}</p>
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
"""

out = pathlib.Path('src/pages/Routing.tsx')
out.write_text(content, encoding='utf-8')
print(f'Written {out.stat().st_size} bytes to Routing.tsx')
