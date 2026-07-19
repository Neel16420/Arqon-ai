import pathlib

req_content = """import { useState, useEffect, useMemo, useRef } from 'react'
import { Search, Filter, X, ChevronRight, Activity, ArrowUpRight, CheckCircle, AlertCircle, RefreshCw, XCircle, FileText, Zap, ChevronLeft, Calendar, Database } from 'lucide-react'
import { useCountUp } from '../motion/useCountUp'
import { ProviderIcon } from '../components/icons/ProviderLogos'
import { formatLatency } from '../utils'
import { useStaggeredList } from '../motion/useStaggeredList'

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface RequestEntry {
  id: string
  provider: string
  model: string
  status: 'success' | 'error' | 'timeout' | 'retry' | 'running' | 'cancelled'
  latency: number
  timestamp: string
  retries: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  errorMsg?: string
  responseCode: number
  region: string
  requestPreview: string
  responsePreview: string
  jsonPayload: string
  routingDecision: {
    selectedProvider: string
    fallbackProvider?: string
    reason: string
  }
}

const PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Azure']
const STATUS_OPTIONS = ['success', 'error', 'timeout', 'retry', 'running', 'cancelled']

// ─── MOCK DATA GENERATOR ─────────────────────────────────────────────────────

const models: Record<string, string[]> = {
  OpenAI: ['gpt-4o', 'gpt-4o-mini'],
  Anthropic: ['claude-3-5-sonnet', 'claude-3-haiku'],
  Google: ['gemini-1.5-pro', 'gemini-1.5-flash'],
  Mistral: ['mistral-large', 'mistral-small'],
  Azure: ['gpt-4', 'gpt-4-turbo'],
}

const generateRequest = (isHistorical = false): RequestEntry => {
  const provider = PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)]
  const modelList = models[provider]
  const model = modelList[Math.floor(Math.random() * modelList.length)]
  
  // Weights for realistic statuses
  const r = Math.random()
  const status = isHistorical 
    ? (r > 0.1 ? 'success' : r > 0.05 ? 'retry' : r > 0.02 ? 'timeout' : 'error')
    : (r > 0.2 ? 'running' : 'success')

  const latency = status === 'timeout' ? 30000 : status === 'error' ? Math.floor(Math.random() * 500 + 100) : Math.floor(Math.random() * 3000 + 200)
  const promptTokens = Math.floor(Math.random() * 2000 + 50)
  const completionTokens = status === 'success' ? Math.floor(Math.random() * 1500 + 20) : 0
  const totalTokens = promptTokens + completionTokens
  const cost = parseFloat(((totalTokens / 1000) * 0.015).toFixed(4))
  
  return {
    id: `req_01J${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
    provider,
    model,
    status,
    latency,
    timestamp: new Date(Date.now() - (isHistorical ? Math.random() * 3600000 : 0)).toISOString(),
    retries: status === 'retry' ? 1 : 0,
    promptTokens,
    completionTokens,
    totalTokens,
    cost,
    errorMsg: status === 'error' ? 'Rate limit exceeded' : undefined,
    responseCode: status === 'success' ? 200 : status === 'error' ? 429 : status === 'timeout' ? 504 : 202,
    region: ['us-east-1', 'us-west-2', 'eu-west-1'][Math.floor(Math.random() * 3)],
    requestPreview: '{"messages":[{"role":"user","content":"Summarize the Q3 report..."}]}',
    responsePreview: status === 'success' ? '{"choices":[{"message":{"content":"Q3 revenue grew by 18% YoY..."}}]}' : '{"error":"Request failed"}',
    jsonPayload: JSON.stringify({
      model: model,
      temperature: 0.7,
      max_tokens: 1024,
      messages: [{ role: "user", content: "Summarize the Q3 report..." }]
    }, null, 2),
    routingDecision: {
      selectedProvider: provider,
      fallbackProvider: Math.random() > 0.8 ? PROVIDERS.find(p => p !== provider) : undefined,
      reason: 'Lowest latency & optimal cost for model class.'
    }
  }
}

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
    success: { bg: 'rgb(var(--color-success-rgb) / 0.1)', color: 'var(--color-success)', label: 'Completed' },
    error: { bg: 'rgb(var(--color-accent-rgb) / 0.1)', color: 'var(--color-accent)', label: 'Failed' },
    timeout: { bg: 'rgba(245,158,11,0.1)', color: 'var(--color-warning)', label: 'Timeout' },
    retry: { bg: 'rgba(59,130,246,0.1)', color: 'var(--color-info)', label: 'Retrying' },
    running: { bg: 'rgba(168,85,247,0.1)', color: '#A855F7', label: 'Running' },
    cancelled: { bg: 'var(--color-surface-2)', color: 'var(--color-muted)', label: 'Cancelled' },
  }
  const c = cfg[status] || cfg.error
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: c.bg, color: c.color, fontFamily: "'JetBrains Mono', monospace" }}>
      <span className="relative flex h-1.5 w-1.5">
        {(status === 'running' || status === 'success') && (
          <span className="animate-pulse-slow absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: c.color }} />
        )}
        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: c.color }} />
      </span>
      {c.label}
    </span>
  )
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function MetricCard({ title, value, color, icon, suffix = '' }: any) {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value
  const decimals = value.toString().includes('.') ? value.toString().split('.')[1].length : 0
  const animNum = useCountUp(num, 1500, decimals)
  
  return (
    <div className="hover-lift p-4 rounded-xl flex flex-col justify-between transition-all duration-200" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted">{title}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {animNum}
        </span>
        <span className="text-sm font-medium" style={{ color: color, fontFamily: "'JetBrains Mono', monospace" }}>{suffix}</span>
      </div>
    </div>
  )
}

function RequestFlowVisualization({ request }: { request: RequestEntry }) {
  return (
    <div className="relative w-full h-24 flex items-center justify-between px-6 rounded-lg overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)' }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <defs>
          <style>{`
            @keyframes route-flow-anim {
              from { stroke-dashoffset: 135; }
              to { stroke-dashoffset: 0; }
            }
            .flow-orb {
              animation: route-flow-anim 2s infinite linear;
              stroke-dasharray: 2 133;
            }
          `}</style>
        </defs>
        <path id="flowPath" d="M 40 48 L 160 48" fill="none" stroke="var(--color-border-2)" strokeWidth="1.5" />
        <path d="M 40 48 L 160 48" fill="none" stroke="var(--color-accent)" strokeWidth="4" className="flow-orb" pathLength="100" style={{ filter: 'blur(3px)' }} />
        <path d="M 40 48 L 160 48" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" className="flow-orb" pathLength="100" />
        
        <path d="M 210 48 L 330 48" fill="none" stroke="var(--color-border-2)" strokeWidth="1.5" />
        <path d="M 210 48 L 330 48" fill="none" stroke="var(--color-accent)" strokeWidth="4" className="flow-orb" pathLength="100" style={{ filter: 'blur(3px)', animationDelay: '1s' }} />
        <path d="M 210 48 L 330 48" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" className="flow-orb" pathLength="100" style={{ animationDelay: '1s' }} />
      </svg>
      
      {/* Nodes */}
      <div className="z-10 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface border border-border">
          <Database size={16} className="text-muted" />
        </div>
        <span className="text-[10px] text-muted font-medium">Application</span>
      </div>
      
      <div className="z-10 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-surface-2 border border-border shadow-lg">
          <img src="/logo/arqon-mark.png" alt="Arqon" className="w-6 h-6 object-contain" />
        </div>
        <span className="text-[10px] text-foreground font-medium">ARQON Engine</span>
      </div>
      
      <div className="z-10 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface border border-border">
          <ProviderIcon type={request.provider} className="w-5 h-5" />
        </div>
        <span className="text-[10px] text-muted font-medium">{request.provider}</span>
      </div>
    </div>
  )
}

function RequestDrawer({ request, onClose }: { request: RequestEntry | null, onClose: () => void }) {
  if (!request) return null
  
  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] z-50 flex flex-col shadow-2xl transition-transform animate-slide-in-right" 
           style={{ background: 'var(--color-background)', borderLeft: '1px solid var(--color-border)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
              Request Details
              <StatusBadge status={request.status} />
            </h2>
            <p className="text-xs text-muted mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{request.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 transition-colors text-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Provider</span>
              <div className="flex items-center gap-2 mt-1">
                <ProviderIcon type={request.provider} className="w-4 h-4" />
                <span className="text-sm font-medium">{request.provider}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Model</span>
              <p className="text-sm font-medium mt-1">{request.model}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Latency</span>
              <p className="text-sm font-medium mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatLatency(request.latency)}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Cost</span>
              <p className="text-sm font-medium mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${request.cost}</p>
            </div>
            <div className="p-3 rounded-lg col-span-2" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Tokens</span>
              <div className="flex items-center justify-between mt-1 text-sm font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="text-muted">P: {request.promptTokens}</span>
                <span className="text-muted">C: {request.completionTokens}</span>
                <span className="text-foreground">Total: {request.totalTokens}</span>
              </div>
            </div>
          </div>

          {/* Flow Vis */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Request Flow</h3>
            <RequestFlowVisualization request={request} />
          </div>
          
          {/* Routing Decision */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
            <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap size={14} className="text-accent" /> Routing Engine Decision
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Selected Provider</span>
                <span className="font-medium text-foreground">{request.routingDecision.selectedProvider}</span>
              </div>
              {request.routingDecision.fallbackProvider && (
                <div className="flex justify-between">
                  <span className="text-muted">Fallback Triggered</span>
                  <span className="font-medium text-warning">{request.routingDecision.fallbackProvider}</span>
                </div>
              )}
              <div className="flex justify-between mt-2 pt-2 border-t border-border">
                <span className="text-muted text-xs">{request.routingDecision.reason}</span>
              </div>
            </div>
          </div>
          
          {/* Payload */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">JSON Payload</h3>
            <div className="p-3 rounded-lg overflow-x-auto text-xs" style={{ background: '#121214', border: '1px solid var(--color-border)', fontFamily: "'JetBrains Mono', monospace" }}>
              <pre className="text-muted">{request.jsonPayload}</pre>
            </div>
          </div>
          
        </div>
      </div>
    </>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 15

export default function Requests() {
  const [requests, setRequests] = useState<RequestEntry[]>([])
  const [search, setSearch] = useState('')
  const [filterProvider, setFilterProvider] = useState<string>('All')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'timestamp' | 'latency' | 'cost'>('timestamp')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [selectedReq, setSelectedReq] = useState<RequestEntry | null>(null)
  
  const getStaggerDelay = useStaggeredList(30)
  
  // Initialize and run live stream loop
  useEffect(() => {
    // Seed initial 40 requests
    setRequests(Array.from({ length: 40 }, () => generateRequest(true)))
    
    // Live update loop every 1.5 - 3s
    const interval = setInterval(() => {
      setRequests(prev => {
        const newReq = generateRequest(false)
        // Optionally update some running to completed
        const updated = prev.map(r => {
          if (r.status === 'running' && Math.random() > 0.5) {
            return { ...r, status: 'success', latency: Math.floor(Math.random() * 2000 + 500) } as RequestEntry
          }
          return r
        })
        return [newReq, ...updated].slice(0, 500) // Keep max 500
      })
    }, 2500)
    
    return () => clearInterval(interval)
  }, [])
  
  // Filtering and Sorting
  const filtered = useMemo(() => {
    let data = [...requests]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r => r.id.toLowerCase().includes(q) || r.model.toLowerCase().includes(q) || r.provider.toLowerCase().includes(q))
    }
    if (filterProvider !== 'All') data = data.filter(r => r.provider === filterProvider)
    if (filterStatus !== 'All') data = data.filter(r => r.status === filterStatus)
    
    data.sort((a, b) => {
      const va = sortBy === 'timestamp' ? new Date(a.timestamp).getTime() : a[sortBy]
      const vb = sortBy === 'timestamp' ? new Date(b.timestamp).getTime() : b[sortBy]
      return sortDir === 'desc' ? vb - va : va - vb
    })
    
    return data
  }, [requests, search, filterProvider, filterStatus, sortBy, sortDir])
  
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  
  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }
  
  const hasFilters = search || filterProvider !== 'All' || filterStatus !== 'All'
  
  // Stats (simulated live wobbling)
  const [stats, setStats] = useState({ live: 1284, rpm: 486, avg: 642, success: 99.82 })
  useEffect(() => {
    const int = setInterval(() => {
      setStats(s => ({
        live: Math.max(1000, s.live + Math.floor((Math.random() - 0.5) * 50)),
        rpm: Math.max(200, s.rpm + Math.floor((Math.random() - 0.5) * 20)),
        avg: Math.max(100, s.avg + Math.floor((Math.random() - 0.5) * 15)),
        success: Math.min(100, Math.max(95, s.success + (Math.random() - 0.5) * 0.05))
      }))
    }, 4000)
    return () => clearInterval(int)
  }, [])

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Requests</h1>
          <p className="text-sm text-muted mt-1">Monitor every AI request flowing through Arqon in real time.</p>
        </div>
      </div>
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Live Requests" value={stats.live} color="var(--color-success)" icon={<span className="relative flex h-2 w-2"><span className="animate-breathe-green absolute inline-flex h-full w-full rounded-full opacity-75 bg-success"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span></span>} />
        <MetricCard title="Requests / Minute" value={stats.rpm} color="#3B82F6" icon={<Activity size={14} className="text-blue-500" />} suffix="RPM" />
        <MetricCard title="Average Response" value={stats.avg} color="#06B6D4" icon={<RefreshCw size={14} className="text-cyan-500" />} suffix="ms" />
        <MetricCard title="Success Rate" value={stats.success.toFixed(2)} color="var(--color-success)" icon={<CheckCircle size={14} className="text-success" />} suffix="%" />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Live Request Stream</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search Requests..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg outline-none transition-colors"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)' }}
              onFocus={(e) => e.currentTarget.style.border = '1px solid var(--color-border-2)'}
              onBlur={(e) => e.currentTarget.style.border = '1px solid var(--color-border)'}
            />
          </div>
          
          <select 
            value={filterProvider} 
            onChange={e => { setFilterProvider(e.target.value); setPage(1) }}
            className="h-8 px-3 rounded-lg text-xs outline-none cursor-pointer"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)' }}
          >
            <option value="All">All Providers</option>
            {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          
          <select 
            value={filterStatus} 
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="h-8 px-3 rounded-lg text-xs outline-none cursor-pointer"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)' }}
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          
          {hasFilters && (
            <button onClick={() => { setSearch(''); setFilterProvider('All'); setFilterStatus('All') }} className="h-8 px-3 rounded-lg text-xs flex items-center gap-1 hover:bg-surface-2 transition-colors text-muted hover:text-foreground">
              <X size={12} /> Clear Filters
            </button>
          )}
        </div>
        
        {/* Table Container */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: '0 4px', background: 'var(--color-background)' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface)' }}>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted rounded-l-xl">Request ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted cursor-pointer hover:text-foreground select-none" onClick={() => toggleSort('timestamp')}>
                  Timestamp {sortBy === 'timestamp' && <span className="text-accent">{sortDir === 'desc' ? '↓' : '↑'}</span>}
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted">Model</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted cursor-pointer hover:text-foreground select-none" onClick={() => toggleSort('latency')}>
                  Latency {sortBy === 'latency' && <span className="text-accent">{sortDir === 'desc' ? '↓' : '↑'}</span>}
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted">Tokens</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted cursor-pointer hover:text-foreground select-none" onClick={() => toggleSort('cost')}>
                  Cost {sortBy === 'cost' && <span className="text-accent">{sortDir === 'desc' ? '↓' : '↑'}</span>}
                </th>
                <th className="px-4 py-3 rounded-r-xl"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-muted gap-3">
                      <Search size={32} />
                      <p>No requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr 
                    key={row.id} 
                    className="group cursor-pointer animate-fade-in transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl"
                    style={{ background: 'var(--color-surface)' }}
                    onClick={() => setSelectedReq(row)}
                  >
                    <td className="px-4 py-3 text-[11px] text-muted font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.id}</td>
                    <td className="px-4 py-3 text-xs text-muted">{formatTime(row.timestamp)}</td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex items-center gap-2">
                        <ProviderIcon type={row.provider} className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
                        <span className="font-medium text-foreground">{row.provider}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-muted">{row.model}</td>
                    <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-3 text-[11px] text-foreground font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {row.status === 'running' ? '--' : formatLatency(row.latency)}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-muted font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {row.status === 'running' ? '--' : row.totalTokens}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-muted font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {row.status === 'running' ? '--' : `$${row.cost}`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity inline-block -translate-x-2 group-hover:translate-x-0 transform" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4" style={{ background: 'var(--color-surface)' }}>
              <span className="text-xs text-muted" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>Prev</button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Live Activity Timeline */}
      <div className="mt-4 p-5 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h2 className="text-sm font-semibold tracking-tight text-foreground mb-4">Live Activity Timeline</h2>
        <div className="space-y-4">
          {requests.slice(0, 5).map((req, idx) => (
            <div key={req.id + '_timeline'} className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="mt-1">
                {req.status === 'success' ? <CheckCircle size={14} className="text-success" /> : req.status === 'error' ? <XCircle size={14} className="text-accent" /> : req.status === 'timeout' ? <AlertCircle size={14} className="text-warning" /> : req.status === 'running' ? <Activity size={14} className="text-purple-500 animate-pulse" /> : <RefreshCw size={14} className="text-info" />}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  {req.provider} {req.status === 'running' ? 'processing' : req.status === 'success' ? 'completed' : req.status === 'retry' ? 'fallback triggered' : req.status}
                </p>
                <p className="text-[10px] text-muted mt-0.5">{formatTime(req.timestamp)} • {req.model}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <RequestDrawer request={selectedReq} onClose={() => setSelectedReq(null)} />
    </div>
  )
}
"""

req_path = pathlib.Path('src/pages/Requests.tsx')
req_path.write_text(req_content, encoding='utf-8')
print("Wrote complete Requests.tsx")
