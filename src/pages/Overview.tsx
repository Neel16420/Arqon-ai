import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Activity,
  CheckCircle,
  Clock,
  Server,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  FileText,
  Settings,
  Shield,
  ExternalLink,
} from 'lucide-react'
import { formatNumber, formatLatency } from '../utils'
import RoutingDiagram from '../components/RoutingDiagram'
import { useCountUp } from '../motion/useCountUp'

const sparkData = {
  requests: [3200, 4100, 3800, 5200, 4800, 6100, 5900, 7200],
  successRate: [99.1, 99.3, 98.9, 99.5, 99.2, 99.6, 99.4, 99.7],
  latency: [312, 298, 334, 287, 310, 276, 290, 268],
  healthy: [5, 6, 5, 6, 6, 6, 5, 6],
}

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  requests: Math.floor(3000 + Math.sin(i * 0.4) * 1800 + Math.random() * 600),
  errors: Math.floor(12 + Math.sin(i * 0.3) * 8 + Math.random() * 6),
}))

const weeklyData = [
  { time: 'Mon', requests: 84200, errors: 340 },
  { time: 'Tue', requests: 91500, errors: 290 },
  { time: 'Wed', requests: 88700, errors: 410 },
  { time: 'Thu', requests: 96400, errors: 320 },
  { time: 'Fri', requests: 102100, errors: 280 },
  { time: 'Sat', requests: 71300, errors: 190 },
  { time: 'Sun', requests: 65800, errors: 160 },
]

const monthlyData = Array.from({ length: 30 }, (_, i) => ({
  time: `${i + 1}`,
  requests: Math.floor(70000 + Math.sin(i * 0.3) * 20000 + Math.random() * 10000),
  errors: Math.floor(200 + Math.random() * 200),
}))

const recentActivity = [
  { id: 'req_01J8K3M9X2NPQ4', provider: 'OpenAI', model: 'gpt-4o', status: 'success', latency: 847, time: '14s ago', retries: 0 },
  { id: 'req_01J8K3M1Y5RKB7', provider: 'Anthropic', model: 'claude-3-5-sonnet', status: 'success', latency: 1243, time: '28s ago', retries: 0 },
  { id: 'req_01J8K3L8V0ZCN3', provider: 'Google', model: 'gemini-1.5-pro', status: 'warning', latency: 3821, time: '45s ago', retries: 1 },
  { id: 'req_01J8K3K2W4DTP6', provider: 'OpenAI', model: 'gpt-4o-mini', status: 'success', latency: 312, time: '1m ago', retries: 0 },
  { id: 'req_01J8K3J9F7AXQ1', provider: 'Mistral', model: 'mistral-large', status: 'error', latency: 5000, time: '2m ago', retries: 2 },
  { id: 'req_01J8K3H4E3MVS8', provider: 'Anthropic', model: 'claude-3-haiku', status: 'success', latency: 654, time: '2m ago', retries: 0 },
]

const systemStatus = [
  { name: 'API Gateway', status: 'healthy', uptime: '99.98%' },
  { name: 'Routing Engine', status: 'healthy', uptime: '99.97%' },
  { name: 'Provider Connectors', status: 'warning', uptime: '99.71%' },
]

function MiniSparkline({
  data,
  color = 'var(--color-accent)',
  gradientId,
  width = 64,
  height = 32,
}: {
  data: number[]
  color?: string
  gradientId: string
  width?: number
  height?: number
}) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = width
  const h = height
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return { x, y }
  })
  const linePts = pts.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPts = `0,${h} ${linePts} ${w},${h}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#${gradientId})`} stroke="none" className="animate-fade-in" />
      <polyline
        points={linePts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sparkline-draw"
      />
    </svg>
  )
}

