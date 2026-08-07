/**
 * RoutingDiagram — Overview page "Live Routing" card
 * ───────────────────────────────────────────────────
 * Pure SVG layout. Providers fan out on the right, Arqon logo in the center,
 * connection lines curve from providers to the engine.
 *
 * ROTATION FIX (root cause):
 *   Framer Motion's motion.image with originX/originY in SVG context
 *   was computing the pivot point wrong — rotating the whole diagram.
 *
 *   Fix: Use a plain SVG <image> element with a ref. Rotation is applied
 *   directly via element.style.transform with transform-box:fill-box and
 *   transform-origin:center. This is the W3C-correct way to rotate an
 *   SVG element around its own geometric center.
 *
 * SHARED STATE (Part 5):
 *   useRoutingSequence() returns from a module-level singleton.
 *   Both this component and Routing.tsx FlowMap share the same provider
 *   and phase state. No duplicate state anywhere.
 */

import { useCallback } from "react"
import { useRoutingSequence } from "../motion/useRoutingSequence"
import {
  AnimatedParticlePath,
  useProviderAnimation,
  useArqonLogoRotation,
  OutboundParticlePath,
  useAppArrivalEffect,
  useEngineFlash,
} from "./AnimatedRoutingFlow"
import { useEngineBreath } from "../motion/useEngineBreath"
import { useReducedMotion } from "../motion/useReducedMotion"
import { ENGINE } from "../motion/motionTokens"
import { ProviderIcon } from "./icons/ProviderLogos"
import { motion } from "framer-motion"
import type { RoutingPhase } from "../motion/useRoutingSequence"

// ─── Layout constants ─────────────────────────────────────────────────────────

/** Center of the Arqon engine in SVG coords */
const ENG = { x: 280, y: 150 }

import { useProviders, Provider } from "../store/providers"

const PROVIDER_X = 560
const PROVIDER_Y_START = 24
const PROVIDER_Y_END = 276
const PROVIDER_ICON_X = 586

/** Hexagon geometry */
const HEX_R = 44
const hexPoints = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90)
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  }).join(" ")

/** Logo sits exactly centered on the engine */
const LOGO_SIZE = 40
const LOGO_X = ENG.x - LOGO_SIZE / 2
const LOGO_Y = ENG.y - LOGO_SIZE / 2

// ─── Application node geometry (LEFT of Arqon) ───────────────────────────────
// The node sits on the left side of the SVG, leaving the right side for providers.
const APP = {
  x: 72, // Center X of the application node card
  y: 150, // Center Y — same as engine center, perfectly horizontal
  w: 120, // Card width
  h: 90, // Card height (slightly taller for better icon+title breathing room)
}
/** Left edge of the engine hexagon — where the outbound path starts */
const HEX_LEFT_X = ENG.x - HEX_R
/** Straight horizontal path: hex left edge → app node right edge */
const OUTBOUND_PATH = `M ${HEX_LEFT_X} ${ENG.y} L ${APP.x + APP.w / 2} ${APP.y}`

// ─── RouteArm — one provider row ─────────────────────────────────────────────

function RouteArm({
  provider,
  rowY,
  isActive,
  phase,
  phaseStartTime,
  onClick,
}: {
  provider: Provider & { pct: string }
  rowY: number
  isActive: boolean
  phase: RoutingPhase
  phaseStartTime: number
  onClick: () => void
}) {
  const { animate, transition, isSelected } = useProviderAnimation(
    isActive,
    phase,
    provider.color,
  )
  const opacity = isActive ? 1 : 0.22

  // Cubic bezier curve: Provider entry → curve → Engine right edge
  const HEX_RIGHT_X = ENG.x + HEX_R
  const MID_X = (HEX_RIGHT_X + PROVIDER_X) / 2
  const pathD = `M ${PROVIDER_X} ${rowY} C ${MID_X} ${rowY}, ${MID_X} ${ENG.y}, ${HEX_RIGHT_X} ${ENG.y}`

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Animated path — static rail + traveling particle (handles its own opacity) */}
      <AnimatedParticlePath
        d={pathD}
        color={provider.color}
        isActive={isActive}
        phase={phase}
        phaseStartTime={phaseStartTime}
        type="inbound"
      />

      {/* Provider Node contents — fades out when inactive */}
      <g style={{ opacity, transition: "opacity 300ms ease" }}>
        {/* Provider dot at line start */}
        <circle
          cx={PROVIDER_X}
          cy={rowY}
          r={isActive ? 4 : 3}
          fill={provider.color}
        />

        {/* Provider icon background circle */}
        <motion.circle
          cx={PROVIDER_ICON_X}
          cy={rowY}
          r={isActive ? 14 : 12}
          fill="var(--color-surface-2)"
          stroke={isSelected ? provider.color : "var(--color-border)"}
          strokeWidth={isActive ? 1.5 : 1}
          animate={animate}
          transition={transition}
        />

        {/* Provider SVG icon */}
        <ProviderIcon
          type={provider.name}
          style={{
            color: provider.color,
            opacity: isActive ? 1 : 0.7,
            pointerEvents: "none",
          }}
          x={PROVIDER_ICON_X - 7}
          y={rowY - 7}
          width={14}
          height={14}
        />

        {/* Provider name */}
        <text
          x={606}
          y={rowY + 4}
          fill={isActive ? "var(--color-foreground)" : "var(--color-muted)"}
          fontSize="11"
          fontFamily="'Inter', sans-serif"
          style={{ transition: "fill 0.3s ease" }}
        >
          {provider.name}
        </text>

        {/* Online dot */}
        <circle cx={752} cy={rowY} r="2.5" fill="var(--color-success)" />

        {/* Traffic percentage */}
        <text
          x={786}
          y={rowY + 4}
          textAnchor="end"
          fill={isActive ? provider.color : "var(--color-muted)"}
          fontSize="11"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight={isActive ? "600" : "400"}
          style={{ transition: "fill 0.3s ease" }}
        >
          {provider.pct}
        </text>
      </g>
    </g>
  )
}

