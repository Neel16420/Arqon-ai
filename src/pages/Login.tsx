import { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────────────
   MESH DATA
   Nodes spread mostly across the bottom half of the screen.
   viewBox is 0 0 100 100 mapped to the full viewport.
───────────────────────────────────────────────────────────────────────── */
const NODES: [number, number][] = [
  // Bottom row (y: 85-100)
  [ 5, 95], [15, 88], [25, 92], [35, 85], [45, 98], [55, 88], [65, 95], [75, 86], [85, 92], [95, 96],
  // Lower-mid row (y: 70-85)
  [10, 75], [20, 82], [30, 72], [40, 78], [50, 75], [60, 80], [70, 72], [80, 78], [90, 74], [100, 82],
  // Mid row (y: 55-70)
  [ 8, 60], [18, 65], [28, 58], [38, 68], [48, 60], [58, 65], [68, 55], [78, 68], [88, 62], [98, 58],
  // Upper-mid scattered (y: 45-55, very faint due to mask)
  [15, 50], [35, 48], [55, 52], [75, 46], [85, 50],
]

const EDGES: [number, number][] = [
  // Connect bottom row
  [0,1], [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,8], [8,9],
  // Connect lower-mid row
  [10,11], [11,12], [12,13], [13,14], [14,15], [15,16], [16,17], [17,18], [18,19],
  // Connect mid row
  [20,21], [21,22], [22,23], [23,24], [24,25], [25,26], [26,27], [27,28], [28,29],
  // Cross connections (bottom to lower-mid)
  [0,10], [1,11], [2,12], [3,13], [4,14], [5,15], [6,16], [7,17], [8,18], [9,19],
  [1,10], [2,11], [3,12], [4,13], [5,14], [6,15], [7,16], [8,17], [9,18],
  // Cross connections (lower-mid to mid)
  [10,20], [11,21], [12,22], [13,23], [14,24], [15,25], [16,26], [17,27], [18,28], [19,29],
  [11,20], [12,21], [13,22], [14,23], [15,24], [16,25], [17,26], [18,27], [19,28],
  // Cross connections (mid to upper-mid)
  [20,30], [21,30], [23,31], [24,31], [25,32], [26,32], [27,33], [28,34], [29,34],
]

/* ─────────────────────────────────────────────────────────────────────────
   BACKGROUND
   Large black empty space at top. Soft red mesh at the bottom.
───────────────────────────────────────────────────────────────────────── */
function LoginBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden" aria-hidden="true">
      {/* ── 1. Pure black base ── */}
      <div className="absolute inset-0" style={{ background: '#050505' }} />

      {/* ── 2. Cinematic depth light — very subtle, mostly behind the card/mesh ── */}
      <div
        className="absolute"
        style={{
          width: '800px',
          height: '600px',
          bottom: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse, rgba(255,20,40,0.12) 0%, rgba(180,10,30,0.04) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* ── 3. Polygon mesh SVG — concentrated at the bottom ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Vertical mask: opaque at bottom, fading quickly to transparent at top */}
          <linearGradient id="meshGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%"   stopColor="white" stopOpacity="0.8" />
            <stop offset="25%"  stopColor="white" stopOpacity="0.4" />
            <stop offset="45%"  stopColor="white" stopOpacity="0.08" />
            <stop offset="65%"  stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="meshMask">
            <rect width="100" height="100" fill="url(#meshGrad)" />
          </mask>

          {/* Very subtle glow for nodes/edges */}
          <filter id="subtleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g mask="url(#meshMask)">
          {/* Mesh edges */}
          {EDGES.map(([a, b], i) => (
            <line
              key={`edge-${i}`}
              x1={NODES[a][0]} y1={NODES[a][1]}
              x2={NODES[b][0]} y2={NODES[b][1]}
              stroke="rgba(255,40,60,0.35)"
              strokeWidth="0.12"
            />
          ))}

          {/* Accent edges for depth */}
          {EDGES.filter((_, i) => i % 5 === 0).map(([a, b], i) => (
            <line
              key={`acc-${i}`}
              x1={NODES[a][0]} y1={NODES[a][1]}
              x2={NODES[b][0]} y2={NODES[b][1]}
              stroke="rgba(255,50,70,0.6)"
              strokeWidth="0.18"
              filter="url(#subtleGlow)"
            />
          ))}

          {/* Nodes */}
          {NODES.map(([x, y], i) => (
            <circle
              key={`node-${i}`}
              cx={x} cy={y}
              r={i % 4 === 0 ? 0.35 : 0.2}
              fill={i % 4 === 0 ? 'rgba(255,60,80,0.9)' : 'rgba(255,40,60,0.6)'}
              filter={i % 4 === 0 ? 'url(#subtleGlow)' : 'none'}
            />
          ))}
        </g>
      </svg>
      
      {/* ── 4. Tiny subtle particles, static but glowing softly ── */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="particleGlow"><feGaussianBlur stdDeviation="0.4" /></filter>
        </defs>
        <g opacity="0.4">
          <circle cx="20" cy="80" r="0.15" fill="#ff2d55" filter="url(#particleGlow)" />
          <circle cx="75" cy="85" r="0.2" fill="#ff2d55" filter="url(#particleGlow)" />
          <circle cx="85" cy="65" r="0.1" fill="#ff2d55" filter="url(#particleGlow)" />
          <circle cx="35" cy="70" r="0.12" fill="#ff2d55" filter="url(#particleGlow)" />
          <circle cx="60" cy="90" r="0.18" fill="#ff2d55" filter="url(#particleGlow)" />
        </g>
      </svg>
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505]">
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
          <div style={{ padding: '48px 36px 36px' }}>

            {/* ── Logo Section ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>

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
                    width: '60px',
                    height: '60px',
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
                    style={{ width: '32px', height: '32px', objectFit: 'contain', position: 'relative', zIndex: 1 }}
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
                marginBottom: '32px',
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
            style={{
              padding: '16px 36px 20px',
              textAlign: 'center',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              background: 'rgba(0,0,0,0.15)',
            }}
          >
            <p
              style={{
                fontSize: '10.5px',
                color: 'rgba(255,255,255,0.25)',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.02em',
              }}
            >
              Single-operator admin console &mdash; v2.4.1
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes loginSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
