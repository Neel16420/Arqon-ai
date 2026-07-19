import { useState, useEffect } from 'react'
import {
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  X,
  Check,
  AlertCircle,
  Wifi,
  WifiOff,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Loader,
} from 'lucide-react'
import { formatLatency } from '../utils'
import { useCountUp } from '../motion/useCountUp'
import { useReducedMotion } from '../motion/useReducedMotion'
import { ProviderIcon } from '../components/icons/ProviderLogos'

function AnimatedNumber({ value, decimals = 0 }: { value: number, decimals?: number }) {
  const animatedValue = useCountUp(value, 1000, decimals)
  return <>{animatedValue}</>
}

interface Provider {
  id: string
  name: string
  type: string
  color: string
  letter: string
  enabled: boolean
  status: 'healthy' | 'warning' | 'error' | 'disabled'
  latency: number
  requestsToday: number
  failureRate: number
  quota: number
  quotaUsed: number
  cooldown: number | null
  priority: number
}

const initialProviders: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    color: '#10A37F',
    letter: 'OA',
    enabled: true,
    status: 'healthy',
    latency: 847,
    requestsToday: 94200,
    failureRate: 0.12,
    quota: 1000000,
    quotaUsed: 612400,
    cooldown: null,
    priority: 1,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'anthropic',
    color: '#D97706',
    letter: 'AN',
    enabled: true,
    status: 'healthy',
    latency: 1243,
    requestsToday: 66700,
    failureRate: 0.08,
    quota: 500000,
    quotaUsed: 198000,
    cooldown: null,
    priority: 2,
  },
  {
    id: 'google',
    name: 'Google AI',
    type: 'google',
    color: '#4285F4',
    letter: 'GG',
    enabled: true,
    status: 'warning',
    latency: 3821,
    requestsToday: 44400,
    failureRate: 2.4,
    quota: 300000,
    quotaUsed: 287100,
    cooldown: null,
    priority: 3,
  },
  {
    id: 'mistral',
    name: 'Mistral',
    type: 'mistral',
    color: '#7C3AED',
    letter: 'MI',
    enabled: true,
    status: 'healthy',
    latency: 612,
    requestsToday: 22200,
    failureRate: 0.21,
    quota: 200000,
    quotaUsed: 44900,
    cooldown: null,
    priority: 4,
  },
  {
    id: 'cohere',
    name: 'Cohere',
    type: 'cohere',
    color: '#E11D48',
    letter: 'CO',
    enabled: false,
    status: 'disabled',
    latency: 0,
    requestsToday: 0,
    failureRate: 0,
    quota: 100000,
    quotaUsed: 0,
    cooldown: null,
    priority: 5,
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    type: 'azure',
    color: '#0078D4',
    letter: 'AZ',
    enabled: true,
    status: 'error',
    latency: 0,
    requestsToday: 7400,
    failureRate: 18.3,
    quota: 200000,
    quotaUsed: 14800,
    cooldown: 847,
    priority: 6,
  },
]

const providerTypes = ['openai', 'anthropic', 'google', 'mistral', 'cohere', 'azure', 'other']

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    healthy: { bg: 'rgb(var(--color-success-rgb) / 0.08)', color: 'var(--color-success)', label: 'Healthy' },
    warning: { bg: 'rgba(245,158,11,0.08)', color: 'var(--color-warning)', label: 'Degraded' },
    error: { bg: 'rgb(var(--color-accent-rgb) / 0.08)', color: 'var(--color-accent)', label: 'Error' },
    disabled: { bg: 'rgba(82,82,91,0.08)', color: '#71717A', label: 'Disabled' },
  }
  const c = cfg[status] || cfg.disabled
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.color, fontFamily: "'JetBrains Mono', monospace" }}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status !== 'disabled' && (
          <span className="animate-pulse-slow absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: c.color }} />
        )}
        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: c.color }} />
      </span>
      {c.label}
    </span>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange() }}
      className="relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200"
      style={{ background: enabled ? 'var(--color-accent)' : 'var(--color-border)' }}
      aria-label={enabled ? 'Disable provider' : 'Enable provider'}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  )
}

