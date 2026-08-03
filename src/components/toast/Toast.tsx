import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { useReducedMotion } from "../../motion/useReducedMotion"

export type ToastType = "success" | "error" | "warning" | "info"

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const icons = {
  success: <CheckCircle2 size={18} className="text-success" />,
  error: <XCircle size={18} className="text-accent" />,
  warning: <AlertTriangle size={18} className="text-warning" />,
  info: <Info size={18} className="text-info" />,
}

const colorMap = {
  success: "var(--color-success)",
  error: "var(--color-accent)",
  warning: "var(--color-warning)",
  info: "var(--color-info)",
}

const defaultDurations = {
  success: 3000,
  error: 6000,
  warning: 4000,
  info: 4000,
}

export function Toast({
  id,
  type,
  title,
  message,
  duration,
  onClose,
}: ToastProps) {
  const [isHovered, setIsHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const finalDuration = duration || defaultDurations[type]

  const [remainingTime, setRemainingTime] = useState(finalDuration)
  const [lastTick, setLastTick] = useState(Date.now())

  useEffect(() => {
    if (isHovered) return

    setLastTick(Date.now())
    const timer = setTimeout(() => {
      onClose(id)
    }, remainingTime)

    return () => {
      clearTimeout(timer)
      setRemainingTime((prev) => Math.max(0, prev - (Date.now() - lastTick)))
    }
  }, [isHovered, remainingTime, id, onClose, lastTick])

  // Framer motion variants for enter/exit
  const variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -20,
      scale: shouldReduceMotion ? 1 : 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -10,
      scale: shouldReduceMotion ? 1 : 0.95,
      transition: { duration: 0.2, ease: "easeIn" as const },
    },
  }

  return (
    <motion.div
      layout="position"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-start gap-3 p-4 rounded-xl shadow-lg pointer-events-auto overflow-hidden"
      style={{
        background: "rgba(var(--color-surface-rgb), 0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--color-border)",
        minWidth: "300px",
        maxWidth: "400px",
      }}
    >
      <div className="shrink-0 mt-0.5">{icons[type]}</div>

      <div className="flex-1 flex flex-col gap-1 pr-4">
        <h4
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </h4>
        {message && (
          <p
            className="text-xs text-muted"
            style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}
          >
            {message}
          </p>
        )}
      </div>

      <button
        onClick={() => onClose(id)}
        className="absolute top-3 right-3 text-muted hover:text-foreground transition-colors p-1 rounded-md hover:bg-surface-2"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-border/30">
        <div
          className="h-full"
          style={{
            background: colorMap[type],
            width: "100%",
            animationName: "toast-progress",
            animationDuration: `${finalDuration}ms`,
            animationTimingFunction: "linear",
            animationFillMode: "forwards",
            animationPlayState: isHovered ? "paused" : "running",
            transformOrigin: "left",
          }}
        />
      </div>
    </motion.div>
  )
}
