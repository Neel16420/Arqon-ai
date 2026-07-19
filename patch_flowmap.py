import pathlib

routing_path = pathlib.Path('src/pages/Routing.tsx')
content = routing_path.read_text(encoding='utf-8')

start_marker = "// ─── Live Flow Map — SVG-based fixed grid (fix for Issue 1) ──────────────────"
end_marker = "// ─── Input Field ──────────────────────────────────────────────────────────────"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Markers not found!")
    exit(1)

new_flow_map = """// ─── Live Flow Map — SVG-based fixed grid (fix for Issue 1) ──────────────────
/**
 * Architecture: CSS Grid positions each provider into a fixed cell.
 * A single <svg> overlay draws connection lines from the engine center
 * to each provider center using useRef'd element bounding boxes.
 * Continuous curved SVG paths with an animated fiber-optic pulse.
 */
function FlowMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef    = useRef<HTMLDivElement>(null)
  const providerRefs = useRef<(HTMLDivElement | null)[]>([])
  const [lines, setLines] = useState<Array<{ id: string; d: string; color: string }>>([])

  const recalc = () => {
    const container = containerRef.current
    const engine    = engineRef.current
    if (!container || !engine) return
    const cRect = container.getBoundingClientRect()
    const eRect = engine.getBoundingClientRect()
    const ex = eRect.left + eRect.width  / 2 - cRect.left
    const ey = eRect.top  + eRect.height / 2 - cRect.top
    const nextLines = providerRefs.current.map((el, i) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      const px = r.left + r.width  / 2 - cRect.left
      const py = r.top  + r.height / 2 - cRect.top
      const midX = (ex + px) / 2
      // Smooth cubic bezier curve
      const d = `M ${ex} ${ey} C ${midX} ${ey}, ${midX} ${py}, ${px} ${py}`
      return { id: PROVIDERS[i].id, d, color: PROVIDERS[i].color }
    }).filter(Boolean) as Array<{ id: string; d: string; color: string }>
    setLines(nextLines)
  }

  useEffect(() => {
    const t = setTimeout(recalc, 80)
    window.addEventListener('resize', recalc)
    return () => { clearTimeout(t); window.removeEventListener('resize', recalc) }
  }, [])

  const gridPositions = [
    { col: 1, row: 1 }, // OpenAI    — top-left
    { col: 3, row: 1 }, // Google    — top-right
    { col: 1, row: 3 }, // Anthropic — bottom-left
    { col: 3, row: 3 }, // Mistral   — bottom-right
    { col: 1, row: 2 }, // Groq      — middle-left
    { col: 3, row: 2 }, // Azure     — middle-right
  ]

  return (
    <div ref={containerRef} className="relative w-full" style={{ minHeight: '320px' }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <style>{`
            @keyframes fiber-pulse {
              0%   { stroke-dashoffset: 100; opacity: 0; }
              15%  { opacity: 1; }
              85%  { opacity: 1; }
              100% { stroke-dashoffset: -20; opacity: 0; }
            }
            .fiber-glow {
              animation: fiber-pulse 2.5s infinite linear;
              stroke-dasharray: 20 100;
            }
            @keyframes hub-pulse {
              0%   { transform: scale(1); opacity: 0.3; }
              20%  { transform: scale(1.05); opacity: 0.6; }
              100% { transform: scale(1); opacity: 0.3; }
            }
            .hub-glow-anim {
              animation: hub-pulse 2.5s infinite ease-out;
            }
          `}</style>
        </defs>
        {lines.map((l) => (
          <g key={l.id}>
            {/* Base continuous curved line */}
            <path d={l.d} fill="none" stroke={l.color} strokeWidth="2" strokeLinecap="round" opacity="0.15" />
            {/* Animated fiber optic pulse */}
            <path d={l.d} fill="none" stroke={l.color} strokeWidth="2" strokeLinecap="round" opacity="0.8"
                  pathLength="100" className="fiber-glow"
                  style={{ filter: `drop-shadow(0 0 6px ${l.color}80)` }} />
          </g>
        ))}
      </svg>

      <div className="relative grid grid-cols-3 grid-rows-3 gap-4" style={{ placeItems: 'center', minHeight: '320px' }}>
        {PROVIDERS.map((p, i) => {
          const pos = gridPositions[i]
          return (
            <div key={p.id} ref={el => { providerRefs.current[i] = el }}
                 className="hover-lift flex flex-col items-center gap-2 w-28 p-3 rounded-2xl text-center transition-all duration-200"
                 style={{ gridColumn: pos.col, gridRow: pos.row, background: 'var(--color-surface)', border: `1px solid ${p.color}30` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${p.color}15`, color: p.color }}>
                <ProviderIcon type={p.id} className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-foreground leading-tight">{p.name}</p>
                <p className="text-[10px] text-muted mt-0.5">{p.latency}ms</p>
                <p className="text-[10px] font-medium" style={{ color: p.color }}>{p.success}%</p>
              </div>
            </div>
          )
        })}

        {/* Arqon Engine Hub (Center) */}
        <div ref={engineRef} className="flex flex-col items-center justify-center z-10 relative" style={{ gridColumn: 2, gridRow: 2 }}>
          {/* Ambient red glow synced with routing pulse */}
          <div className="absolute inset-0 bg-accent rounded-[16px] hub-glow-anim" style={{ filter: 'blur(16px)' }} />
          {/* Black glass square with subtle red border */}
          <div className="relative w-16 h-16 rounded-[16px] flex items-center justify-center shadow-lg"
               style={{ background: 'rgba(10, 10, 14, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 59, 59, 0.25)' }}>
            <img src="/logo/arqon-mark.png" alt="Arqon" className="w-8 h-8 object-contain" />
          </div>
        </div>
      </div>
    </div>
  )
}

"""

new_content = content[:start_idx] + new_flow_map + content[end_idx:]
routing_path.write_text(new_content, encoding='utf-8')
print("Successfully patched FlowMap in Routing.tsx")
