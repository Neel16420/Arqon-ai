import pathlib

# 1. Patch Login.tsx
login_path = pathlib.Path('src/pages/Login.tsx')
content = login_path.read_text(encoding='utf-8')

# Fix background from absolute to fixed to support scrolling
content = content.replace(
    'className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"',
    'className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none"'
)

# Fix page wrapper to allow scrolling and prevent clipping
content = content.replace(
    '<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505]">',
    '<div className="relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto bg-[#050505] py-8">'
)

# Reduce vertical spacing to help fit in viewport
content = content.replace(
    "padding: '48px 36px 36px'",
    "padding: '40px 32px 32px'"
)
content = content.replace(
    "marginBottom: '36px'",
    "marginBottom: '24px'"
)
content = content.replace(
    "marginBottom: '32px'",
    "marginBottom: '24px'"
)
content = content.replace(
    "width: '60px',\n                    height: '60px',",
    "width: '52px',\n                    height: '52px',"
)
content = content.replace(
    "width: '32px', height: '32px'",
    "width: '28px', height: '28px'"
)

# Replace the footer completely
old_footer = """          {/* ── Card footer ── */}
          <div
            style={{
              padding: '16px 36px 20px',
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

new_footer = """          {/* ── Card footer ── */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-4"
            style={{
              padding: '16px 24px 24px',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              background: 'rgba(0,0,0,0.15)',
            }}
          >
            <button onClick={() => window.location.href='/terms'} className="login-footer-link">
              Terms & Conditions
            </button>
            <span className="hidden sm:inline text-white/20 text-[10px]">•</span>
            <button onClick={() => window.location.href='/privacy'} className="login-footer-link">
              Privacy Policy
            </button>
            <span className="hidden sm:inline text-white/20 text-[10px]">•</span>
            <button onClick={() => window.location.href='/help'} className="login-footer-link">
              Help Center
            </button>
          </div>"""

content = content.replace(old_footer, new_footer)
login_path.write_text(content, encoding='utf-8')

# 2. Add CSS for footer link
index_path = pathlib.Path('src/index.css')
index_css = index_path.read_text(encoding='utf-8')

if '.login-footer-link' not in index_css:
    index_css += """
.login-footer-link {
  color: rgba(255,255,255,0.42);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.4px;
  font-family: 'Inter', sans-serif;
  transition: color 200ms ease;
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  text-decoration: none;
  outline: none;
}
.login-footer-link:hover {
  color: #ff4d5d;
}
.login-footer-link:focus-visible {
  color: #ff4d5d;
  text-decoration: underline;
}
"""
    index_path.write_text(index_css, encoding='utf-8')

# 3. Create Placeholder Pages
privacy_path = pathlib.Path('src/pages/Privacy.tsx')
privacy_path.write_text("""import { ChevronLeft } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505]">
      <div className="w-full max-w-xl rounded-2xl p-8 bg-[#0a0a0c] border border-white/10 text-center">
        <h1 className="text-2xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-8">This page will be connected during backend integration.</p>
        <button 
          onClick={() => window.history.back()}
          className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto"
        >
          <ChevronLeft size={16} />
          Return to Login
        </button>
      </div>
    </div>
  )
}
""", encoding='utf-8')

terms_path = pathlib.Path('src/pages/Terms.tsx')
terms_path.write_text("""import { ChevronLeft } from 'lucide-react'

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505]">
      <div className="w-full max-w-xl rounded-2xl p-8 bg-[#0a0a0c] border border-white/10 text-center">
        <h1 className="text-2xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Terms & Conditions</h1>
        <p className="text-white/40 text-sm mb-8">This page will be connected during backend integration.</p>
        <button 
          onClick={() => window.history.back()}
          className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto"
        >
          <ChevronLeft size={16} />
          Return to Login
        </button>
      </div>
    </div>
  )
}
""", encoding='utf-8')

help_path = pathlib.Path('src/pages/Help.tsx')
help_path.write_text("""import { ChevronLeft } from 'lucide-react'

export default function Help() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505]">
      <div className="w-full max-w-xl rounded-2xl p-8 bg-[#0a0a0c] border border-white/10 text-center">
        <h1 className="text-2xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Help Center</h1>
        <p className="text-white/40 text-sm mb-8">This page will be connected during backend integration.</p>
        <button 
          onClick={() => window.history.back()}
          className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto"
        >
          <ChevronLeft size={16} />
          Return to Login
        </button>
      </div>
    </div>
  )
}
""", encoding='utf-8')

# 4. Wire up /privacy in App.tsx (terms and help are already wired but we need to add privacy)
app_path = pathlib.Path('src/App.tsx')
app_content = app_path.read_text(encoding='utf-8')

if "import Privacy from './pages/Privacy'" not in app_content:
    app_content = app_content.replace(
        "import Help from './pages/Help'",
        "import Help from './pages/Help'\nimport Privacy from './pages/Privacy'"
    )
    
    app_content = app_content.replace(
        "if (window.location.pathname === '/help') {",
        "if (window.location.pathname === '/privacy') {\n    return <Privacy />\n  }\n\n  if (window.location.pathname === '/help') {"
    )
    app_path.write_text(app_content, encoding='utf-8')

print("Applied footer fix and created placeholder pages.")
