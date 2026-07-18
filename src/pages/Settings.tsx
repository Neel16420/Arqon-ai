import { useState } from 'react'
import { Eye, EyeOff, Plus, Trash2, Copy, Check, AlertCircle, CheckCircle, Key } from 'lucide-react'
import { maskKey } from '../utils'

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200"
      style={{ background: enabled ? 'var(--color-accent)' : 'var(--color-border)' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-sm font-semibold text-foreground mb-4"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {children}
    </h2>
  )
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
  mono,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  hint?: string
  mono?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3 text-sm rounded-lg outline-none"
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-foreground)',
          fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
          fontSize: mono ? '12px' : undefined,
        }}
        onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--color-border-2)')}
        onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--color-border)')}
      />
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  )
}

interface ApiKey {
  id: string
  label: string
  key: string
  created: string
  lastUsed: string | null
}

const initialKeys: ApiKey[] = [
  {
    id: 'key-1',
    label: 'Production Gateway',
    key: 'arqon_sk_prod_8f3a2b1c9d4e5f6a7b8c9d0e1f2a3b4c',
    created: '2024-11-01',
    lastUsed: '2 minutes ago',
  },
  {
    id: 'key-2',
    label: 'Staging Integration',
    key: 'arqon_sk_stg_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    created: '2024-10-15',
    lastUsed: '3 days ago',
  },
  {
    id: 'key-3',
    label: 'Local Dev',
    key: 'arqon_sk_dev_zz9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k',
    created: '2024-09-28',
    lastUsed: '1 week ago',
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="p-1.5 rounded text-muted hover:text-foreground transition-colors"
    >
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
    </button>
  )
}

