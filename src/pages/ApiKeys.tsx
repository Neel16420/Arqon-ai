/**
 * ApiKeys.tsx - API Key Management Page
 * Uses the existing Arqon design system with premium UI tweaks.
 */
import { useState, useCallback, useEffect, memo, useRef } from 'react'
import {
  Plus, Search, Eye, EyeOff, Copy, Check,
  Trash2, Edit3, RefreshCw, X, Key, Power, Clock, ShieldCheck,
  AlertTriangle, CheckCircle2, XCircle, FileText, Upload
} from 'lucide-react'
import { maskKey } from '../utils'
import { useCountUp } from '../motion/useCountUp'
import { ProviderIcon } from '../components/icons/ProviderLogos'

// ─── Types ────────────────────────────────────────────────────────────────────
type KeyStatus = 'active' | 'disabled' | 'expired'

interface ApiKey {
  id: string
  provider: string
  name: string
  status: KeyStatus
  key: string
  lastUsed: string
  created: string
  environment: 'production' | 'development' | 'staging'
  tags: string[]
  permissions: string[]
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_KEYS: ApiKey[] = [
  { id: 'k1', provider: 'openai', name: 'OpenAI Prod Main', status: 'active', key: 'sk-proj-aBcDeF1234567890', lastUsed: '2 min ago', created: 'Oct 12, 2024', environment: 'production', tags: ['core', 'billing'], permissions: ['chat', 'embeddings'] },
  { id: 'k2', provider: 'anthropic', name: 'Claude Opus Staging', status: 'active', key: 'sk-ant-api03-xYz987654321', lastUsed: '5 hrs ago', created: 'Nov 01, 2024', environment: 'staging', tags: ['testing'], permissions: ['chat'] },
  { id: 'k3', provider: 'google', name: 'Gemini Legacy', status: 'disabled', key: 'AIzaSyD-eXamPleKey999', lastUsed: '3 mos ago', created: 'Jan 15, 2024', environment: 'development', tags: ['legacy'], permissions: ['all'] },
  { id: 'k4', provider: 'azure', name: 'Azure East US', status: 'active', key: '8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p', lastUsed: 'Just now', created: 'Dec 05, 2024', environment: 'production', tags: ['enterprise'], permissions: ['chat', 'completions'] },
  { id: 'k5', provider: 'mistral', name: 'Mistral EU Sandbox', status: 'expired', key: 'mStRl-sandbox-1234abcd', lastUsed: '6 mos ago', created: 'Aug 20, 2023', environment: 'development', tags: ['sandbox'], permissions: ['chat'] },
]

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', color: '#10A37F' },
  { id: 'anthropic', name: 'Anthropic', color: '#D97706' },
  { id: 'google', name: 'Google AI', color: '#4285F4' },
  { id: 'azure', name: 'Azure OpenAI', color: '#0078D4' },
  { id: 'groq', name: 'Groq', color: '#F55036' },
  { id: 'mistral', name: 'Mistral', color: '#7C3AED' },
  { id: 'openrouter', name: 'OpenRouter', color: '#6366F1' },
  { id: 'deepseek', name: 'DeepSeek', color: '#0EA5E9' },
]

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = memo(function StatCard({ icon, label, valueNum, valueStr }: {
  icon: React.ReactNode; label: string; valueNum?: number; valueStr?: string
}) {
  const animated = useCountUp(valueNum ?? 0, 1400)
  return (
    <div className="hover-lift relative flex flex-col gap-3 p-5 rounded-xl overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-center w-8 h-8 rounded-lg"
        style={{ background: `rgb(var(--color-accent-rgb) / 0.08)`, border: `1px solid rgb(var(--color-accent-rgb) / 0.15)` }}>
        {icon}
      </div>
      <p className="text-xs text-muted relative z-10">{label}</p>
      <p className="relative z-10 text-2xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {valueNum !== undefined ? animated : valueStr}
      </p>
    </div>
  )
})

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: KeyStatus }) {
  const cfg = {
    active:   { bg: 'rgb(var(--color-success-rgb) / 0.08)', color: 'var(--color-success)', label: 'Active', Icon: CheckCircle2 },
    disabled: { bg: 'rgba(245,158,11,0.08)', color: 'var(--color-warning)', label: 'Disabled', Icon: AlertTriangle },
    expired:  { bg: 'rgba(82,82,91,0.08)', color: '#71717A', label: 'Expired', Icon: XCircle },
  }[status]
  const Icon = cfg.Icon
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>
      <Icon size={10} />
      {cfg.label}
    </span>
  )
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text, size = 13 }: { text: string; size?: number }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-[var(--color-surface-2)] transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check size={size} className="text-success" /> : <Copy size={size} />}
    </button>
  )
}

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
          fontSize: mono ? '12px' : undefined,
        }}
        onMouseOver={e => {
          if (document.activeElement !== e.currentTarget) {
             e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2), 0 0 8px rgba(255,255,255,0.05)'
             e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          }
        }}
        onMouseOut={e => {
          if (document.activeElement !== e.currentTarget) {
             e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'
             e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
          }
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

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg animate-fade-in-up glass-open"
      style={{ background: 'rgb(var(--color-success-rgb) / 0.1)', border: '1px solid rgb(var(--color-success-rgb) / 0.2)' }} role="alert">
      <Check size={13} className="text-success" />
      <span className="text-xs font-medium text-success" style={{ fontFamily: "'Inter', sans-serif" }}>{message}</span>
    </div>
  )
}

