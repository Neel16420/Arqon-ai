import { useState } from 'react'
import { Cpu, Star, Search, Sparkles, Info } from 'lucide-react'

export interface ModelDetail {
  id: string
  name: string
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Meta' | 'DeepSeek'
  providerBadge: string
  status: 'Operational' | 'Degraded' | 'Beta'
  contextWindow: string
  latency: string
  costPer1k: string
  description: string
  isRecommended?: boolean
  isFavorite: boolean
  capabilities: string[]
}

const CATALOG_MODELS: ModelDetail[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    providerBadge: 'OAI',
    status: 'Operational',
    contextWindow: '128k tokens',
    latency: '210ms',
    costPer1k: '$0.0025',
    description: 'Flagship multimodal intelligence engine optimized for high-speed reasoning and vision.',
    isRecommended: true,
    isFavorite: true,
    capabilities: ['Vision', 'Function Calling', 'JSON Mode', 'Audio Processing'],
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    providerBadge: 'ANT',
    status: 'Operational',
    contextWindow: '200k tokens',
    latency: '280ms',
    costPer1k: '$0.0030',
    description: 'State-of-the-art model for complex coding, architectural synthesis, and technical writing.',
    isRecommended: true,
    isFavorite: true,
    capabilities: ['Artifacts', 'Code Generation', 'Document Retrieval', 'System Prompts'],
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    providerBadge: 'GOO',
    status: 'Operational',
    contextWindow: '1,000k tokens',
    latency: '340ms',
    costPer1k: '$0.0015',
    description: 'Massive 1M token context window capable of ingesting entire codebases and video archives.',
    isRecommended: false,
    isFavorite: false,
    capabilities: ['1M Context', 'Video Ingestion', 'Audio Analysis', 'Multilingual'],
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    providerBadge: 'DSK',
    status: 'Operational',
    contextWindow: '64k tokens',
    latency: '190ms',
    costPer1k: '$0.0005',
    description: 'High-performance open reasoning model with transparent chain-of-thought verification.',
    isRecommended: true,
    isFavorite: false,
    capabilities: ['Chain-of-Thought', 'Math Reasoning', 'Open Weights', 'Low Latency'],
  },
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    providerBadge: 'MTA',
    status: 'Operational',
    contextWindow: '128k tokens',
    latency: '230ms',
    costPer1k: '$0.0008',
    description: 'Meta flagship open-weight 70B parameter model tuned for structured instruct tasks.',
    isRecommended: false,
    isFavorite: false,
    capabilities: ['Open Source', 'Fast Inference', 'Fine-tunable', 'Structured Data'],
  },
]

export default function ModelsCatalog() {
  const [models, setModels] = useState<ModelDetail[]>(CATALOG_MODELS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string>('All')
  const [selectedModelModal, setSelectedModelModal] = useState<ModelDetail | null>(null)

  const providers = ['All', 'Favorites', 'OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Meta']

  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
    if (selectedProvider === 'Favorites') return matchesSearch && m.isFavorite
    if (selectedProvider !== 'All') return matchesSearch && m.provider === selectedProvider
    return matchesSearch
  })

  const toggleFavorite = (id: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m))
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Cpu className="text-emerald-400" size={24} />
            AI Models & Intelligence Engines
          </h1>
          <p className="text-xs text-muted mt-1">
            Compare latency, context windows, capabilities, and provider status across active models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-surface-2 border border-border text-foreground">
            5 Models Active
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-surface glass-border rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Provider Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {providers.map((prov) => (
            <button
              key={prov}
              onClick={() => setSelectedProvider(prov)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedProvider === prov
                  ? 'bg-accent text-white shadow'
                  : 'bg-surface-2/60 text-muted hover:text-foreground hover:bg-surface-2'
              }`}
            >
              {prov}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search model name or capability..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
          />
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            className="group p-5 rounded-2xl glass-surface glass-border card-hover flex flex-col justify-between transition-all relative"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface-2 border border-border text-foreground">
                    {model.providerBadge}
                  </span>
                  {model.isRecommended && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                      <Sparkles size={10} />
                      Recommended
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleFavorite(model.id)}
                  className="p-1 rounded text-muted hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <Star
                    size={16}
                    className={model.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
                  />
                </button>
              </div>

              {/* Title & Provider */}
              <h3
                className="text-lg font-bold text-foreground group-hover:text-accent transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {model.name}
              </h3>
              <p className="text-[11px] text-muted font-mono">{model.provider}</p>

              <p className="text-xs text-muted mt-2 leading-relaxed line-clamp-2">
                {model.description}
              </p>

              {/* Capability Chips */}
              <div className="flex items-center gap-1.5 flex-wrap mt-4">
                {model.capabilities.map((cap, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-surface-2/60 border border-border/60 text-muted"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Metrics Footer */}
            <div className="mt-6 pt-3 border-t border-border/40 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-center">
                <div className="p-1.5 rounded-lg bg-surface-2/40">
                  <span className="block text-[10px] text-muted">Latency</span>
                  <span className="text-emerald-400 font-semibold">{model.latency}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-surface-2/40">
                  <span className="block text-[10px] text-muted">Context</span>
                  <span className="text-foreground font-semibold">{model.contextWindow}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-surface-2/40">
                  <span className="block text-[10px] text-muted">Cost/1k</span>
                  <span className="text-accent font-semibold">{model.costPer1k}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedModelModal(model)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-foreground bg-surface-2 hover:bg-accent hover:text-white border border-border hover:border-accent transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Info size={14} />
                View Full Benchmarks
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODEL DETAILS MODAL */}
      {selectedModelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
          <div className="w-full max-w-lg rounded-2xl glass-elevated glass-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent">
                  {selectedModelModal.providerBadge}
                </span>
                <h3
                  className="text-lg font-bold text-foreground"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {selectedModelModal.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedModelModal(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-2 text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-muted leading-relaxed">{selectedModelModal.description}</p>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[10px] text-muted block">Provider</span>
                  <span className="font-semibold text-foreground">{selectedModelModal.provider}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[10px] text-muted block">Status</span>
                  <span className="font-semibold text-emerald-400">{selectedModelModal.status}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[10px] text-muted block">Context Window</span>
                  <span className="font-semibold text-foreground">{selectedModelModal.contextWindow}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[10px] text-muted block">Est. Response Latency</span>
                  <span className="font-semibold text-emerald-400">{selectedModelModal.latency}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Supported Capabilities</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedModelModal.capabilities.map((cap, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-foreground font-mono text-[11px]">
                      ✓ {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
