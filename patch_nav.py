import pathlib
import re

app_path = pathlib.Path('src/App.tsx')
app_content = app_path.read_text(encoding='utf-8')

# Update App.tsx imports to include useEffect, useCallback
app_content = app_content.replace(
    "import { useState } from 'react'",
    "import { useState, useEffect, useCallback } from 'react'"
)

# Update App.tsx activePage hook
old_state = "const [activePage, setActivePage] = useState<Page>('overview')"
new_state = """const getPathPage = (): Page => {
    const path = window.location.pathname.substring(1)
    const validPages: Page[] = ['overview', 'providers', 'logs', 'settings', 'requests', 'models', 'routing', 'analytics', 'api-keys', 'playground']
    return validPages.includes(path as Page) ? (path as Page) : 'overview'
  }

  const [activePage, _setActivePage] = useState<Page>(getPathPage)

  useEffect(() => {
    const onPopState = () => {
      _setActivePage(getPathPage())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setActivePage = useCallback((page: Page) => {
    _setActivePage((prev) => {
      if (prev !== page) {
        window.history.pushState(null, '', `/${page}`)
        return page
      }
      return prev
    })
  }, [])"""

app_content = app_content.replace(old_state, new_state)

# Pass onNavigate to Overview
app_content = app_content.replace(
    "{activePage === 'overview' && <Overview />}",
    "{activePage === 'overview' && <Overview onNavigate={setActivePage as any} />}"
)

app_path.write_text(app_content, encoding='utf-8')

# Now patch Overview.tsx
ov_path = pathlib.Path('src/pages/Overview.tsx')
ov_content = ov_path.read_text(encoding='utf-8')

ov_content = ov_content.replace(
    "export default function Overview() {",
    "export default function Overview({ onNavigate }: { onNavigate?: (page: string) => void }) {"
)

old_actions = """const quickActions = [
  { icon: <FileText size={16} />, label: 'View Logs', desc: 'Browse request history' },
  { icon: <Server size={16} />, label: 'Manage Providers', desc: 'Configure AI providers' },
  { icon: <Zap size={16} />, label: 'Routing Rules', desc: 'Edit routing logic' },
  { icon: <Shield size={16} />, label: 'API Keys', desc: 'Manage gateway keys' },
  { icon: <Activity size={16} />, label: 'Analytics', desc: 'View usage metrics' },
  { icon: <Settings size={16} />, label: 'Settings', desc: 'Platform configuration' },
]"""

new_actions = """const quickActions = [
  { icon: <FileText size={16} />, label: 'View Logs', desc: 'Browse request history', route: 'logs' },
  { icon: <Server size={16} />, label: 'Manage Providers', desc: 'Configure AI providers', route: 'providers' },
  { icon: <Zap size={16} />, label: 'Routing Rules', desc: 'Edit routing logic', route: 'routing' },
  { icon: <Shield size={16} />, label: 'API Keys', desc: 'Manage gateway keys', route: 'api-keys' },
  { icon: <Activity size={16} />, label: 'Analytics', desc: 'View usage metrics', route: 'analytics' },
  { icon: <Settings size={16} />, label: 'Settings', desc: 'Platform configuration', route: 'settings' },
]"""

ov_content = ov_content.replace(old_actions, new_actions)

old_buttons = """                <button
                  key={a.label}
                  className="hover-lift flex flex-col items-start gap-1 p-2.5 rounded-lg text-left transition-colors hover:border-border-2"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.border = '1px solid var(--color-border-2)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.border = '1px solid var(--color-border)')
                  }
                >"""

new_buttons = """                <button
                  key={a.label}
                  role="button"
                  tabIndex={0}
                  aria-label={`Navigate to ${a.label}`}
                  onClick={() => onNavigate?.(a.route)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onNavigate?.(a.route)
                    }
                  }}
                  className="hover-lift flex flex-col items-start gap-1 p-2.5 rounded-lg text-left transition-colors hover:border-border-2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.border = '1px solid var(--color-border-2)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.border = '1px solid var(--color-border)')
                  }
                >"""

ov_content = ov_content.replace(old_buttons, new_buttons)

ov_path.write_text(ov_content, encoding='utf-8')

print("Patched App.tsx and Overview.tsx")
