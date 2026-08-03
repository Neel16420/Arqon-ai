import { useState, useEffect } from "react"
import { providersStore } from "./providers"

export type ModelStatus = "healthy" | "disabled" | "beta" | "experimental"

export interface ModelFeature {
  id: string
  name: string
  supported: boolean
}

export interface ModelEndpoint {
  path: string
  method: string
}

export interface AIModel {
  id: string
  provider: "openai" | "anthropic" | "google" | "azure" | "groq" | "deepseek" | "mistral" | "openrouter" | string
  name: string
  version: string
  contextWindow: number
  inputCost: number // per 1M tokens
  outputCost: number // per 1M tokens
  latency: number
  successRate: number
  routingWeight: number
  status: ModelStatus
  description: string
  features: ModelFeature[]
  endpoints: ModelEndpoint[]
  regions: string[]
}

export const MASTER_MODEL_CATALOG: AIModel[] = [
  {
    id: "gpt-4o",
    provider: "openai",
    name: "GPT-4o",
    version: "2024-05-13",
    contextWindow: 128000,
    inputCost: 5.0,
    outputCost: 15.0,
    latency: 280,
    successRate: 99.8,
    routingWeight: 1.0,
    status: "healthy",
    description:
      "Our high-capability flagship model for text, vision, and audio.",
    features: [
      { id: "vision", name: "Vision", supported: true },
      { id: "tools", name: "Function Calling", supported: true },
      { id: "reasoning", name: "Reasoning", supported: false },
      { id: "streaming", name: "Streaming", supported: true },
      { id: "json", name: "JSON Mode", supported: true },
    ],
    endpoints: [{ path: "/v1/chat/completions", method: "POST" }],
    regions: ["us-east", "us-west", "eu-west"],
  },
  {
    id: "claude-3-opus",
    provider: "anthropic",
    name: "Claude 3 Opus",
    version: "20240229",
    contextWindow: 200000,
    inputCost: 15.0,
    outputCost: 75.0,
    latency: 550,
    successRate: 99.5,
    routingWeight: 0.8,
    status: "healthy",
    description: "Powerful model for highly complex tasks.",
    features: [
      { id: "vision", name: "Vision", supported: true },
      { id: "tools", name: "Function Calling", supported: true },
      { id: "reasoning", name: "Reasoning", supported: true },
      { id: "streaming", name: "Streaming", supported: true },
      { id: "json", name: "JSON Mode", supported: false },
    ],
    endpoints: [{ path: "/v1/messages", method: "POST" }],
    regions: ["us-east"],
  },
  {
    id: "gemini-1.5-pro",
    provider: "google",
    name: "Gemini 1.5 Pro",
    version: "001",
    contextWindow: 1000000,
    inputCost: 7.0,
    outputCost: 21.0,
    latency: 320,
    successRate: 99.2,
    routingWeight: 1.0,
    status: "healthy",
    description: "Advanced reasoning with a massive context window.",
    features: [
      { id: "vision", name: "Vision", supported: true },
      { id: "tools", name: "Function Calling", supported: true },
      { id: "reasoning", name: "Reasoning", supported: true },
      { id: "streaming", name: "Streaming", supported: true },
      { id: "json", name: "JSON Mode", supported: true },
    ],
    endpoints: [
      { path: "/v1beta/models/gemini-1.5-pro:generateContent", method: "POST" },
    ],
    regions: ["global"],
  },
  {
    id: "azure-gpt-4o",
    provider: "azure",
    name: "Azure GPT-4o",
    version: "2024-05-13",
    contextWindow: 128000,
    inputCost: 5.0,
    outputCost: 15.0,
    latency: 210,
    successRate: 99.7,
    routingWeight: 0.9,
    status: "healthy",
    description: "Enterprise-grade high reliability OpenAI model via Azure.",
    features: [
      { id: "vision", name: "Vision", supported: true },
      { id: "tools", name: "Function Calling", supported: true },
      { id: "reasoning", name: "Reasoning", supported: false },
      { id: "streaming", name: "Streaming", supported: true },
      { id: "json", name: "JSON Mode", supported: true },
    ],
    endpoints: [
      { path: "/openai/deployments/gpt-4o/chat/completions", method: "POST" },
    ],
    regions: ["us-east", "eu-west"],
  },
  {
    id: "deepseek-r1",
    provider: "deepseek",
    name: "DeepSeek R1",
    version: "v2",
    contextWindow: 128000,
    inputCost: 0.5,
    outputCost: 1.2,
    latency: 180,
    successRate: 98.5,
    routingWeight: 0.5,
    status: "experimental",
    description: "High-performance open weights model.",
    features: [
      { id: "vision", name: "Vision", supported: false },
      { id: "tools", name: "Function Calling", supported: true },
      { id: "reasoning", name: "Reasoning", supported: true },
      { id: "streaming", name: "Streaming", supported: true },
      { id: "json", name: "JSON Mode", supported: true },
    ],
    endpoints: [{ path: "/v1/chat/completions", method: "POST" }],
    regions: ["us-east"],
  },
  {
    id: "mistral-large",
    provider: "mistral",
    name: "Mistral Large",
    version: "latest",
    contextWindow: 32000,
    inputCost: 4.0,
    outputCost: 12.0,
    latency: 300,
    successRate: 99.0,
    routingWeight: 0.7,
    status: "disabled",
    description: "Top-tier reasoning model for multi-lingual tasks.",
    features: [
      { id: "vision", name: "Vision", supported: false },
      { id: "tools", name: "Function Calling", supported: true },
      { id: "reasoning", name: "Reasoning", supported: true },
      { id: "streaming", name: "Streaming", supported: true },
      { id: "json", name: "JSON Mode", supported: true },
    ],
    endpoints: [{ path: "/v1/chat/completions", method: "POST" }],
    regions: ["eu-west", "us-east"],
  },
  {
    id: "llama-3-70b-groq",
    provider: "groq",
    name: "Llama 3 70B",
    version: "8k",
    contextWindow: 8192,
    inputCost: 0.59,
    outputCost: 0.79,
    latency: 18,
    successRate: 99.9,
    routingWeight: 0.8,
    status: "healthy",
    description: "Ultra-fast Llama 3 running on Groq LPU inference engines.",
    features: [
      { id: "vision", name: "Vision", supported: false },
      { id: "tools", name: "Function Calling", supported: true },
      { id: "reasoning", name: "Reasoning", supported: false },
      { id: "streaming", name: "Streaming", supported: true },
      { id: "json", name: "JSON Mode", supported: true },
    ],
    endpoints: [{ path: "/openai/v1/chat/completions", method: "POST" }],
    regions: ["us-west", "eu-central"],
  },
  {
    id: "grok-2",
    provider: "xai",
    name: "Grok 2",
    version: "latest",
    contextWindow: 131072,
    inputCost: 2.0,
    outputCost: 10.0,
    latency: 240,
    successRate: 99.4,
    routingWeight: 0.8,
    status: "healthy",
    description: "Frontier multimodal AI model engineered by xAI.",
    features: [
      { id: "vision", name: "Vision", supported: true },
      { id: "tools", name: "Function Calling", supported: true },
      { id: "reasoning", name: "Reasoning", supported: true },
      { id: "streaming", name: "Streaming", supported: true },
      { id: "json", name: "JSON Mode", supported: true },
    ],
    endpoints: [{ path: "/v1/chat/completions", method: "POST" }],
    regions: ["global"],
  },
]

