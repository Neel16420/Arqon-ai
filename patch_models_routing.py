import pathlib

# 1. Update Sidebar.tsx
sidebar_path = pathlib.Path('src/components/Sidebar.tsx')
sidebar_content = sidebar_path.read_text(encoding='utf-8')

# Move { id: 'models', label: 'Models', icon: <Layers size={18} />, p1: true }, from p1Items to navItems
nav_items_target = """const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'requests', label: 'Requests', icon: <Activity size={18} /> },"""
nav_items_replacement = """const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'requests', label: 'Requests', icon: <Activity size={18} /> },
  { id: 'models', label: 'Models', icon: <Layers size={18} /> },"""

sidebar_content = sidebar_content.replace(nav_items_target, nav_items_replacement)

p1_items_target = """const p1Items: NavItem[] = [
  { id: 'models', label: 'Models', icon: <Layers size={18} />, p1: true },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} />, p1: true },"""
p1_items_replacement = """const p1Items: NavItem[] = [
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} />, p1: true },"""

sidebar_content = sidebar_content.replace(p1_items_target, p1_items_replacement)
sidebar_path.write_text(sidebar_content, encoding='utf-8')

# 2. Update App.tsx
app_path = pathlib.Path('src/App.tsx')
app_content = app_path.read_text(encoding='utf-8')

# Ensure we import Models
if "import Models" not in app_content:
    app_content = app_content.replace(
        "import Requests from './pages/Requests'",
        "import Requests from './pages/Requests'\nimport Models from './pages/Models'"
    )
    
    # Inject it into PageTransition
    app_content = app_content.replace(
        "{activePage === 'requests' && <Requests />}",
        "{activePage === 'requests' && <Requests />}\n        {activePage === 'models' && <Models />}"
    )

app_path.write_text(app_content, encoding='utf-8')

