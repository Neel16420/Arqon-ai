import { Zap, Play } from 'lucide-react'

export interface FavoriteModelItem {
  id: string
  name: string
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Meta' | 'DeepSeek'
  status: 'Operational' | 'Degraded' | 'Beta'
  contextLength: string
  description: string
  badgeColor?: string
}

interface FavoriteModelsProps {
  loading?: boolean
  error?: string | null
  models?: FavoriteModelItem[]
  onLaunchModel?: (model: FavoriteModelItem) => void
}

const DEFAULT_MODELS: FavoriteModelItem[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    status: 'Operational',
    contextLength: '128k context',
    description: 'Flagship multimodal reasoning engine with sub-300ms speed',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    status: 'Operational',
    contextLength: '200k context',
    description: 'State-of-the-art coding, instruction following & analysis',
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    status: 'Operational',
    contextLength: '1M context',
    description: 'Massive context window with video, audio & document retrieval',
  },
]

function getProviderLogo(provider: FavoriteModelItem['provider']) {
  switch (provider) {
    case 'OpenAI':
      return (
        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
          OAI
        </div>
      )
    case 'Anthropic':
      return (
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
          ANT
        </div>
      )
    case 'Google':
      return (
        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs font-mono">
          GOO
        </div>
      )
    case 'Meta':
      return (
        <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs font-mono">
          MTA
        </div>
      )
    case 'DeepSeek':
      return (
        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs font-mono">
          DSK
        </div>
      )
  }
}

export default function FavoriteModels({
  loading = false,
  error = null,
  models = DEFAULT_MODELS,
  onLaunchModel,
}: FavoriteModelsProps) {
  if (loading) {
    return (
      <div className="glass-surface glass-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-32 h-5 bg-surface-2 rounded animate-pulse" />
          <div className="w-20 h-4 bg-surface-2 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl glass-surface space-y-3 animate-shimmer">
              <div className="w-8 h-8 rounded-lg bg-surface-2 animate-pulse" />
              <div className="w-24 h-4 bg-surface-2 rounded animate-pulse" />
              <div className="w-32 h-3 bg-surface-2 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-surface glass-border rounded-xl p-5 border-red-500/20 text-xs text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="glass-surface glass-border rounded-xl p-5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-base font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Zap size={16} className="text-accent" />
            Favorite Models
          </h2>
          <p className="text-xs text-muted mt-0.5">Quick access to top performance engines</p>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-surface-2 border border-border text-foreground font-mono">
          3 Active
        </span>
      </div>

      {models.length === 0 ? (
        <div className="py-8 text-center text-muted text-xs">
          No favorite models pinned.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map((model) => (
            <div
              key={model.id}
              className="group p-4 rounded-xl glass-surface glass-border card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  {getProviderLogo(model.provider)}

                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-breathe-green" />
                    {model.status}
                  </div>
                </div>

                <h3
                  className="text-sm font-bold text-foreground group-hover:text-accent transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {model.name}
                </h3>

                <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-border text-muted mt-1 mb-2">
                  {model.contextLength}
                </span>

                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                  {model.description}
                </p>
              </div>

              <button
                onClick={() => onLaunchModel?.(model)}
                className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-semibold text-foreground bg-surface-2 hover:bg-accent hover:text-white border border-border hover:border-accent transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Play size={12} fill="currentColor" />
                Launch Chat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
