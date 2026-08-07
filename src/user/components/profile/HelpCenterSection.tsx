import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, BookOpen, Bug, MessageSquare, ChevronDown } from 'lucide-react'
import { useToast } from '../../../components/toast/ToastContext'

export function HelpCenterSection() {
  const { info, success } = useToast()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [bugDescription, setBugDescription] = useState('')
  const [isBugModalOpen, setIsBugModalOpen] = useState(false)

  const faqs = [
    {
      q: 'How does Arqon automatic failover routing work?',
      a: 'Arqon monitors upstream LLM provider health (OpenAI, Anthropic, Google, Cohere, DeepSeek) in real time. If a provider returns 429 Rate Limit or 5xx server errors, Arqon automatically re-routes the prompt payload to the next optimal provider within milliseconds.',
    },
    {
      q: 'Where do I find my API Keys and secret tokens?',
      a: 'Navigate to the API Keys section on your user panel or within Account Center settings. You can create secret keys, assign environment tags (Production/Staging), and test ping latencies.',
    },
    {
      q: 'How are token costs calculated across providers?',
      a: 'Token costs are calculated per 1,000 prompt and completion tokens according to each model’s official pricing. Arqon’s cost optimization engine routes traffic to lower-cost providers when capabilities match.',
    },
  ]

  const handleReportBugSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsBugModalOpen(false)
    setBugDescription('')
    success('Bug report submitted to Arqon engineering team!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Quick Action Support Header */}
      <div className="glass-surface glass-border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3
            className="text-lg font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <HelpCircle size={20} className="text-accent" />
            Arqon Help & Documentation Center
          </h3>
          <p className="text-xs text-muted mt-1">
            Search API guides, troubleshoot routing errors, or contact dedicated support engineers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsBugModalOpen(true)}
            className="px-4 py-2.5 rounded-xl glass-surface glass-border text-foreground hover:bg-surface-2 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Bug size={14} className="text-rose-400" />
            Report Bug
          </button>

          <button
            onClick={() => info('Connecting to Arqon live support chat...')}
            className="px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare size={14} />
            Contact Support
          </button>
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
        <h4 className="text-base font-bold text-foreground border-b border-border/50 pb-3 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <BookOpen size={18} className="text-accent" />
          Frequently Asked Questions
        </h4>

        <div className="space-y-3 text-xs">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div key={idx} className="rounded-xl bg-surface-2/60 border border-border/50 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-foreground flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-2/80 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={16} className={`text-muted transition-transform ${isOpen ? 'rotate-180 text-accent' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-muted leading-relaxed border-t border-border/30 text-[11px]">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* REPORT BUG MODAL */}
      {isBugModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay animate-fade-in">
          <div className="glass-surface glass-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <Bug size={18} className="text-rose-400" />
                Submit Bug Report
              </h3>
              <button onClick={() => setIsBugModalOpen(false)} className="text-muted hover:text-foreground text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleReportBugSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Issue Description</label>
                <textarea
                  rows={4}
                  required
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  placeholder="Describe the routing error or UI issue encountered..."
                  className="w-full p-3 rounded-xl glass-input text-foreground outline-none focus:ring-1 focus:ring-accent leading-relaxed resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsBugModalOpen(false)} className="px-4 py-2 rounded-xl text-xs text-muted hover:text-foreground">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-white font-semibold text-xs shadow-md shadow-accent/20 hover:bg-accent-hover">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default HelpCenterSection
