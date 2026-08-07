import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Loader2 } from 'lucide-react'
import { useToast } from '../../../components/toast/ToastContext'
import { logout as authServiceLogout, setSimulateLogoutFailure, getSimulateLogoutFailure } from '../../../services/authService'

export interface LogoutConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function LogoutConfirmationModal({
  isOpen,
  onClose,
  onSuccess,
}: LogoutConfirmationModalProps) {
  const { error: toastError } = useToast()
  const [loading, setLoading] = useState(false)
  const [simulateError, setSimulateError] = useState(getSimulateLogoutFailure())
  const modalRef = useRef<HTMLDivElement>(null)

  // Sync state with service config
  useEffect(() => {
    setSimulateLogoutFailure(simulateError)
  }, [simulateError])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, loading])

  const handleConfirmLogout = async () => {
    setLoading(true)
    try {
      await authServiceLogout()
      onClose()
      onSuccess()
    } catch (err: any) {
      toastError('Unable to sign out.', 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
          aria-describedby="logout-modal-description"
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && onClose()}
            className="fixed inset-0 glass-overlay backdrop-blur-md"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
            }}
          />

          {/* Modal Card */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full max-w-md rounded-3xl glass-surface glass-border glass-shadow overflow-hidden z-10 shadow-2xl p-6 sm:p-8"
            style={{
              background: 'linear-gradient(160deg, rgba(22, 22, 26, 0.95) 0%, rgba(12, 12, 15, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Top Glossy Highlight Sheen */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            />

            {/* Header / Icon */}
            <div className="flex items-start justify-between border-b border-border/40 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-rose-500/20 bg-rose-500/10 text-rose-400"
                >
                  <AlertTriangle size={20} />
                </div>
                <h2
                  id="logout-modal-title"
                  className="text-lg sm:text-xl font-bold text-foreground"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Sign Out
                </h2>
              </div>

              <button
                onClick={onClose}
                disabled={loading}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-3" id="logout-modal-description">
              <p className="text-sm leading-relaxed text-muted">
                Are you sure you want to sign out of your Arqon workspace?
              </p>
              <p className="text-xs text-muted/70">
                You can sign back in anytime.
              </p>
            </div>

            {/* Simulated Error Toggle for Testing */}
            <div className="mt-6 p-3 rounded-xl border border-border/40 bg-surface-2/30 flex items-center justify-between gap-4">
              <span className="text-[11px] font-medium text-muted">Simulate API / Network Failure</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateError}
                  onChange={(e) => setSimulateError(e.target.checked)}
                  disabled={loading}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-border/40">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border hover:bg-surface-2 text-foreground transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[96px] shadow-lg shadow-rose-500/10"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Signing Out</span>
                  </>
                ) : (
                  <span>Sign Out</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
