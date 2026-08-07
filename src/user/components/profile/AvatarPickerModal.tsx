import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Upload, Check, ShieldCheck } from 'lucide-react'
import AvatarGrid, { ARQON_AVATARS } from './AvatarGrid'
import { useToast } from '../../../components/toast/ToastContext'

export interface AvatarPickerModalProps {
  isOpen: boolean
  onClose: () => void
  currentAvatarId: string
  onSaveAvatar: (avatarId: string, avatarUrl: string) => void
  
  /** Future Ready extension hooks for API integration */
  onUploadCustomPhoto?: (file: File) => Promise<string>
  onGenerateAIAvatar?: (prompt: string) => Promise<string>
  onRemoveAvatar?: () => Promise<void>
}

export function AvatarPickerModal({
  isOpen,
  onClose,
  currentAvatarId,
  onSaveAvatar,
}: AvatarPickerModalProps) {
  const { success } = useToast()
  
  // Normalize initial selection ID (e.g. 'avatar-01' or '/avatars/avatar-01.png')
  const initialId = ARQON_AVATARS.find(
    (a) => a.id === currentAvatarId || currentAvatarId.includes(a.id)
  )?.id || 'avatar-01'

  const [tempSelectedId, setTempSelectedId] = useState(initialId)
  const modalRef = useRef<HTMLDivElement>(null)

  // Reset temp selection when opened
  useEffect(() => {
    if (isOpen) {
      const found = ARQON_AVATARS.find(
        (a) => a.id === currentAvatarId || currentAvatarId.includes(a.id)
      )?.id || 'avatar-01'
      setTempSelectedId(found)
    }
  }, [isOpen, currentAvatarId])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSave = () => {
    const avatarItem = ARQON_AVATARS.find((a) => a.id === tempSelectedId) || ARQON_AVATARS[0]
    onSaveAvatar(avatarItem.id, avatarItem.url)
    success(`Profile avatar updated to "${avatarItem.label}"!`)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="avatar-modal-title"
          aria-describedby="avatar-modal-subtitle"
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 glass-overlay backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="relative w-full max-w-2xl rounded-3xl glass-surface glass-border glass-shadow overflow-hidden z-10 shadow-2xl space-y-6 p-6 sm:p-8"
            style={{
              background: 'linear-gradient(160deg, rgba(22, 22, 26, 0.95) 0%, rgba(12, 12, 15, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Top Glossy Highlight Sheen */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
            />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/50 pb-5">
              <div>
                <h2
                  id="avatar-modal-title"
                  className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Choose Your Avatar
                </h2>
                <p id="avatar-modal-subtitle" className="text-xs sm:text-sm text-muted mt-1">
                  Select a default avatar for your workspace.
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-2 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Avatar Grid Component */}
            <div className="max-h-[60vh] overflow-y-auto px-1 py-2">
              <AvatarGrid
                selectedAvatarId={tempSelectedId}
                onSelectAvatar={(id) => setTempSelectedId(id)}
              />
            </div>

            {/* Future-Ready Architecture Extensions (Disabled / Placeholders for backend integration) */}
            <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2 text-xs text-muted">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-1.5 opacity-40 cursor-not-allowed text-[11px] font-medium"
                  title="Upload Custom Photo (Backend integration required)"
                >
                  <Upload size={13} />
                  Upload Photo
                </button>
                <span className="text-border">•</span>
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-1.5 opacity-40 cursor-not-allowed text-[11px] font-medium"
                  title="AI Generated Avatar (Backend integration required)"
                >
                  <Sparkles size={13} />
                  AI Generate
                </button>
              </div>

              <span className="flex items-center gap-1 text-[11px] text-muted/80">
                <ShieldCheck size={13} className="text-emerald-400" />
                Frontend Preview
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-2 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover transition-all cursor-pointer flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-accent"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
                }}
              >
                <Check size={15} />
                Save Avatar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AvatarPickerModal
