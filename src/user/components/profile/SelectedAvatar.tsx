import React from 'react'
import { Camera } from 'lucide-react'

export interface SelectedAvatarProps {
  avatarUrl: string
  userName: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isOnline?: boolean
  onClick?: () => void
  showChangeBadge?: boolean
  className?: string
}

const SIZE_CLASSES = {
  sm: 'w-10 h-10 text-xs',
  md: 'w-14 h-14 text-sm',
  lg: 'w-20 h-20 text-xl',
  xl: 'w-28 h-28 text-3xl',
}

const ONLINE_DOT_SIZES = {
  sm: 'w-2.5 h-2.5 bottom-0 right-0 border-2',
  md: 'w-3.5 h-3.5 bottom-0.5 right-0.5 border-2',
  lg: 'w-4 h-4 bottom-1 right-1 border-2',
  xl: 'w-5 h-5 bottom-1.5 right-1.5 border-2',
}

export function SelectedAvatar({
  avatarUrl,
  userName,
  size = 'xl',
  isOnline = true,
  onClick,
  showChangeBadge = false,
  className = '',
}: SelectedAvatarProps) {
  const sizeClass = SIZE_CLASSES[size]
  const onlineDotClass = ONLINE_DOT_SIZES[size]

  return (
    <div
      onClick={onClick}
      className={`relative inline-block group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      aria-label={`${userName}'s profile avatar`}
    >
      {/* Avatar Outer Container */}
      <div
        className={`relative rounded-full overflow-hidden border-2 transition-all duration-300 ${sizeClass} ${
          onClick ? 'group-hover:border-accent group-hover:shadow-[0_0_20px_rgba(255,46,67,0.35)]' : ''
        }`}
        style={{
          borderColor: 'rgba(255, 46, 67, 0.4)',
          background: 'linear-gradient(145deg, rgba(30, 30, 35, 0.9) 0%, rgba(12, 12, 15, 0.95) 100%)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        <img
          src={avatarUrl}
          alt={`${userName}'s Avatar`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // If image fails, hide image element to reveal initials
            ;(e.target as HTMLElement).style.display = 'none'
          }}
        />

        {/* Fallback Initials */}
        <div className="absolute inset-0 flex items-center justify-center font-bold text-foreground font-space select-none -z-10">
          {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>

        {/* Hover Change Badge Overlay */}
        {showChangeBadge && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all duration-200">
            <Camera className="w-5 h-5 mb-0.5 text-accent animate-pulse" />
            <span className="text-[10px] font-semibold tracking-wide">Change</span>
          </div>
        )}
      </div>

      {/* Online Status Indicator */}
      {isOnline && (
        <span
          className={`absolute rounded-full bg-emerald-500 border-background ${onlineDotClass} shadow-[0_0_8px_rgba(16,185,129,0.8)]`}
          title="Online"
        />
      )}
    </div>
  )
}

export default SelectedAvatar
