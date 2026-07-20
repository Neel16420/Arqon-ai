import { useState, useMemo } from 'react'
import { Search, Filter, Plus, Layers, CheckCircle, XCircle, Zap, Cpu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCountUp } from '../motion/useCountUp'
import { ModelCard } from '../components/ModelCard'
import { EditModelModal, DeleteModelModal } from '../components/ModelModals'

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
const INITIAL_MODELS: AIModel[] = [
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
  const [models, setModels] = useState<AIModel[]>(INITIAL_MODELS)
  
  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)

  // Derived state
  const filteredModels = useMemo(() => {
    return models.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.provider.toLowerCase().includes(search.toLowerCase())
    )
  }, [models, search])

  // Calculate top stats
  const totalModels = models.length
  const healthyModels = models.filter(m => m.status === 'healthy').length
  const disabledModels = models.filter(m => m.status === 'disabled').length
  const avgLatency = Math.round(models.reduce((acc, curr) => acc + curr.latency, 0) / (totalModels || 1))

  const totalCount = useCountUp(totalModels)
  const healthyCount = useCountUp(healthyModels)
  const disabledCount = useCountUp(disabledModels)
  const latencyCount = useCountUp(avgLatency)

  // Actions
  const handleEdit = (model: AIModel) => {
    setSelectedModel(model)
    setEditModalOpen(true)
  }

  const handleDeleteClick = (model: AIModel) => {
    setSelectedModel(model)
    setDeleteModalOpen(true)
  }

  const handleToggleStatus = (model: AIModel) => {
    setModels(prev => prev.map(m => 
      m.id === model.id 
        ? { ...m, status: m.status === 'healthy' ? 'disabled' : 'healthy' }
        : m
    ))
  }

  const handleSaveModel = (updatedModel: AIModel) => {
    setModels(prev => {
      const exists = prev.find(m => m.id === updatedModel.id)
      if (exists) {
        return prev.map(m => m.id === updatedModel.id ? updatedModel : m)
      }
      return [...prev, { ...updatedModel, id: `model-${Date.now()}` }]
    })
  }

  const handleConfirmDelete = () => {
    if (selectedModel) {
      setModels(prev => prev.filter(m => m.id !== selectedModel.id))
    }
  }

  const handleOpenAdd = () => {
    const emptyModel: AIModel = {
      id: '',
      provider: 'openai',
      name: '',
      version: '1.0',
      contextWindow: 8192,
      inputCost: 0,
      outputCost: 0,
      latency: 0,
      successRate: 100,
      routingWeight: 1.0,
      status: 'healthy',
      description: 'New custom model.',
      features: [
        { id: 'vision', name: 'Vision', supported: false },
        { id: 'tools', name: 'Function Calling', supported: false },
        { id: 'streaming', name: 'Streaming', supported: true },
      ],
      endpoints: [{ path: '/v1/completions', method: 'POST' }],
      regions: ['global']
    }
    setSelectedModel(emptyModel)
    setEditModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full bg-background pb-20">
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-12 space-y-8 custom-scrollbar">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
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
            
            <button onClick={handleOpenAdd} className="h-9 px-4 flex items-center gap-2 bg-accent/90 hover:bg-accent text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(255,59,59,0.3)] hover:shadow-[0_0_20px_rgba(255,59,59,0.5)]">
              <Plus size={14} />
              <span>Add Model</span>
            </button>
          </div>
        </motion.div>

        {/* Top Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
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
        </motion.div>

        {/* Main Grid */}
        {filteredModels.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredModels.map(model => (
                <ModelCard 
                  key={model.id}
                  model={model}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-6">
              <Cpu size={28} className="text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No models found</h3>
            <p className="text-muted text-sm max-w-sm mb-6">
              We couldn't find any models matching your search. Try adjusting your filters or add a new model.
            </p>
            <button onClick={handleOpenAdd} className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-accent/20">
              Add your first AI model
            </button>
          </motion.div>
        )}

      </div>

      <EditModelModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        model={selectedModel}
        onSave={handleSaveModel}
      />
      
      <DeleteModelModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        model={selectedModel}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
