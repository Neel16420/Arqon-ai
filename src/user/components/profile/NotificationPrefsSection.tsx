import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, Smartphone, ShieldAlert, Sparkles } from 'lucide-react'
import { useToast } from '../../../components/toast/ToastContext'

export function NotificationPrefsSection() {
  const { success } = useToast()

  const [prefs, setPrefs] = useState({
    emailNotifs: true,
    pushNotifs: true,
    aiActivity: true,
    securityAlerts: true,
    marketingEmails: false,
  })

  const togglePref = (key: keyof typeof prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    success('Notification preferences updated!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-5 text-xs">
        <div className="border-b border-border/50 pb-3">
          <h3
            className="text-base font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Bell size={18} className="text-accent" />
            Notification Channels & Preferences
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Configure how and when Arqon alerts you regarding workspace activity, security, and usage quotas.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              key: 'emailNotifs' as const,
              title: 'Email Notifications',
              desc: 'Receive quota alerts, weekly summaries, and billing invoices via email.',
              icon: <Mail size={18} className="text-accent" />,
            },
            {
              key: 'pushNotifs' as const,
              title: 'Browser Push Notifications',
              desc: 'Real-time desktop popups for critical model failovers and finished tasks.',
              icon: <Smartphone size={18} className="text-blue-400" />,
            },
            {
              key: 'aiActivity' as const,
              title: 'AI Routing Activity Digests',
              desc: 'Get daily breakdown of token throughput, latency spikes, and top models.',
              icon: <Sparkles size={18} className="text-emerald-400" />,
            },
            {
              key: 'securityAlerts' as const,
              title: 'Security & Auth Alerts',
              desc: 'Immediate notifications for new device sign-ins or key revocations.',
              icon: <ShieldAlert size={18} className="text-amber-400" />,
            },
            {
              key: 'marketingEmails' as const,
              title: 'Product Updates & Newsletter',
              desc: 'Occasional emails about new AI models, benchmarks, and platform features.',
              icon: <Bell size={18} className="text-violet-400" />,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 rounded-xl bg-surface-2/60 border border-border/50 hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center border border-border shrink-0">
                  {item.icon}
                </div>
                <div>
                  <span className="font-bold text-foreground block">{item.title}</span>
                  <span className="text-[11px] text-muted">{item.desc}</span>
                </div>
              </div>

              <button
                onClick={() => togglePref(item.key)}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                  prefs[item.key] ? 'bg-accent' : 'bg-surface border border-border'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    prefs[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default NotificationPrefsSection
