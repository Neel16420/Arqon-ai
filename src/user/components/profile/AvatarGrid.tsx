import { motion } from 'framer-motion'
import AvatarCard from './AvatarCard'

export interface AvatarItem {
  id: string
  url: string
  label: string
}

export const ARQON_AVATARS: AvatarItem[] = [
  { id: 'avatar-01', url: '/avatars/avatar-01.png', label: 'Arqon Rogue' },
  { id: 'avatar-02', url: '/avatars/avatar-02.png', label: 'Arqon Scholar' },
  { id: 'avatar-03', url: '/avatars/avatar-03.png', label: 'Arqon Cyber' },
  { id: 'avatar-04', url: '/avatars/avatar-04.png', label: 'Arqon Rebel' },
  { id: 'avatar-05', url: '/avatars/avatar-05.png', label: 'Arqon Executive' },
  { id: 'avatar-06', url: '/avatars/avatar-06.png', label: 'Arqon Engineer' },
  { id: 'avatar-07', url: '/avatars/avatar-07.png', label: 'Arqon Specialist' },
  { id: 'avatar-08', url: '/avatars/avatar-08.png', label: 'Arqon Guardian' },
]

export interface AvatarGridProps {
  avatars?: AvatarItem[]
  selectedAvatarId: string
  onSelectAvatar: (id: string) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 350, damping: 25 } },
}

export function AvatarGrid({
  avatars = ARQON_AVATARS,
  selectedAvatarId,
  onSelectAvatar,
}: AvatarGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      role="radiogroup"
      aria-label="Avatar options grid"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 justify-items-center py-2"
    >
      {avatars.map((avatar) => {
        const isSelected = selectedAvatarId === avatar.id || selectedAvatarId.endsWith(avatar.id)
        return (
          <motion.div key={avatar.id} variants={itemVariants}>
            <AvatarCard
              id={avatar.id}
              avatarUrl={avatar.url}
              label={avatar.label}
              isSelected={isSelected}
              onSelect={onSelectAvatar}
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export default AvatarGrid
