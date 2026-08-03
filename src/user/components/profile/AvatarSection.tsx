import React from 'react'
import { motion } from 'framer-motion'
import { Camera, Sparkles, Upload, Trash2, ShieldCheck } from 'lucide-react'
import SelectedAvatar from './SelectedAvatar'
import AvatarGrid from './AvatarGrid'

export interface AvatarSectionProps {
  userName: string
  selectedAvatarId: string
  selectedAvatarUrl: string
  onSelectAvatarId: (id: string, url: string) => void
  onOpenAvatarModal: () => void
}

export function AvatarSection({
  userName,
  selectedAvatarId,
  selectedAvatarUrl,
  onSelectAvatarId,
  onOpenAvatarModal,
}: AvatarSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Current Avatar Feature Box */}
      <div className="glass-surface glass-border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <SelectedAvatar
            avatarUrl={selectedAvatarUrl}
            userName={userName}
            size="xl"
            isOnline={true}
            onClick={onOpenAvatarModal}
            showChangeBadge={true}
          />
          <div>
            <h3
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Current Active Avatar
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Default workspace identity displayed across AI Router prompts, teams, and logs.
            </p>
            <span className="inline-block text-[11px] font-mono text-accent font-semibold mt-2">
              ID: {selectedAvatarId}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenAvatarModal}
          className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Camera size={15} />
          Open Avatar Picker Modal
        </button>
      </div>

      {/* Avatar Gallery Grid */}
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
        <div className="border-b border-border/50 pb-3 flex items-center justify-between">
          <div>
            <h4
              className="text-base font-bold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Avatar Presets Gallery
            </h4>
            <p className="text-xs text-muted">Click any avatar below to switch immediately.</p>
          </div>
          <span className="text-[11px] text-muted flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400" />
            8 Vector Portait Assets
          </span>
        </div>

        <AvatarGrid
          selectedAvatarId={selectedAvatarId}
          onSelectAvatar={(id) => {
            const num = id.replace('avatar-', '')
            onSelectAvatarId(id, `/avatars/avatar-${num}.png`)
          }}
        />
      </div>

      {/* Future-Ready Extensions Card */}
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
        <h4
          className="text-base font-bold text-foreground border-b border-border/50 pb-3"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Extended Avatar Services (Future Integration)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surface-2/60 border border-border/50 opacity-60 flex flex-col justify-between">
            <div className="space-y-1.5">
              <Upload size={20} className="text-accent" />
              <h5 className="text-xs font-bold text-foreground">Upload Photo</h5>
              <p className="text-[11px] text-muted">Upload custom PNG, JPG, or SVG avatar file.</p>
            </div>
            <span className="text-[10px] text-muted font-mono mt-3">API Ready</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-2/60 border border-border/50 opacity-60 flex flex-col justify-between">
            <div className="space-y-1.5">
              <Sparkles size={20} className="text-blue-400" />
              <h5 className="text-xs font-bold text-foreground">AI Avatar Generator</h5>
              <p className="text-[11px] text-muted">Synthesize custom AI avatar portrait from prompt.</p>
            </div>
            <span className="text-[10px] text-muted font-mono mt-3">API Ready</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-2/60 border border-border/50 opacity-60 flex flex-col justify-between">
            <div className="space-y-1.5">
              <Trash2 size={20} className="text-rose-400" />
              <h5 className="text-xs font-bold text-foreground">Remove Avatar</h5>
              <p className="text-[11px] text-muted">Reset avatar to fallback initial letters.</p>
            </div>
            <span className="text-[10px] text-muted font-mono mt-3">API Ready</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AvatarSection