// Full-width stretching sparkline for card background
function BackgroundSparkline({
  data,
  color = 'var(--color-accent)',
  gradientId,
}: {
  data: number[]
  color?: string
  gradientId: string
}) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const W = 100  // viewBox units
  const H = 52
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 8) - 4
    return { x, y }
  })
  const linePts = pts.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPts = `0,${H} ${linePts} ${W},${H}`
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#${gradientId})`} stroke="none" />
      <polyline
        points={linePts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface StatCardProps {
  id: string
  icon: React.ReactNode
  label: string
  value: string
  valueNode?: React.ReactNode   // overrides value/valueNum rendering when provided
  valueNum?: number
  valueSuffix?: string
  valueDecimals?: number
  delta: string
  deltaPositive: boolean
  sparkData: number[]
  sparkColor?: string
}

function StatCard({ id, icon, label, value, valueNode, valueNum, valueSuffix, valueDecimals, delta, deltaPositive, sparkData: data, sparkColor = 'var(--color-accent)' }: StatCardProps) {
  // Duration kept in a ref so StatCard re-renders never cause the hook
  // to see a changed dependency and replay the animation.
  const animatedValue = useCountUp(valueNum ?? 0, 1400, valueDecimals ?? 0)
  // valueNode takes precedence (e.g. FractionDisplay); then valueNum; then static value string.
  const displayValue  = valueNode ?? (valueNum !== undefined ? `${animatedValue}${valueSuffix ?? ''}` : value)

  return (
    <div
      className="hover-lift relative flex flex-col gap-3 p-5 rounded-xl overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* Top row: icon + small sparkline preview */}
      <div className="flex items-start justify-between relative z-10">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: 'rgb(var(--color-accent-rgb) / 0.08)', border: '1px solid rgb(var(--color-accent-rgb) / 0.15)' }}
        >
          {icon}
        </div>
        {/* Small top-right sparkline (original position) */}
        <MiniSparkline data={data} color={sparkColor} gradientId={`spark-sm-${id}`} width={64} height={28} />
      </div>

      {/* Label */}
      <p className="text-xs text-muted relative z-10">{label}</p>

      {/* Number + background graph container */}
      <div className="relative" style={{ minHeight: '40px' }}>
        {/* Background full-width graph — spans entire card */}
        <div
          className="absolute"
          style={{
            left: '-20px',   // bleed out past padding
            right: '-20px',
            bottom: '-4px',
            height: '52px',
            opacity: 0.5,
          }}
        >
          <BackgroundSparkline data={data} color={sparkColor} gradientId={`spark-bg-${id}`} />
        </div>
        {/* Number value rendered on top */}
        <p
          className="relative z-10 text-2xl font-semibold text-foreground tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {displayValue}
        </p>
      </div>

      {/* Delta row */}
      <div className="flex items-center gap-1.5 relative z-10">
        {deltaPositive ? (
          <ArrowUpRight size={13} className="text-success" />
        ) : (
          <ArrowDownRight size={13} className="text-accent" />
        )}
        <span
          className={`text-xs font-medium ${deltaPositive ? 'text-success' : 'text-accent'}`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {delta}
        </span>
        <span className="text-xs text-muted">vs last period</span>
      </div>
    </div>
  )
}

/**
 * FractionDisplay — count-up for "numerator / denominator" values (e.g. "5 / 6").
 * Each number animates independently from 0 to its final value.
 * Both useCountUp calls use an empty-dep-array internally, so animation
 * plays once on mount and never replays on re-render or theme change.
 */
function FractionDisplay({ numerator, denominator }: { numerator: number; denominator: number }) {
  const animNum = useCountUp(numerator,   1400, 0)
  const animDen = useCountUp(denominator, 1400, 0)
  return <>{animNum} / {animDen}</>
}


function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    healthy: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-accent)',
  }
  
  const breathingClass = status === 'healthy' 
    ? 'animate-breathe-green' 
    : status === 'warning' 
      ? 'animate-breathe-yellow' 
      : ''

  return (
    <span className="relative flex h-2 w-2">
      <span className={`relative inline-flex rounded-full h-2 w-2 ${breathingClass}`} style={{ background: colors[status] || 'var(--color-muted)' }} />
    </span>
  )
}

