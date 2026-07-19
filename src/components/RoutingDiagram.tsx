/**
 * RoutingDiagram
 * ──────────────
 * ARQON's animated routing diagram.
 *
 * Responsibilities:
 * - Renders the static SVG layout (preserves existing design exactly)
 * - Adds provider selection state (click to activate)
 * - Wires usePacketAnimation for request/response packets
 * - Wires useEngineBreath for engine heartbeat
 * - Applies CSS transitions for route highlight/dim
 * - Mobile fallback list (unchanged from original)
 *
 * Layout coordinate system (viewBox: 0 0 800 300):
 *   App node:     cx=70, cy=152
 *   Engine:       cx=290, cy=152
 *   Providers:    cx=590, cy=rowY (fan-out)
 */

import { useState, useCallback } from 'react'
import { usePacketAnimation } from '../motion/usePacketAnimation'
import { useEngineBreath } from '../motion/useEngineBreath'
import { useReducedMotion } from '../motion/useReducedMotion'
import { ROUTE, PACKET, ENGINE } from '../motion/motionTokens'
import type { RouteNode } from '../motion/usePacketAnimation'
import { ProviderIcon } from './icons/ProviderLogos'

// ─── Static data (mirrors Overview.tsx routingNodes) ──────────────────────────

const PROVIDERS: RouteNode[] = [
  { name: 'OpenAI',    color: '#10A37F', x: 566, y: 26  },
  { name: 'Anthropic', color: '#D97706', x: 566, y: 78  },
  { name: 'Google',    color: '#4285F4', x: 566, y: 130 },
  { name: 'Mistral',   color: '#7C3AED', x: 566, y: 182 },
  { name: 'Cohere',    color: '#E11D48', x: 566, y: 234 },
  { name: 'Azure',     color: '#0078D4', x: 566, y: 274 },
]

const PERCENTAGES = ['38%', '27%', '18%', '9%', '5%', '3%']

/** SVG coordinate of the ARQON engine center */
const ENGINE_POS = { x: 290, y: 152 }
/** SVG coordinate of the Your Application node */
const APP_POS = { x: 70, y: 152 }
/** Right edge of the engine hexagon */
const HEX_RIGHT_X = 290 + 44
/** X where fan-out curves end (provider entry point) */
const CURVE_END_X = 566

/** Generate hexagon polygon points */
const hexagonPoints = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90)
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  }).join(' ')

// ─── Subcomponents ────────────────────────────────────────────────────────────

/**
 * RouteArm renders one provider row:
 * - Bezier curve from engine → provider
 * - Provider dot + label
 * - Percentage badge
 */
