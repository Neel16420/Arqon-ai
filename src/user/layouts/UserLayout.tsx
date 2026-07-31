import { useState } from 'react'
import UserSidebar, { type UserPage } from '../components/UserSidebar'
import UserHeader from '../components/UserHeader'
import { LayoutDashboard, MessageSquare, FolderGit2, FileText, Menu } from 'lucide-react'

interface UserLayoutProps {
  children: React.ReactNode
  activePage: UserPage
  setActivePage: (p: UserPage) => void
  onLogout: () => void
}

export default function UserLayout({ children, activePage, setActivePage, onLogout }: UserLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-background)' }}>
      <UserSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Content area — offset for sidebar */}
      <div
        className="flex flex-col flex-1 min-w-0 overflow-hidden"
        style={{
          marginLeft: 0,
          paddingLeft: 0,
        }}
      >
        {/* On md+ screens, account for sidebar */}
        <style>{`
          @media (min-width: 768px) {
            .user-content-area { margin-left: 56px; }
          }
          @media (min-width: 1024px) {
            .user-content-area { margin-left: 224px; }
          }
        `}</style>

        <div className="user-content-area flex flex-col flex-1 min-w-0 overflow-hidden h-full">
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

          {/* Milestone 11: Mobile Bottom Navigation Bar */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-surface border-t border-border z-40 flex items-center justify-around px-2">
            <button
              onClick={() => setActivePage('dashboard')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium cursor-pointer ${
                activePage === 'dashboard' ? 'text-accent font-bold' : 'text-muted'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActivePage('chat')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium cursor-pointer ${
                activePage === 'chat' ? 'text-accent font-bold' : 'text-muted'
              }`}
            >
              <MessageSquare size={18} />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setActivePage('projects')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium cursor-pointer ${
                activePage === 'projects' ? 'text-accent font-bold' : 'text-muted'
              }`}
            >
              <FolderGit2 size={18} />
              <span>Projects</span>
            </button>

            <button
              onClick={() => setActivePage('files')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium cursor-pointer ${
                activePage === 'files' ? 'text-accent font-bold' : 'text-muted'
              }`}
            >
              <FileText size={18} />
              <span>Files</span>
            </button>

            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center gap-1 text-[10px] font-medium text-muted cursor-pointer"
            >
              <Menu size={18} />
              <span>Menu</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