/**
 * PercentCountUp — animates a percentage string from 0 to final value.
 * Parses the string to find the number and decimals, then uses useCountUp.
 */
function PercentCountUp({ valueStr }: { valueStr: string }) {
  const num = parseFloat(valueStr)
  const decimals = valueStr.includes('.') ? valueStr.split('.')[1].replace(/[^0-9]/g, '').length : 0
  const animNum = useCountUp(num, 1000, decimals)
  return <>{animNum}%</>
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    success: { bg: 'rgb(var(--color-success-rgb) / 0.08)', color: 'var(--color-success)', label: 'Success' },
    warning: { bg: 'rgba(245,158,11,0.08)', color: 'var(--color-warning)', label: 'Degraded' },
    error: { bg: 'rgb(var(--color-accent-rgb) / 0.08)', color: 'var(--color-accent)', label: 'Error' },
  }
  const c = cfg[status] || cfg.success
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.color, fontFamily: "'JetBrains Mono', monospace" }}
    >
      <span className="relative flex h-2 w-2">
        {status === 'success' && (
          <span className="animate-pulse-slow absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: c.color }} />
        )}
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: c.color }} />
      </span>
      {c.label}
    </span>
  )
}

const quickActions = [
  { icon: <FileText size={16} />, label: 'View Logs', desc: 'Browse request history', route: 'logs' },
  { icon: <Server size={16} />, label: 'Manage Providers', desc: 'Configure AI providers', route: 'providers' },
  { icon: <Zap size={16} />, label: 'Routing Rules', desc: 'Edit routing logic', route: 'routing' },
  { icon: <Shield size={16} />, label: 'API Keys', desc: 'Manage gateway keys', route: 'api-keys' },
  { icon: <Activity size={16} />, label: 'Analytics', desc: 'View usage metrics', route: 'analytics' },
  { icon: <Settings size={16} />, label: 'Settings', desc: 'Platform configuration', route: 'settings' },
]