function GeneralSettings() {
  const [apiUrl, setApiUrl] = useState('https://api.arqon.ai/v1')
  const [timeout, setTimeout_] = useState('30')
  const [retries, setRetries] = useState('3')
  const [rateLimiting, setRateLimiting] = useState(true)
  const [fallbackEnabled, setFallbackEnabled] = useState(true)
  const [logRequests, setLogRequests] = useState(true)
  const [logResponses, setLogResponses] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div
      className="rounded-xl p-6 card-hover"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <SectionTitle>General Configuration</SectionTitle>
      <div className="space-y-5">
        <InputField
          label="Gateway API URL"
          value={apiUrl}
          onChange={setApiUrl}
          placeholder="https://api.arqon.ai/v1"
          mono
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Request Timeout (s)"
            value={timeout}
            onChange={setTimeout_}
            type="number"
            mono
          />
          <InputField
            label="Max Retries"
            value={retries}
            onChange={setRetries}
            type="number"
            mono
          />
        </div>

        <div
          className="space-y-0 rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--color-border)' }}
        >
          {[
            { label: 'Rate Limiting', desc: 'Enforce per-provider rate limits and backoff', val: rateLimiting, set: setRateLimiting },
            { label: 'Automatic Failover', desc: 'Fall back to next provider on error', val: fallbackEnabled, set: setFallbackEnabled },
            { label: 'Log Requests', desc: 'Persist request payloads to the log store', val: logRequests, set: setLogRequests },
            { label: 'Log Responses', desc: 'Persist response payloads (increases storage usage)', val: logResponses, set: setLogResponses },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}
            >
              <div>
                <p className="text-sm text-foreground">{item.label}</p>
                <p className="text-xs text-muted mt-0.5">{item.desc}</p>
              </div>
              <Toggle enabled={item.val} onChange={() => item.set(!item.val)} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="hover-lift h-9 px-5 rounded-lg text-sm font-medium text-white transition-all"
            style={{ background: 'var(--color-accent)', fontFamily: "'Space Grotesk', sans-serif" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FF5252')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-accent)')}
          >
            Save Changes
          </button>
          {saved && (
            <div className="flex items-center gap-1.5 text-xs text-success">
              <CheckCircle size={13} />
              Saved
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AccountSettings() {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('idle')
    if (newPw !== confirmPw) {
      setErrMsg("Passwords don't match")
      setStatus('error')
      return
    }
    if (newPw.length < 8) {
      setErrMsg('Password must be at least 8 characters')
      setStatus('error')
      return
    }
    await new Promise((r) => setTimeout(r, 800))
    setStatus('success')
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
    setTimeout(() => setStatus('idle'), 3000)
  }

  const strengthScore = newPw.length === 0 ? 0
    : newPw.length < 8 ? 1
    : newPw.length < 12 ? 2
    : /[A-Z]/.test(newPw) && /[0-9]/.test(newPw) && /[^A-Za-z0-9]/.test(newPw) ? 4
    : 3

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', 'var(--color-accent)', 'var(--color-warning)', 'var(--color-info)', 'var(--color-success)']

  return (
    <div
      className="rounded-xl p-6 card-hover"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <SectionTitle>Admin Account</SectionTitle>
      <div className="flex items-center gap-3 mb-6 p-3 rounded-lg" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-accent"
          style={{ background: 'rgb(var(--color-accent-rgb) / 0.08)', border: '1px solid rgb(var(--color-accent-rgb) / 0.2)', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          AD
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Administrator</p>
          <p className="text-xs text-muted" style={{ fontFamily: "'JetBrains Mono', monospace" }}>admin@arqon.internal</p>
        </div>
      </div>

      <form onSubmit={handleChange} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Current password</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Enter current password"
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
            <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">New password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="At least 8 characters"
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
            <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {newPw && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{
                      background: s <= strengthScore ? strengthColor[strengthScore] : 'var(--color-border)',
                    }}
                  />
                ))}
              </div>
              <span
                className="text-xs"
                style={{ color: strengthColor[strengthScore], fontFamily: "'JetBrains Mono', monospace" }}
              >
                {strengthLabel[strengthScore]}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Confirm new password</label>
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full h-9 px-3 text-sm rounded-lg outline-none"
            style={{
              background: 'var(--color-surface-2)',
              border: confirmPw && confirmPw !== newPw ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
              color: 'var(--color-foreground)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
            }}
            onFocus={(e) => {
              if (!(confirmPw && confirmPw !== newPw))
                e.currentTarget.style.border = '1px solid var(--color-border-2)'
            }}
            onBlur={(e) => {
              if (!(confirmPw && confirmPw !== newPw))
                e.currentTarget.style.border = '1px solid var(--color-border)'
            }}
          />
        </div>

        {status === 'error' && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
            style={{ background: 'rgb(var(--color-accent-rgb) / 0.08)', border: '1px solid rgb(var(--color-accent-rgb) / 0.2)' }}
          >
            <AlertCircle size={13} className="text-accent" />
            <span className="text-accent">{errMsg}</span>
          </div>
        )}

        {status === 'success' && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
            style={{ background: 'rgb(var(--color-success-rgb) / 0.08)', border: '1px solid rgb(var(--color-success-rgb) / 0.2)' }}
          >
            <CheckCircle size={13} className="text-success" />
            <span className="text-success">Password updated successfully</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!currentPw || !newPw || !confirmPw}
          className="hover-lift h-9 px-5 rounded-lg text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{ background: 'var(--color-accent)', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Update Password
        </button>
      </form>
    </div>
  )
}

function ApiKeySettings() {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [showCreate, setShowCreate] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  const createKey = () => {
    const generated = `arqon_sk_${Math.random().toString(36).slice(2, 8)}_${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    const key: ApiKey = {
      id: `key-${Date.now()}`,
      label: newLabel || 'New Key',
      key: generated,
      created: new Date().toISOString().slice(0, 10),
      lastUsed: null,
    }
    setKeys((k) => [...k, key])
    setNewKey(generated)
    setNewLabel('')
    setShowCreate(false)
  }

  const revokeKey = (id: string) => {
    setKeys((k) => k.filter((key) => key.id !== id))
  }

  const toggleVisible = (id: string) => {
    setVisibleKeys((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  return (
    <div
      className="rounded-xl p-6 card-hover"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>API Keys</SectionTitle>
        <button
          onClick={() => setShowCreate(true)}
          className="hover-lift flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-white transition-all"
          style={{ background: 'var(--color-accent)', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <Plus size={13} /> Create Key
        </button>
      </div>

      {newKey && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg mb-4"
          style={{ background: 'rgb(var(--color-success-rgb) / 0.06)', border: '1px solid rgb(var(--color-success-rgb) / 0.2)' }}
        >
          <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-success mb-1">
              Key created — copy it now, it won't be shown again
            </p>
            <div className="flex items-center gap-2">
              <code
                className="text-xs break-all text-foreground"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {newKey}
              </code>
              <CopyButton text={newKey} />
            </div>
          </div>
          <button onClick={() => setNewKey(null)} className="text-muted hover:text-foreground">
            <Check size={14} className="text-success" />
          </button>
        </div>
      )}

      {showCreate && (
        <div
          className="p-4 rounded-lg mb-4"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
        >
          <p className="text-xs font-medium text-muted mb-3">New API Key</p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Key label (e.g. Production)"
              className="flex-1 h-8 px-3 text-xs rounded-lg outline-none"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-foreground)',
                fontFamily: "'Inter', sans-serif",
              }}
              onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--color-border-2)')}
              onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--color-border)')}
              onKeyDown={(e) => e.key === 'Enter' && createKey()}
            />
            <button
              onClick={createKey}
              className="hover-lift h-8 px-3 rounded-lg text-xs font-medium text-white"
              style={{ background: 'var(--color-accent)', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Generate
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="hover-lift h-8 px-3 rounded-lg text-xs text-muted"
              style={{ background: 'var(--color-border)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid var(--color-border)' }}
      >
        {keys.length === 0 ? (
          <div className="text-center py-10">
            <Key size={20} className="text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No API keys</p>
            <p className="text-xs text-muted mt-1">Create a key to authenticate gateway requests.</p>
          </div>
        ) : (
          keys.map((key, i) => (
            <div
              key={key.id}
              className="flex items-center gap-4 px-4 py-3 animate-fade-in-up"
              style={{
                borderBottom: i < keys.length - 1 ? '1px solid var(--color-border)' : 'none',
                animationDelay: `${i * 50}ms`,
                animationFillMode: 'both',
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-foreground">{key.label}</span>
                  <span
                    className="text-xs text-muted"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Created {key.created}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code
                    className="text-xs text-muted truncate max-w-xs"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {visibleKeys.has(key.id) ? key.key : maskKey(key.key)}
                  </code>
                  <button
                    onClick={() => toggleVisible(key.id)}
                    className="text-muted hover:text-foreground transition-colors shrink-0"
                  >
                    {visibleKeys.has(key.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <CopyButton text={key.key} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-xs text-muted">{key.lastUsed ? `Last used ${key.lastUsed}` : 'Never used'}</span>
              </div>
              <button
                onClick={() => revokeKey(key.id)}
                className="p-1.5 rounded text-muted hover:text-accent transition-colors"
                title="Revoke key"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function Settings() {
  const tabs = ['General', 'Account', 'API Keys'] as const
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('General')

  return (
    <div className="max-w-2xl space-y-6">
      {/* Tab nav */}
      <div
        className="flex gap-0.5 p-1 rounded-lg"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', width: 'fit-content' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="h-8 px-4 rounded-md text-xs font-medium transition-all"
            style={{
              background: activeTab === tab ? 'var(--color-border)' : 'transparent',
              color: activeTab === tab ? 'var(--color-foreground)' : 'var(--color-muted)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'General' && <GeneralSettings />}
      {activeTab === 'Account' && <AccountSettings />}
      {activeTab === 'API Keys' && <ApiKeySettings />}
    </div>
  )
}
