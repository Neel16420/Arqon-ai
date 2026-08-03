import { useState } from 'react'
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Edit2,
  ShieldCheck,
  Zap,
  Activity,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react'
import { useToast } from '../../components/toast/ToastContext'
import EmptyState from '../../components/EmptyState'

export interface UserApiKeyItem {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string
  environment: 'Production' | 'Staging' | 'Development'
  status: 'Active' | 'Revoked'
  scopes: string[]
}

const INITIAL_KEYS: UserApiKeyItem[] = [
  {
    id: 'key-1',
    name: 'Production App Key',
    key: 'arq_live_99f8a27b4012e8419c849102b',
    created: '2025-01-15',
    lastUsed: '2 mins ago',
    environment: 'Production',
    status: 'Active',
    scopes: ['read', 'write', 'routing'],
  },
  {
    id: 'key-2',
    name: 'Staging Integration Key',
    key: 'arq_stage_44b1c83d9102f7411a0021b',
    created: '2025-02-01',
    lastUsed: '4 hours ago',
    environment: 'Staging',
    status: 'Active',
    scopes: ['read', 'routing'],
  },
  {
    id: 'key-3',
    name: 'Dev Playground Key',
    key: 'arq_dev_11c09e8f5412a901009419c',
    created: '2025-02-10',
    lastUsed: 'Yesterday',
    environment: 'Development',
    status: 'Active',
    scopes: ['read'],
  },
]

