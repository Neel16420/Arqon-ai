import { useEffect, useRef } from 'react'

// Arqon Color Tokens
const C1 = '#FF2E43'
const C2 = '#FF445A'
const C3 = '#FF6B6B'

interface RibbonConfig {
  id: number
  color: string
  amplitude: number
  wavelength: number
  speed: number
  blur: number
  opacityBase: number
  opacityVar: number
  opacitySpeed: number
  scaleYSpeed: number
  thickness: number
  glowThickness: number
}

const RIBBONS: RibbonConfig[] = [
  // 1: Back layer, largest, slowest, very blurry
  { id: 1, color: C1, amplitude: 280, wavelength: 1800, speed: 0.8, blur: 60, opacityBase: 0.35, opacityVar: 0.15, opacitySpeed: 0.001, scaleYSpeed: 0.0008, thickness: 8, glowThickness: 60 },
  // 2: Medium
  { id: 2, color: C1, amplitude: 200, wavelength: 1400, speed: 1.2, blur: 40, opacityBase: 0.45, opacityVar: 0.15, opacitySpeed: 0.0012, scaleYSpeed: 0.001, thickness: 6, glowThickness: 40 },
  // 3: Slightly brighter, mid-front
  { id: 3, color: C2, amplitude: 140, wavelength: 1000, speed: 1.6, blur: 20, opacityBase: 0.65, opacityVar: 0.2, opacitySpeed: 0.0015, scaleYSpeed: 0.0012, thickness: 4, glowThickness: 25 },
  // 4: Front layer, sharpest, fastest
  { id: 4, color: C3, amplitude: 80, wavelength: 700, speed: 2.2, blur: 8, opacityBase: 0.9, opacityVar: 0.1, opacitySpeed: 0.002, scaleYSpeed: 0.0015, thickness: 2, glowThickness: 12 },
]

/**
 * Generates an SVG path string for a smooth sine wave.
 * Generates enough periods to cover 3x screen width for seamless looping.
 */
function generateSinePath(amplitude: number, wavelength: number): string {
  const points = []
  const length = Math.ceil(6000 / wavelength) * wavelength

  for (let x = 0; x <= length; x += 10) {
    const y = Math.sin((x / wavelength) * Math.PI * 2) * amplitude
    points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`)
  }
  return points.join(' ')
}

export default function AuthBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animationFrameId: number
    const startTime = performance.now()

    // Store refs to DOM elements to avoid React re-renders (GPU accelerated only)
    const ribbons = RIBBONS.map((r) => ({
      config: r,
      el: document.getElementById(`arqon-auth-ribbon-${r.id}`),
      x: 0,
    }))

    const renderLoop = (time: number) => {
      const elapsed = time - startTime

      ribbons.forEach((ribbon) => {
        if (!ribbon.el) return
        const c = ribbon.config

        // 1. Horizontal movement (Loops perfectly at exactly 1 wavelength)
        ribbon.x -= c.speed
        if (ribbon.x <= -c.wavelength) {
          ribbon.x += c.wavelength
        }

        // 2. Breathing opacity
        const currentOpacity = c.opacityBase + Math.sin(elapsed * c.opacitySpeed) * c.opacityVar

        // 3. Morphing scaleY
        const currentScaleY = 1 + Math.sin(elapsed * c.scaleYSpeed) * 0.15

        // Apply GPU accelerated transforms
        ribbon.el.style.transform = `translate3d(${ribbon.x}px, 0, 0) scaleY(${currentScaleY})`
        ribbon.el.style.opacity = currentOpacity.toFixed(3)
      })

      animationFrameId = requestAnimationFrame(renderLoop)
    }

    animationFrameId = requestAnimationFrame(renderLoop)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none"
      aria-hidden="true"
      style={{ background: '#080808', zIndex: 0 }}
    >
      {/* Ambient gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 46, 67, 0.08) 0%, transparent 80%)',
        }}
      />

      {/* Container for ribbons, vertically centered */}
      <div
        ref={containerRef}
        className="absolute w-full h-full flex items-center"
        style={{ top: '0', left: '0' }}
      >
        {RIBBONS.map((r) => {
          const pathD = generateSinePath(r.amplitude, r.wavelength)

          return (
            <div
              key={r.id}
              id={`arqon-auth-ribbon-${r.id}`}
              className="absolute left-0 will-change-transform"
              style={{
                filter: `blur(${r.blur}px)`,
                mixBlendMode: 'screen', // Additive blending
                width: '6000px',
                height: '0px',
              }}
            >
              <svg
                width="6000"
                height="2000"
                viewBox="0 -1000 6000 2000"
                className="overflow-visible absolute"
                style={{ top: '-1000px', left: '0' }}
              >
                {/* Outer large bloom */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={r.color}
                  strokeWidth={r.glowThickness * 2}
                  strokeLinecap="round"
                  opacity="0.15"
                />
                {/* Soft outer glow */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={r.color}
                  strokeWidth={r.glowThickness}
                  strokeLinecap="round"
                  opacity="0.4"
                />
                {/* Bright core */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={r.color}
                  strokeWidth={r.thickness}
                  strokeLinecap="round"
                  opacity="1"
                />
              </svg>
            </div>
          )
        })}
      </div>
    </div>
  )
}
