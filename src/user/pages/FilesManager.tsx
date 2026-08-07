import { useState } from 'react'
import {
  FileText,
  UploadCloud,
  Search,
  Folder,
  FileCode,
  FileSpreadsheet,
  FileImage,
  Trash2,
  Eye,
  X,
} from 'lucide-react'

import { UserFile } from '../../types'

const INITIAL_FILES: UserFile[] = [
  { id: 'f-1', name: 'system_instructions.json', size: '24.5 KB', type: 'code', folder: 'Prompts', uploadedAt: '10 mins ago' },
  { id: 'f-2', name: 'architecture_diagram.png', size: '1.8 MB', type: 'image', folder: 'Design', uploadedAt: '1 hour ago' },
  { id: 'f-3', name: 'q3_benchmark_results.csv', size: '342 KB', type: 'data', folder: 'Analytics', uploadedAt: 'Yesterday' },
  { id: 'f-4', name: 'user_privacy_policy.pdf', size: '890 KB', type: 'document', folder: 'Legal', uploadedAt: '3 days ago' },
]

export default function FilesManager() {
  const [files, setFiles] = useState<UserFile[]>(INITIAL_FILES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string>('All')
  const [dragActive, setDragActive] = useState(false)
  const [previewFile, setPreviewFile] = useState<UserFile | null>(null)

  const folders = ['All', 'Prompts', 'Design', 'Analytics', 'Legal']

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (selectedFolder !== 'All') return matchesSearch && f.folder === selectedFolder
    return matchesSearch
  })

  const getFileIcon = (type: UserFile['type']) => {
    switch (type) {
      case 'code':
        return <FileCode size={20} className="text-accent" />
      case 'image':
        return <FileImage size={20} className="text-purple-400" />
      case 'data':
        return <FileSpreadsheet size={20} className="text-emerald-400" />
      case 'document':
        return <FileText size={20} className="text-blue-400" />
    }
  }

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSimulatedUpload = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const newF: UserFile = {
      id: `f-${Date.now()}`,
      name: fileList[0].name,
      size: `${(fileList[0].size / 1024).toFixed(1)} KB`,
      type: fileList[0].name.endsWith('.png') || fileList[0].name.endsWith('.jpg') ? 'image' : 'document',
      folder: selectedFolder === 'All' ? 'Prompts' : selectedFolder,
      uploadedAt: 'Just now',
    }
    setFiles((prev) => [newF, ...prev])
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
            <FileText className="text-blue-400" size={24} />
            Files & Documents Workspace
          </h1>
          <p className="text-xs text-muted mt-1">
            Upload, index, and reference document assets for AI context retrieval.
          </p>
        </div>

        <label className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shrink-0 bg-accent hover:brightness-110">
          <UploadCloud size={16} />
          Upload Document
          <input
            type="file"
            className="hidden"
            onChange={(e) => handleSimulatedUpload(e.target.files)}
          />
        </label>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          handleSimulatedUpload(e.dataTransfer.files)
        }}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-2 ${
          dragActive
            ? 'border-accent bg-accent/10 scale-[1.01]'
            : 'border-border glass-surface hover:border-accent/40'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center text-accent">
          <UploadCloud size={24} />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          Drag & Drop PDF, Code, Images, or CSV files here
        </h3>
        <p className="text-xs text-muted max-w-sm">
          Files uploaded here are automatically indexed for RAG context in your AI workspace.
        </p>
      </div>

      {/* Folder Nav & Search */}
      <div className="glass-surface glass-border rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Folders */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                selectedFolder === folder
                  ? 'bg-accent text-white shadow'
                  : 'bg-surface-2/60 text-muted hover:text-foreground hover:bg-surface-2'
              }`}
            >
              <Folder size={13} />
              {folder}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search filenames..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
          />
        </div>
      </div>

      {/* File List Table */}
      {filteredFiles.length === 0 ? (
        <div className="glass-surface glass-border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <FileText size={36} className="text-muted/60" />
          <h3 className="text-base font-bold text-foreground">No Files Found</h3>
          <p className="text-xs text-muted max-w-sm">
            {searchQuery
              ? `No document matching "${searchQuery}".`
              : 'This folder is empty. Drag & drop files above to populate.'}
          </p>
        </div>
      ) : (
        <div className="glass-surface glass-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2/70 border-b border-border text-muted font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3.5 pl-5">Document Name</th>
                  <th className="p-3.5">Folder</th>
                  <th className="p-3.5">Size</th>
                  <th className="p-3.5">Uploaded</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-surface-2/40 transition-colors group cursor-pointer"
                  >
                    <td className="p-3.5 pl-5 font-semibold text-foreground flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <span className="truncate max-w-xs">{file.name}</span>
                    </td>
                    <td className="p-3.5 text-muted font-mono text-[11px]">{file.folder}</td>
                    <td className="p-3.5 text-muted font-mono text-[11px]">{file.size}</td>
                    <td className="p-3.5 text-muted font-mono text-[11px]">{file.uploadedAt}</td>
                    <td className="p-3.5 pr-5 text-right space-x-1">
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
                        title="Preview File"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-surface-2 transition-colors cursor-pointer"
                        title="Delete File"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FILE PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
          <div className="w-full max-w-lg rounded-2xl glass-elevated glass-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                {getFileIcon(previewFile.type)}
                <h3 className="text-base font-bold text-foreground truncate max-w-xs">
                  {previewFile.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black/60 font-mono text-xs text-emerald-300 leading-relaxed max-h-48 overflow-y-auto">
              [File Preview Buffer]\n\nDocument: {previewFile.name}\nSize: {previewFile.size}\nStatus: Indexed in Arqon Vector Database\n\nContent chunk preview ready for RAG prompt injection...
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-2 text-foreground border border-border cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