export default function Overview({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [chartRange, setChartRange] = useState<'day' | 'week' | 'month'>('day')

  const chartData =
    chartRange === 'day' ? hourlyData : chartRange === 'week' ? weeklyData : monthlyData

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs"
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border-2)',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <p className="text-muted mb-1">{label}</p>
        <p className="text-foreground">
          {formatNumber(payload[0].value)}{' '}
          <span className="text-muted">requests</span>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="requests"
          icon={<Activity size={16} className="text-accent" />}
          label="Total Requests"
          value="2.47M"
          valueNum={2.47}
          valueSuffix="M"
          valueDecimals={2}
          delta="+12.4%"
          deltaPositive
          sparkData={sparkData.requests}
        />
        <StatCard
          id="success-rate"
          icon={<CheckCircle size={16} className="text-success" />}
          label="Success Rate"
          value="99.7%"
          valueNum={99.7}
          valueSuffix="%"
          valueDecimals={1}
          delta="+0.3%"
          deltaPositive
          sparkData={sparkData.successRate}
          sparkColor="var(--color-success)"
        />
        <StatCard
          id="latency"
          icon={<Clock size={16} className="text-info" />}
          label="Avg. Latency"
          value="268ms"
          valueNum={268}
          valueSuffix="ms"
          valueDecimals={0}
          delta="-8.2%"
          deltaPositive
          sparkData={sparkData.latency}
          sparkColor="var(--color-info)"
        />
        <StatCard
          id="healthy-providers"
          icon={<Server size={16} className="text-warning" />}
          label="Healthy Providers"
          value="5 / 6"
          valueNode={<FractionDisplay numerator={5} denominator={6} />}
          delta="-1"
          deltaPositive={false}
          sparkData={sparkData.healthy}
          sparkColor="var(--color-warning)"
        />
      </div>

      {/* Middle row: routing + system status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live routing diagram */}
        <div
          className="lg:col-span-2 p-5 rounded-xl card-hover"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Live Routing
              </h3>
              <p className="text-xs text-muted mt-0.5">Real-time traffic distribution</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-xs text-muted">Live</span>
            </div>
          </div>

          <RoutingDiagram />
        </div>

        {/* System status */}
        <div
          className="p-5 rounded-xl card-hover"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <h3
            className="text-sm font-semibold text-foreground mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            System Status
          </h3>
          <div className="space-y-3">
            {systemStatus.map((s, idx) => (
              <div 
                key={s.name} 
                className="flex items-center justify-between animate-fade-in-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-center gap-2.5">
                  <StatusDot status={s.status} />
                  <span className="text-sm text-foreground">{s.name}</span>
                </div>
                <span
                  className="text-xs"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: s.status === 'healthy' ? 'var(--color-success)' : 'var(--color-warning)',
                  }}
                >
                  <PercentCountUp valueStr={s.uptime} />
                </span>
              </div>
            ))}
          </div>

          <div
            className="mt-4 pt-4"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <p className="text-xs text-muted mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.slice(0, 4).map((a) => (
                <button
                  key={a.label}
                  role="button"
                  tabIndex={0}
                  aria-label={`Navigate to ${a.label}`}
                  onClick={() => onNavigate?.(a.route)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onNavigate?.(a.route)
                    }
                  }}
                  className="hover-lift flex flex-col items-start gap-1 p-2.5 rounded-lg text-left transition-colors hover:border-border-2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.border = '1px solid var(--color-border-2)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.border = '1px solid var(--color-border)')
                  }
                >
                  <span className="text-muted">{a.icon}</span>
                  <span className="text-xs font-medium text-foreground leading-tight">
                    {a.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Requests over time chart */}
      <div
        className="p-5 rounded-xl card-hover"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Requests Over Time
            </h3>
            <p className="text-xs text-muted mt-0.5">
              {chartRange === 'day' ? 'Last 24 hours' : chartRange === 'week' ? 'Last 7 days' : 'Last 30 days'}
            </p>
          </div>
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-lg"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            {(['day', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setChartRange(r)}
                className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all"
                style={{
                  background: chartRange === r ? 'var(--color-border)' : 'transparent',
                  color: chartRange === r ? 'var(--color-foreground)' : 'var(--color-muted)',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="requestsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#71717A', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              tickLine={false}
              axisLine={false}
              interval={chartRange === 'day' ? 3 : 0}
            />
            <YAxis
              tick={{ fill: '#71717A', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatNumber(v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="var(--color-accent)"
              strokeWidth={2}
              fill="url(#requestsFill)"
              dot={chartRange === 'week' ? { r: 3, fill: 'var(--color-accent)', stroke: 'var(--color-background)', strokeWidth: 1 } : false}
              activeDot={{ r: 4, fill: 'var(--color-accent)', stroke: 'var(--color-background)', strokeWidth: 1.5 }}
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity table */}
      <div
        className="rounded-xl overflow-hidden card-hover"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h3
            className="text-sm font-semibold text-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Recent Activity
          </h3>
          <button className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors">
            View all <ExternalLink size={12} />
          </button>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Request ID', 'Provider', 'Model', 'Status', 'Latency', 'Time', 'Retries'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-medium text-muted"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((row, i) => (
                <tr
                  key={row.id}
                  className="transition-colors cursor-pointer"
                  style={{
                    borderBottom: i < recentActivity.length - 1 ? '1px solid #1C1C1E' : 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-3">
                    <span
                      className="text-xs text-muted"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {row.id.slice(0, 20)}…
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-foreground">{row.provider}</td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs text-muted"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {row.model}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs ${row.latency > 3000 ? 'text-accent' : row.latency > 1500 ? 'text-warning' : 'text-foreground'}`}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {formatLatency(row.latency)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted">{row.time}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs ${row.retries > 0 ? 'text-warning' : 'text-muted'}`}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {row.retries}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {recentActivity.map((row) => (
            <div key={row.id} className="px-4 py-3 space-y-1">
              <div className="flex items-center justify-between">
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
              <span className="text-xs text-muted">{row.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
