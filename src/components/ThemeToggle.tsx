import { useRef, useState, useLayoutEffect } from 'react'
import { useTheme, Theme } from '../hooks/useTheme'

/* ── SVG Icons ─────────────────────────────────────────────────────────── */

function SunIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 48 48" fill="none"
      style={{ display: 'block', transition: 'opacity 150ms ease', opacity: active ? 1 : 0.55 }}
    >
      <circle cx="24" cy="24" r="10" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
        <line x1="24" y1="4"  x2="24" y2="10" />
        <line x1="24" y1="38" x2="24" y2="44" />
        <line x1="4"  y1="24" x2="10" y2="24" />
        <line x1="38" y1="24" x2="44" y2="24" />
        <line x1="9.7"  y1="9.7"  x2="13.9" y2="13.9" />
        <line x1="34.1" y1="34.1" x2="38.3" y2="38.3" />
        <line x1="38.3" y1="9.7"  x2="34.1" y2="13.9" />
        <line x1="13.9" y1="34.1" x2="9.7"  y2="38.3" />
      </g>
    </svg>
  )
}

function MoonIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 48 48" fill="none"
      style={{ display: 'block', transition: 'opacity 150ms ease', opacity: active ? 1 : 0.55 }}
    >
      <path
        d="M36 25.4A14 14 0 0 1 22.6 12a14.1 14.1 0 0 1 .4-3.4A14 14 0 1 0 39.4 25a14 14 0 0 1-3.4.4z"
        fill="currentColor"
      />
    </svg>
  )
}

function SystemIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 48 48" fill="none"
      style={{ display: 'block', transition: 'opacity 150ms ease', opacity: active ? 1 : 0.55 }}
    >
      {/* Half-filled circle representing System/auto */}
      <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="3.5" fill="none" />
      <path d="M24 7 A17 17 0 0 1 24 41 Z" fill="currentColor" />
    </svg>
  )
}

/* ── Segments config ────────────────────────────────────────────────────── */

const SEGMENTS: { mode: Theme; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { mode: 'light',  label: 'Light Mode',          Icon: SunIcon },
  { mode: 'system', label: 'System Default Mode',  Icon: SystemIcon },
  { mode: 'dark',   label: 'Dark Mode',            Icon: MoonIcon },
]

/* ── Component ──────────────────────────────────────────────────────────── */

export default function ThemeSegmentedControl() {
  const { theme, setTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Track position of the sliding capsule
  const [capsuleStyle, setCapsuleStyle] = useState({ left: 0, width: 0 })
  const [isInitialized, setIsInitialized] = useState(false)

  // Compute capsule position whenever theme changes
  useLayoutEffect(() => {
    const activeIdx = SEGMENTS.findIndex(s => s.mode === theme)
    const btn = buttonRefs.current[activeIdx]
    const container = containerRef.current
    if (!btn || !container) return

    const containerRect = container.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setCapsuleStyle({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    })
    setIsInitialized(true)
  }, [theme])

  const handleSelect = (mode: Theme, index: number) => {
    if (mode === theme) return
    const btn = buttonRefs.current[index]
    if (!btn) {
      setTheme(mode, null)
      return
    }
    // Get the exact center of the icon button for the ripple origin
    const rect = btn.getBoundingClientRect()
    const origin = {
      x: Math.round(rect.left + rect.width / 2),
      y: Math.round(rect.top + rect.height / 2),
    }
    setTheme(mode, origin)
  }

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Theme mode"
      className="glass-surface glass-border glass-shadow"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '3px',
        borderRadius: '100px',
      }}
    >
      {/* Sliding glass capsule */}
      {isInitialized && (
        <span
          aria-hidden="true"
          className="glass-highlight"
          style={{
            position: 'absolute',
            top: '3px',
            bottom: '3px',
            left: `${capsuleStyle.left}px`,
            width: `${capsuleStyle.width}px`,
            borderRadius: '100px',
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.16)',
            boxShadow: `
              0 0 0 0px rgba(255,59,59,0),
              0 2px 6px rgba(0,0,0,0.3),
              inset 0 1px 0 rgba(255,255,255,0.15)
            `,
            transition: isInitialized
              ? 'left 250ms cubic-bezier(0.16, 1, 0.3, 1), width 250ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease'
              : 'none',
            willChange: 'left, width',
            pointerEvents: 'none',
          }}
        />
      )}

      {SEGMENTS.map(({ mode, label, Icon }, idx) => {
        const active = theme === mode
        return (
          <button
            key={mode}
            ref={el => { buttonRefs.current[idx] = el }}
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => handleSelect(mode, idx)}
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '24px',
              borderRadius: '100px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: active ? 'var(--color-foreground)' : 'var(--color-muted)',
              transform: active ? 'scale(1.1)' : 'scale(1)',
              transition: 'color 200ms ease, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={e => {
              if (!active) e.currentTarget.style.color = 'var(--color-foreground)'
            }}
            onMouseLeave={e => {
              if (!active) e.currentTarget.style.color = 'var(--color-muted)'
            }}
          >
            <Icon active={active} />
          </button>
        )
      })}
    </div>
  )
}
