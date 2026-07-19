import pathlib
import re

# 1. Update App.tsx
app_path = pathlib.Path('src/App.tsx')
app_content = app_path.read_text(encoding='utf-8')

app_content = app_content.replace(
    "import Login from './pages/Login'",
    "import Login from './pages/Login'\nimport Terms from './pages/Terms'\nimport Help from './pages/Help'"
)

# Insert the routing override before the authentication check
auth_check = """  if (!session.isAuthenticated) {
    return <Login onLogin={(session) => login(session)} />
  }"""

new_auth_check = """  if (window.location.pathname === '/terms') {
    return <Terms />
  }
  
  if (window.location.pathname === '/help') {
    return <Help />
  }

  if (!session.isAuthenticated) {
    return <Login onLogin={(session) => login(session)} />
  }"""

app_content = app_content.replace(auth_check, new_auth_check)
app_path.write_text(app_content, encoding='utf-8')


# 2. Update Login.tsx
login_path = pathlib.Path('src/pages/Login.tsx')
login_content = login_path.read_text(encoding='utf-8')

old_footer = """          {/* Subtle footer */}
          <div
            style={{
              padding: '12px 24px',
              textAlign: 'center',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              background: 'rgba(0,0,0,0.15)',
            }}
          >
            <p
              style={{
                fontSize: '10.5px',
                color: 'rgba(255,255,255,0.25)',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.02em',
              }}
            >
              Single-operator admin console &mdash; v2.4.1
            </p>
          </div>"""

new_footer = """          {/* Subtle footer */}
          <div
            className="flex items-center justify-center gap-8"
            style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              background: 'rgba(0,0,0,0.15)',
            }}
          >
            <button
              onClick={() => window.location.href = '/terms'}
              aria-label="Terms and Conditions"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-footer-text, rgba(255,255,255,0.55))',
                fontFamily: "'Inter', sans-serif",
                opacity: 0.75,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
              className="transition-all duration-200 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded hover-glow-text"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => window.location.href = '/help'}
              aria-label="Help"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-footer-text, rgba(255,255,255,0.55))',
                fontFamily: "'Inter', sans-serif",
                opacity: 0.75,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
              className="transition-all duration-200 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded hover-glow-text"
            >
              Help
            </button>
          </div>"""

login_content = login_content.replace(old_footer, new_footer)
login_path.write_text(login_content, encoding='utf-8')

# 3. Add global CSS variables and hover effect for the footer text to support light mode properly
index_path = pathlib.Path('src/index.css')
index_content = index_path.read_text(encoding='utf-8')

# Ensure we have a light mode variable fallback
if '--color-footer-text' not in index_content:
    # Inject into :root and .dark
    index_content = index_content.replace(':root {', ':root {\n  --color-footer-text: #444;\n  --color-footer-hover: #111;')
    index_content = index_content.replace('.dark {', '.dark {\n  --color-footer-text: rgba(255, 255, 255, 0.55);\n  --color-footer-hover: #ffffff;')
    
    # Add the hover-glow-text class
    index_content += "\n\n.hover-glow-text:hover { color: var(--color-footer-hover) !important; text-shadow: 0 0 10px rgba(255,255,255,0.3); }\n.dark .hover-glow-text:hover { text-shadow: 0 0 10px rgba(255,255,255,0.3); }\n"
    index_path.write_text(index_content, encoding='utf-8')

print("Successfully patched App.tsx, Login.tsx, and index.css")