export default function UserApiKeys() {
  const { success, error: toastError, info } = useToast()
  const [keys, setKeys] = useState<UserApiKeyItem[]>(INITIAL_KEYS)
  const [search, setSearch] = useState('')
  const [showKeyId, setShowKeyId] = useState<string | null>(null)
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null)
  const [testLatency, setTestLatency] = useState<Record<string, number>>({})

  // Add / Edit Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyEnv, setNewKeyEnv] = useState<'Production' | 'Staging' | 'Development'>('Production')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const filteredKeys = keys.filter(
    (k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.environment.toLowerCase().includes(search.toLowerCase())
  )

  const handleCopy = (id: string, rawKey: string) => {
    navigator.clipboard.writeText(rawKey)
    setCopiedKeyId(id)
    success('API Key copied to clipboard!')
    setTimeout(() => setCopiedKeyId(null), 2000)
  }

  const handleTestConnection = (id: string) => {
    setTestingKeyId(id)
    info('Testing API latency & ping...')
    setTimeout(() => {
      const latency = Math.floor(Math.random() * 40) + 18
      setTestLatency((prev) => ({ ...prev, [id]: latency }))
      setTestingKeyId(null)
      success(`Connection verified! Latency: ${latency}ms`)
    }, 1200)
  }

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) {
      toastError('Please enter a key name')
      return
    }

    const randomHash = Math.random().toString(36).substring(2, 18)
    const newKey: UserApiKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      key: `arq_${newKeyEnv.toLowerCase().slice(0, 4)}_${randomHash}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Just now',
      environment: newKeyEnv,
      status: 'Active',
      scopes: ['read', 'write', 'routing'],
    }

    setKeys([newKey, ...keys])
    setIsAddModalOpen(false)
    setNewKeyName('')
    success(`API Key "${newKey.name}" created successfully!`)
  }

  const handleDeleteKey = (id: string) => {
    const keyItem = keys.find((k) => k.id === id)
    setKeys(keys.filter((k) => k.id !== id))
    setDeleteConfirmId(null)
    success(`API Key "${keyItem?.name || id}" revoked and deleted.`)
  }

  return (
    <div className="space-y-6 pb-12 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-foreground flex items-center gap-2.5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Key className="text-accent" size={26} />
            API Keys & Authentication
          </h1>
          <p className="text-xs text-muted mt-1">
            Manage your secret authentication keys for integrating Arqon AI Router into your applications.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-accent text-white font-medium text-xs shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          Create New Key
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="glass-surface glass-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search API keys..."
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted w-full sm:w-auto justify-end">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            AES-256 Encrypted
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{keys.length} Keys Active</span>
        </div>
      </div>

      {/* Keys Table or Empty State */}
      {filteredKeys.length === 0 ? (
        <EmptyState
          title="No API Keys Found"
          description={search ? `No keys matched "${search}"` : "You haven't generated any API keys yet. Create your first key to start making requests."}
          actionLabel="Generate API Key"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="glass-surface glass-border rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted bg-surface-2/40 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Key Name</th>
                  <th className="py-3.5 px-4">Secret Token</th>
                  <th className="py-3.5 px-4">Environment</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4">Last Used</th>
                  <th className="py-3.5 px-4">Latency</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredKeys.map((item) => {
                  const isVisible = showKeyId === item.id
                  const isCopied = copiedKeyId === item.id
                  const isTesting = testingKeyId === item.id
                  const latency = testLatency[item.id]

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-2/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                            <Key size={14} />
                          </div>
                          <div>
                            <span className="block font-semibold text-foreground">{item.name}</span>
                            <span className="text-[10px] text-muted font-mono">{item.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted">
                        <div className="flex items-center gap-2 bg-surface-2/80 px-2.5 py-1.5 rounded-lg border border-border/50 w-fit">
                          <span className="text-foreground">
                            {isVisible ? item.key : `${item.key.slice(0, 8)}••••••••••••••••`}
                          </span>
                          <button
                            onClick={() => setShowKeyId(isVisible ? null : item.id)}
                            className="text-muted hover:text-foreground transition-colors cursor-pointer ml-1"
                            title={isVisible ? 'Hide Key' : 'Reveal Key'}
                          >
                            {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            item.environment === 'Production'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : item.environment === 'Staging'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}
                        >
                          {item.environment}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-muted">{item.created}</td>
                      <td className="py-3.5 px-4 text-muted">{item.lastUsed}</td>

                      <td className="py-3.5 px-4">
                        {latency !== undefined ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Zap size={11} />
                            {latency}ms
                          </span>
                        ) : (
                          <span className="text-muted text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test Ping */}
                          <button
                            onClick={() => handleTestConnection(item.id)}
                            disabled={isTesting}
                            className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-surface-2 transition-all cursor-pointer disabled:opacity-50"
                            title="Test Connection Latency"
                          >
                            <RefreshCw size={14} className={isTesting ? 'animate-spin text-accent' : ''} />
                          </button>

                          {/* Copy */}
                          <button
                            onClick={() => handleCopy(item.id, item.key)}
                            className="p-1.5 rounded-lg text-muted hover:text-emerald-400 hover:bg-surface-2 transition-all cursor-pointer"
                            title="Copy Key"
                          >
                            {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-rose-400 hover:bg-surface-2 transition-all cursor-pointer"
                            title="Revoke Key"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE KEY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay animate-fade-in">
          <div className="glass-surface glass-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h3
                className="text-base font-bold text-foreground flex items-center gap-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Key size={18} className="text-accent" />
                Generate New API Key
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Key Name / Descriptor
                </label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production Backend Service"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Environment Target
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Production', 'Staging', 'Development'] as const).map((env) => (
                    <button
                      type="button"
                      key={env}
                      onClick={() => setNewKeyEnv(env)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        newKeyEnv === env
                          ? 'bg-accent/15 border-accent text-accent shadow-sm'
                          : 'glass-surface border-border text-muted hover:text-foreground'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-2/60 border border-border/50 text-[11px] text-muted leading-relaxed">
                <ShieldCheck size={14} className="text-emerald-400 inline mr-1.5" />
                This secret key will grant full access to Arqon AI router endpoints configured for your workspace tier.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-muted hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent text-white font-semibold text-xs shadow-md shadow-accent/20 hover:bg-accent-hover transition-all cursor-pointer"
                >
                  Create Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay animate-fade-in">
          <div className="glass-surface glass-border rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Revoke API Key?</h3>
              <p className="text-xs text-muted mt-1.5">
                Any applications using this key will immediately lose access to Arqon AI routing services.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs text-muted hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteKey(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-all cursor-pointer"
              >
                Revoke Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
