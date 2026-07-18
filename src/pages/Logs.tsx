import { useState, useMemo } from 'react'
import { Search, Filter, X, ChevronRight, AlertCircle, CheckCircle, Clock, Copy, Check } from 'lucide-react'
import { formatLatency } from '../utils'
import { useStaggeredList } from '../motion/useStaggeredList'

interface LogEntry {
  id: string
  provider: string
  model: string
  status: 'success' | 'error' | 'timeout' | 'retry'
  latency: number
  timestamp: string
  retries: number
  tokens: number
  cost: number
  errorMsg?: string
  requestPreview: string
  responsePreview: string
}

const PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Azure']
const STATUS_OPTIONS = ['success', 'error', 'timeout', 'retry']

const seedLogs = (): LogEntry[] => {
  const entries: LogEntry[] = []
  const models: Record<string, string[]> = {
    OpenAI: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    Anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    Google: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    Mistral: ['mistral-large-latest', 'mistral-small-latest'],
    Azure: ['gpt-4', 'gpt-4-turbo'],
  }
  const statuses: Array<'success' | 'error' | 'timeout' | 'retry'> = [
    'success', 'success', 'success', 'success', 'success', 'success',
    'success', 'success', 'retry', 'error', 'timeout',
  ]
  const errors = [
    'Rate limit exceeded — retrying in 2s',
    'Context length exceeded (128k tokens)',
    'Connection timeout after 30s',
    'Model temporarily unavailable',
    'Invalid API key format',
  ]
  const now = Date.now()
  for (let i = 0; i < 80; i++) {
    const provider = PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)]
    const modelList = models[provider]
    const model = modelList[Math.floor(Math.random() * modelList.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const latency =
      status === 'timeout' ? 30000
      : status === 'error' ? Math.floor(Math.random() * 500 + 100)
      : Math.floor(Math.random() * 3000 + 200)
    const ts = new Date(now - i * 42000 - Math.random() * 30000)
    entries.push({
      id: `req_01J${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
      provider,
      model,
      status,
      latency,
      timestamp: ts.toISOString(),
      retries: status === 'retry' ? Math.ceil(Math.random() * 2) : 0,
      tokens: Math.floor(Math.random() * 4000 + 100),
      cost: parseFloat((Math.random() * 0.05 + 0.001).toFixed(4)),
      errorMsg: status !== 'success' && status !== 'retry' ? errors[Math.floor(Math.random() * errors.length)] : undefined,
      requestPreview: '{"model":"' + model + '","messages":[{"role":"user","content":"Summarize the quarterly report and identify key trends..."}],"max_tokens":1024}',
      responsePreview: status === 'success' ? '{"id":"chatcmpl-abc123","choices":[{"message":{"role":"assistant","content":"The quarterly report highlights three major trends: 1) Revenue grew 18% YoY..."}}],"usage":{"prompt_tokens":142,"completion_tokens":312}}' : '{"error":{"type":"' + (status) + '","message":"' + (errors[0]) + '"}}',
    })
  }
  return entries
}

const ALL_LOGS = seedLogs()

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diff = (now - d.getTime()) / 1000
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    success: { bg: 'rgb(var(--color-success-rgb) / 0.08)', color: 'var(--color-success)', label: 'Success' },
    error: { bg: 'rgb(var(--color-accent-rgb) / 0.08)', color: 'var(--color-accent)', label: 'Error' },
    timeout: { bg: 'rgba(245,158,11,0.08)', color: 'var(--color-warning)', label: 'Timeout' },
    retry: { bg: 'rgba(59,130,246,0.08)', color: 'var(--color-info)', label: 'Retry' },
  }
  const c = cfg[status] || cfg.error
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.color, fontFamily: "'JetBrains Mono', monospace" }}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === 'success' && (
          <span className="animate-pulse-slow absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: c.color }} />
        )}
        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: c.color }} />
      </span>
      {c.label}
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded text-muted hover:text-foreground transition-colors"
    >
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
    </button>
  )
}

const PAGE_SIZE = 20

export default function Logs() {
  const [search, setSearch] = useState('')
  const [filterProvider, setFilterProvider] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'timestamp' | 'latency'>('timestamp')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const getStaggerDelay = useStaggeredList(40)
  const [selected, setSelected] = useState<LogEntry | null>(null)

  const filtered = useMemo(() => {
    let data = [...ALL_LOGS]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (l) =>
          l.id.toLowerCase().includes(q) ||
          l.provider.toLowerCase().includes(q) ||
          l.model.toLowerCase().includes(q),
      )
    }
    if (filterProvider.length) data = data.filter((l) => filterProvider.includes(l.provider))
    if (filterStatus.length) data = data.filter((l) => filterStatus.includes(l.status))
    data.sort((a, b) => {
      const va = sortBy === 'timestamp' ? new Date(a.timestamp).getTime() : a.latency
      const vb = sortBy === 'timestamp' ? new Date(b.timestamp).getTime() : b.latency
      return sortDir === 'desc' ? vb - va : va - vb
    })
    return data
  }, [search, filterProvider, filterStatus, sortBy, sortDir])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const toggleSort = (col: 'timestamp' | 'latency') => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(col); setSortDir('desc') }
  }

  const toggleFilter = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
    setPage(1)
  }

  const SortIcon = ({ col }: { col: string }) =>
    sortBy === col ? (
      <span className="text-accent">{sortDir === 'desc' ? '↓' : '↑'}</span>
    ) : null

  const hasFilters = search || filterProvider.length || filterStatus.length

  return (
    <div className="flex gap-0 h-full relative">
      {/* Main content */}
      <div
        className={`flex flex-col gap-4 flex-1 min-w-0 transition-all duration-200 ${selected ? 'lg:mr-96' : ''}`}
      >
        {/* Filters */}
        <div
          className="flex flex-wrap items-center gap-3 p-4 rounded-xl"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by ID, provider, model…"
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg outline-none"
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

          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={12} className="text-muted" />
            {PROVIDERS.map((p) => (
              <button
                key={p}
                onClick={() => toggleFilter(filterProvider, p, setFilterProvider)}
                className="h-7 px-2.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: filterProvider.includes(p) ? 'rgb(var(--color-accent-rgb) / 0.12)' : 'var(--color-surface-2)',
                  border: filterProvider.includes(p) ? '1px solid rgb(var(--color-accent-rgb) / 0.3)' : '1px solid var(--color-border)',
                  color: filterProvider.includes(p) ? 'var(--color-accent)' : 'var(--color-muted)',
                }}
              >
                {p}
              </button>
            ))}
            <div className="w-px h-4 bg-border" />
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => toggleFilter(filterStatus, s, setFilterStatus)}
                className="h-7 px-2.5 rounded-full text-xs font-medium capitalize transition-all"
                style={{
                  background: filterStatus.includes(s) ? 'rgb(var(--color-accent-rgb) / 0.12)' : 'var(--color-surface-2)',
                  border: filterStatus.includes(s) ? '1px solid rgb(var(--color-accent-rgb) / 0.3)' : '1px solid var(--color-border)',
                  color: filterStatus.includes(s) ? 'var(--color-accent)' : 'var(--color-muted)',
                }}
              >
                {s}
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setFilterProvider([]); setFilterStatus([]); setPage(1) }}
                className="h-7 px-2.5 rounded-full text-xs text-muted hover:text-foreground flex items-center gap-1 transition-colors"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
              >
                <X size={10} /> Clear
              </button>
            )}
          </div>

          <span
            className="ml-auto text-xs text-muted"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {filtered.length} results
          </span>
        </div>

        {/* Table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Request ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Model</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Status</th>
                  <th
                    className="text-left px-4 py-3 text-xs font-medium text-muted cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => toggleSort('latency')}
                  >
                    Latency <SortIcon col="latency" />
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-medium text-muted cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => toggleSort('timestamp')}
                  >
                    Time <SortIcon col="timestamp" />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Retries</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center px-4 py-16">
                      <div className="flex flex-col items-center gap-3">
                        {hasFilters ? (
                          <>
                            <Filter size={24} className="text-muted" />
                            <p className="text-sm text-muted">No results match your filters</p>
                            <button
                              onClick={() => { setSearch(''); setFilterProvider([]); setFilterStatus([]) }}
                              className="text-xs text-accent hover:underline"
                            >
                              Clear filters
                            </button>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={24} className="text-muted" />
                            <p className="text-sm text-muted">No logs yet</p>
                            <p className="text-xs text-muted">Requests will appear here once traffic flows through Arqon.</p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, i) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer transition-colors animate-fade-in-up"
                      style={{
                        ...getStaggerDelay(i),
                        borderBottom: i < paginated.length - 1 ? '1px solid #1C1C1E' : 'none',
                        background: selected?.id === row.id ? 'var(--color-surface-2)' : 'transparent',
                      }}
                      onClick={() => setSelected(selected?.id === row.id ? null : row)}
                      onMouseEnter={(e) => { if (selected?.id !== row.id) e.currentTarget.style.background = 'var(--color-surface-2)' }}
                      onMouseLeave={(e) => { if (selected?.id !== row.id) e.currentTarget.style.background = 'transparent' }}
                    >
                      <td className="px-4 py-3">
                        <span
                          className="text-xs text-muted"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {row.id.slice(0, 22)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">{row.provider}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {row.model}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs ${row.latency > 10000 ? 'text-accent' : row.latency > 2000 ? 'text-warning' : 'text-foreground'}`}
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {formatLatency(row.latency)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">{formatTime(row.timestamp)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs ${row.retries > 0 ? 'text-warning' : 'text-muted'}`}
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {row.retries}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight
                          size={14}
                          className={`transition-transform ${selected?.id === row.id ? 'rotate-90 text-accent' : 'text-muted'}`}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {paginated.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted">No results</p>
              </div>
            ) : (
              paginated.map((row, i) => (
                <div
                  key={row.id}
                  className="px-4 py-3 cursor-pointer animate-fade-in-up"
                  style={{ 
                    ...getStaggerDelay(i),
                    background: selected?.id === row.id ? 'var(--color-surface-2)' : 'transparent' 
                  }}
                  onClick={() => setSelected(selected?.id === row.id ? null : row)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-xs text-muted"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {row.id.slice(0, 18)}…
                    </span>
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{row.provider} · {row.model}</span>
                    <span
                      className="text-xs text-muted"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {formatLatency(row.latency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted">{formatTime(row.timestamp)}</span>
                    {row.retries > 0 && (
                      <span className="text-xs text-warning" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {row.retries} retr{row.retries === 1 ? 'y' : 'ies'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <span
                className="text-xs text-muted"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-7 px-3 rounded text-xs text-muted hover:text-foreground disabled:opacity-30 transition-colors"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className="h-7 w-7 rounded text-xs transition-all"
                      style={{
                        background: pg === page ? 'var(--color-accent)' : 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: pg === page ? '#fff' : 'var(--color-muted)',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {pg}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-7 px-3 rounded text-xs text-muted hover:text-foreground disabled:opacity-30 transition-colors"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div
          className="fixed right-0 top-0 bottom-0 z-40 w-full md:w-96 flex flex-col overflow-y-auto transition-transform duration-200 glass-elevated glass-border-left glass-shadow"
          style={{
            top: '57px',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
            style={{ background: 'rgba(13,13,15,0.75)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Request Detail
            </h3>
            <button
              onClick={() => setSelected(null)}
              className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Status */}
            <div className="flex items-center justify-between">
              <StatusBadge status={selected.status} />
              <span className="text-xs text-muted">{formatTime(selected.timestamp)}</span>
            </div>

            {/* Meta */}
            <div className="space-y-3">
              {[
                { label: 'Request ID', value: selected.id },
                { label: 'Provider', value: selected.provider },
                { label: 'Model', value: selected.model },
                { label: 'Latency', value: formatLatency(selected.latency) },
                { label: 'Tokens', value: selected.tokens.toLocaleString() },
                { label: 'Cost', value: `$${selected.cost}` },
                { label: 'Retries', value: selected.retries.toString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <div className="flex items-center gap-1">
                    <span
                      className="text-xs text-foreground text-right max-w-48 truncate"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {value}
                    </span>
                    <CopyButton text={value} />
                  </div>
                </div>
              ))}
            </div>

            {selected.errorMsg && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{ background: 'rgb(var(--color-accent-rgb) / 0.06)', border: '1px solid rgb(var(--color-accent-rgb) / 0.15)' }}
              >
                <AlertCircle size={13} className="text-accent mt-0.5 shrink-0" />
                <span className="text-xs text-accent leading-relaxed">{selected.errorMsg}</span>
              </div>
            )}

            {/* Request body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted">Request</span>
                <CopyButton text={selected.requestPreview} />
              </div>
              <pre
                className="text-xs p-3 rounded-lg overflow-x-auto leading-relaxed"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-muted)',
                  fontFamily: "'JetBrains Mono', monospace",
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {JSON.stringify(JSON.parse(selected.requestPreview), null, 2)}
              </pre>
            </div>

            {/* Response body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted">Response</span>
                <CopyButton text={selected.responsePreview} />
              </div>
              <pre
                className="text-xs p-3 rounded-lg overflow-x-auto leading-relaxed"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-muted)',
                  fontFamily: "'JetBrains Mono', monospace",
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {JSON.stringify(JSON.parse(selected.responsePreview), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
