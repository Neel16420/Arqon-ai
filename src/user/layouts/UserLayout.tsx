import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import UserSidebar, { type UserPage } from '../components/UserSidebar'
import UserHeader from '../components/UserHeader'
import AvatarPickerModal from '../components/profile/AvatarPickerModal'
import { LayoutDashboard, MessageSquare, FolderGit2, FileText, Menu } from 'lucide-react'

const EXPANDED_W = 264
const COLLAPSED_W = 68

interface UserLayoutProps {
  children: React.ReactNode
  activePage: UserPage
  setActivePage: (p: UserPage) => void
  onLogout: () => void
}

export default function UserLayout({ children, activePage, setActivePage, onLogout }: UserLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    try { return localStorage.getItem('arqon-sidebar-pinned') !== 'false' } catch { return true }
  })

  // ── Global avatar state — single source of truth ──
  const [selectedAvatarId, setSelectedAvatarId] = useState('avatar-01')
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('/avatars/avatar-01.png')
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)

  const handleSaveAvatar = useCallback((id: string, url: string) => {
    setSelectedAvatarId(id)
    setSelectedAvatarUrl(url)
    // Notify profile page via custom event so UserProfile stays in sync
    window.dispatchEvent(new CustomEvent('arqon-avatar-changed', { detail: { id, url } }))
  }, [])

  // Listen for any page wanting to open the avatar modal
  useEffect(() => {
    const handler = () => setIsAvatarModalOpen(true)
    window.addEventListener('arqon-open-avatar-modal', handler)
    return () => window.removeEventListener('arqon-open-avatar-modal', handler)
  }, [])

  const handleExpandedChange = useCallback((expanded: boolean) => {
    setSidebarExpanded(expanded)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-background)' }}>
      <UserSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onExpandedChange={handleExpandedChange}
        avatarUrl={selectedAvatarUrl}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
        onLogout={onLogout}
      />

      {/* Content area — animated margin matches sidebar width on desktop */}
      <motion.div
        className="flex flex-col flex-1 min-w-0 overflow-hidden"
        animate={{ marginLeft: sidebarExpanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
      >
        <style>{`
          @media (max-width: 767px) {
            .user-content-motion { margin-left: 0 !important; }
          }
        `}</style>

        <div className="user-content-motion flex flex-col flex-1 min-w-0 overflow-hidden h-full">
          <UserHeader
            activePage={activePage}
            setActivePage={setActivePage}
            onMenuClick={() => setSidebarOpen(true)}
            onLogout={onLogout}
          />

          <main className="flex-1 overflow-y-auto pb-16 md:pb-6">
            <div className="px-4 md:px-6 py-5 md:py-6 max-w-screen-xl mx-auto w-full h-full">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-surface border-t border-border z-40 flex items-center justify-around px-2">
            <button onClick={() => setActivePage('dashboard')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium cursor-pointer ${activePage === 'dashboard' ? 'text-accent font-bold' : 'text-muted'}`}>
              <LayoutDashboard size={18} /><span>Home</span>
            </button>
            <button onClick={() => setActivePage('chat')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium cursor-pointer ${activePage === 'chat' ? 'text-accent font-bold' : 'text-muted'}`}>
              <MessageSquare size={18} /><span>Chat</span>
            </button>
            <button onClick={() => setActivePage('projects')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium cursor-pointer ${activePage === 'projects' ? 'text-accent font-bold' : 'text-muted'}`}>
              <FolderGit2 size={18} /><span>Projects</span>
            </button>
            <button onClick={() => setActivePage('files')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium cursor-pointer ${activePage === 'files' ? 'text-accent font-bold' : 'text-muted'}`}>
              <FileText size={18} /><span>Files</span>
            </button>
            <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center gap-1 text-[10px] font-medium text-muted cursor-pointer">
              <Menu size={18} /><span>Menu</span>
            </button>
          </nav>
        </div>
      </motion.div>

      {/* Global Avatar Picker Modal — controlled from UserLayout */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarId={selectedAvatarId}
        onSaveAvatar={handleSaveAvatar}
      />
    </div>
  )
}
