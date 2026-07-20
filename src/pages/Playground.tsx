import { useState, useEffect } from 'react'
import { History, Terminal } from 'lucide-react'
import { AnalyticsSkeleton } from '../components/Skeleton'

import { ProviderSidebar } from '../components/playground/ProviderSidebar'
import { PromptEditor } from '../components/playground/PromptEditor'
import { ResponsePanel } from '../components/playground/ResponsePanel'
import { PlaygroundStats } from '../components/playground/PlaygroundStats'
import { PlaygroundHistory } from '../components/playground/PlaygroundHistory'

export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'azure' | 'mistral' | 'groq' | 'deepseek' | 'openrouter'

export default function Playground() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider>('openai')
  const [selectedModel, setSelectedModel] = useState('GPT-4o')
  
  const [promptText, setPromptText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [responseContent, setResponseContent] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  
  // Generation triggers
  const handleGenerate = () => {
    if (!promptText.trim()) return
    setIsGenerating(true)
    setResponseContent('')
    // We'll simulate streaming directly in ResponsePanel or here
  }

  const handleStop = () => {
    setIsGenerating(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <AnalyticsSkeleton />
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden animate-page-enter relative">
      {/* Premium subtle background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="h-14 border-b border-border/40 bg-surface/30 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center border border-accent/20">
            <Terminal size={14} className="text-accent" />
          </div>
          <h1 className="text-sm font-semibold text-foreground font-space">Playground</h1>
        </div>
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface border border-border/60 hover:border-accent/40 text-xs text-muted hover:text-foreground transition-all"
        >
          <History size={12} />
          History
        </button>
      </div>

      {/* Main 2-Panel Workspace */}
      <div className="flex-1 flex overflow-hidden relative z-0">
        
        {/* Left Panel: Provider & Model Selection (hidden on mobile/tablet) */}
        <div className="hidden lg:flex w-[280px] shrink-0 border-r border-border/40 overflow-y-auto custom-scrollbar flex-col h-full bg-surface-2/20">
          <ProviderSidebar 
            selectedProvider={selectedProvider} 
            setSelectedProvider={setSelectedProvider}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>

        {/* Center Workspace: Prompt & Response (scrollable) */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-surface/10 relative scroll-smooth">
          <div className="max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-full">
            
            {/* Mobile/Tablet Provider Sidebar (rendered inline for single column) */}
            <div className="lg:hidden flex flex-col w-full bg-surface-2/10 rounded-xl border border-border/40 overflow-hidden shrink-0 h-[400px] overflow-y-auto custom-scrollbar">
              <ProviderSidebar 
                selectedProvider={selectedProvider} 
                setSelectedProvider={setSelectedProvider}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
              />
            </div>

            {/* Prompt Editor */}
            <PromptEditor 
              promptText={promptText}
              setPromptText={setPromptText}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />

            {/* Response Output (only renders when there is content or generating) */}
            <ResponsePanel 
              content={responseContent}
              setContent={setResponseContent}
              isGenerating={isGenerating}
              onStop={handleStop}
            />
            
            {/* Extra padding at the bottom so users can scroll past the response easily */}
            <div className="h-12 shrink-0"></div>
          </div>
        </div>

      </div>

      {/* Bottom Panel: Live Stats */}
      <div className="shrink-0 h-[80px] border-t border-border/40 bg-surface/50 backdrop-blur-xl px-6 flex items-center justify-between z-10 relative">
        <PlaygroundStats 
          isGenerating={isGenerating} 
          provider={selectedProvider} 
        />
      </div>

      {/* Slide-out History Drawer */}
      <PlaygroundHistory 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        onSelect={(historicalPrompt) => setPromptText(historicalPrompt)}
      />
    </div>
  )
}
