"""Generates src/pages/ApiKeys.tsx with the full API Keys page implementation."""
import pathlib, textwrap

content = r"""/**
 * ApiKeys.tsx - AI Provider API Keys Management Page
 * Uses the existing Arqon design system exclusively.
 * All interactions via React state (mock data only, no backend).
 */
import { useState, useCallback, useEffect, useRef, memo } from 'react'
import {
  Plus, Search, Filter, Download, Eye, EyeOff, Copy, Check,
  Trash2, Edit3, RefreshCw, Wifi, X, Key, DollarSign,
  AlertTriangle, Layers, Loader, ArrowUpRight, ArrowDownRight,
  Clock, Server, ChevronRight, Activity,
} from 'lucide-react'
import { cn, maskKey, formatLatency } from '../utils'
import { useCountUp } from '../motion/useCountUp'
import { useReducedMotion } from '../motion/useReducedMotion'
import { ProviderIcon } from '../components/icons/ProviderLogos'

// ─── Types ────────────────────────────────────────────────────────────────────
type ProviderStatus = 'healthy' | 'degraded' | 'error' | 'offline'

interface ProviderKey {
  id: string; name: string; type: string; color: string
  status: ProviderStatus; apiKey: string; orgId: string | null
  region: string; nickname: string; models: string[]
  lastVerified: string; lastUsed: string; dailyRequests: number
  monthlyCost: number; latency: number; health: number; enabled: boolean
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const initialKeys: ProviderKey[] = [
  {
    id: 'pk-openai', name: 'OpenAI', type: 'openai', color: '#10A37F', status: 'healthy',
    apiKey: 'sk-proj-8f3a2b1c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f',
    orgId: 'org-ArqonProd2024', region: 'us-east-1', nickname: 'Production OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'text-embedding-3-large'],
    lastVerified: '2 min ago', lastUsed: '14s ago', dailyRequests: 94200,
    monthlyCost: 1247.8, latency: 210, health: 99.99, enabled: true,
  },
  {
    id: 'pk-anthropic', name: 'Anthropic', type: 'anthropic', color: '#D97706', status: 'healthy',
    apiKey: 'sk-ant-api03-aBcDeF1234567890abcdef1234567890abcdef1234567890ab',
    orgId: null, region: 'us-east-1', nickname: 'Claude Production',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    lastVerified: '5 min ago', lastUsed: '28s ago', dailyRequests: 66700,
    monthlyCost: 892.4, latency: 248, health: 99.98, enabled: true,
  },
  {
    id: 'pk-google', name: 'Google AI', type: 'google', color: '#4285F4', status: 'healthy',
    apiKey: 'AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz0123456789',
    orgId: 'proj-arqon-prod-482917', region: 'us-central1', nickname: 'Gemini Production',
    models: ['gemini-1.5-pro-002', 'gemini-1.5-flash-002', 'gemini-2.0-flash'],
    lastVerified: '1 min ago', lastUsed: '45s ago', dailyRequests: 44400,
    monthlyCost: 421.3, latency: 185, health: 100, enabled: true,
  },
  {
    id: 'pk-azure', name: 'Azure OpenAI', type: 'azure', color: '#0078D4', status: 'offline',
    apiKey: 'f3a2b1c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
    orgId: 'arqon-eastus-prod', region: 'East US', nickname: 'Azure GPT-4',
    models: ['gpt-4', 'gpt-4-32k', 'gpt-35-turbo'],
    lastVerified: '2h ago', lastUsed: '2h ago', dailyRequests: 7400,
    monthlyCost: 318.9, latency: 0, health: 0, enabled: false,
  },
  {
    id: 'pk-groq', name: 'Groq', type: 'groq', color: '#F55036', status: 'healthy',
    apiKey: 'gsk_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdef',
    orgId: null, region: 'us-east-1', nickname: 'Groq Inference',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    lastVerified: '3 min ago', lastUsed: '2m ago', dailyRequests: 22200,
    monthlyCost: 98.4, latency: 142, health: 99.95, enabled: true,
  },
  {
    id: 'pk-mistral', name: 'Mistral', type: 'mistral', color: '#7C3AED', status: 'degraded',
    apiKey: 'AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdef12345',
    orgId: null, region: 'eu-west-1', nickname: 'Mistral API',
    models: ['mistral-large-2411', 'mistral-small-2501', 'codestral-2501'],
    lastVerified: '8 min ago', lastUsed: '2m ago', dailyRequests: 18100,
    monthlyCost: 156.7, latency: 834, health: 97.2, enabled: true,
  },
  {
    id: 'pk-openrouter', name: 'OpenRouter', type: 'openrouter', color: '#6366F1', status: 'healthy',
    apiKey: 'sk-or-v1-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdef12',
    orgId: null, region: 'global', nickname: 'OpenRouter Gateway',
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro-1.5'],
    lastVerified: '4 min ago', lastUsed: '5m ago', dailyRequests: 11300,
    monthlyCost: 73.2, latency: 298, health: 99.8, enabled: true,
  },
  {
    id: 'pk-deepseek', name: 'DeepSeek', type: 'deepseek', color: '#0EA5E9', status: 'healthy',
    apiKey: 'sk-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdef1234',
    orgId: null, region: 'ap-southeast-1', nickname: 'DeepSeek Chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    lastVerified: '6 min ago', lastUsed: '12m ago', dailyRequests: 8900,
    monthlyCost: 41.5, latency: 312, health: 99.7, enabled: true,
  },
]

const sparkData = {
  providers: [6, 7, 7, 8, 8, 8, 8, 8], keys: [8, 8, 8, 9, 9, 8, 9, 8],
  latency: [312, 298, 334, 287, 210, 276, 248, 225],
  cost: [2800, 3100, 2950, 3400, 3100, 3200, 3300, 3249],
  failed: [2, 1, 3, 1, 1, 2, 1, 1], models: [28, 30, 31, 32, 34, 35, 36, 38],
}

const ADD_PROVIDER_LIST = [
  { type: 'openai', name: 'OpenAI', color: '#10A37F' },
  { type: 'anthropic', name: 'Anthropic', color: '#D97706' },
  { type: 'google', name: 'Google AI', color: '#4285F4' },
  { type: 'azure', name: 'Azure OpenAI', color: '#0078D4' },
  { type: 'groq', name: 'Groq', color: '#F55036' },
  { type: 'mistral', name: 'Mistral', color: '#7C3AED' },
  { type: 'openrouter', name: 'OpenRouter', color: '#6366F1' },
  { type: 'deepseek', name: 'DeepSeek', color: '#0EA5E9' },
]

// ─── Mini Sparkline (mirrors Overview) ───────────────────────────────────────
function MiniSparkline({ data, color = 'var(--color-accent)', gradientId, width = 64, height = 28 }: {
  data: number[]; color?: string; gradientId: string; width?: number; height?: number
}) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * width, y: height - ((v - min) / range) * (height - 4) - 2 }))
  const linePts = pts.map(p => `${p.x},${p.y}`).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${linePts} ${width},${height}`} fill={`url(#${gradientId})`} stroke="none" className="animate-fade-in" />
      <polyline points={linePts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sparkline-draw" />
    </svg>
  )
}

// ─── Background Sparkline (mirrors Overview) ──────────────────────────────────
function BackgroundSparkline({ data, color = 'var(--color-accent)', gradientId }: {
  data: number[]; color?: string; gradientId: string
}) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1
  const W = 100, H = 52
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - ((v - min) / range) * (H - 8) - 4 }))
  const linePts = pts.map(p => `${p.x},${p.y}`).join(' ')
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${linePts} ${W},${H}`} fill={`url(#${gradientId})`} stroke="none" />
      <polyline points={linePts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Status Badge (matches Providers.tsx) ─────────────────────────────────────
function StatusBadge({ status }: { status: ProviderStatus }) {
  const cfg: Record<ProviderStatus, { bg: string; color: string; label: string }> = {
    healthy:  { bg: 'rgb(var(--color-success-rgb) / 0.08)', color: 'var(--color-success)', label: 'Healthy'  },
    degraded: { bg: 'rgba(245,158,11,0.08)',                color: 'var(--color-warning)', label: 'Degraded' },
    error:    { bg: 'rgb(var(--color-accent-rgb) / 0.08)', color: 'var(--color-accent)',   label: 'Error'    },
    offline:  { bg: 'rgba(82,82,91,0.08)',                  color: '#71717A',               label: 'Offline'  },
  }
  const c = cfg[status]
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.color, fontFamily: "'JetBrains Mono', monospace" }}>
      <span className="relative flex h-1.5 w-1.5">
        {status !== 'offline' && (
          <span className="animate-pulse-slow absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: c.color }} />
        )}
        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: c.color }} />
      </span>
      {c.label}
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

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success' }: { message: string; type?: 'success' | 'error' | 'info' }) {
  const map = {
    success: { bg: 'rgb(var(--color-success-rgb) / 0.1)', border: 'rgb(var(--color-success-rgb) / 0.2)', icon: <Check size={13} className="text-success" />, cls: 'text-success' },
    error:   { bg: 'rgb(var(--color-accent-rgb) / 0.1)',  border: 'rgb(var(--color-accent-rgb) / 0.2)',  icon: <X size={13} className="text-accent" />,    cls: 'text-accent'  },
    info:    { bg: 'rgba(59,130,246,0.08)',               border: 'rgba(59,130,246,0.2)',               icon: <Activity size={13} className="text-info" />,cls: 'text-info'    },
  }
  const c = map[type]
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg animate-fade-in-up glass-open"
      style={{ background: c.bg, border: `1px solid ${c.border}` }} role="alert" aria-live="polite">
      {c.icon}
      <span className={cn('text-xs font-medium', c.cls)} style={{ fontFamily: "'Inter', sans-serif" }}>{message}</span>
    </div>
  )
}

// ─── Input Field (mirrors Settings.tsx) ──────────────────────────────────────
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
        className="w-full h-9 px-3 text-sm rounded-lg outline-none"
        style={{
          background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
          color: 'var(--color-foreground)',
          fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
          fontSize: mono ? '12px' : undefined,
        }}
        onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-border-2)')}
        onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')}
      />
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  )
}

// ─── Stat Card (identical structure to Overview's StatCard) ───────────────────
const StatCard = memo(function StatCard({ id, icon, label, valueNum, valueSuffix = '', valueDecimals = 0, delta, deltaPositive, data, color = 'var(--color-accent)' }: {
  id: string; icon: React.ReactNode; label: string; valueNum: number
  valueSuffix?: string; valueDecimals?: number; delta: string
  deltaPositive: boolean; data: number[]; color?: string
}) {
  const animated = useCountUp(valueNum, 1400, valueDecimals)
  return (
    <div className="hover-lift relative flex flex-col gap-3 p-5 rounded-xl overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: 'rgb(var(--color-accent-rgb) / 0.08)', border: '1px solid rgb(var(--color-accent-rgb) / 0.15)' }}>
          {icon}
        </div>
        <MiniSparkline data={data} color={color} gradientId={`ak-spark-sm-${id}`} width={64} height={28} />
      </div>
      <p className="text-xs text-muted relative z-10">{label}</p>
      <div className="relative" style={{ minHeight: '40px' }}>
        <div className="absolute" style={{ left: '-20px', right: '-20px', bottom: '-4px', height: '52px', opacity: 0.5 }}>
          <BackgroundSparkline data={data} color={color} gradientId={`ak-spark-bg-${id}`} />
        </div>
        <p className="relative z-10 text-2xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {animated}{valueSuffix}
        </p>
      </div>
      <div className="flex items-center gap-1.5 relative z-10">
        {deltaPositive ? <ArrowUpRight size={13} className="text-success" /> : <ArrowDownRight size={13} className="text-accent" />}
        <span className={cn('text-xs font-medium', deltaPositive ? 'text-success' : 'text-accent')} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{delta}</span>
        <span className="text-xs text-muted">vs last period</span>
      </div>
    </div>
  )
})

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onCancel])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 glass-overlay" onClick={onCancel} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-xl p-6 glass-elevated glass-border glass-shadow glass-highlight animate-fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgb(var(--color-accent-rgb) / 0.1)', border: '1px solid rgb(var(--color-accent-rgb) / 0.2)' }}>
            <Trash2 size={16} className="text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Remove Provider</h2>
            <p className="text-xs text-muted mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-muted mb-6">
          Are you sure you want to remove <span className="text-foreground font-medium">{name}</span>? All associated key data will be deleted.
        </p>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="flex-1 h-9 rounded-lg text-sm font-medium text-muted"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontFamily: "'Inter', sans-serif" }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 h-9 rounded-lg text-sm font-medium text-white hover-lift"
            style={{ background: 'var(--color-accent)', fontFamily: "'Space Grotesk', sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FF5252')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}>
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Rotate Confirm Modal ─────────────────────────────────────────────────────
function RotateConfirmModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onCancel])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 glass-overlay" onClick={onCancel} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-xl p-6 glass-elevated glass-border glass-shadow glass-highlight animate-fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <RefreshCw size={16} className="text-warning" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Rotate API Key</h2>
            <p className="text-xs text-muted mt-0.5">Invalidates the current key immediately</p>
          </div>
        </div>
        <p className="text-sm text-muted mb-6">
          Rotating the key for <span className="text-foreground font-medium">{name}</span> will generate a new credential. Update any services using this key.
        </p>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="flex-1 h-9 rounded-lg text-sm font-medium text-muted"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontFamily: "'Inter', sans-serif" }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 h-9 rounded-lg text-sm font-medium text-white hover-lift"
            style={{ background: 'var(--color-warning)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Rotate Key
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ provider, onSave, onClose }: { provider: ProviderKey; onSave: (p: ProviderKey) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    nickname: provider.nickname, apiKey: provider.apiKey,
    orgId: provider.orgId ?? '', region: provider.region,
  })
  const [showKey, setShowKey] = useState(false)
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 glass-overlay" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-xl p-6 glass-elevated glass-border glass-shadow glass-highlight animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${provider.color}18`, border: `1px solid ${provider.color}40`, color: provider.color }}>
              <ProviderIcon type={provider.type} className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Edit {provider.name}</h2>
              <p className="text-xs text-muted">Update provider credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"
            style={{ background: 'var(--color-surface-2)' }} aria-label="Close">
            <X size={14} />
          </button>
        </div>
        <div className="space-y-4">
          <InputField label="Nickname" value={form.nickname} onChange={v => setForm(f => ({ ...f, nickname: v }))} placeholder="e.g. Production OpenAI" />
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">API Key</label>
            <div className="relative">
              <input type={showKey ? 'text' : 'password'} value={form.apiKey}
                onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                placeholder="Enter API key" className="w-full h-9 px-3 pr-10 text-sm rounded-lg outline-none"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}
                onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-border-2)')}
                onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')} />
              <button type="button" onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                aria-label="Toggle key visibility">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Organization ID" value={form.orgId} onChange={v => setForm(f => ({ ...f, orgId: v }))} placeholder="org-..." mono hint="Optional" />
            <InputField label="Region" value={form.region} onChange={v => setForm(f => ({ ...f, region: v }))} placeholder="us-east-1" mono />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <button onClick={onClose} className="flex-1 h-9 rounded-lg text-sm font-medium text-muted"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontFamily: "'Inter', sans-serif" }}>
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...provider, nickname: form.nickname || provider.nickname, apiKey: form.apiKey || provider.apiKey, orgId: form.orgId || null, region: form.region || provider.region })}
            className="flex-1 h-9 rounded-lg text-sm font-medium text-white hover-lift"
            style={{ background: 'var(--color-accent)', fontFamily: "'Space Grotesk', sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FF5252')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Provider Modal ───────────────────────────────────────────────────────
function AddProviderModal({ onAdd, onClose }: { onAdd: (p: ProviderKey) => void; onClose: () => void }) {
  const [step, setStep] = useState<'select' | 'configure'>('select')
  const [selected, setSelected] = useState<typeof ADD_PROVIDER_LIST[number] | null>(null)
  const [form, setForm] = useState({ apiKey: '', orgId: '', region: '', nickname: '' })
  const [showKey, setShowKey] = useState(false)
  const [testState, setTestState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const handleTest = async () => {
    setTestState('testing')
    await new Promise(r => setTimeout(r, 1400))
    setTestState(form.apiKey.length > 8 ? 'success' : 'error')
  }

  const handleAdd = () => {
    if (!selected || !form.apiKey) return
    onAdd({
      id: `pk-${selected.type}-${Date.now()}`, name: selected.name, type: selected.type,
      color: selected.color, status: 'healthy', apiKey: form.apiKey, orgId: form.orgId || null,
      region: form.region || 'us-east-1', nickname: form.nickname || `${selected.name} API`,
      models: [], lastVerified: 'Just now', lastUsed: 'Never',
      dailyRequests: 0, monthlyCost: 0, latency: 0, health: 100, enabled: true,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Add Provider">
      <div className="absolute inset-0 glass-overlay" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg rounded-xl p-6 glass-elevated glass-border glass-shadow glass-highlight animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {step === 'select' ? 'Add Provider' : `Configure ${selected?.name ?? ''}`}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {step === 'select' ? 'Choose an AI provider to connect' : 'Enter credentials for this provider'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {step === 'configure' && (
              <button onClick={() => setStep('select')} className="h-8 px-3 rounded-lg text-xs text-muted hover:text-foreground"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                Back
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-foreground"
              style={{ background: 'var(--color-surface-2)' }} aria-label="Close">
              <X size={15} />
            </button>
          </div>
        </div>

        {step === 'select' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ADD_PROVIDER_LIST.map(p => (
              <button key={p.type} onClick={() => { setSelected(p); setStep('configure') }}
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl hover-lift"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                onMouseEnter={e => (e.currentTarget.style.border = `1px solid ${p.color}60`)}
                onMouseLeave={e => (e.currentTarget.style.border = '1px solid var(--color-border)')}
                aria-label={`Select ${p.name}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${p.color}18`, border: `1px solid ${p.color}40`, color: p.color }}>
                  <ProviderIcon type={p.type} className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">{p.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {selected && (
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${selected.color}18`, border: `1px solid ${selected.color}40`, color: selected.color }}>
                  <ProviderIcon type={selected.type} className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{selected.name}</p>
                  <p className="text-xs text-muted">Selected provider</p>
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">API Key <span className="text-accent">*</span></label>
              <div className="relative">
                <input type={showKey ? 'text' : 'password'} value={form.apiKey}
                  onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                  placeholder="sk-... or equivalent" className="w-full h-9 px-3 pr-10 text-sm rounded-lg outline-none"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}
                  onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-border-2)')}
                  onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')}
                  autoFocus />
                <button type="button" onClick={() => setShowKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  aria-label="Toggle key visibility">
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Organization ID" value={form.orgId} onChange={v => setForm(f => ({ ...f, orgId: v }))} placeholder="org-..." mono hint="Optional" />
              <InputField label="Region" value={form.region} onChange={v => setForm(f => ({ ...f, region: v }))} placeholder="us-east-1" mono />
            </div>
            <InputField label="Nickname" value={form.nickname} onChange={v => setForm(f => ({ ...f, nickname: v }))} placeholder={`My ${selected?.name ?? 'Provider'}`} />
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-2">
                {testState === 'idle'    && <Wifi size={14} className="text-muted" />}
                {testState === 'testing' && <Loader size={14} className="text-info animate-spin" />}
                {testState === 'success' && <Check size={14} className="text-success" />}
                {testState === 'error'   && <AlertTriangle size={14} className="text-accent" />}
                <span className="text-xs text-muted">
                  {testState === 'idle'    && 'Verify connection before saving'}
                  {testState === 'testing' && 'Testing connection…'}
                  {testState === 'success' && 'Connection successful'}
                  {testState === 'error'   && 'Connection failed — check credentials'}
                </span>
              </div>
              <button onClick={handleTest} disabled={!form.apiKey || testState === 'testing'}
                className="text-xs font-medium text-accent disabled:opacity-40 disabled:cursor-not-allowed">
                Test
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="flex-1 h-9 rounded-lg text-sm font-medium text-muted"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontFamily: "'Inter', sans-serif" }}>
                Cancel
              </button>
              <button onClick={handleAdd} disabled={!form.apiKey}
                className="flex-1 h-9 rounded-lg text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed hover-lift"
                style={{ background: 'var(--color-accent)', fontFamily: "'Space Grotesk', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FF5252')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}>
                Add Provider
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Provider Health Panel ────────────────────────────────────────────────────
const HealthPanel = memo(function HealthPanel({ providers }: { providers: ProviderKey[] }) {
  const active = providers.filter(p => p.enabled)
  const hColor = (s: ProviderStatus) => ({
    healthy: 'var(--color-success)', degraded: 'var(--color-warning)',
    error: 'var(--color-accent)', offline: '#71717A',
  })[s]
  return (
    <div className="rounded-xl overflow-hidden card-hover" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="px-4 py-3.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Provider Health</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-breathe-green" />
            <span className="text-xs text-muted">Live</span>
          </div>
        </div>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {providers.map(p => (
          <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--color-surface-2)] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ background: `${p.color}18`, border: `1px solid ${p.color}40`, color: p.color }}>
                <ProviderIcon type={p.type} className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-foreground truncate">{p.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {p.enabled && p.status !== 'offline' ? (
                <>
                  <span className="text-xs tabular-nums"
                    style={{ color: p.latency > 500 ? 'var(--color-warning)' : 'var(--color-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {p.latency > 0 ? formatLatency(p.latency) : '—'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                    style={{ background: `${hColor(p.status)}14`, color: hColor(p.status), fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}>
                    <span className="w-1 h-1 rounded-full" style={{ background: hColor(p.status) }} />
                    {p.status === 'healthy' ? 'OK' : p.status}
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(82,82,91,0.08)', color: '#71717A', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}>
                  <span className="w-1 h-1 rounded-full" style={{ background: '#71717A' }} />Offline
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{active.length} of {providers.length} active</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            avg {Math.round(active.filter(p => p.latency > 0).reduce((s, p) => s + p.latency, 0) / Math.max(active.filter(p => p.latency > 0).length, 1))}ms
          </span>
        </div>
      </div>
    </div>
  )
})

// ─── Provider Card ────────────────────────────────────────────────────────────
interface ProviderCardProps {
  provider: ProviderKey; revealed: boolean
  onRevealToggle: (id: string) => void; onEdit: (p: ProviderKey) => void
  onDelete: (p: ProviderKey) => void; onRotate: (p: ProviderKey) => void
  onTestConnection: (p: ProviderKey) => void; testingId: string | null; animated: boolean
}

const ProviderCard = memo(function ProviderCard({ provider: p, revealed, onRevealToggle, onEdit, onDelete, onRotate, onTestConnection, testingId, animated }: ProviderCardProps) {
  const isTestingThis = testingId === p.id
  const healthColor = p.status === 'healthy' ? 'var(--color-success)' : p.status === 'degraded' ? 'var(--color-warning)' : p.status === 'error' ? 'var(--color-accent)' : '#52525B'
  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl hover-lift"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', opacity: p.enabled ? 1 : 0.65 }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: `${p.color}18`, border: `1px solid ${p.color}40`, color: p.color }}>
            <ProviderIcon type={p.type} className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{p.nickname || p.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted">{p.name}</span>
              <StatusBadge status={p.status} />
            </div>
          </div>
        </div>
        {p.enabled && p.latency > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full tabular-nums shrink-0"
            style={{ background: p.latency > 500 ? 'rgba(245,158,11,0.08)' : 'rgb(var(--color-success-rgb) / 0.08)', color: p.latency > 500 ? 'var(--color-warning)' : 'var(--color-success)', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}>
            {formatLatency(p.latency)}
          </span>
        )}
      </div>

      {/* API Key row */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
        <Key size={11} className="text-muted shrink-0" />
        <code className="flex-1 text-xs text-muted truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {revealed ? p.apiKey : maskKey(p.apiKey)}
        </code>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => onRevealToggle(p.id)} className="p-1.5 rounded text-muted hover:text-foreground transition-colors"
            aria-label={revealed ? 'Hide key' : 'Reveal key'}>
            {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <CopyButton text={p.apiKey} size={12} />
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {p.orgId && (
          <div>
            <p className="text-xs text-muted mb-0.5">Organization</p>
            <p className="text-xs text-foreground truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.orgId}</p>
          </div>
        )}
        <div><p className="text-xs text-muted mb-0.5">Region</p><p className="text-xs text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.region}</p></div>
        <div><p className="text-xs text-muted mb-0.5">Last Verified</p><p className="text-xs text-foreground">{p.lastVerified}</p></div>
        <div><p className="text-xs text-muted mb-0.5">Last Used</p><p className="text-xs text-foreground">{p.lastUsed}</p></div>
      </div>

      {/* Stats */}
      {p.enabled && (
        <div className="grid grid-cols-3 gap-3" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
          <div>
            <p className="text-xs text-muted mb-0.5">Daily Reqs</p>
            <p className="text-xs font-medium text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {p.dailyRequests >= 1000 ? `${(p.dailyRequests / 1000).toFixed(0)}K` : p.dailyRequests}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Monthly</p>
            <p className="text-xs font-medium text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${p.monthlyCost.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Health</p>
            <p className="text-xs font-medium" style={{ color: healthColor, fontFamily: "'JetBrains Mono', monospace" }}>
              {p.health > 0 ? `${p.health}%` : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Health bar */}
      {p.enabled && (
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <div className="h-full rounded-full" style={{
            width: animated ? `${p.health}%` : '0%', background: healthColor,
            transition: 'width 1.2s cubic-bezier(0.22,0.61,0.36,1) 150ms',
            boxShadow: p.health > 50 ? `0 0 6px ${healthColor}60` : 'none',
          }} />
        </div>
      )}

      {/* Models */}
      {p.models.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {p.models.slice(0, 3).map(m => (
            <span key={m} className="px-2 py-0.5 rounded-full text-xs text-muted"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}>
              {m.length > 22 ? `${m.slice(0, 22)}…` : m}
            </span>
          ))}
          {p.models.length > 3 && (
            <span className="px-2 py-0.5 rounded-full text-xs text-muted"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontSize: '10px' }}>
              +{p.models.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-wrap" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
        <button onClick={() => onEdit(p)}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontFamily: "'Inter', sans-serif" }}>
          <Edit3 size={11} /> Edit
        </button>
        <button onClick={() => onRotate(p)}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium text-muted hover:text-warning transition-colors"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontFamily: "'Inter', sans-serif" }}>
          <RefreshCw size={11} /> Rotate
        </button>
        <button onClick={() => onTestConnection(p)} disabled={isTestingThis || !p.enabled}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: isTestingThis ? 'var(--color-info)' : 'var(--color-muted)', fontFamily: "'Inter', sans-serif" }}>
          {isTestingThis ? <Loader size={11} className="animate-spin" /> : <Wifi size={11} />}
          {isTestingThis ? 'Testing…' : 'Test'}
        </button>
        <button onClick={() => onDelete(p)}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium text-muted hover:text-accent transition-colors ml-auto"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontFamily: "'Inter', sans-serif" }}
          aria-label={`Delete ${p.name}`}>
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
})

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApiKeys() {
  const [providers, setProviders] = useState<ProviderKey[]>(initialKeys)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | ProviderStatus>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProviderKey | null>(null)
  const [rotateTarget, setRotateTarget] = useState<ProviderKey | null>(null)
  const [editTarget,   setEditTarget]   = useState<ProviderKey | null>(null)
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())
  const [testingId,    setTestingId]    = useState<string | null>(null)
  const [toast,        setToast]        = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [animated, setAnimated] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) { setAnimated(true); return }
    const t = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(t)
  }, [reduced])

  useEffect(() => {
    if (!showFilterMenu) return
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilterMenu(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [showFilterMenu])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  const handleRevealToggle = useCallback((id: string) => {
    setRevealedKeys(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    setProviders(ps => ps.filter(p => p.id !== deleteTarget.id))
    showToast(`${deleteTarget.name} removed`, 'info')
    setDeleteTarget(null)
  }, [deleteTarget, showToast])

  const handleRotateConfirm = useCallback(() => {
    if (!rotateTarget) return
    const newKey = `sk-rot-${Math.random().toString(36).slice(2, 38)}`
    setProviders(ps => ps.map(p => p.id === rotateTarget.id ? { ...p, apiKey: newKey, lastVerified: 'Just now' } : p))
    showToast(`${rotateTarget.name} key rotated`, 'success')
    setRotateTarget(null)
  }, [rotateTarget, showToast])

  const handleEditSave = useCallback((updated: ProviderKey) => {
    setProviders(ps => ps.map(p => p.id === updated.id ? updated : p))
    showToast('Provider updated', 'success')
    setEditTarget(null)
  }, [showToast])

  const handleTestConnection = useCallback(async (p: ProviderKey) => {
    setTestingId(p.id)
    await new Promise(r => setTimeout(r, 1600))
    setTestingId(null)
    showToast(`${p.name} connection ${p.status !== 'offline' ? 'verified' : 'failed'}`, p.status !== 'offline' ? 'success' : 'error')
  }, [showToast])

  const handleAdd = useCallback((p: ProviderKey) => {
    setProviders(ps => [...ps, p])
    showToast(`${p.name} added`, 'success')
  }, [showToast])

  const handleExport = useCallback(() => {
    const data = JSON.stringify(providers.map(p => ({ name: p.name, status: p.status, region: p.region, models: p.models })), null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'arqon-providers.json'; a.click(); URL.revokeObjectURL(url)
    showToast('Providers exported', 'success')
  }, [providers, showToast])

  const filtered = providers.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.nickname.toLowerCase().includes(search.toLowerCase())
    return matchSearch && (filterStatus === 'all' || p.status === filterStatus)
  })

  const activeProviders = providers.filter(p => p.enabled).length
  const activeKeys      = providers.filter(p => p.enabled && p.apiKey).length
  const latencyArr      = providers.filter(p => p.latency > 0)
  const avgLatency      = latencyArr.length ? Math.round(latencyArr.reduce((s, p) => s + p.latency, 0) / latencyArr.length) : 0
  const totalCost       = Math.round(providers.reduce((s, p) => s + p.monthlyCost, 0))
  const failedCount     = providers.filter(p => p.status === 'offline' || p.status === 'error').length
  const totalModels     = providers.reduce((s, p) => s + p.models.length, 0)

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-muted">
          {activeProviders} of {providers.length} providers connected · {activeKeys} active keys
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search providers…"
              className="h-9 pl-8 pr-3 rounded-lg text-xs outline-none"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)', fontFamily: "'Inter', sans-serif", width: '180px' }}
              onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-border-2)')}
              onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')}
              aria-label="Search providers" />
          </div>
          {/* Filter */}
          <div className="relative" ref={filterRef}>
            <button onClick={() => setShowFilterMenu(v => !v)} aria-expanded={showFilterMenu}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs text-muted hover:text-foreground transition-colors"
              style={{ background: showFilterMenu || filterStatus !== 'all' ? 'var(--color-surface-2)' : 'var(--color-surface)', border: filterStatus !== 'all' ? '1px solid var(--color-border-2)' : '1px solid var(--color-border)', fontFamily: "'Inter', sans-serif" }}>
              <Filter size={13} />
              <span className="hidden sm:inline">Filter</span>
              {filterStatus !== 'all' && <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: 'rgb(var(--color-accent-rgb) / 0.12)', color: 'var(--color-accent)', fontSize: '10px' }}>1</span>}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 rounded-xl z-30 overflow-hidden glass-surface glass-border glass-shadow glass-open" role="menu">
                {(['all', 'healthy', 'degraded', 'error', 'offline'] as const).map(f => (
                  <button key={f} onClick={() => { setFilterStatus(f); setShowFilterMenu(false) }}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-left hover:bg-white/[0.04]"
                    style={{ color: filterStatus === f ? 'var(--color-foreground)' : 'var(--color-muted)', fontFamily: "'Inter', sans-serif" }} role="menuitem">
                    <span className="capitalize">{f === 'all' ? 'All providers' : f}</span>
                    {filterStatus === f && <Check size={11} className="text-accent" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Export */}
          <button onClick={handleExport}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs text-muted hover:text-foreground transition-colors"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontFamily: "'Inter', sans-serif" }}>
            <Download size={13} /><span className="hidden sm:inline">Export</span>
          </button>
          {/* Add Provider */}
          <button onClick={() => setShowAddModal(true)}
            className="hover-lift flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-medium text-white"
            style={{ background: 'var(--color-accent)', fontFamily: "'Space Grotesk', sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FF5252')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}>
            <Plus size={14} /> Add Provider
          </button>
        </div>
      </div>

      {/* Stat cards — 2 cols mobile, 3 tablet, 6 desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard id="providers" icon={<Server size={16} className="text-accent" />}        label="Connected Providers" valueNum={activeProviders} delta="+2"    deltaPositive data={sparkData.providers} />
        <StatCard id="keys"      icon={<Key size={16} className="text-accent" />}           label="Active API Keys"     valueNum={activeKeys}       delta="+1"    deltaPositive data={sparkData.keys}      />
        <StatCard id="latency"   icon={<Clock size={16} className="text-info" />}           label="Average Latency"     valueNum={avgLatency} valueSuffix="ms" delta="-12ms" deltaPositive data={sparkData.latency} color="var(--color-info)" />
        <StatCard id="cost"      icon={<DollarSign size={16} className="text-warning" />}   label="Monthly Cost"        valueNum={totalCost}        delta="+$148" deltaPositive={false} data={sparkData.cost} color="var(--color-warning)" />
        <StatCard id="failed"    icon={<AlertTriangle size={16} className="text-accent" />} label="Failed Connections"  valueNum={failedCount}      delta="-1"    deltaPositive data={sparkData.failed}    />
        <StatCard id="models"    icon={<Layers size={16} className="text-success" />}       label="Available Models"    valueNum={totalModels}      delta="+3"    deltaPositive data={sparkData.models}    color="var(--color-success)" />
      </div>

      {/* Main content: provider grid + sticky health panel */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Provider cards grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <Key size={28} className="text-muted mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No providers found</p>
              <p className="text-xs text-muted text-center max-w-xs">
                {search ? `No providers match "${search}"` : 'No providers match the current filter'}
              </p>
              {(search || filterStatus !== 'all') && (
                <button onClick={() => { setSearch(''); setFilterStatus('all') }} className="mt-4 text-xs text-accent hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filtered.map(p => (
                <ProviderCard key={p.id} provider={p} revealed={revealedKeys.has(p.id)}
                  onRevealToggle={handleRevealToggle} onEdit={setEditTarget} onDelete={setDeleteTarget}
                  onRotate={setRotateTarget} onTestConnection={handleTestConnection}
                  testingId={testingId} animated={animated} />
              ))}
            </div>
          )}
        </div>

        {/* Sticky health panel + quick stats */}
        <div className="xl:w-64 shrink-0">
          <div className="xl:sticky xl:top-20 space-y-4">
            <HealthPanel providers={providers} />
            <div className="p-4 rounded-xl card-hover" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h3 className="text-xs font-semibold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Quick Stats</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Total daily requests', value: `${Math.round(providers.reduce((s, p) => s + p.dailyRequests, 0) / 1000)}K` },
                  { label: 'Est. monthly spend',   value: `$${totalCost.toLocaleString()}` },
                  { label: 'Healthy providers',    value: `${providers.filter(p => p.status === 'healthy').length} / ${providers.length}` },
                  { label: 'Avg key age',          value: '47 days' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted">{stat.label}</span>
                    <span className="text-xs font-medium text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowAddModal(true)}
                className="mt-4 w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium"
                style={{ background: 'rgb(var(--color-accent-rgb) / 0.06)', border: '1px solid rgb(var(--color-accent-rgb) / 0.15)', color: 'var(--color-accent)', fontFamily: "'Space Grotesk', sans-serif" }}>
                <Plus size={12} /> Add Provider <ChevronRight size={11} className="ml-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <AddProviderModal onAdd={handleAdd} onClose={() => setShowAddModal(false)} />}
      {deleteTarget  && <DeleteConfirmModal name={deleteTarget.name} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />}
      {rotateTarget  && <RotateConfirmModal name={rotateTarget.name} onConfirm={handleRotateConfirm} onCancel={() => setRotateTarget(null)} />}
      {editTarget    && <EditModal provider={editTarget} onSave={handleEditSave} onClose={() => setEditTarget(null)} />}
      {toast         && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
"""

out = pathlib.Path('src/pages/ApiKeys.tsx')
out.write_text(content, encoding='utf-8')
print(f'Written {out.stat().st_size} bytes, {content.count(chr(10))} lines')