# 3. Create boilerplate for Models.tsx
models_path = pathlib.Path('src/pages/Models.tsx')
models_content = """import { useState, useMemo } from 'react'
import { Search, Filter, RefreshCw, Plus, LayoutGrid, List, Activity, Settings2, Trash2, Edit2, Play, Power, MoreVertical, X, Sparkles, Zap, BrainCircuit, Box, Workflow, Layers, CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCountUp } from '../motion/useCountUp'
import { ProviderIcon } from '../components/icons/ProviderLogos'

// Basic Types
export type ModelStatus = 'healthy' | 'disabled' | 'beta' | 'experimental'

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
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'groq' | 'deepseek' | 'mistral' | 'openrouter'
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

// Mock Data
const MOCK_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    version: '2024-05-13',
    contextWindow: 128000,
    inputCost: 5.0,
    outputCost: 15.0,
    latency: 280,
    successRate: 99.8,
    routingWeight: 1.0,
    status: 'healthy',
    description: 'Our high-capability flagship model for text, vision, and audio.',
    features: [
      { id: 'vision', name: 'Vision', supported: true },
      { id: 'tools', name: 'Function Calling', supported: true },
      { id: 'reasoning', name: 'Reasoning', supported: false },
      { id: 'streaming', name: 'Streaming', supported: true },
      { id: 'json', name: 'JSON Mode', supported: true }
    ],
    endpoints: [{ path: '/v1/chat/completions', method: 'POST' }],
    regions: ['us-east', 'us-west', 'eu-west']
  },
  {
    id: 'claude-3-opus',
    provider: 'anthropic',
    name: 'Claude 3 Opus',
    version: '20240229',
    contextWindow: 200000,
    inputCost: 15.0,
    outputCost: 75.0,
    latency: 550,
    successRate: 99.5,
    routingWeight: 0.8,
    status: 'healthy',
    description: 'Powerful model for highly complex tasks.',
    features: [
      { id: 'vision', name: 'Vision', supported: true },
      { id: 'tools', name: 'Function Calling', supported: true },
      { id: 'reasoning', name: 'Reasoning', supported: true },
      { id: 'streaming', name: 'Streaming', supported: true },
      { id: 'json', name: 'JSON Mode', supported: false }
    ],
    endpoints: [{ path: '/v1/messages', method: 'POST' }],
    regions: ['us-east']
  },
  {
    id: 'gemini-1.5-pro',
    provider: 'google',
    name: 'Gemini 1.5 Pro',
    version: '001',
    contextWindow: 1000000,
    inputCost: 7.0,
    outputCost: 21.0,
    latency: 320,
    successRate: 99.2,
    routingWeight: 1.0,
    status: 'healthy',
    description: 'Advanced reasoning with a massive context window.',
    features: [
      { id: 'vision', name: 'Vision', supported: true },
      { id: 'tools', name: 'Function Calling', supported: true },
      { id: 'reasoning', name: 'Reasoning', supported: true },
      { id: 'streaming', name: 'Streaming', supported: true },
      { id: 'json', name: 'JSON Mode', supported: true }
    ],
    endpoints: [{ path: '/v1beta/models/gemini-1.5-pro:generateContent', method: 'POST' }],
    regions: ['global']
  },
  {
    id: 'deepseek-r1',
    provider: 'deepseek',
    name: 'DeepSeek R1',
    version: 'v2',
    contextWindow: 128000,
    inputCost: 0.5,
    outputCost: 1.2,
    latency: 180,
    successRate: 98.5,
    routingWeight: 0.5,
    status: 'experimental',
    description: 'High-performance open weights model.',
    features: [
      { id: 'vision', name: 'Vision', supported: false },
      { id: 'tools', name: 'Function Calling', supported: true },
      { id: 'reasoning', name: 'Reasoning', supported: true },
      { id: 'streaming', name: 'Streaming', supported: true },
      { id: 'json', name: 'JSON Mode', supported: true }
    ],
    endpoints: [{ path: '/v1/chat/completions', method: 'POST' }],
    regions: ['us-east']
  },
  {
    id: 'mistral-large',
    provider: 'mistral',
    name: 'Mistral Large',
    version: 'latest',
    contextWindow: 32000,
    inputCost: 4.0,
    outputCost: 12.0,
    latency: 300,
    successRate: 99.0,
    routingWeight: 0.7,
    status: 'disabled',
    description: 'Top-tier reasoning model for multi-lingual tasks.',
    features: [
      { id: 'vision', name: 'Vision', supported: false },
      { id: 'tools', name: 'Function Calling', supported: true },
      { id: 'reasoning', name: 'Reasoning', supported: true },
      { id: 'streaming', name: 'Streaming', supported: true },
      { id: 'json', name: 'JSON Mode', supported: true }
    ],
    endpoints: [{ path: '/v1/chat/completions', method: 'POST' }],
    regions: ['eu-west', 'us-east']
  }
]

export default function Models() {
  const [search, setSearch] = useState('')
  
  // Calculate top stats
  const totalModels = MOCK_MODELS.length
  const healthyModels = MOCK_MODELS.filter(m => m.status === 'healthy').length
  const disabledModels = MOCK_MODELS.filter(m => m.status === 'disabled').length
  const avgLatency = Math.round(MOCK_MODELS.reduce((acc, curr) => acc + curr.latency, 0) / (totalModels || 1))

  const totalCount = useCountUp(totalModels)
  const healthyCount = useCountUp(healthyModels)
  const disabledCount = useCountUp(disabledModels)
  const latencyCount = useCountUp(avgLatency)

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in pb-20">
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-12 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-foreground font-space">Models</h1>
            <p className="text-sm text-muted mt-1 max-w-xl leading-relaxed">
              Manage every AI model available inside your routing engine.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              <input
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-60 pl-9 pr-4 bg-surface/50 border border-border/40 rounded-lg text-sm text-foreground placeholder-muted/60 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all hover:bg-surface"
              />
            </div>
            
            <button className="h-9 px-3 flex items-center gap-2 bg-surface/50 border border-border/40 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface hover:border-border transition-all">
              <Filter size={14} />
              <span>Filters</span>
            </button>
            
            <button className="h-9 px-4 flex items-center gap-2 bg-accent/90 hover:bg-accent text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(255,59,59,0.3)] hover:shadow-[0_0_20px_rgba(255,59,59,0.5)]">
              <Plus size={14} />
              <span>Add Model</span>
            </button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Card 1 */}
           <div className="relative p-5 rounded-xl border border-border/40 bg-surface/30 backdrop-blur-md overflow-hidden group hover:border-border transition-colors">
             <div className="flex justify-between items-start mb-2">
               <span className="text-xs font-medium text-muted uppercase tracking-wider">Available Models</span>
               <Layers size={14} className="text-muted group-hover:text-foreground transition-colors" />
             </div>
             <div className="text-2xl font-semibold text-foreground font-space">
               {totalCount}
             </div>
           </div>

           {/* Card 2 */}
           <div className="relative p-5 rounded-xl border border-border/40 bg-surface/30 backdrop-blur-md overflow-hidden group hover:border-border transition-colors">
             <div className="flex justify-between items-start mb-2">
               <span className="text-xs font-medium text-muted uppercase tracking-wider">Healthy</span>
               <CheckCircle size={14} className="text-success" />
             </div>
             <div className="text-2xl font-semibold text-foreground font-space">
               {healthyCount}
             </div>
           </div>

           {/* Card 3 */}
           <div className="relative p-5 rounded-xl border border-border/40 bg-surface/30 backdrop-blur-md overflow-hidden group hover:border-border transition-colors">
             <div className="flex justify-between items-start mb-2">
               <span className="text-xs font-medium text-muted uppercase tracking-wider">Disabled</span>
               <XCircle size={14} className="text-muted group-hover:text-foreground transition-colors" />
             </div>
             <div className="text-2xl font-semibold text-foreground font-space">
               {disabledCount}
             </div>
           </div>

           {/* Card 4 */}
           <div className="relative p-5 rounded-xl border border-border/40 bg-surface/30 backdrop-blur-md overflow-hidden group hover:border-border transition-colors">
             <div className="flex justify-between items-start mb-2">
               <span className="text-xs font-medium text-muted uppercase tracking-wider">Avg Latency</span>
               <Zap size={14} className="text-accent" />
             </div>
             <div className="text-2xl font-semibold text-foreground font-space">
               {latencyCount}<span className="text-sm text-muted font-normal ml-1">ms</span>
             </div>
           </div>
        </div>

        {/* Main Grid Placeholder */}
        <div className="p-12 text-center text-muted">
           Building Grid...
        </div>

      </div>
    </div>
  )
}
"""
models_path.write_text(models_content, encoding='utf-8')
print("Patched routing and created Models.tsx boilerplate.")
