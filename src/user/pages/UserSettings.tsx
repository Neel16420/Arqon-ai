import { useState } from 'react'
import { Settings, Check } from 'lucide-react'

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'security' | 'accessibility'>('general')
  const [saved, setSaved] = useState(false)

  // State values
  const [defaultModel, setDefaultModel] = useState('gpt-4o')
  const [streamResponse, setStreamResponse] = useState(true)
  const [contextCaching, setContextCaching] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [quotaWarning, setQuotaWarning] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 pb-12 animate-page-enter max-w-4xl mx-auto">
      {/* Toast Notification */}
      {saved && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl glass-elevated glass-border text-xs font-semibold text-foreground shadow-2xl flex items-center gap-2 animate-bounce-subtle">
          <Check size={16} className="text-emerald-400" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-foreground flex items-center gap-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <Settings className="text-accent" size={24} />
          User Preferences & Settings
        </h1>
        <p className="text-xs text-muted mt-1">
          Configure default AI behavior, appearance, security, notifications, and accessibility options.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="glass-surface glass-border rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto text-xs">
        {(['general', 'appearance', 'notifications', 'security', 'accessibility'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-accent text-white shadow'
                : 'text-muted hover:text-foreground hover:bg-surface-2'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SETTINGS SECTIONS */}
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-6">
        {/* TAB 1: GENERAL */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            <h3
              className="text-base font-bold text-foreground border-b border-border pb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              General AI Engine Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Default AI Intelligence Model
                </label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full max-w-md p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground outline-none focus:border-accent/50"
                >
                  <option value="gpt-4o">GPT-4o (OpenAI)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                  <option value="gemini-1-5-pro">Gemini 1.5 Pro (Google)</option>
                  <option value="deepseek-r1">DeepSeek R1 (DeepSeek)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2/60 border border-border">
                <div>
                  <p className="text-xs font-bold text-foreground">Realtime Streaming Response</p>
                  <p className="text-[11px] text-muted">Stream tokens character-by-character as they are generated.</p>
                </div>
                <input
                  type="checkbox"
                  checked={streamResponse}
                  onChange={(e) => setStreamResponse(e.target.checked)}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2/60 border border-border">
                <div>
                  <p className="text-xs font-bold text-foreground">Prefix Context Caching</p>
                  <p className="text-[11px] text-muted">Automatically cache repeated prompt prefixes to reduce token cost up to 50%.</p>
                </div>
                <input
                  type="checkbox"
                  checked={contextCaching}
                  onChange={(e) => setContextCaching(e.target.checked)}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPEARANCE */}
        {activeTab === 'appearance' && (
          <div className="space-y-5">
            <h3
              className="text-base font-bold text-foreground border-b border-border pb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Visual Theme & Interface
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-muted">
                Arqon automatically syncs theme preference with your system or selected dark/light mode from the top navbar control.
              </p>
              <div className="p-4 rounded-xl bg-surface-2/60 border border-border text-xs">
                Theme Segmented Control is live in the header. Current theme mode is dynamically bound to CSS variables.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-5">
            <h3
              className="text-base font-bold text-foreground border-b border-border pb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Notification & Email Preferences
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2/60 border border-border">
                <div>
                  <p className="text-xs font-bold text-foreground">API Token Quota Alerts</p>
                  <p className="text-[11px] text-muted">Receive alerts when token consumption reaches 80% and 95% of quota.</p>
                </div>
                <input
                  type="checkbox"
                  checked={quotaWarning}
                  onChange={(e) => setQuotaWarning(e.target.checked)}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2/60 border border-border">
                <div>
                  <p className="text-xs font-bold text-foreground">Product & Security Emails</p>
                  <p className="text-[11px] text-muted">Important account security alerts and feature updates.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-5">
            <h3
              className="text-base font-bold text-foreground border-b border-border pb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Authentication & Security Controls
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2/60 border border-border">
                <div>
                  <p className="text-xs font-bold text-foreground">Two-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-muted">Protect your user account with TOTP authenticator apps (Google/Authy).</p>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ACCESSIBILITY */}
        {activeTab === 'accessibility' && (
          <div className="space-y-5">
            <h3
              className="text-base font-bold text-foreground border-b border-border pb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Accessibility & Motion
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2/60 border border-border">
                <div>
                  <p className="text-xs font-bold text-foreground">Reduce Motion & Animations</p>
                  <p className="text-[11px] text-muted">Disable decorative transitions for lower GPU power or motion sensitivity.</p>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white shadow-lg cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
            boxShadow: '0 4px 14px rgba(255, 59, 59, 0.35)',
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}
