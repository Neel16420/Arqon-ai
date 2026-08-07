import { useState } from 'react'
import {
  Bookmark,
  Plus,
  Search,
  Star,
  Copy,
  Check,
  Download,
  X,
  Trash2,
} from 'lucide-react'

import { SavedPrompt } from '../../types'

const INITIAL_PROMPTS: SavedPrompt[] = [
  {
    id: 'pr-1',
    title: 'Senior TypeScript Architect Review',
    category: 'Engineering',
    tags: ['TypeScript', 'Code Quality', 'Architecture'],
    content: 'Act as a Senior Principal TypeScript Engineer. Review the provided code for strict type safety, zero `any` usage, memory efficiency, and idiomatic design patterns.',
    isFavorite: true,
    usageCount: 142,
  },
  {
    id: 'pr-2',
    title: 'React Micro-animations & Motion',
    category: 'Design System',
    tags: ['React', 'CSS', 'Framer Motion'],
    content: 'Generate micro-animations CSS utility classes following high performance GPU hardware acceleration (will-change, transform: translate3d).',
    isFavorite: true,
    usageCount: 89,
  },
  {
    id: 'pr-3',
    title: 'Executive SaaS Pitch Deck Summary',
    category: 'Business',
    tags: ['Strategy', 'Startup', 'Pitch'],
    content: 'Summarize the executive pitch deck into 5 core pillars: Problem, Solution, Total Addressable Market (TAM), Financial Unit Economics, and 12-month Roadmap.',
    isFavorite: false,
    usageCount: 54,
  },
  {
    id: 'pr-4',
    title: 'JSON Schema Validation Generator',
    category: 'Data',
    tags: ['JSON', 'Validation', 'Zod'],
    content: 'Construct a Zod validation schema matching the input interface, enforcing strict string bounds, email regex, and customized error messages.',
    isFavorite: false,
    usageCount: 67,
  },
]

export default function PromptLibrary() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>(INITIAL_PROMPTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Editor Form State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Engineering')
  const [tagsInput, setTagsInput] = useState('')
  const [content, setContent] = useState('')

  const categories = ['All', 'Favorites', 'Engineering', 'Design System', 'Business', 'Data']

  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    if (selectedCategory === 'Favorites') return matchesSearch && p.isFavorite
    if (selectedCategory !== 'All') return matchesSearch && p.category === selectedCategory
    return matchesSearch
  })

  const toggleFavorite = (id: string) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    )
  }

  const handleCopyPrompt = (p: SavedPrompt) => {
    navigator.clipboard.writeText(p.content)
    setCopiedId(p.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeletePrompt = (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleSavePrompt = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    const newPrompt: SavedPrompt = {
      id: `pr-${Date.now()}`,
      title,
      category,
      tags: tagsInput ? tagsInput.split(',').map((t) => t.trim()) : [category],
      content,
      isFavorite: false,
      usageCount: 0,
    }
    setPrompts((prev) => [newPrompt, ...prev])
    setTitle('')
    setContent('')
    setTagsInput('')
    setShowModal(false)
  }

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(prompts, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'arqon-saved-prompts.json'
    a.click()
  }

  return (
    <div className="space-y-6 pb-12 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Bookmark className="text-amber-400" size={24} />
            Prompt Library
          </h1>
          <p className="text-xs text-muted mt-1">
            Create, categorize, and reuse system instructions & structured prompt templates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface-2 hover:bg-surface border border-border text-foreground transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            Export JSON
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl font-semibold text-xs text-white shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
              boxShadow: '0 4px 14px rgba(255, 59, 59, 0.35)',
            }}
          >
            <Plus size={16} />
            New Saved Prompt
          </button>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="glass-surface glass-border rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-accent text-white shadow'
                  : 'bg-surface-2/60 text-muted hover:text-foreground hover:bg-surface-2'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompt titles or tags..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
          />
        </div>
      </div>

      {/* Prompt Cards Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="glass-surface glass-border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <Bookmark size={36} className="text-muted/60" />
          <h3 className="text-base font-bold text-foreground">No Prompts Found</h3>
          <p className="text-xs text-muted max-w-sm">
            {searchQuery
              ? `No saved prompt matching "${searchQuery}".`
              : 'Your prompt library is empty. Click "New Saved Prompt" to create your first template.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="group p-5 rounded-2xl glass-surface glass-border card-hover flex flex-col justify-between transition-all"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider">
                    {prompt.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(prompt.id)}
                      className="p-1 rounded text-muted hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <Star
                        size={15}
                        className={prompt.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
                      />
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="p-1 rounded text-muted hover:text-accent transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3
                  className="text-base font-bold text-foreground group-hover:text-accent transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {prompt.title}
                </h3>

                {/* Content Code Preview */}
                <div className="my-3 p-3 rounded-xl bg-black/60 border border-border/60 text-xs font-mono text-emerald-300 leading-relaxed max-h-28 overflow-y-auto">
                  "{prompt.content}"
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {prompt.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-border text-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between">
                <span className="text-[11px] text-muted font-mono">
                  Used {prompt.usageCount} times
                </span>

                <button
                  onClick={() => handleCopyPrompt(prompt)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground bg-surface-2 hover:bg-accent hover:text-white border border-border hover:border-accent transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {copiedId === prompt.id ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PROMPT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
          <div className="w-full max-w-lg rounded-2xl glass-elevated glass-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3
                className="text-base font-bold text-foreground flex items-center gap-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Bookmark className="text-amber-400" size={18} />
                Add Saved Prompt
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePrompt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Prompt Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next.js App Router Master System Instruction"
                  className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground outline-none focus:border-accent/50"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design System">Design System</option>
                    <option value="Business">Business</option>
                    <option value="Data">Data</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="React, Architecture"
                    className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  System Instruction / Prompt Content
                </label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter detailed prompt instructions..."
                  className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 leading-relaxed font-mono resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  Save Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
