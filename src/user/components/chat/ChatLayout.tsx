import React, { useState, useCallback } from 'react'
import ConversationList from './ConversationList'
import ChatWindow from './ChatWindow'
import ContextPanel from './ContextPanel'
import type { ConversationSummary } from './ConversationItem'
import type { ChatMessage } from './MessageBubble'
import { AVAILABLE_MODELS } from './ModelSelector'

const INITIAL_CONVERSATIONS: Record<string, { summary: ConversationSummary; messages: ChatMessage[]; systemPrompt: string }> = {
  'conv-1': {
    summary: {
      id: 'conv-1',
      title: 'React Architecture & Micro-frontends',
      modelId: 'gpt-4o',
      modelName: 'GPT-4o',
      lastMessage: 'Here is how you can isolate micro-frontend state using Zustand...',
      updatedAt: '10 mins ago',
      isFavorite: true,
      messageCount: 3,
    },
    systemPrompt: 'You are a Principal Frontend Architect specializing in React, Next.js, and TypeScript.',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'How should I structure state management across micro-frontends in a large React enterprise application?',
        timestamp: '10:14 AM',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        modelName: 'GPT-4o',
        content: 'For micro-frontend architectures, avoiding global shared state singletons across isolated bundles is critical to prevent tight coupling. Here is the recommended pattern using event buses and isolated Zustand stores:',
        timestamp: '10:15 AM',
        tokens: 412,
        codeSnippets: [
          {
            language: 'typescript',
            code: `// Shared Event Bus pattern for cross-micro-frontend communication
export class MicroFrontendBus extends EventTarget {
  private static instance: MicroFrontendBus;
  
  static getInstance(): MicroFrontendBus {
    if (!MicroFrontendBus.instance) {
      MicroFrontendBus.instance = new MicroFrontendBus();
    }
    return MicroFrontendBus.instance;
  }
}`,
          },
        ],
      },
    ],
  },
  'conv-2': {
    summary: {
      id: 'conv-2',
      title: 'Rust Async Web Server Benchmarks',
      modelId: 'claude-3-5-sonnet',
      modelName: 'Claude 3.5 Sonnet',
      lastMessage: 'Axum vs Actix-web request throughput benchmarks...',
      updatedAt: '2 hours ago',
      isFavorite: false,
      messageCount: 2,
    },
    systemPrompt: 'You are a Rust systems programmer with expertise in Tokio, Axum, and async IO performance.',
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'Compare Axum and Actix-web for high-throughput HTTP APIs in Rust.',
        timestamp: '08:30 AM',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        modelName: 'Claude 3.5 Sonnet',
        content: 'Both Axum and Actix-web offer exceptional performance, but differ in ergonomics and ecosystem alignment. Axum builds on Tower and Hyper, offering seamless integration with Tokio primitives.',
        timestamp: '08:31 AM',
        tokens: 285,
      },
    ],
  },
}

