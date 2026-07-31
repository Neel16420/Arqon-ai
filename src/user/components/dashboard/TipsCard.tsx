import { useState, useEffect } from 'react'
import { Lightbulb, ChevronLeft, ChevronRight, Sparkles, Pause, Play } from 'lucide-react'

export interface TipItem {
  id: string
  title: string
  content: string
  category: string
  actionLabel?: string
  actionTarget?: string
}

interface TipsCardProps {
  loading?: boolean
  error?: string | null
  tips?: TipItem[]
  onTipAction?: (tip: TipItem) => void
}

const DEFAULT_TIPS: TipItem[] = [
  {
    id: 'tip-1',
    title: 'Saved Prompts Efficiency',
    content: 'Use saved prompts to speed up repetitive tasks and enforce consistent team system instructions.',
    category: 'PRO TIP #1',
    actionLabel: 'Explore Prompts',
    actionTarget: 'chat',
  },
  {
    id: 'tip-2',
    title: 'Multi-Model Benchmark',
    content: 'Switch between GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro instantly in the Playground to evaluate quality vs latency.',
    category: 'BENCHMARKS',
    actionLabel: 'Open Playground',
    actionTarget: 'chat',
  },
  {
    id: 'tip-3',
    title: 'API Rate Controls',
    content: 'Generate dedicated API keys for dev, staging, and production environments with custom token rate limits.',
    category: 'SECURITY',
    actionLabel: 'Manage Keys',
    actionTarget: 'settings',
  },
  {
    id: 'tip-4',
    title: 'Context Caching',
    content: 'Enable prefix context caching on large documents to cut prompt processing cost by up to 50%.',
    category: 'COST OPTIMIZATION',
    actionLabel: 'View Docs',
    actionTarget: 'docs',
  },
]

export default function TipsCard({
  loading = false,
  error = null,
  tips = DEFAULT_TIPS,
  onTipAction,
}: TipsCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (loading || isPaused || tips.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tips.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [tips.length, isPaused, loading])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tips.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length)
  }

  if (loading) {
    return (
      <div className="glass-surface glass-border rounded-xl p-5 animate-shimmer space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-24 h-4 bg-surface-2 rounded animate-pulse" />
          <div className="w-16 h-4 bg-surface-2 rounded animate-pulse" />
        </div>
        <div className="w-3/4 h-5 bg-surface-2 rounded animate-pulse" />
        <div className="w-full h-4 bg-surface-2 rounded animate-pulse" />
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

  if (!tips || tips.length === 0) {
    return null
  }

  const currentTip = tips[currentIndex]

  return (
    <div className="relative overflow-hidden glass-surface glass-border rounded-xl p-5 hover-lift">
      {/* Decorative background glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-10 blur-2xl"
        style={{ background: 'radial-gradient(circle, var(--color-warning) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Tip Content */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb size={20} />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider">
                {currentTip.category}
              </span>
              <span className="text-[11px] font-semibold text-foreground truncate">
                {currentTip.title}
              </span>
            </div>

            <p className="text-xs text-muted leading-relaxed max-w-2xl">
              "{currentTip.content}"
            </p>
          </div>
        </div>

        {/* Controls & Action */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
          {currentTip.actionLabel && (
            <button
              onClick={() => onTipAction?.(currentTip)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface border border-border text-foreground hover:border-accent/40 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={12} className="text-amber-400" />
              {currentTip.actionLabel}
            </button>
          )}

          {/* Carousel Buttons */}
          <div className="flex items-center gap-1 bg-surface-2/60 border border-border rounded-lg p-1">
            <button
              onClick={handlePrev}
              className="p-1 rounded hover:bg-surface text-muted hover:text-foreground transition-colors cursor-pointer"
              title="Previous Tip"
            >
              <ChevronLeft size={14} />
            </button>

            <button
              onClick={() => setIsPaused((v) => !v)}
              className="p-1 rounded hover:bg-surface text-muted hover:text-foreground transition-colors cursor-pointer"
              title={isPaused ? 'Resume Auto-rotate' : 'Pause Auto-rotate'}
            >
              {isPaused ? <Play size={12} /> : <Pause size={12} />}
            </button>

            <button
              onClick={handleNext}
              className="p-1 rounded hover:bg-surface text-muted hover:text-foreground transition-colors cursor-pointer"
              title="Next Tip"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