// ─── Create/Edit Modal ────────────────────────────────────────────────────────
function ApiKeyModal({ isEdit, initialData, onSave, onClose }: {
  isEdit: boolean; initialData?: ApiKey; onSave: (k: ApiKey) => void; onClose: () => void
}) {
  const [provider, setProvider] = useState(initialData?.provider ?? 'openai')
  const [name, setName] = useState(initialData?.name ?? '')
  const [keyStr, setKeyStr] = useState(initialData?.key ?? '')
  const [env, setEnv] = useState<ApiKey['environment']>(initialData?.environment ?? 'development')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const pObj = PROVIDERS.find(p => p.id === provider)!

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Dimmed backdrop */}
      <div 
        className="absolute inset-0 transition-opacity" 
        onClick={onClose} 
        aria-hidden="true" 
        style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(8px)' }}
      />
      
      {/* Smoked glass modal panel */}
      <div 
        className="relative z-10 w-full max-w-lg p-7 animate-fade-in-up"
        style={{
          background: 'rgba(18,18,22,0.72)',
          backdropFilter: 'blur(32px) saturate(180%)',
          borderRadius: '24px',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14), 0 30px 80px rgba(0,0,0,0.35)',
          color: '#ffffff'
        }}
      >
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {isEdit ? 'Edit API Key' : 'Create API Key'}
            </h2>
            <p className="text-xs mt-1 text-[rgba(255,255,255,0.6)]">{isEdit ? 'Update key configuration' : 'Add a new provider credential'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors"
            aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-2">Provider</label>
            <div className="grid grid-cols-4 gap-2.5">
              {PROVIDERS.map(p => {
                const isSelected = provider === p.id;
                return (
                  <button key={p.id} onClick={() => setProvider(p.id)}
                    className="flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all duration-200"
                    style={{
                      background: isSelected ? 'rgba(var(--color-accent-rgb), 0.1)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isSelected ? '0 4px 12px rgba(var(--color-accent-rgb), 0.2)' : 'none',
                      transform: isSelected ? 'translateY(-1px)' : 'none',
                    }}>
                    <ProviderIcon type={p.id} className="w-5 h-5" />
                    <span className="text-[10px] font-medium truncate w-full text-center" style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)' }}>{p.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <InputField label="Display Name" value={name} onChange={setName} placeholder={`${pObj.name} Key`} required />

          <div>
            <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-1.5">Secret Key <span className="text-accent">*</span></label>
            <div className="relative group">
              <input type={showKey ? 'text' : 'password'} value={keyStr} onChange={e => setKeyStr(e.target.value)}
                placeholder="sk-..." required
                className="w-full h-9 px-3 pr-10 text-sm rounded-lg outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)', color: '#ffffff', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px'
                }}
                onMouseOver={e => {
                  if (document.activeElement !== e.currentTarget) {
                     e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2), 0 0 8px rgba(255,255,255,0.05)'
                     e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  }
                }}
                onMouseOut={e => {
                  if (document.activeElement !== e.currentTarget) {
                     e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'
                     e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  }
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
              <button type="button" onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.5)] hover:text-white transition-colors">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-2">Environment</label>
            <div className="flex gap-2">
              {(['development', 'staging', 'production'] as const).map(e => (
                <button key={e} onClick={() => setEnv(e)}
                  className="flex-1 h-9 rounded-lg text-xs font-medium transition-all duration-200 capitalize"
                  style={{
                    background: env === e ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                    border: env === e ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.05)',
                    color: env === e ? '#ffffff' : 'rgba(255,255,255,0.5)'
                  }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          
          <InputField label="Tags" value={initialData?.tags.join(', ') ?? ''} onChange={() => {}} placeholder="e.g. core, billing, sandbox" hint="Comma separated for organizing keys" />
          <InputField label="Permissions" value={initialData?.permissions.join(', ') ?? ''} onChange={() => {}} placeholder="e.g. chat, completions, embeddings" hint="Restrict the scope of what this key can access" />
        </div>

        <div className="flex items-center gap-3 mt-8">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.1)]"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Cancel
          </button>
          <button
            onClick={() => {
              if (!name || !keyStr) return
              onSave({
                id: initialData?.id ?? `k${Date.now()}`, provider, name, key: keyStr, environment: env,
                status: initialData?.status ?? 'active', lastUsed: initialData?.lastUsed ?? 'Never', created: initialData?.created ?? 'Just now',
                tags: ['new'], permissions: ['all']
              })
            }}
            disabled={!name || !keyStr}
            className="flex-1 h-10 rounded-xl text-sm font-medium text-white transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{ 
              background: 'linear-gradient(135deg, var(--color-accent), #e11d48)', 
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
              fontFamily: "'Space Grotesk', sans-serif" 
            }}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Refresh Action Button ────────────────────────────────────────────────────
