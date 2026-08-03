import { useState, useEffect, useRef } from "react"

import { useToast } from "../components/toast/ToastContext"

import { Eye, EyeOff, AlertCircle } from "lucide-react"

import AuthBackground from '../components/auth/AuthBackground'
            </div>
          )
        })}
      </div>
    </div>
  )
}
>>>>>>> f74ae380a15092b3cf2aa6cc9590c6e727a1b0ae

/* ─────────────────────────────────────────────────────────────────────────
   AUTH LOGIC
───────────────────────────────────────────────────────────────────────── */

const ADMIN_PASSWORD = "arqon2024"

interface LoginSession {
  userName: string

  userRole: string

  userEmail: string

  userAvatar: string
}

interface LoginProps {
  onLogin: (session: LoginSession) => void
}

export default function Login({ onLogin }: LoginProps) {
  const { success, error: toastError } = useToast()

  const [password, setPassword] = useState("")

  const [showPw, setShowPw] = useState(false)

  const [error, setError] = useState("")

  const [loading, setLoading] = useState(false)

  const [focused, setFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError("")

    setLoading(true)

    await new Promise((r) => setTimeout(r, 600))

    setLoading(false)

    if (password === ADMIN_PASSWORD) {
      success("Welcome back", "Successfully authenticated as Administrator")

      onLogin({
        userName: "Administrator",
        userRole: "Super Admin",
        userEmail: "admin@arqon.internal",
        userAvatar: "/avatars/avatar-1.png",
      })
    } else {
      toastError("Authentication Failed", "Invalid admin password")

      setError("Invalid admin password. Please try again.")

      setPassword("")
    }
  }

  /* Shared input style helpers */

  const inputBase: React.CSSProperties = {
    width: "100%",

    height: "44px",

    paddingLeft: "14px",

    paddingRight: "42px",

    fontSize: "13px",

    fontFamily: "'JetBrains Mono', monospace",

    color: "#ffffff",

    backdropFilter: "blur(12px)",

    WebkitBackdropFilter: "blur(12px)",

    borderRadius: "10px",

    boxSizing: "border-box",

    transition: "all 200ms ease",

    outline: "none",
  }

  const inputIdle: React.CSSProperties = {
    ...inputBase,

    background: "rgba(20, 20, 24, 0.4)",

    border: error
      ? "1px solid rgba(255,45,85,0.6)"
      : "1px solid rgba(255,255,255,0.06)",

    boxShadow:
      "inset 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02)",
  }

  const inputFocused: React.CSSProperties = {
    ...inputBase,

    background: "rgba(30, 30, 35, 0.6)",

    border: "1px solid rgba(255,45,85,0.4)",

    boxShadow:
      "0 0 0 2px rgba(255,45,85,0.15), inset 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto bg-[#050505] py-8">
      <AuthBackground />

      {/* ══════════════════════════════════════════════════════════════
          LOGIN CARD
          Reduced size, elegant proportions, premium dark acrylic.
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full mx-4" style={{ maxWidth: "400px" }}>
        <div
          style={{
            /* Rich dark glass with subtle red ambient tint at the bottom */

            background: `
              linear-gradient(160deg, rgba(22,22,26,0.5) 0%, rgba(12,12,15,0.6) 40%, rgba(8,8,10,0.8) 100%),
              radial-gradient(ellipse at bottom, rgba(255,30,60,0.06) 0%, transparent 70%)
            `,

            backdropFilter: "blur(48px) saturate(140%)",

            WebkitBackdropFilter: "blur(48px) saturate(140%)",

            border: "1px solid rgba(255,255,255,0.08)",

            borderRadius: "32px",

            position: "relative",

            /* Premium soft shadows and inner edge highlights */

            boxShadow: `
              0  4px  24px rgba(0,0,0,0.4),
              0 24px  64px rgba(0,0,0,0.6),
              0 32px 100px rgba(255,10,40,0.12),
              inset 0  1px 1px rgba(255,255,255,0.12),
              inset 0 -1px 1px rgba(0,0,0,0.5)
            `,

            overflow: "hidden", // Contain corner reflections cleanly
          }}
        >
          {/* ── Top-edge glossy reflection ── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",

              top: 0,

              left: "10%",

              width: "80%",

              height: "1px",

              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.2) 80%, transparent 100%)",

              pointerEvents: "none",

              zIndex: 2,
            }}
          />

          {/* ── Upper-left glossy corner sheen ── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",

              top: 0,

              left: 0,

              width: "140px",

              height: "120px",

              background:
                "radial-gradient(ellipse at top left, rgba(255,255,255,0.06) 0%, transparent 70%)",

              pointerEvents: "none",
            }}
          />

          {/* ═════════════════════════════════════════════════════
              CARD CONTENT
          ═════════════════════════════════════════════════════ */}
          <div style={{ padding: "40px 32px 32px" }}>
            {/* ── Logo Section ── */}
            <div
              style={{
                display: "flex",

                flexDirection: "column",

                alignItems: "center",

                gap: "16px",

                marginBottom: "24px",
              }}
            >
              {/* Logo Container - Rounded Rectangle with soft glow */}
              <div style={{ position: "relative" }}>
                {/* Subtle red bloom behind logo container */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",

                    inset: "-8px",

                    borderRadius: "24px",

                    background:
                      "radial-gradient(circle, rgba(255,35,75,0.3) 0%, transparent 70%)",

                    filter: "blur(12px)",

                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    width: "52px",

                    height: "52px",

                    borderRadius: "16px",

                    background:
                      "linear-gradient(145deg, rgba(30,25,28,0.8) 0%, rgba(15,10,12,0.9) 100%)",

                    border: "1px solid rgba(255,45,85,0.25)",

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    position: "relative",

                    boxShadow:
                      "inset 0 1px 2px rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.5)",
                  }}
                >
                  <img
                    src="/logo/arqon-new-logo.png"
                    alt="Arqon"
                    style={{
                      width: "28px",

                      height: "28px",

                      objectFit: "contain",

                      position: "relative",

                      zIndex: 1,
                    }}
                  />
                </div>
              </div>

              {/* Brand Text */}
              <div style={{ textAlign: "center" }}>
                <h1
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",

                    fontSize: "22px",

                    fontWeight: 700,

                    color: "#ffffff",

                    letterSpacing: "-0.02em",

                    lineHeight: 1.2,

                    margin: 0,
                  }}
                >
                  Arqon
                </h1>
                <p
                  style={{
                    fontSize: "10.5px",

                    color: "rgba(255,255,255,0.4)",

                    marginTop: "4px",

                    letterSpacing: "0.08em",

                    fontFamily: "'Inter', sans-serif",

                    textTransform: "uppercase",
                  }}
                >
                  AI Orchestration Platform
                </p>

                {/* ── Workspace Role Switcher Pills ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: '#ffffff',
                      background: 'rgba(255, 45, 85, 0.25)',
                      border: '1px solid rgba(255, 45, 85, 0.4)',
                    }}
                  >
                    Admin Gateway
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      window.history.pushState(null, '', '/user/login')
                      window.dispatchEvent(new PopStateEvent('popstate'))
                    }}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: '#ffffff',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                    }}
                  >
                    User Workspace →
                  </button>
                </div>
              </div>
            </div>

            {/* ── Subtle Divider ── */}
            <div
              style={{
                height: "1px",

                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",

                marginBottom: "24px",
              }}
            />

            {/* ── Form Heading ── */}
            <div style={{ marginBottom: "20px" }}>
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",

                  fontSize: "14px",

                  fontWeight: 600,

                  color: "#ffffff",

                  marginBottom: "4px",
                }}
              >
                Admin access
              </h2>
              <p
                style={{
                  fontSize: "12px",

                  color: "rgba(255,255,255,0.45)",

                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Enter your admin password to continue.
              </p>
            </div>

            {/* ── Form ── */}
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",

                    fontSize: "10px",

                    fontWeight: 600,

                    color: "rgba(255,255,255,0.4)",

                    marginBottom: "8px",

                    fontFamily: "'Inter', sans-serif",

                    letterSpacing: "0.06em",

                    textTransform: "uppercase",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
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
                      position: "absolute",

                      right: "12px",

                      top: "50%",

                      transform: "translateY(-50%)",

                      color: "rgba(255,255,255,0.3)",

                      background: "none",

                      border: "none",

                      padding: "4px",

                      cursor: "pointer",

                      display: "flex",

                      alignItems: "center",

                      transition: "color 150ms ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.8)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.3)")
                    }
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
                    display: "flex",

                    alignItems: "center",

                    gap: "8px",

                    fontSize: "12px",

                    padding: "10px 14px",

                    borderRadius: "10px",

                    background: "rgba(255,30,50,0.1)",

                    border: "1px solid rgba(255,30,50,0.2)",

                    color: "#ff6b81",

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
                  width: "100%",

                  height: "44px",

                  borderRadius: "10px",

                  fontSize: "13px",

                  fontWeight: 600,

                  fontFamily: "'Space Grotesk', sans-serif",

                  letterSpacing: "0.02em",

                  color: "#ffffff",

                  cursor: !password || loading ? "not-allowed" : "pointer",

                  opacity: !password || loading ? 0.5 : 1,

                  /* Premium soft crimson vertical gradient */

                  background:
                    "linear-gradient(180deg, rgba(180,25,45,0.95) 0%, rgba(130,15,30,0.95) 100%)",

                  border: "1px solid rgba(255,40,70,0.4)",

                  position: "relative",

                  overflow: "hidden",

                  boxShadow: `
                    0 4px 12px rgba(0,0,0,0.3),
                    0 8px 24px rgba(200,20,40,0.15),
                    inset 0 1px 1px rgba(255,255,255,0.2),
                    inset 0 -1px 2px rgba(0,0,0,0.4)
                  `,

                  transition: "all 150ms ease",

                  marginTop: "10px",
                }}
                onMouseEnter={(e) => {
                  if (!loading && password) {
                    e.currentTarget.style.transform = "translateY(-1px)"

                    e.currentTarget.style.background =
                      "linear-gradient(180deg, rgba(200,30,55,1) 0%, rgba(140,20,35,1) 100%)"

                    e.currentTarget.style.boxShadow = `
                      0 6px 16px rgba(0,0,0,0.4),
                      0 12px 32px rgba(200,20,40,0.25),
                      inset 0 1px 1px rgba(255,255,255,0.25),
                      inset 0 -1px 2px rgba(0,0,0,0.4)
                    `
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"

                  e.currentTarget.style.background =
                    "linear-gradient(180deg, rgba(180,25,45,0.95) 0%, rgba(130,15,30,0.95) 100%)"

                  e.currentTarget.style.boxShadow = `
                    0 4px 12px rgba(0,0,0,0.3),
                    0 8px 24px rgba(200,20,40,0.15),
                    inset 0 1px 1px rgba(255,255,255,0.2),
                    inset 0 -1px 2px rgba(0,0,0,0.4)
                  `
                }}
                onMouseDown={(e) => {
                  if (!loading && password) {
                    e.currentTarget.style.transform =
                      "translateY(1px) scale(0.99)"

                    e.currentTarget.style.boxShadow = `
                      0 2px 8px rgba(0,0,0,0.3),
                      0 4px 16px rgba(200,20,40,0.1),
                      inset 0 2px 4px rgba(0,0,0,0.3)
                    `
                  }
                }}
                onMouseUp={(e) => {
                  if (!loading && password) {
                    e.currentTarget.style.transform = "translateY(0)"
                  }
                }}
              >
                {loading ? (
                  <span
                    style={{
                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "14px",

                        height: "14px",

                        border: "2px solid rgba(255,255,255,0.2)",

                        borderTopColor: "#ffffff",

                        borderRadius: "50%",

                        display: "inline-block",

                        animation: "loginSpin 0.7s linear infinite",
                      }}
                    />
                    Authenticating…
                  </span>
                ) : (
                  "Access Dashboard"
                )}
              </button>
            </form>
          </div>

          {/* ── Card footer ── */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-4"
            style={{
              padding: "16px 24px 24px",

              borderTop: "1px solid rgba(255,255,255,0.04)",

              background: "rgba(0,0,0,0.15)",
            }}
          >
            <button
              onClick={() => (window.location.href = "/terms")}
              className="login-footer-link"
            >
              Terms & Conditions
            </button>
            <span className="hidden sm:inline text-white/20 text-[10px]">
              •
            </span>
            <button
              onClick={() => (window.location.href = "/privacy")}
              className="login-footer-link"
            >
              Privacy Policy
            </button>
            <span className="hidden sm:inline text-white/20 text-[10px]">
              •
            </span>
            <button
              onClick={() => (window.location.href = "/help")}
              className="login-footer-link"
            >
              Help Center
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes loginSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
