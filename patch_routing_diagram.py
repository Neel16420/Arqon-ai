import pathlib
import re

file_path = pathlib.Path('src/components/RoutingDiagram.tsx')
content = file_path.read_text(encoding='utf-8')

# 1. Remove usePacketAnimation hook imports and usages
content = re.sub(
    r"import \{ usePacketAnimation \} from '\.\./motion/usePacketAnimation'\n",
    "",
    content
)
content = re.sub(
    r"import type \{ RouteNode \} from '\.\./motion/usePacketAnimation'\n",
    "export interface RouteNode { name: string; color: string; x: number; y: number }\n",
    content
)
content = content.replace(
    "  // Packet animation — drives req/res SVG circles via rAF\n  const { reqRef, resRef } = usePacketAnimation(activeProvider, ENGINE_POS, APP_POS)\n",
    ""
)

# 2. Update RouteArm definition to render the new paths
old_route_arm = """function RouteArm({
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
      )}"""

new_route_arm = """function RouteArm({
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
  const opacity = isDimmed ? 0.20 : 1
  const strokeWidth = isActive ? 1.5 : 1.2

  // Reverse path: Provider -> Engine
  const basePath = `M ${CURVE_END_X} ${rowY} C ${(HEX_RIGHT_X + CURVE_END_X) / 2} ${rowY}, ${(HEX_RIGHT_X + CURVE_END_X) / 2} ${ENGINE_POS.y}, ${HEX_RIGHT_X} ${ENGINE_POS.y}`
  
  // Full path: Provider -> Engine -> Application
  const fullPath = `M ${CURVE_END_X} ${rowY} C ${(HEX_RIGHT_X + CURVE_END_X) / 2} ${rowY}, ${(HEX_RIGHT_X + CURVE_END_X) / 2} ${ENGINE_POS.y}, ${HEX_RIGHT_X} ${ENGINE_POS.y} L ${APP_POS.x + 60} ${APP_POS.y}`

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
      {/* Base curve (static, no glow) */}
      <path
        d={basePath}
        fill="none"
        stroke={provider.color}
        strokeWidth={strokeWidth}
        style={{ transition: `stroke-width ${ROUTE.switchDuration}ms ease` }}
      />
      
      {/* If active, draw the full path to App and the animated orb */}
      {isActive && (
        <>
          {/* Static full line overlay to ensure ARQON -> App has the active color */}
          <path
            d={fullPath}
            fill="none"
            stroke={provider.color}
            strokeWidth={1.5}
          />
          {/* Outer glow orb */}
          <path
            d={fullPath}
            fill="none"
            stroke={provider.color}
            strokeWidth={12}
            opacity={0.3}
            strokeLinecap="round"
            pathLength="100"
            className="routing-pulse-orb"
            style={{ filter: 'blur(4px)' }}
          />
          {/* Core orb */}
          <path
            d={fullPath}
            fill="none"
            stroke={provider.color}
            strokeWidth={4}
            opacity={1}
            strokeLinecap="round"
            pathLength="100"
            className="routing-pulse-orb"
          />
        </>
      )}"""

content = content.replace(old_route_arm, new_route_arm)

# 3. Inject CSS definitions and remove old packet rendering
old_defs = """            {/* Active route gradient */}
            <linearGradient id="arqon-route-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.8" />
              <stop offset="100%" stopColor={activeProvider.color} stopOpacity="0.8" />
            </linearGradient>
          </defs>"""

new_defs = """            {/* Active route gradient */}
            <linearGradient id="arqon-route-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.8" />
              <stop offset="100%" stopColor={activeProvider.color} stopOpacity="0.8" />
            </linearGradient>
            <style>{`
              @keyframes route-orb-pulse {
                from { stroke-dashoffset: 135; }
                to   { stroke-dashoffset: 0; }
              }
              .routing-pulse-orb {
                animation: route-orb-pulse 2.8s infinite linear;
                stroke-dasharray: 1 134;
              }
            `}</style>
          </defs>"""

content = content.replace(old_defs, new_defs)

# 4. Remove old packet elements
old_packets = """          {/* ── Animated Packets ────────────────────────────────────── */}

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
          />"""

new_packets = """          {/* ── Animated Packets (Replaced by CSS Path Animation) ── */}"""

content = content.replace(old_packets, new_packets)

# 5. Clean up old line opacity since it is managed by CSS now.
# Note: The App -> Engine static line remains underneath, the active fullPath overlays it.

file_path.write_text(content, encoding='utf-8')
print("Successfully patched RoutingDiagram.tsx")
