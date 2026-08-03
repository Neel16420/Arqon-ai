export interface ProviderMetadata {
  id: string
  name: string
  type: string
  brandColor: string
  supportsStreaming?: boolean
  supportsVision?: boolean
  supportsEmbeddings?: boolean
  supportsFunctionCalling?: boolean
  supportsReasoning?: boolean
  supportsImageGeneration?: boolean
}

export const PROVIDER_METADATA: ProviderMetadata[] = [
  {
    id: "openai",
    name: "OpenAI",
    type: "openai",
    brandColor: "#10A37F",
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsImageGeneration: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    type: "anthropic",
    brandColor: "#D97706",
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    id: "google",
    name: "Google AI",
    type: "google",
    brandColor: "#4285F4",
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    type: "azure",
    brandColor: "#0078D4",
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    id: "cohere",
    name: "Cohere",
    type: "cohere",
    brandColor: "#E11D48",
    supportsStreaming: true,
    supportsEmbeddings: true,
  },
  {
    id: "mistral",
    name: "Mistral",
    type: "mistral",
    brandColor: "#7C3AED",
    supportsStreaming: true,
    supportsFunctionCalling: true,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    type: "deepseek",
    brandColor: "#1A4CD7",
    supportsStreaming: true,
    supportsReasoning: true,
  },
  {
    id: "groq",
    name: "Groq",
    type: "groq",
    brandColor: "#F55036",
    supportsStreaming: true,
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    type: "xai",
    brandColor: "#FFFFFF",
    supportsStreaming: true,
    supportsVision: true,
  },
  {
    id: "perplexity",
    name: "Perplexity",
    type: "perplexity",
    brandColor: "#22B8CD",
    supportsStreaming: true,
  },
  {
    id: "together",
    name: "Together AI",
    type: "together",
    brandColor: "#0055FF",
    supportsStreaming: true,
  },
  {
    id: "fireworks",
    name: "Fireworks AI",
    type: "fireworks",
    brandColor: "#FF6B00",
    supportsStreaming: true,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    type: "openrouter",
    brandColor: "#808080",
    supportsStreaming: true,
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    type: "ollama",
    brandColor: "#FFFFFF",
    supportsStreaming: true,
  },
]
