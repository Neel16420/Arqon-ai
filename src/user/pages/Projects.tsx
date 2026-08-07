import { useState } from 'react'
import {
  FolderGit2,
  Plus,
  Search,
  Grid,
  List,
  Star,
  Archive,
  X,
} from 'lucide-react'

import { ProjectItem } from '../../types'

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    name: 'Arqon AI Assistant UI',
    description: 'Enterprise grade design system, React components, Tailwind v4 styling, and motion system.',
    model: 'GPT-4o',
    updatedAt: '12 minutes ago',
    isFavorite: true,
    isArchived: false,
    tag: 'Frontend',
    filesCount: 42,
    chatsCount: 18,
  },
  {
    id: 'proj-2',
    name: 'Multi-Model Routing Engine',
    description: 'Low-latency Rust proxy microservice distributing requests across Anthropic, OpenAI, and Gemini.',
    model: 'Claude 3.5 Sonnet',
    updatedAt: '2 hours ago',
    isFavorite: true,
    isArchived: false,
    tag: 'Backend',
    filesCount: 19,
    chatsCount: 9,
  },
  {
    id: 'proj-3',
    name: 'Autonomous RAG Pipeline',
    description: 'Vector database retrieval with Pinecone and prefix caching for 1M context document Q&A.',
    model: 'Gemini 1.5 Pro',
    updatedAt: 'Yesterday',
    isFavorite: false,
    isArchived: false,
    tag: 'AI / ML',
    filesCount: 31,
    chatsCount: 14,
  },
  {
    id: 'proj-4',
    name: 'Legacy Admin Migration',
    description: 'Archived refactoring project for migrating legacy REST endpoints to tRPC server actions.',
    model: 'DeepSeek R1',
    updatedAt: '3 days ago',
    isFavorite: false,
    isArchived: true,
    tag: 'Archive',
    filesCount: 8,
    chatsCount: 4,
  },
]

export default function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterTab, setFilterTab] = useState<'all' | 'favorites' | 'archived'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // New Project Form State
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newTag, setNewTag] = useState('Frontend')

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    if (filterTab === 'favorites') return matchesSearch && p.isFavorite && !p.isArchived
    if (filterTab === 'archived') return matchesSearch && p.isArchived
    return matchesSearch && !p.isArchived
  })

  const toggleFavorite = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    )
  }

  const toggleArchive = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isArchived: !p.isArchived } : p))
    )
  }

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: newName,
      description: newDesc || 'No description provided.',
      model: 'GPT-4o',
      updatedAt: 'Just now',
      isFavorite: false,
      isArchived: false,
      tag: newTag,
      filesCount: 0,
      chatsCount: 0,
    }
    setProjects((prev) => [newProj, ...prev])
    setNewName('')
    setNewDesc('')
    setShowCreateModal(false)
  }

  return (
    <div className="space-y-6 pb-12 animate-page-enter">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <FolderGit2 className="text-accent" size={24} />
            Projects Workspace
          </h1>
          <p className="text-xs text-muted mt-1">
            Organize AI chat threads, prompt templates, and code assets into unified projects.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
            boxShadow: '0 4px 14px rgba(255, 59, 59, 0.35)',
          }}
        >
          <Plus size={16} />
          Create New Project
        </button>
      </div>

      {/* Controls Bar: Tabs, Search, View Toggle */}
      <div className="glass-surface glass-border rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border w-full md:w-auto">
          {(['all', 'favorites', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                filterTab === tab
                  ? 'bg-accent text-white shadow'
                  : 'text-muted hover:text-foreground hover:bg-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Grid/List View */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-surface text-accent font-bold' : 'text-muted hover:text-foreground'
              }`}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-surface text-accent font-bold' : 'text-muted hover:text-foreground'
              }`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display Area */}
      {filteredProjects.length === 0 ? (
        <div className="glass-surface glass-border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <FolderGit2 size={36} className="text-muted/60" />
          <h3 className="text-base font-bold text-foreground">No Projects Found</h3>
          <p className="text-xs text-muted max-w-sm">
            {searchQuery
              ? `No project matches search criteria "${searchQuery}".`
              : 'You have no projects in this view. Click "Create New Project" to organize your AI assets.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group p-5 rounded-2xl glass-surface glass-border card-hover flex flex-col justify-between transition-all relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent uppercase tracking-wider">
                    {project.tag}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(project.id)}
                      className="p-1 rounded text-muted hover:text-amber-400 transition-colors cursor-pointer"
                      title={project.isFavorite ? 'Unfavorite' : 'Favorite'}
                    >
                      <Star
                        size={15}
                        className={project.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
                      />
                    </button>
                    <button
                      onClick={() => toggleArchive(project.id)}
                      className="p-1 rounded text-muted hover:text-accent transition-colors cursor-pointer"
                      title={project.isArchived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive size={15} />
                    </button>
                  </div>
                </div>

                <h3
                  className="text-base font-bold text-foreground group-hover:text-accent transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {project.name}
                </h3>

                <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span>{project.filesCount} Files</span>
                  <span>•</span>
                  <span>{project.chatsCount} Chats</span>
                </div>

                <span className="text-[10px] font-mono">{project.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-xl glass-surface glass-border card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0 text-accent">
                  <FolderGit2 size={20} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground truncate">{project.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-border text-muted">
                      {project.tag}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">{project.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40 text-xs text-muted">
                <div className="font-mono text-[11px] space-x-3">
                  <span>{project.filesCount} files</span>
                  <span>{project.chatsCount} chats</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(project.id)}
                    className="p-1 rounded text-muted hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <Star
                      size={15}
                      className={project.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
                    />
                  </button>
                  <button
                    onClick={() => toggleArchive(project.id)}
                    className="p-1 rounded text-muted hover:text-accent transition-colors cursor-pointer"
                  >
                    <Archive size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
          <div className="w-full max-w-md rounded-2xl glass-elevated glass-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3
                className="text-base font-bold text-foreground flex items-center gap-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <FolderGit2 className="text-accent" size={18} />
                Create New Project
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Next.js SaaS Boilerplate"
                  className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Tag / Category
                </label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground outline-none focus:border-accent/50"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="AI / ML">AI / ML</option>
                  <option value="Full-Stack">Full-Stack</option>
                  <option value="Design System">Design System</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Briefly describe the scope of this project..."
                  className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-2 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md cursor-pointer transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
                  }}
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
