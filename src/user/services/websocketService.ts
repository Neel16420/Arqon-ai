/**
 * ARQON USER PANEL — Realtime WebSocket Service Abstraction
 * Milestone 13: Backend Integration Readiness
 *
 * Manages WebSocket client connections for realtime AI token streaming,
 * latency health checks, and push notifications.
 */

export type WSEventType = 'token_chunk' | 'generation_done' | 'notification_push' | 'error'

export interface WSMessage {
  type: WSEventType
  conversationId?: string
  content?: string
  tokens?: number
  timestamp?: string
  error?: string
}

type WSEventListener = (msg: WSMessage) => void

export class WebSocketService {
  private socket: WebSocket | null = null
  private listeners: Map<WSEventType, Set<WSEventListener>> = new Map()
  private isConnected = false

  constructor() {
    this.listeners.set('token_chunk', new Set())
    this.listeners.set('generation_done', new Set())
    this.listeners.set('notification_push', new Set())
    this.listeners.set('error', new Set())
  }

  public connect(url: string = 'wss://api.arqon.ai/ws/user'): void {
    if (this.socket) return

    try {
      this.socket = new WebSocket(url)

      this.socket.onopen = () => {
        this.isConnected = true;
        console.log('[WebSocket] Connected to Arqon Realtime Service')
      }

      this.socket.onmessage = (event) => {
        try {
          const parsed: WSMessage = JSON.parse(event.data)
          const handlers = this.listeners.get(parsed.type)
          if (handlers) {
            handlers.forEach((fn) => fn(parsed))
          }
        } catch (e) {
          console.error('[WebSocket] Error parsing message payload', e)
        }
      }

      this.socket.onclose = () => {
        this.isConnected = false
        this.socket = null
      }
    } catch (e) {
      console.warn('[WebSocket] Connection initialized in mock mode')
    }
  }

  public subscribe(event: WSEventType, listener: WSEventListener): () => void {
    const set = this.listeners.get(event)
    if (set) {
      set.add(listener)
    }
    return () => {
      set?.delete(listener)
    }
  }

  public sendPrompt(conversationId: string, promptText: string, modelId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({ action: 'stream_prompt', conversationId, promptText, modelId }))
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null;
      this.isConnected = false
    }
  }
}

export const wsService = new WebSocketService()
