import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export interface AvatarCardProps {
  id: string
  avatarUrl: string
  label: string
  isSelected: boolean
  onSelect: (id: string) => void
}

export function AvatarCard({
  id,
  avatarUrl,
  label,
  isSelected,
  onSelect,
}: AvatarCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
    }
  }

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Select ${label}`}
      whileHover={{ scale: 1.06, y: -4 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative group rounded-full p-1 cursor-pointer outline-none transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-accent ring-offset-2 ring-offset-background'
          : 'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      }`}
    >
      {/* Avatar Container */}
      <div
        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden transition-all duration-300 ${
          isSelected
            ? 'border-2 border-accent shadow-[0_0_24px_rgba(255,46,67,0.5)] scale-[1.03]'
            : 'border border-border/80 group-hover:border-accent/60 group-hover:shadow-[0_0_18px_rgba(255,46,67,0.25)]'
        }`}
        style={{
          background: 'linear-gradient(145deg, rgba(25, 25, 30, 0.9) 0%, rgba(10, 10, 14, 0.95) 100%)',
        }}
      >
        <img
          src={avatarUrl}
          alt={label}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Selected Overlay Dim */}
        {isSelected && (
          <div className="absolute inset-0 bg-accent/10 pointer-events-none" />
        )}
      </div>

      {/* Checkmark Badge for Selected State */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0 right-0 w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center shadow-lg border-2 border-background z-10"
        >
          <Check size={14} className="stroke-[3]" />
        </motion.div>
      )}

      {/* Label Subtitle */}
      <span className="block text-[11px] font-medium text-center mt-2 truncate max-w-24 text-muted group-hover:text-foreground transition-colors">
        {label}
      </span>
    </motion.button>
  )
}

export default AvatarCard
