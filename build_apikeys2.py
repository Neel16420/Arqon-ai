"""Generates src/pages/ApiKeys.tsx with the NEW API Keys page implementation (Gateway key management)."""
import pathlib

content = r"""/**
 * ApiKeys.tsx - API Key Management Page
 * Uses the existing Arqon design system exclusively.
 */
import { useState, useCallback, useEffect, memo } from 'react'
import {
  Plus, Search, Download, Eye, EyeOff, Copy, Check,
  Trash2, Edit3, RefreshCw, X, Key, Shield, Clock, ShieldCheck,
  AlertTriangle, CheckCircle2, XCircle, FileText, Upload, MoreHorizontal
} from 'lucide-react'
import { cn, maskKey } from '../utils'
import { useCountUp } from '../motion/useCountUp'
import { useReducedMotion } from '../motion/useReducedMotion'
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
const StatCard = memo(function StatCard({ icon, label, valueNum, valueStr, color = 'var(--color-accent)' }: {
  icon: React.ReactNode; label: string; valueNum?: number; valueStr?: string; color?: string
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
      className="p-1.5 rounded text-muted hover:text-foreground transition-colors"
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
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">
        {label}{required && <span className="text-accent ml-0.5">*</span>}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full h-9 px-3 text-sm rounded-lg outline-none transition-colors focus:border-[var(--color-border-2)]"
        style={{
          background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
          color: 'var(--color-foreground)',
          fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
          fontSize: mono ? '12px' : undefined,
        }}
      />
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
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
      <div className="absolute inset-0 glass-overlay" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg rounded-xl p-6 glass-elevated glass-border glass-shadow glass-highlight animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {isEdit ? 'Edit API Key' : 'Create API Key'}
            </h2>
            <p className="text-xs text-muted mt-0.5">{isEdit ? 'Update key configuration' : 'Add a new provider credential'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"
            style={{ background: 'var(--color-surface-2)' }} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Provider</label>
            <div className="grid grid-cols-4 gap-2">
              {PROVIDERS.map(p => (
                <button key={p.id} onClick={() => setProvider(p.id)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors border"
                  style={{
                    background: provider === p.id ? `${p.color}15` : 'var(--color-surface-2)',
                    borderColor: provider === p.id ? `${p.color}60` : 'var(--color-border)',
                  }}>
                  <ProviderIcon type={p.id} className="w-4 h-4" />
                  <span className="text-[10px] text-muted truncate w-full text-center">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <InputField label="Display Name" value={name} onChange={setName} placeholder={`${pObj.name} Key`} required />

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Secret Key <span className="text-accent">*</span></label>
            <div className="relative">
              <input type={showKey ? 'text' : 'password'} value={keyStr} onChange={e => setKeyStr(e.target.value)}
                placeholder="sk-..." required
                className="w-full h-9 px-3 pr-10 text-sm rounded-lg outline-none transition-colors focus:border-[var(--color-border-2)]"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}
              />
              <button type="button" onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Environment</label>
            <div className="flex gap-2">
              {(['development', 'staging', 'production'] as const).map(e => (
                <button key={e} onClick={() => setEnv(e)}
                  className="flex-1 h-8 rounded-lg text-xs font-medium transition-colors border capitalize"
                  style={{
                    background: env === e ? 'var(--color-surface)' : 'var(--color-surface-2)',
                    borderColor: env === e ? 'var(--color-border-2)' : 'var(--color-border)',
                    color: env === e ? 'var(--color-foreground)' : 'var(--color-muted)'
                  }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          
          <InputField label="Tags (comma separated)" value={initialData?.tags.join(', ') ?? ''} onChange={() => {}} placeholder="e.g. core, billing, sandbox" hint="Used for organizing and filtering keys" />
          <InputField label="Permissions (comma separated)" value={initialData?.permissions.join(', ') ?? ''} onChange={() => {}} placeholder="e.g. chat, completions, embeddings" hint="Restrict the scope of what this key can access" />
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={onClose} className="flex-1 h-9 rounded-lg text-sm font-medium text-muted"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
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
            className="flex-1 h-9 rounded-lg text-sm font-medium text-white hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-accent)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Save
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

  const handleRotate = (id: string) => {
    setKeys(ks => ks.map(k => k.id === id ? { ...k, key: `sk-rot-${Math.random().toString(36).slice(2)}`, lastUsed: 'Just now' } : k))
    showToast('API Key rotated')
  }

  const handleToggleDisable = (id: string) => {
    setKeys(ks => ks.map(k => k.id === id ? { ...k, status: k.status === 'active' ? 'disabled' : 'active' } : k))
    showToast('API Key status updated')
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>API Keys</h1>
          <p className="text-sm text-muted mt-1">Manage provider credentials securely.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <FileText size={14} /> Documentation
          </button>
          <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <Upload size={14} /> Import
          </button>
          <button onClick={() => setShowCreate(true)}
            className="hover-lift flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-medium text-white"
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
      <div className="rounded-xl overflow-hidden glass-surface glass-border shadow-sm">
        <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Provider Keys</h2>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search keys…"
              className="h-8 pl-8 pr-3 rounded-md text-xs outline-none"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)', width: '200px' }}
              onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-border-2)')}
              onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                <th className="px-4 py-3 text-xs font-medium text-muted font-sans whitespace-nowrap">Provider</th>
                <th className="px-4 py-3 text-xs font-medium text-muted font-sans whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-muted font-sans whitespace-nowrap">Key Name</th>
                <th className="px-4 py-3 text-xs font-medium text-muted font-sans whitespace-nowrap">Secret Key</th>
                <th className="px-4 py-3 text-xs font-medium text-muted font-sans whitespace-nowrap">Environment</th>
                <th className="px-4 py-3 text-xs font-medium text-muted font-sans whitespace-nowrap">Last Used</th>
                <th className="px-4 py-3 text-xs font-medium text-muted font-sans whitespace-nowrap">Created</th>
                <th className="px-4 py-3 text-xs font-medium text-muted font-sans whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {filtered.map(k => {
                const pObj = PROVIDERS.find(p => p.id === k.provider)!
                return (
                  <tr key={k.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                    {/* Provider */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                          style={{ background: `${pObj.color}15`, border: `1px solid ${pObj.color}40`, color: pObj.color }}>
                          <ProviderIcon type={pObj.id} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-medium text-foreground">{pObj.name}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={k.status} />
                    </td>
                    {/* Key Name */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-foreground font-medium">{k.name}</span>
                    </td>
                    {/* Masked Key */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <code className="text-xs text-muted truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {revealed.has(k.id) ? k.key : maskKey(k.key)}
                        </code>
                        <div className="flex items-center shrink-0">
                          <button onClick={() => handleReveal(k.id)} className="p-1 rounded text-muted hover:text-foreground">
                            {revealed.has(k.id) ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                          <CopyButton text={k.key} size={11} />
                        </div>
                      </div>
                    </td>
                    {/* Environment */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="capitalize text-xs text-muted">{k.environment}</span>
                    </td>
                    {/* Last Used */}
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted">{k.lastUsed}</td>
                    {/* Created */}
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted">{k.created}</td>
                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditTarget(k)} className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)] transition-all" title="Edit">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => handleRotate(k.id)} className="p-1.5 rounded-md text-muted hover:text-warning hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)] transition-all" title="Rotate Key">
                          <RefreshCw size={13} />
                        </button>
                        <button onClick={() => handleToggleDisable(k.id)} className="p-1.5 rounded-md text-muted hover:text-info hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)] transition-all" title={k.status === 'active' ? 'Disable' : 'Enable'}>
                          <Shield size={13} />
                        </button>
                        <button onClick={() => handleDelete(k.id)} className="p-1.5 rounded-md text-muted hover:text-accent hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)] transition-all" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-xs text-muted">No API keys found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Encrypted Storage', desc: 'AES-256-GCM encryption at rest', icon: ShieldCheck, color: 'var(--color-success)' },
          { title: 'Rotation Reminder', desc: 'Keys over 90 days are flagged', icon: Clock, color: 'var(--color-warning)' },
          { title: 'Key Validation', desc: 'Automated syntax & live checking', icon: CheckCircle2, color: 'var(--color-info)' },
          { title: 'Audit Logs', desc: 'All key actions are permanently logged', icon: FileText, color: 'var(--color-muted)' },
        ].map(s => (
          <div key={s.title} className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: s.color }}>
              <s.icon size={14} />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.title}</p>
              <p className="text-[10px] text-muted mt-0.5">{s.desc}</p>
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
      {toastMsg && <Toast message={toastMsg} />}
    </div>
  )
}
"""

out = pathlib.Path('src/pages/ApiKeys.tsx')
out.write_text(content, encoding='utf-8')
print(f'Written {out.stat().st_size} bytes to ApiKeys.tsx')