function RefreshActionButton({ onRefresh }: { onRefresh: () => void }) {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [hover, setHover] = useState(false)
  const onRefreshRef = useRef(onRefresh)

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>
    let t2: ReturnType<typeof setTimeout>
    if (state === 'loading') {
      t1 = setTimeout(() => {
        setState('success')
        onRefreshRef.current()
      }, 1000)
    } else if (state === 'success') {
      t2 = setTimeout(() => {
        setState('idle')
      }, 500)
    }
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [state])

  const handleClick = () => {
    if (state !== 'idle') return
    setState('loading')
  }

  return (
    <button
      onClick={handleClick}
      disabled={state !== 'idle'}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="p-2 rounded-full transition-all duration-300 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-accent"
      style={{
        color: state === 'loading' ? 'var(--color-accent)' : state === 'success' ? 'var(--color-success)' : hover ? 'var(--color-accent)' : 'var(--color-muted)',
        transform: hover && state === 'idle' ? 'scale(1.05)' : 'scale(1)',
        background: hover && state === 'idle' ? 'var(--color-surface-2)' : 'transparent',
        filter: hover && state === 'idle' ? 'drop-shadow(0 0 4px rgba(255, 59, 59, 0.4))' : 'none'
      }}
      title="Refresh API Key"
    >
      <div className="relative w-[14px] h-[14px] flex items-center justify-center">
        <Check 
          size={14} 
          className="absolute transition-all duration-200" 
          style={{ transform: state === 'success' ? 'scale(1)' : 'scale(0)', opacity: state === 'success' ? 1 : 0 }} 
        />
        <RefreshCw 
          size={14} 
          className={`absolute transition-all duration-200 ${state === 'loading' ? 'animate-spin' : ''}`} 
          style={{ transform: state === 'success' ? 'scale(0)' : 'scale(1)', opacity: state === 'success' ? 0 : 1 }} 
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

function PowerToggleButton({ isActive, onClick, animating }: { isActive: boolean, onClick: () => void, animating: boolean }) {
  const [hover, setHover] = useState(false)
  const activeColor = '#22C55E'
  const disabledColor = '#EF4444'
  const color = isActive ? activeColor : disabledColor
  const title = isActive ? 'Disable API Key' : 'Enable API Key'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="p-2 rounded-full transition-all duration-300 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-accent"
      style={{
        color: hover || animating ? color : 'var(--color-muted)',
        transform: hover && !animating ? 'scale(1.05)' : 'scale(1)',
        background: hover ? 'var(--color-surface-2)' : 'transparent',
        filter: hover || animating ? `drop-shadow(0 0 4px ${color}66)` : 'none'
      }}
      title={title}
      aria-label={title}
    >
      <Power 
        size={14} 
        className={animating ? 'animate-power-toggle' : ''}
        style={{ transition: 'color 0.3s ease' }}
      />
    </button>
  )
}

