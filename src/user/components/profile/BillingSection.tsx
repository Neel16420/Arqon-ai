import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Download, Sparkles, ArrowRight } from 'lucide-react'
import { useToast } from '../../../components/toast/ToastContext'

export function BillingSection() {
  const { success, info } = useToast()

  const [invoices] = useState([
    { id: 'INV-2025-002', date: 'Feb 1, 2025', amount: '$29.00', status: 'Paid', pdf: 'invoice-feb.pdf' },
    { id: 'INV-2025-001', date: 'Jan 1, 2025', amount: '$29.00', status: 'Paid', pdf: 'invoice-jan.pdf' },
    { id: 'INV-2024-012', date: 'Dec 1, 2024', amount: '$29.00', status: 'Paid', pdf: 'invoice-dec.pdf' },
  ])

  const handleDownloadInvoice = (id: string) => {
    info(`Downloading ${id}...`)
    setTimeout(() => success(`Downloaded PDF for ${id}`), 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Current Subscription Card */}
      <div className="glass-surface glass-border rounded-2xl p-6 relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
              Current Plan
            </span>
            <h3
              className="text-xl font-bold text-foreground flex items-center gap-2 mt-0.5"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Pro Workspace Tier
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
                Active
              </span>
            </h3>
            <p className="text-xs text-muted mt-1">Unlimited model routing, 100,000 monthly API credits.</p>
          </div>

          <div className="text-left sm:text-right">
            <span
              className="text-2xl font-bold text-foreground font-space block"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              $29<span className="text-xs text-muted font-normal"> / month</span>
            </span>
            <span className="text-[11px] text-muted font-mono">Renews automatically on Mar 1, 2025</span>
          </div>
        </div>

        {/* Quota Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted font-medium flex items-center gap-1.5">
              <Zap size={14} className="text-accent" /> Monthly Quota Used
            </span>
            <span className="font-mono text-foreground font-bold">64,200 / 100,000 credits (64.2%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full rounded-full bg-accent w-[64.2%]" />
          </div>
        </div>
      </div>

      {/* Upgrade Enterprise Tier Banner */}
      <div className="glass-surface glass-border rounded-2xl p-6 relative overflow-hidden bg-gradient-to-r from-accent/10 via-surface to-surface">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Sparkles size={18} className="text-accent" />
              <h4 className="text-base font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Need Unlimited Throughput & Custom SLA?
              </h4>
            </div>
            <p className="text-xs text-muted max-w-lg leading-relaxed">
              Upgrade to Arqon Enterprise for dedicated AI router instances, zero-rate-limit failover, and custom VPC deployments.
            </p>
          </div>

          <button
            onClick={() => info('Contacting Arqon sales team...')}
            className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs shadow-lg shadow-accent/25 hover:bg-accent-hover transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            Upgrade to Enterprise
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Payment Method & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Method */}
        <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
          <h4 className="text-base font-bold text-foreground border-b border-border/50 pb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Payment Method
          </h4>

          <div className="p-4 rounded-xl bg-surface-2/60 border border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-mono font-bold text-xs text-blue-400">
                  VISA
                </div>
                <div>
                  <span className="font-bold text-xs text-foreground block font-mono">•••• •••• •••• 4242</span>
                  <span className="text-[10px] text-muted">Expires 12/28</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Default
              </span>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="lg:col-span-2 glass-surface glass-border rounded-2xl p-6 space-y-4">
          <h4 className="text-base font-bold text-foreground border-b border-border/50 pb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Invoice History
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Invoice ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-foreground">{inv.id}</td>
                    <td className="py-3 px-3 text-muted">{inv.date}</td>
                    <td className="py-3 px-3 font-mono font-bold text-foreground">{inv.amount}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-surface-2 transition-all cursor-pointer inline-flex items-center gap-1"
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default BillingSection
