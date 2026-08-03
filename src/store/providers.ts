import { useState, useEffect } from "react"

export interface Provider {
  id: string
  name: string
  type: string
  color: string
  letter: string
  enabled: boolean
  status: "healthy" | "warning" | "error" | "disabled" | "expired"
  latency: number
  requestsToday: number
  failureRate: number
  quota: number
  quotaUsed: number
  cooldown: number | null
  priority: number

  // API Key fields
  apiKey: string
  displayName: string
  lastUsed: string
  created: string
  environment: "production" | "development" | "staging"
  tags: string[]
  permissions: string[]

  // Capabilities
  supportsStreaming: boolean
  supportsVision: boolean
  supportsEmbeddings: boolean
  supportsFunctionCalling: boolean
  supportsReasoning: boolean
  supportsImageGeneration: boolean
}

// Initial mock state combining previous API keys and provider stats
export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: "k1",
    name: "OpenAI",
    type: "openai",
    color: "#10A37F",
    letter: "OA",
    enabled: true,
    status: "healthy",
    latency: 847,
    requestsToday: 94200,
    failureRate: 0.12,
    quota: 1000000,
    quotaUsed: 612400,
    cooldown: null,
    priority: 1,
    apiKey: "sk-proj-aBcDeF1234567890",
    displayName: "OpenAI Prod Main",
    lastUsed: "2 min ago",
    created: "Oct 12, 2024",
    environment: "production",
    tags: ["core", "billing"],
    permissions: ["chat", "embeddings"],
    supportsStreaming: true,
    supportsVision: true,
    supportsEmbeddings: false,
    supportsFunctionCalling: true,
    supportsReasoning: false,
    supportsImageGeneration: true,
  },
  {
    id: "k2",
    name: "Anthropic",
    type: "anthropic",
    color: "#D97706",
    letter: "AN",
    enabled: true,
    status: "healthy",
    latency: 1243,
    requestsToday: 66700,
    failureRate: 0.08,
    quota: 500000,
    quotaUsed: 198000,
    cooldown: null,
    priority: 2,
    apiKey: "sk-ant-api03-xYz987654321",
    displayName: "Claude Opus Staging",
    lastUsed: "5 hrs ago",
    created: "Nov 01, 2024",
    environment: "staging",
    tags: ["testing"],
    permissions: ["chat"],
    supportsStreaming: true,
    supportsVision: true,
    supportsEmbeddings: false,
    supportsFunctionCalling: true,
    supportsReasoning: false,
    supportsImageGeneration: false,
  },
  {
    id: "k4",
    name: "Azure OpenAI",
    type: "azure",
    color: "#0078D4",
    letter: "AZ",
    enabled: true,
    status: "error",
    latency: 0,
    requestsToday: 7400,
    failureRate: 18.3,
    quota: 200000,
    quotaUsed: 14800,
    cooldown: 847,
    priority: 6,
    apiKey: "8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p",
    displayName: "Azure East US",
    lastUsed: "Just now",
    created: "Dec 05, 2024",
    environment: "production",
    tags: ["enterprise"],
    permissions: ["chat", "completions"],
    supportsStreaming: true,
    supportsVision: true,
    supportsEmbeddings: false,
    supportsFunctionCalling: true,
    supportsReasoning: false,
    supportsImageGeneration: false,
  },
]

type Listener = () => void
let currentProviders = [...INITIAL_PROVIDERS]
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export const providersStore = {
  getProviders: () => currentProviders,
  setProviders: (updater: Provider[] | ((prev: Provider[]) => Provider[])) => {
    currentProviders =
      typeof updater === "function" ? updater(currentProviders) : updater
    emit()
  },
  addProvider: (p: Provider) => {
    currentProviders = [...currentProviders, p]
    emit()
  },
  updateProvider: (id: string, updates: Partial<Provider>) => {
    currentProviders = currentProviders.map((p) =>
      p.id === id ? { ...p, ...updates } : p,
    )
    emit()
  },
  removeProvider: (id: string) => {
    currentProviders = currentProviders.filter((p) => p.id !== id)
    emit()
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

export function useProviders() {
  const [providers, setProvidersLocal] = useState(providersStore.getProviders())

  useEffect(() => {
    return providersStore.subscribe(() => {
      setProvidersLocal(providersStore.getProviders())
    })
  }, [])

  return [providers, providersStore.setProviders] as const
}