function ConfirmToggleModal({ isActive, onConfirm, onClose }: { isActive: boolean, onConfirm: () => void, onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const title = isActive ? 'Disable API Key?' : 'Enable API Key?'
  const desc = isActive 
    ? 'This API key will stop handling requests until it is enabled again.'
    : 'This API key will begin accepting requests immediately.'
  const primaryText = isActive ? 'Disable Key' : 'Enable Key'
  const shadowColor = isActive ? 'rgba(225, 29, 72, 0.3)' : 'rgba(34, 197, 94, 0.3)'
  const primaryGradient = isActive 
    ? 'linear-gradient(135deg, var(--color-accent), #e11d48)' 
    : 'linear-gradient(135deg, #22c55e, #16a34a)'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 transition-opacity" onClick={onClose} style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(8px)' }} />
      <div className="relative z-10 w-full max-w-sm p-6 animate-fade-in-up text-center"
        style={{ background: 'rgba(18,18,22,0.72)', backdropFilter: 'blur(32px) saturate(180%)', borderRadius: '24px', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14), 0 30px 80px rgba(0,0,0,0.35)', color: '#ffffff' }}>
        
        <h2 className="text-lg font-semibold tracking-tight text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
        <p className="text-sm text-[rgba(255,255,255,0.7)] mb-6">{desc}</p>
        
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.1)]"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 h-10 rounded-xl text-sm font-medium text-white transition-all hover-lift"
            style={{ background: primaryGradient, boxShadow: `0 4px 12px ${shadowColor}`, fontFamily: "'Space Grotesk', sans-serif" }}>
            {primaryText}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS)
  const [search, setSearch] = useState('')
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [toastMsg, setToastMsg] = useState('')
  const [editTarget, setEditTarget] = useState<ApiKey | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [toggleTarget, setToggleTarget] = useState<ApiKey | null>(null)
  const [animatingToggle, setAnimatingToggle] = useState<string | null>(null)

  const showToast = useCallback((m: string) => {
    setToastMsg(m)
    setTimeout(() => setToastMsg(''), 2500)
  }, [])

  const handleReveal = (id: string) => {
    setRevealed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const handleDelete = (id: string) => {
    setKeys(ks => ks.filter(k => k.id !== id))
    showToast('API Key deleted')
  }

  const handleRefresh = (id: string) => {
    setKeys(ks => ks.map(k => k.id === id ? { ...k, status: 'active', lastUsed: 'Just now' } : k))
    showToast('API key refreshed successfully')
  }

  const handleConfirmToggle = () => {
    if (!toggleTarget) return
    const id = toggleTarget.id
    const newStatus = toggleTarget.status === 'active' ? 'disabled' : 'active'
    const msg = newStatus === 'active' ? 'API key enabled' : 'API key disabled'
    
    setToggleTarget(null)
    setKeys(ks => ks.map(k => k.id === id ? { ...k, status: newStatus } : k))
    setAnimatingToggle(id)
    
    setTimeout(() => {
      showToast(msg)
      setAnimatingToggle(null)
    }, 600)
  }

  const handleSave = (k: ApiKey) => {
    setKeys(ks => {
      const idx = ks.findIndex(x => x.id === k.id)
      if (idx >= 0) {
        const n = [...ks]
        n[idx] = k
        return n
      }
      return [k, ...ks]
    })
    setEditTarget(null)
    setShowCreate(false)
    showToast(editTarget ? 'API Key updated' : 'API Key created')
  }

  const filtered = keys.filter(k => !search || k.name.toLowerCase().includes(search.toLowerCase()) || k.provider.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-8 animate-fade-in">
      <style>{POWER_TOGGLE_STYLE}</style>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>API Keys</h1>
          <p className="text-sm text-muted mt-1">Manage provider credentials securely.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <FileText size={14} /> Documentation
          </button>
          <button className="flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <Upload size={14} /> Import
          </button>
          <button onClick={() => setShowCreate(true)}
            className="hover-lift flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-medium text-white"
            style={{ background: 'var(--color-accent)', fontFamily: "'Space Grotesk', sans-serif" }}>
            <Plus size={14} /> Create API Key
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Key size={16} className="text-accent" />} label="Total Keys" valueNum={keys.length} />
        <StatCard icon={<CheckCircle2 size={16} className="text-success" />} label="Active Keys" valueNum={keys.filter(k => k.status === 'active').length} />
        <StatCard icon={<AlertTriangle size={16} className="text-warning" />} label="Expiring Soon" valueNum={1} />
        <StatCard icon={<Clock size={16} className="text-info" />} label="Last Updated" valueStr="2 min ago" />
      </div>

      {/* Provider Table Area */}
      <div className="mt-4">
        <div className="pb-4 flex items-center justify-between border-b mb-2" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Provider Keys</h2>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search keys…"
              className="h-8 pl-8 pr-3 rounded-md text-xs outline-none transition-colors"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)', width: '240px' }}
              onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-border-2)')}
              onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')} />
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: '850px' }}>
            <thead>
              <tr>
                <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">Provider</th>
                <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">Status</th>
                <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">Key Name</th>
                <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">Secret Key</th>
                <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">Environment</th>
                <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">Last Used</th>
                <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap">Created</th>
                <th className="px-5 py-2 text-xs font-medium text-muted font-sans whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => {
                const pObj = PROVIDERS.find(p => p.id === k.provider)!
                return (
                  <tr key={k.id} className="group transition-all duration-200"
                      style={{ background: 'transparent' }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = 'var(--color-surface)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'none';
                      }}
                  >
                    {/* Provider */}
                    <td className="px-5 py-4 whitespace-nowrap rounded-l-[12px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${pObj.color}15`, border: `1px solid ${pObj.color}40`, color: pObj.color }}>
                          <ProviderIcon type={pObj.id} className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{pObj.name}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={k.status} />
                    </td>
                    {/* Key Name */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground font-medium">{k.name}</span>
                    </td>
                    {/* Masked Key */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <code className="text-xs text-muted truncate bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {revealed.has(k.id) ? k.key : maskKey(k.key)}
                        </code>
                        <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleReveal(k.id)} className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-[var(--color-surface-2)] transition-colors">
                            {revealed.has(k.id) ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <CopyButton text={k.key} size={13} />
                        </div>
                      </div>
                    </td>
                    {/* Environment */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="capitalize text-xs text-muted bg-[var(--color-surface-2)] px-2 py-1 rounded-md">{k.environment}</span>
                    </td>
                    {/* Last Used */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-muted">{k.lastUsed}</td>
                    {/* Created */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-muted">{k.created}</td>
                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right rounded-r-[12px]">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditTarget(k)} className="p-2 rounded-full text-muted hover:text-foreground hover:bg-[var(--color-surface-2)] transition-all" title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <RefreshActionButton onRefresh={() => handleRefresh(k.id)} />
                        <PowerToggleButton isActive={k.status === 'active'} onClick={() => setToggleTarget(k)} animating={animatingToggle === k.id} />
                        <button onClick={() => handleDelete(k.id)} className="p-2 rounded-full text-muted hover:text-white hover:bg-accent transition-all" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-sm text-muted">No API keys found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {[
          { title: 'Encrypted Storage', desc: 'AES-256-GCM encryption at rest', icon: ShieldCheck, color: 'var(--color-success)' },
          { title: 'Rotation Reminder', desc: 'Keys over 90 days are flagged', icon: Clock, color: 'var(--color-warning)' },
          { title: 'Key Validation', desc: 'Automated syntax & live checking', icon: CheckCircle2, color: 'var(--color-info)' },
          { title: 'Audit Logs', desc: 'All key actions are permanently logged', icon: FileText, color: 'var(--color-muted)' },
        ].map(s => (
          <div key={s.title} className="p-5 rounded-2xl flex items-start gap-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: s.color }}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.title}</p>
              <p className="text-xs text-muted mt-1">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {(showCreate || editTarget) && (
        <ApiKeyModal
          isEdit={!!editTarget}
          initialData={editTarget || undefined}
          onSave={handleSave}
          onClose={() => { setShowCreate(false); setEditTarget(null) }}
        />
      )}
      {toggleTarget && (
        <ConfirmToggleModal 
          isActive={toggleTarget.status === 'active'}
          onConfirm={handleConfirmToggle}
          onClose={() => setToggleTarget(null)}
        />
      )}
      {toastMsg && <Toast message={toastMsg} />}
    </div>
  )
}
