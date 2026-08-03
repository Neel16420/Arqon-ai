import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useToast } from "./toast/ToastContext"
import { useReducedMotion } from "../motion/useReducedMotion"

export interface ActionSuccessButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  onAction: () => void | boolean | Promise<void | boolean>
  label?: React.ReactNode
  loadingLabel?: React.ReactNode
  successLabel?: React.ReactNode
  toastTitle?: string
  toastMessage?: string
  duration?: number
  onAfterSuccess?: () => void
  variant?: "primary" | "danger" | "success" | "ghost" | "custom"
  icon?: React.ReactNode
  minLoadingMs?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * ActionSuccessButton (Universal Enterprise Success Button)
 * ─────────────────────────────────────────────────────────
 * Implements Phase 2 & 3 Standard Success Flow:
 * Idle -> Loading (~500ms min) -> ✓ Success (1.5-2s) -> Return to Idle / onAfterSuccess.
 * Zero scaling, zero bouncing. Animate only GPU-friendly properties. Respects reduced-motion.
 */
export function ActionSuccessButton({
  onAction,
  label = "Save",
  loadingLabel = "Saving...",
  successLabel = "Saved",
  toastTitle,
  toastMessage,
  duration = 1500,
  onAfterSuccess,
  variant = "primary",
  icon,
  minLoadingMs = 500,
  disabled = false,
  className = "",
  style = {},
  type = "button",
  ...props
}: ActionSuccessButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle")
  const { success } = useToast()
  const reduced = useReducedMotion()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (disabled || state !== "idle") return

    setState("loading")
    const startTime = Date.now()

    try {
      const result = await onAction()
      if (result === false) {
        setState("idle")
        return
      }

      const elapsed = Date.now() - startTime
      if (elapsed < minLoadingMs) {
        await new Promise((r) => setTimeout(r, minLoadingMs - elapsed))
      }

      if (toastTitle) {
        success(toastTitle, toastMessage)
      }

      setState("success")
      timeoutRef.current = setTimeout(() => {
        setState("idle")
        if (onAfterSuccess) onAfterSuccess()
      }, duration)
    } catch (err) {
      console.error(err)
      setState("idle")
    }
  }

  // Define background style based on state and variant
  let bgStyle: string | undefined = undefined
  if (state === "success") {
    bgStyle = "var(--color-success)"
  } else if (variant === "primary") {
    bgStyle = "var(--color-accent)"
  } else if (variant === "danger") {
    bgStyle = "linear-gradient(135deg, #E11D48, #9F1239)"
  } else if (variant === "success") {
    bgStyle = "var(--color-success)"
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || state !== "idle"}
      className={`relative inline-flex items-center justify-center gap-2 px-5 h-10 rounded-xl text-sm font-medium text-white transition-colors duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      style={{
        background: bgStyle || style.background,
        fontFamily: "'Space Grotesk', sans-serif",
        minWidth: "120px",
        ...style,
      }}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "idle" && (
          <motion.span
            key="idle"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 pointer-events-none whitespace-nowrap"
          >
            {icon && <span className="shrink-0">{icon}</span>}
            {label}
          </motion.span>
        )}

        {state === "loading" && (
          <motion.span
            key="loading"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 pointer-events-none whitespace-nowrap"
          >
            <Loader2 size={16} className="animate-spin shrink-0 text-white" />
            {loadingLabel}
          </motion.span>
        )}

        {state === "success" && (
          <motion.span
            key="success"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 pointer-events-none whitespace-nowrap text-white font-semibold"
          >
            <CheckCircle2 size={16} className="shrink-0 text-white" />
            {successLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

// Alias for convenience across components
export { ActionSuccessButton as SuccessButton }

/**
 * AnimatedListItem
 * ────────────────
 * Implements Phase 4 List & Card Updates:
 * When new content is created: Fade in, TranslateY 8px -> 0, 180-220ms (200ms).
 * When content is removed: Fade out, collapse smoothly without layout jumps.
 */
export function AnimatedListItem({
  children,
  className = "",
  style = {},
  onClick,
  layout = true,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler<HTMLDivElement>
  layout?: boolean | string
}) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      layout={layout && !reduced ? "position" : false}
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={
        reduced
          ? { opacity: 0 }
          : {
              opacity: 0,
              height: 0,
              marginTop: 0,
              marginBottom: 0,
              paddingTop: 0,
              paddingBottom: 0,
              overflow: "hidden",
            }
      }
      transition={{
        duration: 0.2, // 200ms per specification
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

/**
 * StatusChangeIndicator
 * ─────────────────────
 * Implements Phase 5 Status Changes:
 * Wraps status indicators, badges, and toggles with smooth color transitions and subtle pulse on change.
 */
export function StatusChangeIndicator({
  children,
  active = false,
  className = "",
}: {
  children: React.ReactNode
  active?: boolean
  className?: string
}) {
  const [pulsing, setPulsing] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setPulsing(true)
    const timer = setTimeout(() => setPulsing(false), 1000)
    return () => clearTimeout(timer)
  }, [active])

  return (
    <div
      className={`transition-colors duration-300 ${
        pulsing ? "animate-status-pulse" : ""
      } ${className}`}
    >
      {children}
    </div>
  )
}
