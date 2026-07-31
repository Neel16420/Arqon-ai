import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Check, Sparkles, Cpu, Shield, AlertTriangle } from 'lucide-react'
import AuthBackground from '../../components/auth/AuthBackground'

interface UserAuthProps {
  mode?: 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email'
  onSuccessNavigate?: (page: string) => void
}

export default function UserAuth({
  mode = 'login',
  onSuccessNavigate,
}: UserAuthProps) {
  const [currentMode, setCurrentMode] = useState(mode)

  // Form Fields
  const [email, setEmail] = useState('user@example.com')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)

  // Feedback states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Caps Lock Event Handler
  const handleKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'))
    }
  }

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-surface-2' }
    let score = 0
    if (pwd.length >= 8) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500' }
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' }
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' }
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' }
  }

  const strength = getPasswordStrength(password)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!email || (currentMode !== 'forgot-password' && !password)) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      if (currentMode === 'login') {
        setSuccessMsg('Authentication successful! Redirecting to your workspace...')
        setTimeout(() => {
          if (onSuccessNavigate) onSuccessNavigate('dashboard')
          else {
            window.history.pushState(null, '', '/user/dashboard')
            window.dispatchEvent(new PopStateEvent('popstate'))
          }
        }, 800)
      } else if (currentMode === 'register') {
        setSuccessMsg('Account created successfully! Welcome to Arqon.')
        setTimeout(() => {
          if (onSuccessNavigate) onSuccessNavigate('dashboard')
          else {
            window.history.pushState(null, '', '/user/dashboard')
            window.dispatchEvent(new PopStateEvent('popstate'))
          }
        }, 800)
      } else if (currentMode === 'forgot-password') {
        setSuccessMsg('Password recovery link sent! Check your inbox.')
      }
    }, 900)
  }

  const navigateMode = (newMode: 'login' | 'register' | 'forgot-password') => {
    setCurrentMode(newMode)
    setError(null)
    setSuccessMsg(null)
    window.history.pushState(null, '', `/user/${newMode}`)
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden overflow-y-auto bg-[#050505] p-4 sm:p-6 md:p-10">
      {/* 1. Shared Unified Cinematic Animated Background */}
      <AuthBackground />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6">
        
        {/* ── LEFT COLUMN: Brand Hero & Value Proposition (Desktop & Tablet) ── */}
        <div className="lg:col-span-6 space-y-6 text-foreground text-center lg:text-left hidden md:block animate-fade-in-up">
          
          {/* Arqon Brand Badge */}
          <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-surface-2/90 border border-border/80 shadow-lg backdrop-blur-md">
            <img src="/logo/arqon-new-logo.png" alt="Arqon" className="w-5 h-5 object-contain" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-foreground">
              ARQON AI WORKSPACE
            </span>
          </div>

          <div className="space-y-3">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-accent">Arqon</span>
            </h1>

            <p
              className="text-lg font-bold text-accent tracking-wide"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Your intelligent workspace for modern AI development.
            </p>

            <p className="text-sm text-muted leading-relaxed max-w-md mx-auto lg:mx-0">
              Create. Collaborate. Build with AI using multi-model routing, prompt libraries, and real-time document context.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs font-medium text-foreground p-3.5 rounded-2xl glass-surface glass-border max-w-md mx-auto lg:mx-0 shadow-md">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Cpu size={17} className="text-emerald-400" />
              </div>
              <div>
                <span className="font-bold block">Multi-Model AI Orchestration</span>
                <span className="text-[11px] text-muted">GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 & DeepSeek R1</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-foreground p-3.5 rounded-2xl glass-surface glass-border max-w-md mx-auto lg:mx-0 shadow-md">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Sparkles size={17} className="text-amber-400" />
              </div>
              <div>
                <span className="font-bold block">Collaborative Prompt Libraries</span>
                <span className="text-[11px] text-muted">Save system instructions & export reusable JSON templates</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-foreground p-3.5 rounded-2xl glass-surface glass-border max-w-md mx-auto lg:mx-0 shadow-md">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Shield size={17} className="text-blue-400" />
              </div>
              <div>
                <span className="font-bold block">Enterprise Encrypted RAG Context</span>
                <span className="text-[11px] text-muted">Upload document assets with instant vector indexing</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Refined Authentication Card ── */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md rounded-2xl glass-surface glass-border p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in-up relative backdrop-blur-xl border border-white/10">
            
            {/* Top Navigation & Role Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <img src="/logo/arqon-new-logo.png" alt="Arqon" className="w-5 h-5 object-contain md:hidden" />
                <span className="text-[11px] font-mono font-bold text-muted uppercase tracking-wider">
                  {currentMode === 'login' && 'User Sign In'}
                  {currentMode === 'register' && 'Account Registration'}
                  {currentMode === 'forgot-password' && 'Password Recovery'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.history.pushState(null, '', '/overview')
                  window.dispatchEvent(new PopStateEvent('popstate'))
                }}
                className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer transition-all"
                title="Switch to Admin Gateway"
              >
                <span>Admin Gateway</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {/* 3. Brand Section Header */}
            <div className="space-y-1.5">
              <h2
                className="text-2xl font-bold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {currentMode === 'login' && 'Welcome back'}
                {currentMode === 'register' && 'Create your account'}
                {currentMode === 'forgot-password' && 'Reset your password'}
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                {currentMode === 'login' && 'Sign in to continue building with Arqon AI.'}
                {currentMode === 'register' && 'Get started with 5.0M monthly tokens & high-speed reasoning.'}
                {currentMode === 'forgot-password' && 'Enter your registered email address to receive reset instructions.'}
              </p>
            </div>

            {/* Success Alert */}
            {successMsg && (
              <div
                role="status"
                aria-live="polite"
                className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2.5 animate-fade-in-up"
              >
                <Check size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2.5 animate-fade-in-up"
              >
                <AlertTriangle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 4. Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {currentMode === 'register' && (
                <div>
                  <label htmlFor="user-name" className="block text-xs font-semibold text-foreground mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-3.5 text-muted pointer-events-none" />
                    <input
                      id="user-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Neel Patel"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-2/90 border border-border text-xs text-foreground placeholder:text-muted/60 outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="user-email" className="block text-xs font-semibold text-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3.5 text-muted pointer-events-none" />
                  <input
                    id="user-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-2/90 border border-border text-xs text-foreground placeholder:text-muted/60 outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition-all duration-200"
                  />
                </div>
              </div>

              {/* 5. Password Field with Caps Lock Indicator */}
              {currentMode !== 'forgot-password' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="user-password" className="block text-xs font-semibold text-foreground">
                      Password
                    </label>
                    {currentMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => navigateMode('forgot-password')}
                        className="text-[11px] font-medium text-accent hover:underline cursor-pointer transition-all"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3.5 text-muted pointer-events-none" />
                    <input
                      id="user-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyEvent}
                      onKeyUp={handleKeyEvent}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-2/90 border border-border text-xs text-foreground placeholder:text-muted/60 outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-3 text-muted hover:text-foreground cursor-pointer transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Caps Lock Indicator Pill */}
                  {isCapsLockOn && (
                    <div className="mt-1.5 text-[10px] text-amber-400 font-semibold flex items-center gap-1 animate-fade-in-up">
                      <AlertTriangle size={12} />
                      <span>Caps Lock is ON</span>
                    </div>
                  )}

                  {/* Password strength meter for registration */}
                  {currentMode === 'register' && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-muted">
                        <span>Strength: {strength.label}</span>
                        <span>{strength.score}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. Login CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] hover:shadow-accent/20 transition-all duration-200 mt-2"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent) 0%, #C62828 100%)',
                  boxShadow: '0 4px 16px rgba(255, 45, 85, 0.35)',
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <>
                    <span>
                      {currentMode === 'login' && 'Sign In to Workspace'}
                      {currentMode === 'register' && 'Create Account'}
                      {currentMode === 'forgot-password' && 'Send Recovery Link'}
                    </span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* 7. Social Login (UI Only) */}
            <div className="space-y-3 pt-1">
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-border/80" />
                <span className="absolute bg-background px-2.5 text-[10px] text-muted font-mono uppercase tracking-wider">
                  Or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onSuccessNavigate) onSuccessNavigate('dashboard')
                    else {
                      window.history.pushState(null, '', '/user/dashboard')
                      window.dispatchEvent(new PopStateEvent('popstate'))
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-surface-2/90 hover:bg-surface border border-border text-xs font-semibold text-foreground transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onSuccessNavigate) onSuccessNavigate('dashboard')
                    else {
                      window.history.pushState(null, '', '/user/dashboard')
                      window.dispatchEvent(new PopStateEvent('popstate'))
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-surface-2/90 hover:bg-surface border border-border text-xs font-semibold text-foreground transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="text-center pt-2 border-t border-border/60 text-xs text-muted">
              {currentMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigateMode('register')}
                    className="font-bold text-accent hover:underline cursor-pointer transition-all"
                  >
                    Sign up for free
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigateMode('login')}
                    className="font-bold text-accent hover:underline cursor-pointer transition-all"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>

            {/* Direct Workspace Bypass Link */}
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border/80 text-center">
              <button
                type="button"
                onClick={() => {
                  window.history.pushState(null, '', '/user/dashboard')
                  window.dispatchEvent(new PopStateEvent('popstate'))
                }}
                className="text-xs font-bold text-foreground hover:text-accent flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-all"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Enter User Dashboard Directly</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Trust Indicators Footer */}
      <div className="relative z-10 w-full max-w-5xl mx-auto pt-6 border-t border-white/5 flex flex-wrap items-center justify-center md:justify-between gap-4 text-[11px] text-muted">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Shield size={13} className="text-emerald-400" />
            <span>Secure 256-Bit Auth</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5">
            <Lock size={13} className="text-blue-400" />
            <span>Privacy-First Architecture</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5">
            <Cpu size={13} className="text-amber-400" />
            <span>Enterprise SLA</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => window.location.href = '/terms'} className="hover:text-foreground transition-colors cursor-pointer">
            Terms
          </button>
          <span>•</span>
          <button onClick={() => window.location.href = '/privacy'} className="hover:text-foreground transition-colors cursor-pointer">
            Privacy
          </button>
          <span>•</span>
          <button onClick={() => window.location.href = '/help'} className="hover:text-foreground transition-colors cursor-pointer">
            Support
          </button>
        </div>
      </div>
    </div>
  )
}
