import { useState } from 'react'
import {
  Activity,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '../../components/toast/ToastContext'
import EmptyState from '../../components/EmptyState'

export interface UserRequestLogItem {
  id: string
  timestamp: string
  model: string
  provider: string
  status: 200 | 429 | 500
  tokens: number
  latencyMs: number
  cost: string
  promptPreview: string
  responsePreview: string
}

const MOCK_REQUESTS: UserRequestLogItem[] = [
  {
    id: 'req_99f8a21',
    timestamp: '2025-02-14 11:42:08',
    model: 'gpt-4o',
    provider: 'OpenAI',
    status: 200,
    tokens: 1420,
    latencyMs: 340,
    cost: '$0.0071',
    promptPreview: 'Analyze the quarterly AI routing metrics and generate summary report.',
    responsePreview: 'Based on the metrics, OpenAI handled 48% of traffic with 340ms average latency...',
  },
  {
    id: 'req_88e7b10',
    timestamp: '2025-02-14 11:39:15',
    model: 'claude-3-5-sonnet',
    provider: 'Anthropic',
    status: 200,
    tokens: 890,
    latencyMs: 280,
    cost: '$0.0044',
    promptPreview: 'Refactor React component to use custom hook for websocket state.',
    responsePreview: 'Here is the refactored code using `useUserWorkspace` hook for clean state sync...',
  },
  {
    id: 'req_77d6c09',
    timestamp: '2025-02-14 11:35:40',
    model: 'gemini-1.5-pro',
    provider: 'Google AI',
    status: 200,
    tokens: 3100,
    latencyMs: 410,
    cost: '$0.0093',
    promptPreview: 'Process multimodal image inputs and extract text OCR coordinates.',
    responsePreview: 'Extracted 14 bounding boxes with 99.4% confidence score...',
  },
  {
    id: 'req_66c5b08',
    timestamp: '2025-02-14 11:30:12',
    model: 'deepseek-r1',
    provider: 'DeepSeek',
    status: 429,
    tokens: 0,
    latencyMs: 120,
    cost: '$0.0000',
    promptPreview: 'Generate complex mathematical proof for graph optimization algorithm.',
    responsePreview: 'Rate limit exceeded on provider endpoint. Failover fallback triggered.',
  },
  {
    id: 'req_55b4a07',
    timestamp: '2025-02-14 11:22:50',
    model: 'command-r-plus',
    provider: 'Cohere',
    status: 200,
    tokens: 1850,
    latencyMs: 310,
    cost: '$0.0055',
    promptPreview: 'RAG retrieval query across vector embedding document store.',
    responsePreview: 'Retrieved top 5 matching chunks with cosine similarity > 0.88...',
  },
]

export default function RequestsHistory() {
  const { success, info } = useToast()
  const [requests, setRequests] = useState<UserRequestLogItem[]>(MOCK_REQUESTS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedReq, setSelectedReq] = useState<UserRequestLogItem | null>(null)

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.model.toLowerCase().includes(search.toLowerCase()) ||
      r.provider.toLowerCase().includes(search.toLowerCase()) ||
      r.promptPreview.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === '200'
        ? r.status === 200
        : r.status !== 200

    return matchesSearch && matchesStatus
  })

  const handleExportCSV = () => {
    info('Exporting request logs...')
    const headers = ['Request ID', 'Timestamp', 'Model', 'Provider', 'Status', 'Tokens', 'Latency (ms)', 'Cost']
    const rows = filteredRequests.map((r) => [
      r.id,
      r.timestamp,
      r.model,
      r.provider,
      r.status,
      r.tokens,
      r.latencyMs,
      r.cost,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `arqon_requests_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    success('Exported CSV file successfully!')
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
            <Activity className="text-accent" size={26} />
            Requests & Activity Logs
          </h1>
          <p className="text-xs text-muted mt-1">
            Real-time audit log of all AI prompts, routed responses, token costs, and provider latencies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              info('Refreshed request logs')
              setRequests([...MOCK_REQUESTS])
            }}
            className="px-3.5 py-2 rounded-xl glass-surface glass-border text-xs font-medium text-foreground hover:bg-surface-2 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-accent text-white font-medium text-xs shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download size={14} />
            Export Logs (CSV)
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-surface glass-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, prompt, model..."
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
          <Filter size={14} className="text-muted" />
          <span className="text-muted font-medium">Filter Status:</span>
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border">
            {[
              { id: 'all', label: 'All Status' },
              { id: '200', label: '200 OK' },
              { id: 'error', label: 'Errors' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-surface'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          title="No Requests Logged"
          description={search ? `No requests found matching "${search}"` : "You haven't initiated any requests through Arqon router yet."}
          actionLabel="Launch AI Playground"
          onAction={() => {
            window.history.pushState(null, '', '/user/chat')
            window.dispatchEvent(new PopStateEvent('popstate'))
          }}
        />
      ) : (
        <div className="glass-surface glass-border rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted bg-surface-2/40 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Model & Provider</th>
                  <th className="py-3.5 px-4">Prompt Snippet</th>
                  <th className="py-3.5 px-4">Tokens</th>
                  <th className="py-3.5 px-4">Latency</th>
                  <th className="py-3.5 px-4">Cost</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredRequests.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedReq(r)}
                    className="hover:bg-surface-2/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-accent">
                      {r.id}
                    </td>

                    <td className="py-3.5 px-4 text-muted font-mono text-[11px]">
                      {r.timestamp}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-foreground block">{r.model}</span>
                        <span className="text-[10px] text-muted">{r.provider}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-muted">
                      {r.promptPreview}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-muted">
                      {r.tokens > 0 ? r.tokens.toLocaleString() : '—'}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="inline-flex items-center gap-1 text-[11px] text-foreground">
                        <Zap size={11} className="text-amber-400" />
                        {r.latencyMs}ms
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-foreground font-medium">
                      {r.cost}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          r.status === 200
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {r.status === 200 ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <XCircle size={11} />
                        )}
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight size={16} className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYLOAD INSPECTOR MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay animate-fade-in">
          <div className="glass-surface glass-border rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <h3
                  className="text-base font-bold text-foreground flex items-center gap-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <Activity size={18} className="text-accent" />
                  Payload Detail: {selectedReq.id}
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {selectedReq.timestamp} • {selectedReq.model} ({selectedReq.provider})
                </p>
              </div>

              <button
                onClick={() => setSelectedReq(null)}
                className="text-muted hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Stats Summary */}
              <div className="grid grid-cols-4 gap-3 p-3 rounded-xl bg-surface-2/60 border border-border/50 text-center font-mono">
                <div>
                  <span className="block text-[10px] text-muted uppercase">Status</span>
                  <span className="font-bold text-emerald-400">{selectedReq.status}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted uppercase">Latency</span>
                  <span className="font-bold text-foreground">{selectedReq.latencyMs}ms</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted uppercase">Tokens</span>
                  <span className="font-bold text-foreground">{selectedReq.tokens}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted uppercase">Cost</span>
                  <span className="font-bold text-foreground">{selectedReq.cost}</span>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="block font-semibold text-foreground mb-1.5">Prompt Payload</label>
                <div className="p-3.5 rounded-xl bg-surface-2/80 border border-border/50 text-muted font-mono leading-relaxed overflow-x-auto max-h-36">
                  {selectedReq.promptPreview}
                </div>
              </div>

              {/* Response */}
              <div>
                <label className="block font-semibold text-foreground mb-1.5">Routed Response</label>
                <div className="p-3.5 rounded-xl bg-surface-2/80 border border-border/50 text-foreground font-mono leading-relaxed overflow-x-auto max-h-36">
                  {selectedReq.responsePreview}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-border/50">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-5 py-2 rounded-xl bg-accent text-white font-semibold text-xs shadow-md shadow-accent/20 hover:bg-accent-hover transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