interface AddProviderModalProps {
  onClose: () => void
  onAdd: (p: Provider) => void
}

function AddProviderModal({ onClose, onAdd }: AddProviderModalProps) {
  const [form, setForm] = useState({
    name: '',
    type: 'openai',
    apiKey: '',
    endpoint: '',
    timeout: '30',
  })
  const [showKey, setShowKey] = useState(false)
  const [testState, setTestState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  const handleTest = async () => {
    setTestState('testing')
    await new Promise((r) => setTimeout(r, 1500))
    setTestState(form.apiKey.length > 8 ? 'success' : 'error')
  }

  const handleAdd = () => {
    const newProvider: Provider = {
      id: `provider-${Date.now()}`,
      name: form.name || form.type,
      type: form.type,
      color: 'var(--color-muted)',
      letter: (form.name || form.type).slice(0, 2).toUpperCase(),
      enabled: true,
      status: 'healthy',
      latency: 0,
      requestsToday: 0,
      failureRate: 0,
      quota: 500000,
      quotaUsed: 0,
      cooldown: null,
      priority: 99,
    }
    onAdd(newProvider)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 glass-overlay"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-xl p-6 animate-fade-in-up glass-elevated glass-border glass-shadow glass-highlight"
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-base font-semibold text-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Add Provider
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"
            style={{ background: 'var(--color-surface-2)' }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Display name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="My OpenAI"
                className="w-full h-9 px-3 text-sm rounded-lg outline-none"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-foreground)',
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--color-border-2)')}
                onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--color-border)')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Provider type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-lg outline-none appearance-none"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-foreground)',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {providerTypes.map((t) => (
                  <option key={t} value={t} style={{ background: 'var(--color-surface-2)' }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={form.apiKey}
                onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                placeholder="sk-..."
                className="w-full h-9 px-3 pr-10 text-sm rounded-lg outline-none"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-foreground)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                }}
                onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--color-border-2)')}
                onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--color-border)')}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Endpoint override <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              type="url"
              value={form.endpoint}
              onChange={(e) => setForm((f) => ({ ...f, endpoint: e.target.value }))}
              placeholder="https://api.openai.com/v1"
              className="w-full h-9 px-3 text-sm rounded-lg outline-none"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-foreground)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
              }}
              onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--color-border-2)')}
              onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--color-border)')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Timeout (seconds)
            </label>
            <input
              type="number"
              value={form.timeout}
              onChange={(e) => setForm((f) => ({ ...f, timeout: e.target.value }))}
              min="1"
              max="300"
              className="w-full h-9 px-3 text-sm rounded-lg outline-none"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-foreground)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--color-border-2)')}
              onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--color-border)')}
            />
          </div>

          {/* Test connection */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2">
              {testState === 'idle' && <Wifi size={14} className="text-muted" />}
              {testState === 'testing' && (
                <Loader size={14} className="text-info animate-spin" />
              )}
              {testState === 'success' && <Check size={14} className="text-success" />}
              {testState === 'error' && <AlertCircle size={14} className="text-accent" />}
              <span className="text-xs text-muted">
                {testState === 'idle' && 'Verify connection before adding'}
                {testState === 'testing' && 'Testing connection…'}
                {testState === 'success' && 'Connection successful'}
                {testState === 'error' && 'Connection failed — check credentials'}
              </span>
            </div>
            <button
              onClick={handleTest}
              disabled={!form.apiKey || testState === 'testing'}
              className="text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Test
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-lg text-sm font-medium text-muted transition-colors"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!form.name}
            className="flex-1 h-9 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-accent)',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Add Provider
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>(initialProviders)
  const [showAddModal, setShowAddModal] = useState(false)
  const [dragOver, setDragOver] = useState<string | null>(null)
  
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
              status: !p.enabled ? 'healthy' : 'disabled',
            }
          : p,
      ),
    )
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
  }

  const sorted = [...providers].sort((a, b) => a.priority - b.priority)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">
            {providers.filter((p) => p.enabled).length} of {providers.length} providers active
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="hover-lift flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white transition-all"
          style={{ background: 'var(--color-accent)', fontFamily: "'Space Grotesk', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#FF5252')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-accent)')}
        >
          <Plus size={15} />
          Add Provider
        </button>
      </div>

      {/* Provider grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((provider, idx) => (
          <div
            key={provider.id}
            className="relative flex flex-col gap-4 p-5 rounded-xl hover-lift cursor-default"
            style={{
              background: 'var(--color-surface)',
              border: dragOver === provider.id ? '1px solid var(--color-border-2)' : '1px solid var(--color-border)',
              opacity: provider.enabled ? 1 : 0.6,
            }}
          >
            {/* Priority badge */}
            <div
              className="absolute top-3 right-3 flex items-center gap-0.5"
            >
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
                style={{
                  background: `${provider.color}18`,
                  border: `1px solid ${provider.color}40`,
                  color: provider.color,
                  '--hover-glow': `0 0 12px ${provider.color}40`,
                  '--hover-border': `${provider.color}80`,
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 12px ${provider.color}50`
                  e.currentTarget.style.borderColor = `${provider.color}90`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
                  e.currentTarget.style.borderColor = `${provider.color}40`
                }}
              >
                <ProviderIcon 
                  type={provider.type} 
                  className="w-5 h-5 transition-transform duration-300 group-hover:scale-105" 
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{provider.name}</p>
                <StatusBadge status={provider.status} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted mb-1">Latency</p>
                <p
                  className={`text-sm font-medium ${provider.latency > 3000 ? 'text-accent' : provider.latency > 1500 ? 'text-warning' : 'text-foreground'}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {provider.enabled && provider.latency > 0
                    ? <><AnimatedNumber value={provider.latency} />ms</>
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Today</p>
                <p
                  className="text-sm font-medium text-foreground"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {provider.enabled
                    ? provider.requestsToday >= 1000
                      ? <><AnimatedNumber value={provider.requestsToday / 1000} decimals={0} />K</>
                      : <AnimatedNumber value={provider.requestsToday} />
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Failures</p>
                <p
                  className={`text-sm font-medium ${provider.failureRate > 5 ? 'text-accent' : provider.failureRate > 1 ? 'text-warning' : 'text-success'}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {provider.enabled ? <><AnimatedNumber value={provider.failureRate} decimals={1} />%</> : '—'}
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
                    <AnimatedNumber value={Math.round((provider.quotaUsed / provider.quota) * 100)} />%
                  </span>
                </div>
                <div
                  className="w-full h-1 rounded-full overflow-hidden"
                  style={{ background: 'var(--color-border)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${animated ? (provider.quotaUsed / provider.quota) * 100 : 0}%`,
                      transition: `width 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) ${idx * 80}ms`,
                      background:
                        provider.quotaUsed / provider.quota > 0.9
                          ? 'var(--color-accent)'
                          : provider.quotaUsed / provider.quota > 0.7
                            ? 'var(--color-warning)'
                            : 'var(--color-success)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Cooldown */}
            {provider.cooldown && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: 'rgb(var(--color-accent-rgb) / 0.06)', border: '1px solid rgb(var(--color-accent-rgb) / 0.15)' }}
              >
                <RefreshCw size={12} className="text-accent" />
                <span className="text-xs text-accent">
                  Cooldown: {Math.floor(provider.cooldown / 60)}m {provider.cooldown % 60}s remaining
                </span>
              </div>
            )}

            {/* Footer */}
            <div
              className="flex items-center justify-between pt-3"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                {provider.enabled ? (
                  <Wifi size={13} className="text-success" />
                ) : (
                  <WifiOff size={13} className="text-muted" />
                )}
                <span className="text-xs text-muted">
                  {provider.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <Toggle enabled={provider.enabled} onChange={() => toggleProvider(provider.id)} />
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddProviderModal
          onClose={() => setShowAddModal(false)}
          onAdd={(p) => setProviders((ps) => [...ps, p])}
        />
      )}
    </div>
  )
}
