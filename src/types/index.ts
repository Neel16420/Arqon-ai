/**
 * ARQON — Unified TypeScript Domain Models
 * Shared across Admin and User workspaces.
 */

export type UserRole = 'user' | 'admin' | 'pro'

export interface UserSession {
  isAuthenticated: boolean
  user: {
    id: string
    name: string
    email: string
    role: UserRole
    avatarUrl?: string
    plan: string
  } | null
}

export interface AIModel {
  id: string
  name: string
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Meta' | 'DeepSeek'
  providerBadge: string
  status: 'Operational' | 'Degraded' | 'Beta'
  contextLength: string
  speed: string
  costPer1k?: string
  description: string
  isRecommended?: boolean
  isFavorite?: boolean
  capabilities?: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  tokens?: number
  modelId?: string
  modelName?: string
  codeSnippets?: Array<{ language: string; code: string }>
}

export interface ConversationSummary {
  id: string
  title: string
  modelId: string
  modelName: string
  lastMessage: string
  updatedAt: string
  isFavorite?: boolean
  messageCount: number
}

export interface ProjectItem {
  id: string
  name: string
  description: string
  model: string
  updatedAt: string
  isFavorite: boolean
  isArchived: boolean
  tag: string
  filesCount: number
  chatsCount: number
}

export interface SavedPrompt {
  id: string
  title: string
  category: string
  tags: string[]
  content: string
  isFavorite: boolean
  usageCount: number
}

export interface UserFile {
  id: string
  name: string
  size: string
  type: 'code' | 'document' | 'image' | 'data'
  folder: string
  uploadedAt: string
}

export interface UserNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'alert'
  timestamp: string
  isRead: boolean
}

export interface UserProfileData {
  id: string
  name: string
  email: string
  jobTitle: string
  bio: string
  timezone: string
  language: string
  tier: string
}

export interface BillingSubscription {
  planName: 'Starter' | 'Pro' | 'Enterprise'
  price: string
  period: string
  renewalDate: string
  tokensUsed: number
  tokensLimit: number
}
