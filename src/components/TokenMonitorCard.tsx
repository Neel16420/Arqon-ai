/**
 * TokenMonitorCard
 * ────────────────
 * Replaces the static "Pro Plan" card in the sidebar bottom section.
 *
 * - Matches Arqon glassmorphism design language (vars, typography, spacing)
 * - Red gradient progress bar with glow; pulse when < 20 % remaining
 * - Clicking opens a glass popup (same animation as Notifications / Profile)
 * - Popup closes on click-outside or Escape key
 * - Respects prefers-reduced-motion
 * - All data flows from useTokenMonitor (localStorage-persisted)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Coins, TrendingUp, Clock, ChevronUp, X, Zap, BarChart2, ArrowUp } from 'lucide-react'
import { useTokenMonitor } from '../hooks/useTokenMonitor'
import { useReducedMotion } from '../motion/useReducedMotion'

// ─── Number formatter ─────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function fmtFull(n: number): string {
  return n.toLocaleString()
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
interface ProgressBarProps {
  percentage: number
  isLow: boolean
  animated: boolean
}

function ProgressBar({ percentage, isLow, animated }: ProgressBarProps) {
  const clampedPct = Math.max(0, Math.min(100, percentage))

  return (
    <div
      className="w-full h-1.5 rounded-full overflow-hidden"
      style={{ background: 'var(--color-sidebar-border-right)' }}
      role="progressbar"
      aria-valuenow={clampedPct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${clampedPct}% tokens remaining`}
    >
      <div
        className={isLow ? 'token-pulse-bar' : ''}
        style={{
          height: '100%',
          width: animated ? `${clampedPct}%` : '0%',
          borderRadius: '9999px',
          background:
            clampedPct > 50
              ? 'linear-gradient(90deg, #FF3B3B 0%, #FF6B6B 100%)'
              : clampedPct > 20
              ? 'linear-gradient(90deg, #FF3B3B 0%, #FF8C42 100%)'
              : 'linear-gradient(90deg, #CC1010 0%, #FF3B3B 100%)',
          boxShadow:
            clampedPct > 0
              ? '0 0 8px rgba(255, 59, 59, 0.5), 0 0 2px rgba(255, 59, 59, 0.8)'
              : 'none',
          transition: animated
            ? 'width 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) 150ms'
            : 'none',
        }}
      />
    </div>
  )
}

// ─── Popup ────────────────────────────────────────────────────────────────────
interface PopupProps {
  onClose: () => void
  monitor: ReturnType<typeof useTokenMonitor>
}

function TokenMonitorPopup({ onClose, monitor }: PopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // Close on click-outside
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Trap focus inside popup
  useEffect(() => {
    const firstFocusable = popupRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()
  }, [])

  const rows: { label: string; value: string; icon?: React.ReactNode; highlight?: boolean }[] = [
    { label: 'Plan', value: 'Free Tier', icon: <Coins size={11} /> },
    { label: 'Maximum Tokens', value: fmtFull(monitor.max), icon: <BarChart2 size={11} /> },
    { label: 'Used Tokens', value: fmtFull(monitor.used), icon: <TrendingUp size={11} /> },
    {
      label: 'Remaining Tokens',
      value: fmtFull(monitor.remaining),
      icon: <Zap size={11} />,
      highlight: true,
    },
    {
      label: 'Remaining',
      value: `${monitor.percentage}%`,
      icon: <ArrowUp size={11} />,
      highlight: monitor.isLow,
    },
    { label: 'Reset Countdown', value: monitor.countdownString, icon: <Clock size={11} /> },
    {
      label: 'Est. Requests Left',
      value:
        monitor.estimatedRequestsLeft > 0
          ? fmtFull(monitor.estimatedRequestsLeft)
          : '—',
      icon: <Zap size={11} />,
    },
    {
      label: 'Avg Tokens / Request',
      value:
        monitor.avgTokensPerRequest > 0
          ? fmtFull(monitor.avgTokensPerRequest)
          : '—',
      icon: <BarChart2 size={11} />,
    },
    {
      label: 'Largest Request',
      value:
        monitor.largestRequest > 0 ? fmtFull(monitor.largestRequest) : '—',
      icon: <TrendingUp size={11} />,
    },
  ]

  return (
    <>
      {/* Invisible full-screen backdrop — click anywhere to dismiss */}
      <div className="fixed inset-0 z-40" aria-hidden="true" onClick={onClose} />

      {/* Popup panel */}
      <div
        ref={popupRef}
        role="dialog"
        aria-modal="true"
        aria-label="Token Monitor Details"
        className={`absolute bottom-full left-0 mb-2 w-64 rounded-xl z-50 overflow-hidden glass-surface glass-border glass-shadow ${reduced ? '' : 'glass-open'}`}
        style={{ minWidth: '240px' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: 'rgb(var(--color-accent-rgb) / 0.12)', color: 'var(--color-accent)' }}
            >
              <Coins size={12} />
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: 'var(--color-foreground)', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Token Monitor
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors"
            style={{ color: 'var(--color-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-foreground)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)' }}
            aria-label="Close token monitor"
          >
            <X size={12} />
          </button>
        </div>

        {/* Stats rows */}
        <div className="py-2">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-1.5"
              style={{
                borderBottom:
                  i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <div className="flex items-center gap-1.5">
                <span style={{ color: 'var(--color-muted)', opacity: 0.7 }}>{row.icon}</span>
                <span
                  className="text-xs"
                  style={{ color: 'var(--color-muted)', fontFamily: "'Inter', sans-serif" }}
                >
                  {row.label}
                </span>
              </div>
              <span
                className="text-xs font-medium tabular-nums"
                style={{
                  color: row.highlight
                    ? 'var(--color-accent)'
                    : 'var(--color-foreground)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar in popup */}
        <div className="px-4 pb-3 pt-1">
          <div
            className="w-full h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <div
              style={{
                height: '100%',
                width: `${monitor.percentage}%`,
                borderRadius: '9999px',
                background: 'linear-gradient(90deg, #FF3B3B 0%, #FF6B6B 100%)',
                boxShadow: '0 0 6px rgba(255, 59, 59, 0.6)',
                transition: 'width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)',
              }}
            />
          </div>
        </div>

        {/* Upgrade button */}
        <div
          className="px-4 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button
            disabled
            tabIndex={-1}
            className="w-full py-2 rounded-lg text-xs font-medium cursor-not-allowed"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--color-muted)',
              fontFamily: "'Inter', sans-serif",
              opacity: 0.5,
            }}
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export default function TokenMonitorCard() {
  const monitor = useTokenMonitor()
  const [showPopup, setShowPopup] = useState(false)
  const [animated, setAnimated] = useState(false)
  const reduced = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)

  // Animate progress bar in on mount (matches existing sidebar progress bar pattern)
  useEffect(() => {
    if (reduced) {
      setAnimated(true)
      return
    }
    const t = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(t)
  }, [reduced])

  const handleClose = useCallback(() => setShowPopup(false), [])

  return (
    // Outer wrapper: provides relative positioning context for the popup
    <div ref={cardRef} className="relative hidden lg:block mb-2">
      {/* Popup — rendered above the card */}
      {showPopup && (
        <TokenMonitorPopup onClose={handleClose} monitor={monitor} />
      )}

      {/* Card */}
      <button
        onClick={() => setShowPopup((v) => !v)}
        className="w-full text-left p-3 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        style={{
          background: 'var(--color-sidebar-card-bg)',
          border: 'var(--color-sidebar-card-border)',
          boxShadow: 'var(--color-sidebar-card-shadow)',
          cursor: 'pointer',
        }}
        aria-label="Open token monitor details"
        aria-expanded={showPopup}
        aria-haspopup="dialog"
      >
        {/* Title row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Coins
              size={11}
              style={{ color: 'var(--color-accent)', flexShrink: 0 }}
            />
            <span
              className="text-xs font-semibold"
              style={{
                color: 'var(--color-sidebar-text-active)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '11px',
              }}
            >
              Token Monitor
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--color-sidebar-text-inactive)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9px',
                letterSpacing: '0.04em',
              }}
            >
              Free Tier
            </span>
            <ChevronUp
              size={10}
              style={{
                color: 'var(--color-sidebar-text-inactive)',
                transform: showPopup ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>
        </div>

        {/* Token counts */}
        <div className="flex items-baseline justify-between mb-1.5">
          <span
            className="tabular-nums font-bold"
            style={{
              color: monitor.isLow ? 'var(--color-accent)' : 'var(--color-sidebar-text-active)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '14px',
            }}
          >
            {fmt(monitor.remaining)}
          </span>
          <span
            className="tabular-nums"
            style={{
              color: 'var(--color-sidebar-text-inactive)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px',
            }}
          >
            / {fmt(monitor.max)}
          </span>
        </div>

        {/* Percentage + label */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs"
            style={{ color: 'var(--color-sidebar-text-inactive)', fontSize: '10px' }}
          >
            Remaining
          </span>
          <span
            className="tabular-nums text-xs"
            style={{
              color: monitor.isLow ? 'var(--color-accent)' : 'var(--color-sidebar-text-inactive)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
            }}
          >
            {monitor.percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <ProgressBar
          percentage={monitor.percentage}
          isLow={monitor.isLow}
          animated={animated}
        />

        {/* Countdown */}
        <div className="flex items-center gap-1 mt-2">
          <Clock size={9} style={{ color: 'var(--color-sidebar-text-inactive)', flexShrink: 0 }} />
          <span
            className="truncate"
            style={{
              color: 'var(--color-sidebar-text-inactive)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px',
            }}
          >
            {monitor.countdownString}
          </span>
        </div>

        {/* Today's usage */}
        {monitor.used > 0 && (
          <div className="flex items-center justify-between mt-1.5 pt-1.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center gap-1">
              <TrendingUp size={9} style={{ color: 'var(--color-sidebar-text-inactive)', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-sidebar-text-inactive)', fontSize: '9px', fontFamily: "'Inter', sans-serif" }}>
                Session usage
              </span>
            </div>
            <span
              className="tabular-nums"
              style={{
                color: 'var(--color-sidebar-text-inactive)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9px',
              }}
            >
              {fmt(monitor.used)}
            </span>
          </div>
        )}
      </button>
    </div>
  )
}
