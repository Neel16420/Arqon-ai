/**
 * ARQON USER PANEL — API Client Service Layer
 * Milestone 13: Backend Integration Readiness
 *
 * Configured for HttpOnly cookie authentication, standard REST endpoints,
 * error handling interceptors, and fallback mock data handlers.
 */

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errorCode?: string
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
    this.name = 'ApiError'
  }
}

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || '/api/v1'

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    // Enforce sending HttpOnly authentication cookies with requests
    credentials: 'include',
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config)

    if (!response.ok) {
      if (response.status === 401) {
        // Trigger session expiry or redirect
        window.dispatchEvent(new CustomEvent('arqon:unauthorized'))
      }
      const errorBody = await response.json().catch(() => ({}))
      throw new ApiError(
        errorBody.message || `Request failed with status ${response.status}`,
        response.status,
        errorBody.code
      )
    }

    const data = await response.json()
    return { data, success: true }
  } catch (err) {
    if (err instanceof ApiError) throw err
    // Handle offline or network failure
    throw new ApiError('Network connection failed or service offline.', 0, 'ERR_NETWORK')
  }
}

/**
 * Service Methods API Handlers (Placeholders ready for backend endpoints)
 */
export const UserService = {
  getProfile: () => apiRequest<any>('/user/profile'),
  updateProfile: (data: any) => apiRequest<any>('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getDashboardStats: () => apiRequest<any>('/user/dashboard/stats'),
}

export const ChatService = {
  getConversations: () => apiRequest<any[]>('/user/conversations'),
  getMessages: (conversationId: string) => apiRequest<any[]>(`/user/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, payload: any) =>
    apiRequest<any>(`/user/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify(payload) }),
}