type Listener = () => void
let currentModels: AIModel[] = []
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function syncWithProviders() {
  const providers = providersStore.getProviders()
  const activeTypes = new Set(providers.map((p) => p.type))

  // 1. Filter out models for providers that no longer exist in providersStore
  let nextModels = currentModels.filter((m) => activeTypes.has(m.provider))

  // 2. Ensure every current provider in providersStore has corresponding models in nextModels
  for (const p of providers) {
    const hasModel = nextModels.some((m) => m.provider === p.type)
    if (!hasModel) {
      const defaults = MASTER_MODEL_CATALOG.filter((m) => m.provider === p.type)
      if (defaults.length > 0) {
        nextModels = [
          ...nextModels,
          ...defaults.map((m) => ({
            ...m,
            status: (p.enabled ? "healthy" : "disabled") as ModelStatus,
          })),
        ]
      } else {
        // Universal default fallback for custom or unlisted provider types
        nextModels = [
          ...nextModels,
          {
            id: `${p.type}-model`,
            provider: p.type,
            name: `${p.name} Fast`,
            version: "v1.0",
            contextWindow: 128000,
            inputCost: 2.0,
            outputCost: 6.0,
            latency: p.latency > 0 ? p.latency : 280,
            successRate: 99.5,
            routingWeight: 0.8,
            status: (p.enabled ? "healthy" : "disabled") as ModelStatus,
            description: `Default specialized AI routing model for ${p.name}.`,
            features: [
              { id: "streaming", name: "Streaming", supported: true },
              { id: "tools", name: "Function Calling", supported: true },
              { id: "json", name: "JSON Mode", supported: true },
            ],
            endpoints: [{ path: "/v1/chat/completions", method: "POST" }],
            regions: ["global"],
          },
        ]
      }
    }
  }

  // 3. Keep status in sync with provider enable/disable state
  nextModels = nextModels.map((m) => {
    const provider = providers.find((p) => p.type === m.provider)
    if (provider && !provider.enabled && m.status !== "disabled") {
      return { ...m, status: "disabled" as ModelStatus }
    }
    if (provider && provider.enabled && m.status === "disabled") {
      return { ...m, status: "healthy" as ModelStatus }
    }
    return m
  })

  if (JSON.stringify(nextModels) !== JSON.stringify(currentModels)) {
    currentModels = nextModels
    emit()
  }
}

// Initialize and subscribe to provider changes for instant zero-reload synchronization
syncWithProviders()
providersStore.subscribe(() => {
  syncWithProviders()
})

export const modelsStore = {
  getModels: () => currentModels,
  setModels: (updater: AIModel[] | ((prev: AIModel[]) => AIModel[])) => {
    currentModels =
      typeof updater === "function" ? updater(currentModels) : updater
    emit()
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

export function useModels() {
  const [models, setModelsLocal] = useState(modelsStore.getModels())

  useEffect(() => {
    return modelsStore.subscribe(() => {
      setModelsLocal(modelsStore.getModels())
    })
  }, [])

  return [models, modelsStore.setModels] as const
}
