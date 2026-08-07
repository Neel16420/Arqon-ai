import { useState } from "react"
import { Eye, EyeOff, AlertCircle, Sparkles, Loader2, User, Lock, Mail } from "lucide-react"

import { useToast } from "../components/toast/ToastContext"
import { useAuth } from "../hooks/useAuth"
import AuthBackground from "../components/auth/AuthBackground"
import { 
  login as authServiceLogin, 
  register as authServiceRegister 
} from "../services/authService"

export default function Login() {
  const { success: toastSuccess, error: toastError } = useToast()
  const { login: syncAuthContext } = useAuth()

  const [currentMode, setCurrentMode] = useState<'login' | 'register' | 'forgot-password'>('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // Live password requirements checklist
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ]

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (currentMode === 'login') {
      if (!email || !password) {
        setError('Please fill in all required fields.')
        return
      }

      setLoading(true)

      try {
        const response = await authServiceLogin({ email, password, rememberMe })
        
        syncAuthContext({
          userName: response.user.name,
          userRole: response.user.role,
          userEmail: response.user.email,
          userAvatar: response.user.role === 'admin' ? '/avatars/avatar-1.png' : '/avatars/avatar-01.png',
        })

        setSuccessMsg('Authentication successful! Redirecting...')
        toastSuccess('Welcome to Arqon', `Successfully signed in as ${response.user.name}`)

        setTimeout(() => {
          const destination = response.user.role === 'admin' ? '/overview' : '/user/dashboard'
          window.history.pushState(null, '', destination)
          window.dispatchEvent(new PopStateEvent('popstate'))
        }, 800)
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.')
        toastError('Authentication Failed', err.message || 'Check your credentials and try again.')
      } finally {
        setLoading(false)
      }

    } else if (currentMode === 'register') {
      if (!name || !username || !email || !password || !confirmPassword) {
        setError('Please fill in all required fields.')
        return
      }

      // Email format regex
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address.')
        return
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters.')
        return
      }

      const unmetRequirements = requirements.filter(req => !req.met)
      if (unmetRequirements.length > 0) {
        setError('Password does not meet all complexity requirements.')
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }

      if (!termsAccepted) {
        setError('You must accept the Terms & Conditions.')
        return
      }

      setLoading(true)

      try {
        await authServiceRegister({ name, username, email, password })

        setRegistrationSuccess(true)
        setSuccessMsg('Account created successfully. Please sign in.')
        toastSuccess('Account Created', 'Welcome to Arqon! Account registered successfully.')

        setTimeout(() => {
          setRegistrationSuccess(false)
          setCurrentMode('login')
          setError(null)
          setSuccessMsg('Account created successfully. Please sign in to continue.')
          setPassword('')
          setConfirmPassword('')
        }, 2200)
      } catch (err: any) {
        setError(err.message || 'Registration failed.')
        toastError('Registration Failed', err.message || 'Check your information and try again.')
      } finally {
        setLoading(false)
      }

    } else if (currentMode === 'forgot-password') {
      if (!email) {
        setError('Please enter your email address.')
        return
      }

      setLoading(true)

      try {
        await new Promise((r) => setTimeout(r, 800))
        setSuccessMsg('Password recovery link sent! Check your inbox.')
        toastSuccess('Recovery Sent', 'Please check your email for the recovery link.')
      } catch (err: any) {
        setError(err.message || 'Failed to send recovery link.')
      } finally {
        setLoading(false)
      }
    }
  }

  const navigateMode = (newMode: 'login' | 'register' | 'forgot-password') => {
    setCurrentMode(newMode)
    setError(null)
    setSuccessMsg(null)
    setPassword('')
    setConfirmPassword('')
  }

  // Render checkmark success screen inside the glass container
  if (registrationSuccess) {
    return (
      <div className="relative min-h-screen w-screen flex items-center justify-center overflow-x-hidden p-4 select-none">
        <AuthBackground />
        <div className="w-full max-w-md rounded-2xl glass-surface glass-border p-8 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 animate-fade-in relative backdrop-blur-xl border border-white/10">
          
          {/* Animated bounce check circle */}
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center animate-bounce">
            <svg className="w-8 h-8 text-emerald-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Account Created!
          </h3>
          
          <p className="text-xs text-muted leading-relaxed max-w-xs">
            Account created successfully.<br />
            Please sign in to continue.
          </p>

          <div className="flex items-center gap-2 text-[10px] text-accent font-bold tracking-widest uppercase font-mono">
            <Loader2 size={12} className="animate-spin text-accent" />
            <span>Redirecting to Login</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center overflow-x-hidden p-4 select-none animate-fade-in">
      {/* Cinematic Animated Space Background */}
      <AuthBackground />

      <div className="w-full max-w-md rounded-2xl glass-surface glass-border p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in-up relative backdrop-blur-xl border border-white/10">
        
        {/* ARQON Logo & Branding */}
        <div className="flex flex-col items-center justify-center text-center space-y-1.5 pt-2">
          <img src="/logo/arqon-logo.png" alt="ARQON Logo" className="w-12 h-12 object-contain" />
          <h2
            className="text-xl sm:text-2xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {currentMode === 'login' && 'Login'}
            {currentMode === 'register' && 'Register'}
            {currentMode === 'forgot-password' && 'Reset Password'}
          </h2>
          <p className="text-xs text-muted">
            {currentMode === 'login' && 'Sign in to continue'}
            {currentMode === 'register' && 'Get started with your workspace'}
            {currentMode === 'forgot-password' && 'Recover your workspace access'}
          </p>
        </div>

        {/* Spacing Divider */}
        <div className="border-t border-border/40" />

        {/* Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 leading-relaxed animate-shake">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5 leading-relaxed">
            <Sparkles size={15} className="shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentMode === 'register' && (
            <>
              {/* Full Name */}
              <div className="relative border-b border-white/20 focus-within:border-accent transition-all duration-200 pb-1">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted">
                  <User size={15} />
                </span>
                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full h-10 border-0 bg-transparent text-xs text-white placeholder-muted/60 focus:ring-0 focus:outline-none pl-8"
                />
              </div>

              {/* Username */}
              <div className="relative border-b border-white/20 focus-within:border-accent transition-all duration-200 pb-1">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted">
                  <User size={15} />
                </span>
                <input
                  id="register-username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full h-10 border-0 bg-transparent text-xs text-white placeholder-muted/60 focus:ring-0 focus:outline-none pl-8"
                />
              </div>
            </>
          )}

          {/* Email or Username */}
          <div className="relative border-b border-white/20 focus-within:border-accent transition-all duration-200 pb-1">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted">
              {currentMode === 'register' ? <Mail size={15} /> : <User size={15} />}
            </span>
            <input
              id="login-email"
              type="text"
              placeholder={currentMode === 'register' ? 'Enter your email' : 'Enter your email/username'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full h-10 border-0 bg-transparent text-xs text-white placeholder-muted/60 focus:ring-0 focus:outline-none pl-8"
            />
          </div>

          {/* Password */}
          {currentMode !== 'forgot-password' && (
            <div className="relative border-b border-white/20 focus-within:border-accent transition-all duration-200 pb-1">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted">
                <Lock size={15} />
              </span>
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full h-10 border-0 bg-transparent text-xs text-white placeholder-muted/60 focus:ring-0 focus:outline-none pl-8 pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          )}

          {/* Confirm Password */}
          {currentMode === 'register' && (
            <div className="relative border-b border-white/20 focus-within:border-accent transition-all duration-200 pb-1">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted">
                <Lock size={15} />
              </span>
              <input
                id="login-confirmpassword"
                type={showConfirmPw ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full h-10 border-0 bg-transparent text-xs text-white placeholder-muted/60 focus:ring-0 focus:outline-none pl-8 pr-8"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer transition-colors"
              >
                {showConfirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          )}

          {/* Live password requirements checklist for registration */}
          {currentMode === 'register' && password && (
            <div className="p-3 rounded-xl bg-surface-2/40 border border-border/40 space-y-2 animate-fade-in">
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider flex justify-between">
                <span>Password Requirements</span>
                <span className="font-bold text-foreground text-[9px]">{strength.label} ({strength.score}%)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className={`shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[9px] ${
                      req.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted/10 text-muted/60'
                    }`}>
                      {req.met ? '✓' : '○'}
                    </span>
                    <span className={req.met ? 'text-foreground font-semibold' : 'text-muted'}>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remember Me and Forgot Password row */}
          {currentMode === 'login' ? (
            <div className="flex items-center justify-between text-xs mt-2 select-none">
              <label className="flex items-center gap-2 text-muted hover:text-foreground cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="rounded bg-surface-2 border-border text-accent focus:ring-accent/30 focus:ring-offset-0 focus:ring-1 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => navigateMode('forgot-password')}
                className="text-muted hover:text-foreground cursor-pointer transition-all"
              >
                Forgot password?
              </button>
            </div>
          ) : currentMode === 'register' ? (
            <label className="flex items-start gap-2.5 text-xs text-muted hover:text-foreground cursor-pointer transition-colors select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                disabled={loading}
                className="mt-0.5 rounded bg-surface-2 border-border text-accent focus:ring-accent/30 focus:ring-offset-0 focus:ring-1 cursor-pointer"
              />
              <span>
                I agree to the <a href="/terms" className="text-accent font-bold hover:underline">Terms & Conditions</a> and <a href="/privacy" className="text-accent font-bold hover:underline">Privacy Policy</a>.
              </span>
            </label>
          ) : null}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] hover:opacity-90 transition-all duration-200 mt-2"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #C62828 100%)',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>
                {currentMode === 'login' && 'Login Now'}
                {currentMode === 'register' && 'Register Now'}
                {currentMode === 'forgot-password' && 'Recover Password'}
              </span>
            )}
          </button>
        </form>

        {/* Spacing Divider */}
        <div className="border-t border-border/40" />

        {/* Footer switch state action items */}
        <div className="text-center pt-1.5 flex flex-col items-center justify-center gap-1.5 text-xs text-muted select-none">
          {currentMode === 'login' ? (
            <div className="flex items-center gap-1">
              <span>Don't have an account?</span>
              <button
                type="button"
                onClick={() => navigateMode('register')}
                className="font-bold text-accent hover:underline cursor-pointer transition-all hover:scale-105"
              >
                Create Account
              </button>
            </div>
          ) : currentMode === 'register' ? (
            <div className="flex items-center gap-1">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => navigateMode('login')}
                className="font-bold text-accent hover:underline cursor-pointer transition-all hover:scale-105"
              >
                Sign In
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigateMode('login')}
              className="font-bold text-accent hover:underline cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <span>Back to Login</span>
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
