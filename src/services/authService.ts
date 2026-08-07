/**
 * ARQON — Unified Authentication Service Layer
 *
 * Single source of truth for authenticating, storing sessions,
 * detecting roles, and simulating responses for both Admins and Users.
 */

// Simulation/configuration flags
let googleOauthConfigured = false
let simulateLogoutFailure = false

export function setGoogleOauthConfigured(value: boolean): void {
  googleOauthConfigured = value
}

export function getGoogleOauthConfigured(): boolean {
  return googleOauthConfigured
}

export function setSimulateLogoutFailure(value: boolean): void {
  simulateLogoutFailure = value
}

export function getSimulateLogoutFailure(): boolean {
  return simulateLogoutFailure
}

export interface AuthSession {
  isAuthenticated: boolean
  userName: string
  userRole: string
  userEmail: string
  userAvatar: string
  token?: string
}

const SCHEMA_VERSION = "v1"

const KEYS = {
  SCHEMA: "arqon_schema",
  IS_AUTHENTICATED: "arqon_auth",
  USER_NAME: "arqon_user_name",
  USER_ROLE: "arqon_user_role",
  USER_EMAIL: "arqon_user_email",
  USER_AVATAR: "arqon_user_avatar",
  TOKEN: "arqon_token",
} as const

// Mock accounts simulation database (Isolated in localStorage)
export function getMockAccounts() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('arqon_mock_users')
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('[AuthService] Failed to parse mock accounts', e)
  }
  
  // Seed default database accounts
  const seed = [
    {
      // TODO: Replace mock authentication with backend API.
      email: 'admin',
      password: 'admin',
      name: 'Administrator',
      role: 'admin',
      avatar: '/avatars/avatar-1.png',
    },
    {
      email: 'user@arqon.ai',
      password: 'user2024',
      name: 'Neel Patil',
      role: 'user',
      avatar: '/avatars/avatar-01.png',
    }
  ]
  try {
    localStorage.setItem('arqon_mock_users', JSON.stringify(seed))
  } catch {}
  return seed
}

/**
 * Helper to read and validate session from sessionStorage or localStorage.
 */
export function readSession(): AuthSession {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, userName: '', userRole: '', userEmail: '', userAvatar: '' }
  }

  try {
    const get = (key: string) => sessionStorage.getItem(key) || localStorage.getItem(key)
    const raw = {
      schema: get(KEYS.SCHEMA),
      auth: get(KEYS.IS_AUTHENTICATED),
      userName: get(KEYS.USER_NAME),
      userRole: get(KEYS.USER_ROLE),
      userEmail: get(KEYS.USER_EMAIL),
      userAvatar: get(KEYS.USER_AVATAR),
    }

    if (raw.schema !== SCHEMA_VERSION || raw.auth !== "true" || !raw.userEmail) {
      return { isAuthenticated: false, userName: '', userRole: '', userEmail: '', userAvatar: '' }
    }

    return {
      isAuthenticated: true,
      userName: raw.userName || '',
      userRole: raw.userRole || '',
      userEmail: raw.userEmail || '',
      userAvatar: raw.userAvatar || '/avatars/avatar-1.png',
    }
  } catch {
    return { isAuthenticated: false, userName: '', userRole: '', userEmail: '', userAvatar: '' }
  }
}

/**
 * Helper to write session data to storage.
 */
export function writeSession(session: Omit<AuthSession, 'isAuthenticated'>, rememberMe: boolean = false): void {
  if (typeof window === 'undefined') return

  try {
    const storage = rememberMe ? localStorage : sessionStorage
    
    // Clear other storage to avoid conflict/duplication
    const otherStorage = rememberMe ? sessionStorage : localStorage
    Object.values(KEYS).forEach((k) => otherStorage.removeItem(k))

    storage.setItem(KEYS.SCHEMA, SCHEMA_VERSION)
    storage.setItem(KEYS.IS_AUTHENTICATED, "true")
    storage.setItem(KEYS.USER_NAME, session.userName)
    storage.setItem(KEYS.USER_ROLE, session.userRole)
    storage.setItem(KEYS.USER_EMAIL, session.userEmail)
    storage.setItem(KEYS.USER_AVATAR, session.userAvatar || "/avatars/avatar-1.png")
    if (session.token) {
      storage.setItem(KEYS.TOKEN, session.token)
    }
  } catch (e) {
    console.error('[AuthService] Failed to write session', e)
  }
}

/**
 * Helper to clear session from both sessionStorage and localStorage.
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return
  try {
    Object.values(KEYS).forEach((k) => {
      sessionStorage.removeItem(k)
      localStorage.removeItem(k)
    })
  } catch (e) {
    console.error('[AuthService] Failed to clear session', e)
  }
}

/**
 * Authenticate with backend or mock database.
 */
