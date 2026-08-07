import { useState } from 'react'
import {
  BarChart2,
  TrendingUp,
  DollarSign,
  Zap,
  RefreshCw,
  ArrowUpRight,
  PieChart,
} from 'lucide-react'
import { useCountUp } from '../../motion/useCountUp'
import { useToast } from '../../components/toast/ToastContext'

export default function UserAnalytics() {
  const { info } = useToast()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Animated stat values
  const totalRequests = useCountUp(14820, 1500)
  const totalTokens = useCountUp(4.89, 1500, 2)
  const totalCost = useCountUp(64.80, 1500, 2)
  const avgLatency = useCountUp(284, 1500)

  return (
    <div className="space-y-6 pb-12 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-foreground flex items-center gap-2.5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <BarChart2 className="text-accent" size={26} />
            Personal Usage Analytics
          </h1>
          <p className="text-xs text-muted mt-1">
            Deep insights into your personal AI token consumption, API costs, latency distribution, and provider share.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border text-xs">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range)
                  info(`Updated analytics view range: ${range}`)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-surface'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => info('Refreshed analytics metrics')}
            className="p-2 rounded-xl glass-surface glass-border text-muted hover:text-foreground transition-colors cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Hero Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Requests */}
        <div className="glass-surface glass-border rounded-2xl p-5 space-y-2 hover:border-accent/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">Total Requests</span>
            <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className="text-2xl font-bold text-foreground tracking-tight font-mono"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {totalRequests.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight size={12} />
              +14.2%
            </span>
          </div>
          <p className="text-[11px] text-muted">Filtered across {timeRange} timeframe</p>
        </div>

        {/* 2. Total Tokens */}
        <div className="glass-surface glass-border rounded-2xl p-5 space-y-2 hover:border-accent/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">Token Consumption</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className="text-2xl font-bold text-foreground tracking-tight font-mono"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {totalTokens}M
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight size={12} />
              +8.7%
            </span>
          </div>
          <p className="text-[11px] text-muted">Prompt + Completion Tokens</p>
        </div>

        {/* 3. Estimated Cost */}
        <div className="glass-surface glass-border rounded-2xl p-5 space-y-2 hover:border-accent/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">Monthly Cost</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className="text-2xl font-bold text-foreground tracking-tight font-mono"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              ${totalCost}
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              -22.1% saved
            </span>
          </div>
          <p className="text-[11px] text-muted">Optimized via Arqon Routing</p>
        </div>

        {/* 4. Avg Latency */}
        <div className="glass-surface glass-border rounded-2xl p-5 space-y-2 hover:border-accent/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">Avg Latency</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className="text-2xl font-bold text-foreground tracking-tight font-mono"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {avgLatency}ms
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              Fastest 95%
            </span>
          </div>
          <p className="text-[11px] text-muted">Global routing speed</p>
        </div>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Over Time Bar Chart Visualization */}
        <div className="lg:col-span-2 glass-surface glass-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3
                className="text-base font-bold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Usage Volume ({timeRange})
              </h3>
              <p className="text-xs text-muted">Daily requests and token breakdown over time.</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted">
                <span className="w-2.5 h-2.5 rounded-sm bg-accent" /> Requests
              </span>
              <span className="flex items-center gap-1.5 text-muted">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Tokens
              </span>
            </div>
          </div>

          {/* Simulated Animated Bar Graph */}
          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-border/50">
            {[45, 68, 52, 84, 92, 60, 78, 95, 88, 110, 74, 98, 120, 105].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                <div className="w-full flex items-end gap-1 h-full">
                  <div
                    className="w-1/2 bg-accent/80 hover:bg-accent rounded-t transition-all duration-500 group-hover:scale-105"
                    style={{ height: `${height * 0.7}%` }}
                    title={`Day ${i + 1}: ${height * 12} requests`}
                  />
                  <div
                    className="w-1/2 bg-emerald-400/80 hover:bg-emerald-400 rounded-t transition-all duration-500 group-hover:scale-105"
                    style={{ height: `${height * 0.9}%` }}
                    title={`Day ${i + 1}: ${height * 35}k tokens`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted font-mono">
            <span>Feb 1</span>
            <span>Feb 5</span>
            <span>Feb 10</span>
            <span>Feb 14 (Today)</span>
          </div>
        </div>

        {/* Provider Distribution Pie/Bar */}
        <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className="text-base font-bold text-foreground flex items-center gap-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <PieChart size={18} className="text-accent" />
              Provider Share
            </h3>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { name: 'OpenAI', share: 46, color: '#10a37f' },
              { name: 'Anthropic', share: 32, color: '#d97706' },
              { name: 'Google AI', share: 14, color: '#4285f4' },
              { name: 'DeepSeek', share: 8, color: '#0066ff' },
            ].map((p) => (
              <div key={p.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground">{p.name}</span>
                  <span className="font-mono text-muted">{p.share}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${p.share}%`, backgroundColor: p.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/50 text-[11px] text-muted leading-relaxed mt-4">
            💡 Arqon Smart Router automatically shifted 8% traffic to DeepSeek, reducing cost by 18%.
          </div>
        </div>
      </div>
    </div>
  )
}
