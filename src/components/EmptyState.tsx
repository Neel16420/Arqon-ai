import React from "react"
import { motion } from "framer-motion"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center w-full py-12 md:py-16 px-4 min-h-[300px] ${className}`}>
      {/* Card with soft scale & hover elevation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl text-center glass-elevated glass-border glass-shadow max-w-[420px] w-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Illustration with Fade in, Translate Y: 12px, Opacity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="w-14 h-14 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mb-5 text-accent shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300"
        >
          {icon}
        </motion.div>

        {/* Typography */}
        <h2 className="text-xl font-bold text-foreground tracking-tight font-space mb-2">
          {title}
        </h2>

        {subtitle && (
          <p className="text-xs sm:text-sm text-muted mb-6 leading-relaxed max-w-[320px]">
            {subtitle}
          </p>
        )}

        {/* CTA Button with existing animations */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="hover-lift glass-hover active:scale-95 flex items-center justify-center gap-2 h-10 px-6 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all bg-accent hover:bg-accent/90 shadow-md shadow-accent/25 cursor-pointer"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {actionLabel}
          </button>
        )}
      </motion.div>
    </div>
  )
}
