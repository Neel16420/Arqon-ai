import { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────────────
   CINEMATIC VOLUMETRIC LIGHT RIBBONS
   GPU-accelerated, infinite looping, smooth morphing background.
───────────────────────────────────────────────────────────────────────── */
import { useEffect, useRef } from 'react'

// Arqon Colors
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
 * Generates enough periods to cover 2x screen width + 1 wavelength for seamless looping.
 */
function generateSinePath(amplitude: number, wavelength: number): string {
  const points = []
  // Extend path to 3 times typical max screen width (3 * 2000 = 6000)
  // Ensure it ends on an exact multiple of wavelength to allow perfect looping
  const length = Math.ceil(6000 / wavelength) * wavelength
  
  for (let x = 0; x <= length; x += 10) {
    const y = Math.sin((x / wavelength) * Math.PI * 2) * amplitude
    points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`)
  }
  return points.join(' ')
}

function LoginBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    let animationFrameId: number;
    let startTime = performance.now();
    
    // Store refs to DOM elements to avoid React re-renders (GPU accelerated only)
    const ribbons = RIBBONS.map(r => ({
      config: r,
      el: document.getElementById(`ribbon-${r.id}`),
      x: 0
    }))

    const renderLoop = (time: number) => {
      const elapsed = time - startTime
      
      ribbons.forEach(ribbon => {
        if (!ribbon.el) return
        const c = ribbon.config
        
        // 1. Horizontal movement (Loops perfectly at exactly 1 wavelength)
        ribbon.x -= c.speed
        if (ribbon.x <= -c.wavelength) {
           ribbon.x += c.wavelength
        }
        
        // 2. Breathing opacity
        // Math.sin oscillates -1 to 1. We map it to -opacityVar to +opacityVar
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
      {/* Container for ribbons, vertically centered */}
      <div 
        ref={containerRef}
        className="absolute w-full h-full flex items-center" 
        style={{ top: '0', left: '0' }}
      >
        {RIBBONS.map(r => {
          const pathD = generateSinePath(r.amplitude, r.wavelength)
          
          return (
            <div
              key={r.id}
              id={`ribbon-${r.id}`}
              className="absolute left-0 will-change-transform"
              style={{
                filter: `blur(${r.blur}px)`,
                mixBlendMode: 'screen', // Additive blending
                width: '6000px', // matches path length
                height: '0px', // paths are drawn relative to center
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

/* ─────────────────────────────────────────────────────────────────────────
   AUTH LOGIC
───────────────────────────────────────────────────────────────────────── */
const ADMIN_PASSWORD = 'arqon2024'

interface LoginSession {
  userName:  string
  userRole:  string
  userEmail: string
}

interface LoginProps {
  onLogin: (session: LoginSession) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [focused, setFocused]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    if (password === ADMIN_PASSWORD) {
      onLogin({ userName: 'Administrator', userRole: 'admin', userEmail: 'admin@arqon.internal' })
    } else {
      setError('Invalid admin password. Please try again.')
      setPassword('')
    }
  }

  /* Shared input style helpers */
  const inputBase: React.CSSProperties = {
    width: '100%',
    height: '44px',
    paddingLeft: '14px',
    paddingRight: '42px',
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#ffffff',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '10px',
    boxSizing: 'border-box',
    transition: 'all 200ms ease',
    outline: 'none',
  }
  
  const inputIdle: React.CSSProperties = {
    ...inputBase,
    background: 'rgba(20, 20, 24, 0.4)',
    border: error ? '1px solid rgba(255,45,85,0.6)' : '1px solid rgba(255,255,255,0.06)',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02)',
  }
  
  const inputFocused: React.CSSProperties = {
    ...inputBase,
    background: 'rgba(30, 30, 35, 0.6)',
    border: '1px solid rgba(255,45,85,0.4)',
    boxShadow: '0 0 0 2px rgba(255,45,85,0.15), inset 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto bg-[#050505] py-8">
      <LoginBackground />

      {/* ══════════════════════════════════════════════════════════════
          LOGIN CARD
          Reduced size, elegant proportions, premium dark acrylic.
      ══════════════════════════════════════════════════════════════ */}
      <div
        className="relative z-10 w-full mx-4"
        style={{ maxWidth: '400px' }}
      >
        <div
          style={{
            /* Rich dark glass with subtle red ambient tint at the bottom */
            background: `
              linear-gradient(160deg, rgba(22,22,26,0.5) 0%, rgba(12,12,15,0.6) 40%, rgba(8,8,10,0.8) 100%),
              radial-gradient(ellipse at bottom, rgba(255,30,60,0.06) 0%, transparent 70%)
            `,
            backdropFilter: 'blur(48px) saturate(140%)',
            WebkitBackdropFilter: 'blur(48px) saturate(140%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '32px',
            position: 'relative',
            /* Premium soft shadows and inner edge highlights */
            boxShadow: `
              0  4px  24px rgba(0,0,0,0.4),
              0 24px  64px rgba(0,0,0,0.6),
              0 32px 100px rgba(255,10,40,0.12),
              inset 0  1px 1px rgba(255,255,255,0.12),
              inset 0 -1px 1px rgba(0,0,0,0.5)
            `,
            overflow: 'hidden', // Contain corner reflections cleanly
          }}
        >
          {/* ── Top-edge glossy reflection ── */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              width: '80%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.2) 80%, transparent 100%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
          
          {/* ── Upper-left glossy corner sheen ── */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '140px',
              height: '120px',
              background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* ═════════════════════════════════════════════════════
              CARD CONTENT
          ═════════════════════════════════════════════════════ */}
          <div style={{ padding: '40px 32px 32px' }}>

            {/* ── Logo Section ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>

              {/* Logo Container - Rounded Rectangle with soft glow */}
              <div style={{ position: 'relative' }}>
                {/* Subtle red bloom behind logo container */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '24px',
                    background: 'radial-gradient(circle, rgba(255,35,75,0.3) 0%, transparent 70%)',
                    filter: 'blur(12px)',
                    pointerEvents: 'none',
                  }}
                />
                
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    background: 'linear-gradient(145deg, rgba(30,25,28,0.8) 0%, rgba(15,10,12,0.9) 100%)',
                    border: '1px solid rgba(255,45,85,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.5)',
                  }}
                >
                  <img
                    src="/logo/arqon-new-logo.png"
                    alt="Arqon"
                    style={{ width: '28px', height: '28px', objectFit: 'contain', position: 'relative', zIndex: 1 }}
                  />
                </div>
              </div>

              {/* Brand Text */}
              <div style={{ textAlign: 'center' }}>
                <h1
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  Arqon
                </h1>
                <p
                  style={{
                    fontSize: '10.5px',
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: '4px',
                    letterSpacing: '0.08em',
                    fontFamily: "'Inter', sans-serif",
                    textTransform: 'uppercase',
                  }}
                >
                  AI Orchestration Platform
                </p>
              </div>
            </div>

            {/* ── Subtle Divider ── */}
            <div
              style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
                marginBottom: '24px',
              }}
            />

            {/* ── Form Heading ── */}
            <div style={{ marginBottom: '20px' }}>
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '4px',
                }}
              >
                Admin access
              </h2>
              <p
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.45)',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Enter your admin password to continue.
              </p>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)',
                    marginBottom: '8px',
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    style={focused ? inputFocused : inputIdle}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255,255,255,0.3)',
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Error state */}
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,30,50,0.1)',
                    border: '1px solid rgba(255,30,50,0.2)',
                    color: '#ff6b81',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* ── Submit button ── */}
              <button
                type="submit"
                disabled={!password || loading}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '0.02em',
                  color: '#ffffff',
                  cursor: !password || loading ? 'not-allowed' : 'pointer',
                  opacity: !password || loading ? 0.5 : 1,
                  /* Premium soft crimson vertical gradient */
                  background: 'linear-gradient(180deg, rgba(180,25,45,0.95) 0%, rgba(130,15,30,0.95) 100%)',
                  border: '1px solid rgba(255,40,70,0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: `
                    0 4px 12px rgba(0,0,0,0.3),
                    0 8px 24px rgba(200,20,40,0.15),
                    inset 0 1px 1px rgba(255,255,255,0.2),
                    inset 0 -1px 2px rgba(0,0,0,0.4)
                  `,
                  transition: 'all 150ms ease',
                  marginTop: '10px',
                }}
                onMouseEnter={(e) => {
                  if (!loading && password) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.background = 'linear-gradient(180deg, rgba(200,30,55,1) 0%, rgba(140,20,35,1) 100%)'
                    e.currentTarget.style.boxShadow = `
                      0 6px 16px rgba(0,0,0,0.4),
                      0 12px 32px rgba(200,20,40,0.25),
                      inset 0 1px 1px rgba(255,255,255,0.25),
                      inset 0 -1px 2px rgba(0,0,0,0.4)
                    `
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.background = 'linear-gradient(180deg, rgba(180,25,45,0.95) 0%, rgba(130,15,30,0.95) 100%)'
                  e.currentTarget.style.boxShadow = `
                    0 4px 12px rgba(0,0,0,0.3),
                    0 8px 24px rgba(200,20,40,0.15),
                    inset 0 1px 1px rgba(255,255,255,0.2),
                    inset 0 -1px 2px rgba(0,0,0,0.4)
                  `
                }}
                onMouseDown={(e) => {
                  if (!loading && password) {
                    e.currentTarget.style.transform = 'translateY(1px) scale(0.99)'
                    e.currentTarget.style.boxShadow = `
                      0 2px 8px rgba(0,0,0,0.3),
                      0 4px 16px rgba(200,20,40,0.1),
                      inset 0 2px 4px rgba(0,0,0,0.3)
                    `
                  }
                }}
                onMouseUp={(e) => {
                  if (!loading && password) {
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid rgba(255,255,255,0.2)',
                        borderTopColor: '#ffffff',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'loginSpin 0.7s linear infinite',
                      }}
                    />
                    Authenticating…
                  </span>
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>
          </div>

          {/* ── Card footer ── */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-4"
            style={{
              padding: '16px 24px 24px',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              background: 'rgba(0,0,0,0.15)',
            }}
          >
            <button onClick={() => window.location.href='/terms'} className="login-footer-link">
              Terms & Conditions
            </button>
            <span className="hidden sm:inline text-white/20 text-[10px]">•</span>
            <button onClick={() => window.location.href='/privacy'} className="login-footer-link">
              Privacy Policy
            </button>
            <span className="hidden sm:inline text-white/20 text-[10px]">•</span>
            <button onClick={() => window.location.href='/help'} className="login-footer-link">
              Help Center
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes loginSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
