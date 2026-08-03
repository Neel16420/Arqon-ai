import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link2, ShieldCheck, Check, Unlink } from 'lucide-react'
import { useToast } from '../../../components/toast/ToastContext'

export function ConnectedAccountsSection() {
  const { success, info } = useToast()

  const [accounts, setAccounts] = useState([
    { id: 'google', name: 'Google Workspace', email: 'user@example.com', connected: true, iconColor: 'text-blue-400' },
    { id: 'github', name: 'GitHub OAuth', handle: '@neel-dev', connected: true, iconColor: 'text-foreground' },
    { id: 'microsoft', name: 'Microsoft Azure Entra ID', connected: false, iconColor: 'text-cyan-400' },
  ])

  const toggleConnect = (id: string) => {
    setAccounts(
      accounts.map((acc) => {
        if (acc.id === id) {
          const next = !acc.connected
          if (next) success(`Connected to ${acc.name}`)
          else info(`Disconnected ${acc.name}`)
          return { ...acc, connected: next }
        }
        return acc
      })
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
        <div className="border-b border-border/50 pb-3">
          <h3
            className="text-base font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Link2 size={18} className="text-accent" />
            Connected OAuth & SSO Identity Providers
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Link external Single Sign-On (SSO) accounts for fast 1-click authentication.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between p-4 rounded-xl bg-surface-2/60 border border-border/50 hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center border border-border font-bold shrink-0">
                  <span className={acc.iconColor}>{acc.name.charAt(0)}</span>
                </div>
                <div>
                  <span className="font-bold text-foreground block">{acc.name}</span>
                  <span className="text-[11px] text-muted">{acc.email || acc.handle || 'Not connected'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${
                    acc.connected
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-surface-2 text-muted border-border'
                  }`}
                >
                  {acc.connected ? 'Connected' : 'Not Connected'}
                </span>

                <button
                  onClick={() => toggleConnect(acc.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    acc.connected
                      ? 'bg-surface-2 text-muted hover:text-rose-400 border border-border'
                      : 'bg-accent text-white hover:bg-accent-hover shadow-sm'
                  }`}
                >
                  {acc.connected ? 'Disconnect' : 'Connect Account'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default ConnectedAccountsSection