function RouteArm({
  provider,
  rowY,
  pct,
  isActive,
  isDimmed,
  onClick,
}: {
  provider: RouteNode
  rowY: number
  pct: string
  isActive: boolean
  isDimmed: boolean
  onClick: () => void
}) {
  const opacity = isDimmed ? ROUTE.inactiveOpacity : ROUTE.activeOpacity
  const strokeWidth = isActive ? ROUTE.activeStrokeWidth : 1.2
  const transition = `opacity ${ROUTE.switchDuration}ms cubic-bezier(0.16,1,0.3,1), stroke-width ${ROUTE.switchDuration}ms ease`

  return (
    <g
      className="group"
      style={{
        opacity,
        transition: `opacity ${ROUTE.switchDuration}ms cubic-bezier(0.16,1,0.3,1)`,
        cursor: 'pointer',
        '--node-color': provider.color,
      } as React.CSSProperties}
      onClick={onClick}
    >
      {/* Bezier curve: engine right edge → provider */}
      <path
        d={`M ${HEX_RIGHT_X} ${ENGINE_POS.y} C ${(HEX_RIGHT_X + CURVE_END_X) / 2} ${ENGINE_POS.y}, ${(HEX_RIGHT_X + CURVE_END_X) / 2} ${rowY}, ${CURVE_END_X} ${rowY}`}
        fill="none"
        stroke={provider.color}
        strokeWidth={strokeWidth}
        strokeDasharray={isActive ? 'none' : '2 3'}
        style={{ transition }}
      />

      {/* Active route glow line (behind the main line) */}
      {isActive && (
        <path
          d={`M ${HEX_RIGHT_X} ${ENGINE_POS.y} C ${(HEX_RIGHT_X + CURVE_END_X) / 2} ${ENGINE_POS.y}, ${(HEX_RIGHT_X + CURVE_END_X) / 2} ${rowY}, ${CURVE_END_X} ${rowY}`}
          fill="none"
          stroke={provider.color}
          strokeWidth={6}
          opacity={0.12}
          style={{ filter: 'blur(3px)' }}
        />
      )}

      {/* Entry dot at curve end */}
      <circle cx={CURVE_END_X} cy={rowY} r={isActive ? 4 : 3} fill={provider.color} />

      {/* Provider icon circle container */}
      <circle
        cx={590}
        cy={rowY}
        r={isActive ? 15 : 13}
        fill="var(--color-surface-2)"
        stroke={isActive ? provider.color : 'var(--color-border)'}
        strokeWidth={isActive ? 1.5 : 1}
        className="transition-all duration-300"
        style={{ 
          filter: isActive ? `drop-shadow(0 0 6px ${provider.color}70)` : 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.stroke = provider.color;
          e.currentTarget.style.filter = `drop-shadow(0 0 8px ${provider.color}80)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.stroke = isActive ? provider.color : 'var(--color-border)';
          e.currentTarget.style.filter = isActive ? `drop-shadow(0 0 6px ${provider.color}70)` : 'none';
        }}
      />
      {/* Provider logo */}
      <ProviderIcon
        type={provider.name}
        className="transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
        style={{
          color: provider.color,
          opacity: isActive ? 1 : 0.75,
          transformOrigin: '590px ' + rowY + 'px',
          pointerEvents: 'none' // Let hover pass to the circle behind it
        }}
        x={590 - 8}
        y={rowY - 8}
        width={16}
        height={16}
      />

      {/* Provider name */}
      <text
        x={610}
        y={rowY + 4}
        fill={isActive ? 'var(--color-foreground)' : 'var(--color-muted)'}
        fontSize="12"
        fontFamily="'Inter', sans-serif"
        style={{ transition: `fill ${ROUTE.switchDuration}ms ease` }}
      >
        {provider.name}
      </text>

      {/* Status dot */}
      <circle cx={758} cy={rowY} r="2.5" fill="var(--color-success)" />

      {/* Percentage */}
      <text
        x={790}
        y={rowY + 4}
        textAnchor="end"
        fill={isActive ? provider.color : 'var(--color-muted)'}
        fontSize="11"
        fontFamily="'JetBrains Mono', monospace"
        fontWeight={isActive ? '600' : '400'}
        style={{ transition: `fill ${ROUTE.switchDuration}ms ease` }}
      >
        {pct}
      </text>
    </g>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function RoutingDiagram() {
  const reduced = useReducedMotion()

  // Default to OpenAI (index 0) as active provider
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const activeProvider = PROVIDERS[activeIndex]

  // Packet animation — drives req/res SVG circles via rAF
  const { reqRef, resRef } = usePacketAnimation(activeProvider, ENGINE_POS, APP_POS)

  // Engine heartbeat — drives scale + glow via rAF
  const { ref: engineRef, glowRef: engineGlowRef } = useEngineBreath()

  const handleProviderClick = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  return (
    <>
      {/* ── Desktop SVG diagram ─────────────────────────────────────── */}
      <div className="hidden md:flex justify-center">
        <svg
          viewBox="0 0 800 310"
          className="w-full"
          style={{ maxHeight: 270 }}
          aria-label="ARQON live routing diagram"
        >
          <defs>
            {/* Engine glow filter */}
            <filter id="arqon-hex-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Request packet glow */}
            <filter id="arqon-pkt-req-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Response packet glow */}
            <filter id="arqon-pkt-res-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Active route gradient */}
            <linearGradient id="arqon-route-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.8" />
              <stop offset="100%" stopColor={activeProvider.color} stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* ── App → Engine connector ──────────────────────────────── */}
          <line
            x1={APP_POS.x + 60}
            y1={APP_POS.y}
            x2={ENGINE_POS.x - 44}
            y2={ENGINE_POS.y}
            stroke="var(--color-border-2)"
            strokeWidth="1.5"
          />
          {/* Animated connector when active */}
          <line
            x1={APP_POS.x + 60}
            y1={APP_POS.y}
            x2={ENGINE_POS.x - 44}
            y2={ENGINE_POS.y}
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            opacity="0.35"
          />
          {/* App node dot */}
          <circle cx={APP_POS.x + 60} cy={APP_POS.y} r="3" fill="var(--color-accent)" />

          {/* ── Your Application card ───────────────────────────────── */}
          <rect
            x={APP_POS.x - 60}
            y={APP_POS.y - 30}
            width="120"
            height="60"
            rx="10"
            fill="var(--color-surface-2)"
            stroke="var(--color-border)"
            strokeWidth="1"
          />
          {[0, 1].map((row) =>
            [0, 1].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={APP_POS.x - 12 + col * 10}
                y={APP_POS.y - 14 + row * 10}
                width="7"
                height="7"
                rx="2"
                fill="none"
                stroke="var(--color-muted)"
                strokeWidth="1.2"
              />
            ))
          )}
          <text
            x={APP_POS.x}
            y={APP_POS.y + 20}
            textAnchor="middle"
            fill="var(--color-muted)"
            fontSize="10"
            fontFamily="'Inter', sans-serif"
          >
            Your Application
          </text>

          {/* ── Provider route arms (fan-out) ───────────────────────── */}
          {PROVIDERS.map((provider, i) => {
            const rowY = 26 + i * ((274 - 26) / (PROVIDERS.length - 1))
            const isActive = i === activeIndex
            const isDimmed = !isActive
            return (
              <RouteArm
                key={provider.name}
                provider={provider}
                rowY={rowY}
                pct={PERCENTAGES[i]}
                isActive={isActive}
                isDimmed={isDimmed}
                onClick={() => handleProviderClick(i)}
              />
            )
          })}

          {/* ── ARQON Engine (center hexagon) ───────────────────────── */}
          <g filter="url(#arqon-hex-glow)">
            {/* Breathing outer glow disc */}
            <circle
              ref={engineGlowRef}
              cx={ENGINE_POS.x}
              cy={ENGINE_POS.y}
              r={52}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1"
              opacity={ENGINE.glowRange[0]}
              style={
                reduced
                  ? {}
                  : { transition: `opacity ${ENGINE.breathPeriod}ms ease-in-out` }
              }
            />
            {/* Core hexagon */}
            <g ref={engineRef}>
              <polygon
                points={hexagonPoints(ENGINE_POS.x, ENGINE_POS.y, 44)}
                fill="rgb(var(--color-accent-rgb) / 0.08)"
                stroke="var(--color-accent)"
                strokeWidth="1.5"
              />
              {/* Engine logo */}
              <image
                href="/logo/arqon-new-logo.png"
                x={ENGINE_POS.x - 16}
                y={ENGINE_POS.y - 20}
                width="32"
                height="32"
              />
            </g>
          </g>

          {/* Engine label */}
          <text
            x={ENGINE_POS.x}
            y={ENGINE_POS.y + 62}
            textAnchor="middle"
            fill="var(--color-foreground)"
            fontSize="12"
            fontWeight="600"
            fontFamily="'Space Grotesk', sans-serif"
          >
            ARQON AI
          </text>
          <text
            x={ENGINE_POS.x}
            y={ENGINE_POS.y + 77}
            textAnchor="middle"
            fill="var(--color-muted)"
            fontSize="9"
            fontFamily="'Inter', sans-serif"
          >
            Orchestration Engine
          </text>

          {/* ── Animated Packets ────────────────────────────────────── */}

          {/* REQUEST packet: App → Engine → Provider */}
          <circle
            ref={reqRef}
            cx={APP_POS.x}
            cy={APP_POS.y}
            r={PACKET.radius}
            fill={activeProvider.color}
            opacity="0"
            filter="url(#arqon-pkt-req-glow)"
            style={{ willChange: 'transform' }}
          />

          {/* RESPONSE packet: Provider → Engine → App */}
          {/* Slightly smaller, more transparent — distinct visual treatment */}
          <circle
            ref={resRef}
            cx={APP_POS.x}
            cy={APP_POS.y}
            r={PACKET.radius - 1.5}
            fill="var(--color-foreground)"
            opacity="0"
            filter="url(#arqon-pkt-res-glow)"
            style={{ willChange: 'transform' }}
          />

          {/* ── "Click to select" hint ─────────────────────────────── */}
          <text
            x={590}
            y={296}
            textAnchor="middle"
            fill="#52525B"
            fontSize="9"
            fontFamily="'Inter', sans-serif"
          >
            click provider to select route
          </text>
        </svg>
      </div>

      {/* ── Mobile simplified list (unchanged) ─────────────────────── */}
      <div className="md:hidden space-y-2">
        <div
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
        >
          <img
            src="/logo/arqon-new-logo.png"
            alt="Arqon"
            style={{ width: '18px', height: '18px', objectFit: 'contain' }}
          />
          <span className="text-xs text-muted">Arqon Router</span>
        </div>
        {PROVIDERS.slice(0, 3).map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActiveIndex(i)}
            className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
            style={{
              background: activeIndex === i ? 'rgba(255,255,255,0.04)' : 'var(--color-surface-2)',
              border: activeIndex === i ? `1px solid ${p.color}40` : '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-xs text-foreground">{p.name}</span>
            </div>
            <span
              className="text-xs text-muted"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {PERCENTAGES[i]}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