export default function ChatLayout() {
  // --- STATE SEPARATION ---
  // 1. Conversation State
  const [conversationsMap, setConversationsMap] = useState(INITIAL_CONVERSATIONS)
  const [activeConvId, setActiveConvId] = useState<string | null>('conv-1')

  // 2. Model & Generation State
  const [selectedModelId, setSelectedModelId] = useState<string>('gpt-4o')
  const [temperature, setTemperature] = useState<number>(0.7)
  const [maxTokens, setMaxTokens] = useState<number>(4096)
  const [systemPrompt, setSystemPrompt] = useState<string>(
    INITIAL_CONVERSATIONS['conv-1'].systemPrompt
  )

  // 3. UI Responsive Drawers & Loading State
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightContextOpen, setRightContextOpen] = useState(true)
  const [isTyping, setIsTyping] = useState(false)

  const activeConv = activeConvId ? conversationsMap[activeConvId] : null
  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0]

  // Create new conversation thread
  const handleNewChat = useCallback(() => {
    const newId = `conv-${Date.now()}`
    const newConv = {
      summary: {
        id: newId,
        title: 'New AI Conversation',
        modelId: selectedModelId,
        modelName: currentModel.name,
        lastMessage: 'Started new conversation...',
        updatedAt: 'Just now',
        isFavorite: false,
        messageCount: 0,
      },
      systemPrompt: 'You are Arqon AI, a helpful and precise assistant.',
      messages: [],
    }

    setConversationsMap((prev) => ({
      ...prev,
      [newId]: newConv,
    }))
    setActiveConvId(newId)
    setLeftSidebarOpen(false)
  }, [selectedModelId, currentModel.name])

  // Switch Active Conversation
  const handleSelectConversation = (id: string) => {
    setActiveConvId(id)
    const target = conversationsMap[id]
    if (target) {
      setSelectedModelId(target.summary.modelId)
      setSystemPrompt(target.systemPrompt || '')
    }
    setLeftSidebarOpen(false)
  }

  // Toggle Favorite Status
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversationsMap((prev) => {
      const conv = prev[id]
      if (!conv) return prev
      return {
        ...prev,
        [id]: {
          ...conv,
          summary: {
            ...conv.summary,
            isFavorite: !conv.summary.isFavorite,
          },
        },
      }
    })
  }

  // Delete Conversation
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversationsMap((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    if (activeConvId === id) {
      const remainingIds = Object.keys(conversationsMap).filter((k) => k !== id)
      setActiveConvId(remainingIds.length > 0 ? remainingIds[0] : null)
    }
  }

  // Clear current active conversation messages
  const handleClearConversation = () => {
    if (!activeConvId) return
    setConversationsMap((prev) => {
      const conv = prev[activeConvId]
      if (!conv) return prev
      return {
        ...prev,
        [activeConvId]: {
          ...conv,
          summary: {
            ...conv.summary,
            lastMessage: 'Conversation cleared',
            messageCount: 0,
          },
          messages: [],
        },
      }
    })
  }

  // Send New Message & Trigger Mock AI Reply
  const handleSendMessage = (text: string) => {
    let convId = activeConvId
    if (!convId) {
      convId = `conv-${Date.now()}`
      const newConv = {
        summary: {
          id: convId,
          title: text.length > 30 ? text.substring(0, 30) + '...' : text,
          modelId: selectedModelId,
          modelName: currentModel.name,
          lastMessage: text,
          updatedAt: 'Just now',
          isFavorite: false,
          messageCount: 1,
        },
        systemPrompt: 'You are Arqon AI.',
        messages: [],
      }
      setConversationsMap((prev) => ({ ...prev, [convId!]: newConv }))
      setActiveConvId(convId)
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    // Add User Message
    setConversationsMap((prev) => {
      const target = prev[convId!]
      if (!target) return prev
      return {
        ...prev,
        [convId!]: {
          ...target,
          summary: {
            ...target.summary,
            title: target.messages.length === 0 ? (text.length > 30 ? text.slice(0, 30) + '...' : text) : target.summary.title,
            lastMessage: text,
            updatedAt: 'Just now',
            messageCount: target.messages.length + 1,
          },
          messages: [...target.messages, userMsg],
        },
      }
    })

    // Simulate Mock AI Response
    setIsTyping(true)
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        modelName: currentModel.name,
        content: `I received your prompt: "${text}".\n\nHere is a comprehensive breakdown optimized by ${currentModel.name}:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tokens: Math.floor(Math.random() * 300) + 150,
        codeSnippets: text.toLowerCase().includes('code') || text.toLowerCase().includes('react')
          ? [
              {
                language: 'typescript',
                code: `// Sample response generated by ${currentModel.name}\nfunction processRequest(data: unknown) {\n  console.log("Processing with Arqon AI:", data);\n  return { success: true, timestamp: Date.now() };\n}`,
              },
            ]
          : undefined,
      }

      setConversationsMap((prev) => {
        const target = prev[convId!]
        if (!target) return prev
        return {
          ...prev,
          [convId!]: {
            ...target,
            summary: {
              ...target.summary,
              lastMessage: aiMsg.content.slice(0, 60) + '...',
              updatedAt: 'Just now',
              messageCount: target.messages.length + 1,
            },
            messages: [...target.messages, aiMsg],
          },
        }
      })
      setIsTyping(false)
    }, 1200)
  }

  // Regenerate Response Action
  const handleRegenerateResponse = (messageId: string) => {
    if (!activeConvId) return
    setIsTyping(true)
    setTimeout(() => {
      setConversationsMap((prev) => {
        const target = prev[activeConvId]
        if (!target) return prev
        const updatedMessages = target.messages.map((m) => {
          if (m.id === messageId) {
            return {
              ...m,
              content: `[Regenerated Output] Here is an updated perspective using ${currentModel.name}:`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          }
          return m
        })
        return {
          ...prev,
          [activeConvId]: {
            ...target,
            messages: updatedMessages,
          },
        }
      })
      setIsTyping(false)
    }, 1000)
  }

  const conversationSummaries: ConversationSummary[] = Object.values(conversationsMap).map(
    (c) => c.summary
  )

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden relative bg-background">
      {/* 1. Left Sidebar Drawer / Mobile Overlay */}
      {leftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 h-full transition-transform duration-200 ease-in-out ${
          leftSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <ConversationList
          conversations={conversationSummaries}
          activeConversationId={activeConvId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onToggleFavorite={handleToggleFavorite}
          onDeleteConversation={handleDeleteConversation}
        />
      </aside>

      {/* 2. Center Panel (Main Chat Window) */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-background">
        <ChatWindow
          conversationId={activeConvId}
          conversationTitle={activeConv?.summary.title}
          messages={activeConv?.messages || []}
          selectedModelId={selectedModelId}
          onSelectModel={(model) => setSelectedModelId(model.id)}
          onSendMessage={handleSendMessage}
          onRegenerateResponse={handleRegenerateResponse}
          onClearConversation={handleClearConversation}
          isTyping={isTyping}
          userName="Neel"
          onToggleLeftSidebar={() => setLeftSidebarOpen((v) => !v)}
          onToggleRightContext={() => setRightContextOpen((v) => !v)}
        />
      </main>

      {/* 3. Right Sidebar Drawer / Context Panel */}
      {rightContextOpen && (
        <>
          {/* Overlay on tablet/mobile when opening context drawer */}
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setRightContextOpen(false)}
          />

          <aside className="fixed lg:static inset-y-0 right-0 z-40 w-72 lg:w-80 h-full transition-all duration-200">
            <ContextPanel
              currentModel={currentModel}
              temperature={temperature}
              onChangeTemperature={setTemperature}
              maxTokens={maxTokens}
              onChangeMaxTokens={setMaxTokens}
              systemPrompt={systemPrompt}
              onChangeSystemPrompt={setSystemPrompt}
              onClose={() => setRightContextOpen(false)}
              onSelectPinnedPrompt={handleSendMessage}
            />
          </aside>
        </>
      )}
    </div>
  )
}