// ─── Main diagram ─────────────────────────────────────────────────────────────

export default function RoutingDiagram() {
  const [providers] = useProviders()
  const reduced = useReducedMotion()
  const { selectedProviderId, phase, phaseStartTime, setSelectedProviderId } =
    useRoutingSequence()

  const fakePcts = ["38%", "27%", "18%", "9%", "5%", "3%", "0%"]
  const displayProviders = providers
    .filter((p) => p.enabled)
    .map((p, i) => ({ ...p, pct: fakePcts[i] || "1%" }))

  const N = displayProviders.length

  // Hexagon breathing (scale only, on the hexagon <g>, NOT the logo)
  const { ref: hexRef, glowRef } = useEngineBreath(selectedProviderId !== null)

  // Logo rotation — direct DOM manipulation, correct SVG rotation
  const logoRef = useArqonLogoRotation(phase, phaseStartTime)

  // Red core flash — ref on the polygon fill, fired on 'rotate' phase
  const flashRef = useEngineFlash(phase)

  // Application arrival pulse — direct DOM on the rect element, using active provider color.
  // Derive the color from the currently selected provider (falls back to accent if none).
  const activeProviderColor =
    displayProviders.find((p) => p.id === selectedProviderId)?.color ??
    "var(--color-accent)"
  const appRectRef = useAppArrivalEffect(phase, activeProviderColor)

  const handleClick = useCallback(
    (id: string) => {
      setSelectedProviderId(id)
    },
    [setSelectedProviderId],
  )

  return (
    <>
      {/* ── Desktop SVG ──────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <svg
          viewBox="0 0 800 300"
          className="w-full"
          style={{ maxHeight: 260 }}
          aria-label="ARQON live routing diagram"
        >
          <defs>
            <filter id="rd-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {N > 0 && (
            <>
              {/* Outer glow disc — opacity only, no scale, never wraps logo */}
              <circle
                ref={glowRef}
                cx={ENG.x}
                cy={ENG.y}
                r={56}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="1"
                opacity={ENGINE.glowRange[0]}
                filter="url(#rd-glow)"
                style={
                  reduced
                    ? {}
                    : {
                        transition: `opacity ${ENGINE.breathPeriod}ms ease-in-out`,
                      }
                }
              />

              {/*
                Hexagon — ref={hexRef} receives breathing scale from useEngineBreath.
                transform-box: fill-box + transform-origin: center center.
                THE LOGO IS NOT INSIDE THIS GROUP.
              */}
              <g
                ref={hexRef}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center center",
                }}
              >
                {/*
                  flashRef is on the polygon fill ONLY.
                  The <g ref={hexRef}> scale is completely unaffected.
                */}
                <polygon
                  ref={flashRef}
                  points={hexPoints(ENG.x, ENG.y, HEX_R)}
                  fill="rgba(220, 38, 38, 0.07)"
                  stroke="var(--color-accent)"
                  strokeWidth="1.5"
                />
              </g>
            </>
          )}

          {/*
            ── ARQON LOGO ───────────────────────────────────────────────
            SIBLING of the hexagon <g> — NOT a child.
            No parent transforms reach this element.
            Rotation is applied via useArqonLogoRotation:
              element.style.transform = rotate(Ndeg)
              element.style.transformBox = 'fill-box'
              element.style.transformOrigin = 'center'
            This guarantees rotation around the image's own center ONLY.
          */}
          <image
            ref={logoRef as unknown as React.RefObject<SVGImageElement>}
            href="/logo/arqon-logo.png"
            x={LOGO_X}
            y={LOGO_Y}
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            preserveAspectRatio="xMidYMid meet"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              // Initial state — will-change hints GPU layer
              willChange: "transform",
            }}
          />

          {/* Engine labels */}
          {N > 0 && (
            <>
              <text
                x={ENG.x}
                y={ENG.y + 62}
                textAnchor="middle"
                fill="var(--color-foreground)"
                fontSize="12"
                fontWeight="600"
                fontFamily="'Space Grotesk', sans-serif"
              >
                ARQON AI
              </text>
              <text
                x={ENG.x}
                y={ENG.y + 76}
                textAnchor="middle"
                fill="var(--color-muted)"
                fontSize="9"
                fontFamily="'Inter', sans-serif"
              >
                Orchestration Engine
              </text>
            </>
          )}

          {/* Empty state or Provider arms */}
          {N === 0 ? (
            <text
              x={ENG.x}
              y={ENG.y + 110}
              textAnchor="middle"
              fill="var(--color-muted)"
              fontSize="11"
              fontFamily="'Inter', sans-serif"
            >
              No AI providers connected
            </text>
          ) : (
            displayProviders.map((p, i) => {
              const rowY =
                N > 1
                  ? PROVIDER_Y_START +
                    i * ((PROVIDER_Y_END - PROVIDER_Y_START) / (N - 1))
                  : (PROVIDER_Y_START + PROVIDER_Y_END) / 2
              return (
                <RouteArm
                  key={p.id}
                  provider={p}
                  rowY={rowY}
                  isActive={p.id === selectedProviderId}
                  phase={phase}
                  phaseStartTime={phaseStartTime}
                  onClick={() => handleClick(p.id)}
                />
              )
            })
          )}

          {/* Click hint */}
          {N > 0 && (
            <text
              x={PROVIDER_ICON_X}
              y={292}
              textAnchor="middle"
              fill="#52525B"
              fontSize="9"
              fontFamily="'Inter', sans-serif"
            >
              click provider to select route
            </text>
          )}

          {/* ── Outbound path: Arqon → Application ─────────────────────
              ONE path drawn from the hex left edge to the app node.
              The static rail + traveling particle are both inside
              OutboundParticlePath — nothing in existing code changes.
          */}
          {/* Outbound path to application (only if providers exist) */}
          {N > 0 && (
            <OutboundParticlePath
              d={OUTBOUND_PATH}
              color={activeProviderColor}
              phase={phase}
              phaseStartTime={phaseStartTime}
            />
          )}

          {/* ── Application node ─────────────────────────────────────────
              Dark glass rounded rectangle. Arrival effect via appRectRef.
              NO scale. NO movement. Only border glow pulse on arrival.
          */}
          {N > 0 && (
            <g>
              {/* Card background */}
              <rect
                ref={appRectRef}
                x={APP.x - APP.w / 2}
                y={APP.y - APP.h / 2}
                width={APP.w}
                height={APP.h}
                rx={10}
                fill="rgba(8,8,12,0.65)"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
                style={{
                  backdropFilter: "blur(12px)",
                }}
              />

              {/* Monitor icon — 15% larger, centered above title */}
              <g transform={`translate(${APP.x - 10.5}, ${APP.y - 26})`}>
                {/* Screen — 21×15 (was 18×13) */}
                <rect
                  x={0}
                  y={0}
                  width={21}
                  height={15}
                  rx={2.5}
                  fill="none"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="1.3"
                />
                {/* Stand neck */}
                <line
                  x1={10.5}
                  y1={15}
                  x2={10.5}
                  y2={19}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="1.3"
                />
                {/* Stand base */}
                <line
                  x1={5.5}
                  y1={19}
                  x2={15.5}
                  y2={19}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="1.3"
                />
              </g>

              {/* "Your Application" — only label, Production removed */}
              <text
                x={APP.x}
                y={APP.y + 8}
                textAnchor="middle"
                fill="rgba(255,255,255,0.82)"
                fontSize="10"
                fontWeight="500"
                fontFamily="'Inter', sans-serif"
              >
                Your Application
              </text>

              {/* Connection dot on the right side of the card */}
              <circle
                cx={APP.x + APP.w / 2}
                cy={APP.y}
                r={3}
                fill="var(--color-accent)"
                opacity={phase === "arrival" ? 1 : 0.4}
                style={{ transition: "opacity 0.2s ease" }}
              />
            </g>
          )}
        </svg>
      </div>

      {/* ── Mobile fallback ──────────────────────────────────────────── */}
      <div className="md:hidden space-y-2">
        <div
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
          }}
        >
          <img
            src="/logo/arqon-logo.png"
            alt="Arqon"
            style={{ width: 18, height: 18, objectFit: "contain" }}
          />
          <span className="text-xs text-muted">Arqon Router</span>
        </div>
        {displayProviders.slice(0, 3).map((p) => (
          <button
            key={p.id}
            onClick={() => handleClick(p.id)}
            className="w-full flex items-center justify-between p-3 rounded-lg"
            style={{
              background:
                selectedProviderId === p.id
                  ? "rgba(255,255,255,0.04)"
                  : "var(--color-surface-2)",
              border:
                selectedProviderId === p.id
                  ? `1px solid ${p.color}40`
                  : "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: p.color }}
              />
              <span className="text-xs text-foreground">{p.name}</span>
            </div>
            <span
              className="text-xs text-muted"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {p.pct}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