export async function login(credentials: { email: string; password?: string; rememberMe?: boolean }): Promise<{
  success: boolean
  token: string
  user: {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
  }
}> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800))

  const accounts = getMockAccounts()
  const normalizedEmail = credentials.email.trim().toLowerCase()
  const account = accounts.find(
    (acc) => acc.email.toLowerCase() === normalizedEmail || (acc.email.includes('@') ? acc.email.split('@')[0] : acc.email).toLowerCase() === normalizedEmail
  )

  if (account && (!credentials.password || account.password === credentials.password)) {
    const response = {
      success: true,
      token: 'jwt_token_' + Math.random().toString(36).substring(2),
      user: {
        id: account.role === 'admin' ? '123' : '456',
        name: account.name,
        email: account.email,
        role: account.role as 'admin' | 'user'
      }
    }

    // Write to appropriate storage
    writeSession({
      userName: response.user.name,
      userRole: response.user.role,
      userEmail: response.user.email,
      userAvatar: account.avatar,
      token: response.token
    }, credentials.rememberMe)

    // Sync across useAuth instances
    window.dispatchEvent(new CustomEvent('arqon_auth_sync', { detail: {
      isAuthenticated: true,
      userName: response.user.name,
      userRole: response.user.role,
      userEmail: response.user.email,
      userAvatar: account.avatar
    } }))

    return response
  }

  throw new Error('Invalid email/username or password.')
}

/**
 * Logout session.
 */
export async function logout(): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  if (simulateLogoutFailure) {
    throw new Error('Unable to sign out. Please try again.')
  }

  clearSession()

  // Sync across useAuth instances
  if (typeof window !== 'undefined') {
    const unauthenticatedState = {
      isAuthenticated: false,
      userName: '',
      userRole: '',
      userEmail: '',
      userAvatar: '',
    }
    window.dispatchEvent(new CustomEvent('arqon_auth_sync', { detail: unauthenticatedState }))
    window.dispatchEvent(new CustomEvent('arqon:logout-success'))
  }

  return { success: true }
}

/**
 * Google Sign-In authentication.
 */
export async function loginWithGoogle(rememberMe: boolean = false): Promise<{
  success: boolean
  token: string
  user: {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
  }
}> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (!googleOauthConfigured) {
    throw new Error('Google OAuth is not configured.')
  }

  // Simulated success (defaults to user role)
  const response = {
    success: true,
    token: 'google_jwt_token_' + Math.random().toString(36).substring(2),
    user: {
      id: '123-google',
      name: 'Google User',
      email: 'google.user@arqon.ai',
      role: 'user' as const
    }
  }

  // Save session
  writeSession({
    userName: response.user.name,
    userRole: response.user.role,
    userEmail: response.user.email,
    userAvatar: '/avatars/avatar-02.png',
    token: response.token
  }, rememberMe)

  // Sync across hooks
  window.dispatchEvent(new CustomEvent('arqon_auth_sync', { detail: {
    isAuthenticated: true,
    userName: response.user.name,
    userRole: response.user.role,
    userEmail: response.user.email,
    userAvatar: '/avatars/avatar-02.png'
  } }))

  return response
}

/**
 * Check and refresh session (future-ready).
 */
export async function refreshSession(): Promise<boolean> {
  return true
}

/**
 * Get current logged in user.
 */
export function getCurrentUser() {
  const session = readSession()
  return session.isAuthenticated ? {
    name: session.userName,
    email: session.userEmail,
    role: session.userRole,
    avatar: session.userAvatar
  } : null
}

/**
 * Get current user role.
 */
export function getUserRole(): string | null {
  const session = readSession()
  return session.isAuthenticated ? session.userRole : null
}

/**
 * Register a new User account in mock storage.
 */
export async function register(userData: {
  name: string
  username: string
  email: string
  password?: string
}): Promise<{
  success: boolean
  user: {
    id: string
    name: string
    email: string
    role: 'user'
  }
}> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const accounts = getMockAccounts()
  const normalizedEmail = userData.email.trim().toLowerCase()
  const normalizedUsername = userData.username.trim().toLowerCase()

  // Validate email uniqueness
  const emailExists = accounts.some(
    (acc) => acc.email.toLowerCase() === normalizedEmail
  )
  if (emailExists) {
    throw new Error('Email address is already registered.')
  }

  // Validate username uniqueness
  const usernameExists = accounts.some((acc) => {
    const userPart = acc.email.includes('@') ? acc.email.split('@')[0] : acc.email
    return userPart.toLowerCase() === normalizedUsername
  })
  if (usernameExists) {
    throw new Error('Username is already taken.')
  }

  // TODO: In production, hash passwords using bcrypt/argon2 before storing in database.
  const newAccount = {
    email: normalizedEmail,
    password: userData.password || '',
    name: userData.name,
    role: 'user' as const, // Always user role for security
    avatar: '/avatars/avatar-01.png',
  }

  accounts.push(newAccount)
  try {
    localStorage.setItem('arqon_mock_users', JSON.stringify(accounts))
  } catch (e) {
    console.error('[AuthService] Failed to save register state', e)
  }

  return {
    success: true,
    user: {
      id: 'mock_user_' + Math.random().toString(36).substring(2),
      name: userData.name,
      email: normalizedEmail,
      role: 'user' as const
    }
  }
}
