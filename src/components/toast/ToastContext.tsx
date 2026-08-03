import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react"
import { AnimatePresence } from "framer-motion"
import { Toast, ToastProps } from "./Toast"

interface ToastOptions extends Omit<ToastProps, "id" | "onClose"> {}

interface ToastContextValue {
  toast: (options: ToastOptions) => void
  success: (title: string, message?: string, duration?: number) => void
  error: (title: string, message?: string, duration?: number) => void
  warning: (title: string, message?: string, duration?: number) => void
  info: (title: string, message?: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (options: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => {
        // Keep only up to 3 old ones, plus the new one, max 4
        const next = [...prev, { ...options, id, onClose: removeToast }]
        if (next.length > 4) {
          return next.slice(next.length - 4)
        }
        return next
      })
    },
    [removeToast],
  )

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: "success", title, message, duration })
    },
    [addToast],
  )

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: "error", title, message, duration })
    },
    [addToast],
  )

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: "warning", title, message, duration })
    },
    [addToast],
  )

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: "info", title, message, duration })
    },
    [addToast],
  )

  return (
    <ToastContext.Provider
      value={{ toast: addToast, success, error, warning, info }}
    >
      {children}

      {/* Toast Container */}
      <div
        className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none"
        style={{ perspective: "1000px" }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <Toast key={t.id} {...t} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
