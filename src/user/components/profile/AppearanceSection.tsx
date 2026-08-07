import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react'
import { useTheme } from '../../../hooks/useTheme'
import ThemeSegmentedControl from '../../../components/shared/ThemeToggle'
import { useToast } from '../../../components/toast/ToastContext'

export function AppearanceSection() {
  const { theme, setTheme } = useTheme()
  const { success } = useToast()

  const [accentColor, setAccentColor] = useState('#FF2E43')
  const [compactMode, setCompactMode] = useState(false)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Theme Card */}
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
        <div className="border-b border-border/50 pb-3 flex items-center justify-between">
          <div>
            <h3
              className="text-base font-bold text-foreground flex items-center gap-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Sun size={18} className="text-amber-400" />
              Theme Preference
            </h3>
            <p className="text-xs text-muted mt-0.5">Choose how Arqon UI looks to you.</p>
          </div>

          <ThemeSegmentedControl />
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs pt-2">
          {[
            { id: 'dark', label: 'Dark Mode', icon: <Moon size={16} /> },
            { id: 'light', label: 'Light Mode', icon: <Sun size={16} /> },
            { id: 'system', label: 'System Default', icon: <Monitor size={16} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id as any, null)
                success(`Theme changed to ${t.label}`)
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                theme === t.id
                  ? 'bg-accent/15 border-accent text-accent shadow-sm'
                  : 'glass-surface border-border text-muted hover:text-foreground'
              }`}
            >
              {t.icon}
              <span className="font-semibold text-[11px]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color & Display Tweaks */}
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-5 text-xs">
        <div className="border-b border-border/50 pb-3">
          <h3
            className="text-base font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Palette size={18} className="text-accent" />
            Accent Color & Display Tweaks
          </h3>
          <p className="text-xs text-muted mt-0.5">Customize highlight colors and layout density.</p>
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <label className="block font-semibold text-foreground">Brand Accent Color</label>
          <div className="flex items-center gap-3">
            {[
              { hex: '#FF2E43', name: 'Arqon Red' },
              { hex: '#3B82F6', name: 'Electric Blue' },
              { hex: '#10B981', name: 'Emerald' },
              { hex: '#8B5CF6', name: 'Violet' },
            ].map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  setAccentColor(c.hex)
                  success(`Accent color set to ${c.name}`)
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  accentColor === c.hex ? 'ring-2 ring-foreground scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {accentColor === c.hex && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2/60 border border-border/50">
            <div>
              <span className="font-bold text-foreground block">Compact Layout Mode</span>
              <span className="text-[11px] text-muted">Reduce padding for higher data density</span>
            </div>
            <button
              onClick={() => {
                setCompactMode(!compactMode)
                success(!compactMode ? 'Compact mode enabled' : 'Normal mode enabled')
              }}
              className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                compactMode ? 'bg-accent' : 'bg-surface border border-border'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  compactMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2/60 border border-border/50">
            <div>
              <span className="font-bold text-foreground block">Micro-Animations</span>
              <span className="text-[11px] text-muted">Smooth UI transitions & particle effects</span>
            </div>
            <button
              onClick={() => {
                setAnimationsEnabled(!animationsEnabled)
                success(!animationsEnabled ? 'Animations enabled' : 'Animations reduced')
              }}
              className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                animationsEnabled ? 'bg-accent' : 'bg-surface border border-border'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  animationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AppearanceSection
