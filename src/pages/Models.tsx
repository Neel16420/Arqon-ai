import { useState, useMemo } from "react"

import { useToast } from "../components/toast/ToastContext"

import {
  Filter,
  Plus,
  Layers,
  CheckCircle,
  XCircle,
  Zap,
  Cpu,
} from "lucide-react"

import { motion, AnimatePresence } from "framer-motion"

import { useCountUp } from "../motion/useCountUp"

import { ModelCard } from "../components/ModelCard"

import { EditModelModal, DeleteModelModal } from "../components/ModelModals"

import { EmptyState } from "../components/EmptyState"
import { SearchInput } from "../components/SearchInput"

import { useProviders } from "../store/providers"

import {
  useModels,
  type ModelStatus,
  type ModelFeature,
  type ModelEndpoint,
  type AIModel,
} from "../store/models"

export type { ModelStatus, ModelFeature, ModelEndpoint, AIModel }

export default function Models() {
  const { success } = useToast()

  const [search, setSearch] = useState("")

  const [models, setModels] = useModels()

  const [providers] = useProviders()

  const validModels = models.filter((m) =>
    providers.some((p) => p.type === m.provider && p.enabled),
  )

  // Modals state

  const [editModalOpen, setEditModalOpen] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)

  const filteredModels = useMemo(() => {
    return validModels.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.provider.toLowerCase().includes(search.toLowerCase()),
    )
  }, [validModels, search])

  // Calculate top stats

  const totalModels = validModels.length

  const healthyModels = validModels.filter((m) => m.status === "healthy").length

  const disabledModels = validModels.filter(
    (m) => m.status === "disabled",
  ).length

  const avgLatency = Math.round(
    validModels.reduce((acc, curr) => acc + curr.latency, 0) /
      (totalModels || 1),
  )

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
    const isEnabling = model.status !== "healthy"
    setModels((prev) =>
      prev.map((m) =>
        m.id === model.id
          ? { ...m, status: m.status === "healthy" ? "disabled" : "healthy" }
          : m,
      ),
    )

    success(isEnabling ? "Model Activated" : "Model Deactivated", `${model.name} routing status updated.`)
  }

  const handleSaveModel = (updatedModel: AIModel) => {
    setModels((prev) => {
      const exists = prev.find((m) => m.id === updatedModel.id)

      if (exists) {
        return prev.map((m) => (m.id === updatedModel.id ? updatedModel : m))
      }

      return [...prev, { ...updatedModel, id: `model-${Date.now()}` }]
    })
    success("Model Saved", `Configuration for ${updatedModel.name} has been applied.`)
  }

  const handleConfirmDelete = () => {
    if (selectedModel) {
      setModels((prev) => prev.filter((m) => m.id !== selectedModel.id))
      success("Model Removed", `${selectedModel.name} has been removed from routing chains.`)
    }
  }

  const handleOpenAdd = () => {
    const emptyModel: AIModel = {
      id: "",

      provider: "openai",

      name: "",

      version: "1.0",

      contextWindow: 8192,

      inputCost: 0,

      outputCost: 0,

      latency: 0,

      successRate: 100,

      routingWeight: 1.0,

      status: "healthy",

      description: "New custom model.",

      features: [
        { id: "vision", name: "Vision", supported: false },

        { id: "tools", name: "Function Calling", supported: false },

        { id: "streaming", name: "Streaming", supported: true },
      ],

      endpoints: [{ path: "/v1/completions", method: "POST" }],

      regions: ["global"],
    }

    setSelectedModel(emptyModel)

    setEditModalOpen(true)
  }

  if (validModels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full animate-fade-in-up">
        <EmptyState
          icon={<Layers className="w-7 h-7" />}
          title="No Models"
          subtitle="No models available yet."
          actionLabel="Create Model"
          onAction={handleOpenAdd}
        />
        <EditModelModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          model={selectedModel}
          onSave={handleSaveModel}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-fade-in">
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-12 space-y-8 custom-scrollbar">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-foreground font-space">
              Models
            </h1>
            <p className="text-sm text-muted mt-1 max-w-xl leading-relaxed">
              Manage every AI model available inside your routing engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-auto">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search models..."
              />
            </div>

            <button className="hover-lift h-9 px-3.5 flex items-center gap-2 bg-surface border border-border rounded-xl text-xs font-medium text-muted hover:text-foreground transition-all">
              <Filter size={14} />
              <span>Filters</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="hover-lift h-9 px-4 flex items-center gap-2 bg-accent hover:bg-accent text-white rounded-xl text-xs font-semibold transition-all shadow-[0_4px_16px_rgba(255,59,59,0.3)]"
            >
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

          <div className="relative p-5 rounded-xl border border-border/40 bg-surface/30 backdrop-blur-md overflow-hidden group hover:border-border transition-colors h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Available Models
              </span>
              <Layers
                size={14}
                className="text-muted group-hover:text-foreground transition-colors"
              />
            </div>
            <div className="text-2xl font-semibold text-foreground font-space">
              {totalCount}
            </div>
          </div>

          {/* Card 2 */}

          <div className="relative p-5 rounded-xl border border-border/40 bg-surface/30 backdrop-blur-md overflow-hidden group hover:border-border transition-colors h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Healthy
              </span>
              <CheckCircle size={14} className="text-success" />
            </div>
            <div className="text-2xl font-semibold text-foreground font-space">
              {healthyCount}
            </div>
          </div>

          {/* Card 3 */}

          <div className="relative p-5 rounded-xl border border-border/40 bg-surface/30 backdrop-blur-md overflow-hidden group hover:border-border transition-colors h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Disabled
              </span>
              <XCircle
                size={14}
                className="text-muted group-hover:text-foreground transition-colors"
              />
            </div>
            <div className="text-2xl font-semibold text-foreground font-space">
              {disabledCount}
            </div>
          </div>

          {/* Card 4 */}

          <div className="relative p-5 rounded-xl border border-border/40 bg-surface/30 backdrop-blur-md overflow-hidden group hover:border-border transition-colors h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Avg Latency
              </span>
              <Zap size={14} className="text-accent" />
            </div>
            <div className="text-2xl font-semibold text-foreground font-space">
              {latencyCount}
              <span className="text-sm text-muted font-normal ml-1">ms</span>
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
              {filteredModels.map((model) => (
                <ModelCard
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
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No models found
            </h3>
            <p className="text-muted text-sm max-w-sm mb-6">
              We couldn't find any models matching your search. Try adjusting
              your filters or add a new model.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-accent/20"
            >
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
