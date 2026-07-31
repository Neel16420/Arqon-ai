import { useState } from 'react'
import { HelpCircle, Search, BookOpen, MessageSquare, Bug, ChevronDown, ChevronUp, Send, X, Check } from 'lucide-react'

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How does multi-model routing work in Arqon?',
    answer: 'Arqon dynamically routes prompts to optimal model provider endpoints (OpenAI, Anthropic, Google, DeepSeek) based on latency benchmarks, context length, and fallback policies.',
    category: 'Architecture',
  },
  {
    id: 'faq-2',
    question: 'How do saved prompt templates work?',
    answer: 'You can create reusable prompt templates in your Prompt Library or Context Panel. Selecting a saved prompt injects custom system instructions directly into your conversation session.',
    category: 'Features',
  },
  {
    id: 'faq-3',
    question: 'Are API keys and chat logs encrypted?',
    answer: 'Yes, all sensitive API keys and conversation outputs are encrypted at rest using AES-256 and transmitted securely over TLS 1.3 endpoints.',
    category: 'Security',
  },
  {
    id: 'faq-4',
    question: 'How do I manage monthly token consumption?',
    answer: 'Monitor active consumption in real-time on your User Dashboard or Billing workspace. Quota alerts automatically notify you when reaching 80% and 95% of monthly tokens.',
    category: 'Billing',
  },
]

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>('faq-1')
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [supportMessage, setSupportMessage] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!supportMessage.trim()) return
    setToastMessage('Support ticket created! Our engineering team will respond shortly.')
    setSupportMessage('')
    setShowSupportModal(false)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="space-y-6 pb-12 animate-page-enter max-w-4xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl glass-elevated glass-border text-xs font-semibold text-foreground shadow-2xl flex items-center gap-2 animate-bounce-subtle">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-foreground flex items-center gap-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <HelpCircle className="text-cyan-400" size={24} />
          Help Center & Documentation
        </h1>
        <p className="text-xs text-muted mt-1">
          Explore FAQs, API benchmarks, platform documentation, and contact engineering support.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-surface glass-border space-y-2 text-center flex flex-col items-center justify-center">
          <BookOpen className="text-blue-400" size={24} />
          <h3 className="text-sm font-bold text-foreground">Documentation</h3>
          <p className="text-xs text-muted">Browse model specs and system architecture API docs.</p>
        </div>

        <div className="p-5 rounded-2xl glass-surface glass-border space-y-2 text-center flex flex-col items-center justify-center">
          <MessageSquare className="text-emerald-400" size={24} />
          <h3 className="text-sm font-bold text-foreground">Community & Tutorials</h3>
          <p className="text-xs text-muted">Learn prompt engineering patterns & workflows.</p>
        </div>

        <div
          onClick={() => setShowSupportModal(true)}
          className="p-5 rounded-2xl glass-surface glass-border hover:border-accent/40 space-y-2 text-center flex flex-col items-center justify-center cursor-pointer transition-all card-hover"
        >
          <Bug className="text-accent" size={24} />
          <h3 className="text-sm font-bold text-foreground">Report Bug / Contact</h3>
          <p className="text-xs text-muted">Open a priority ticket with our engineering team.</p>
        </div>
      </div>

      {/* Search FAQs */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-3 text-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search frequently asked questions..."
          className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all"
        />
      </div>

      {/* Accordion FAQs */}
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-3">
        <h3
          className="text-base font-bold text-foreground border-b border-border pb-3"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id
            return (
              <div
                key={faq.id}
                className="rounded-xl bg-surface-2/60 border border-border overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs text-foreground cursor-pointer hover:bg-surface-2/80 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-accent uppercase">
                      {faq.category}
                    </span>
                    {faq.question}
                  </span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-muted leading-relaxed border-t border-border/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
          <div className="w-full max-w-md rounded-2xl glass-elevated glass-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3
                className="text-base font-bold text-foreground flex items-center gap-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Bug className="text-accent" size={18} />
                Contact Engineering Support
              </h3>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendSupport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Describe Issue or Feedback
                </label>
                <textarea
                  rows={4}
                  required
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Provide details or steps to reproduce..."
                  className="w-full p-3 rounded-xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-2 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, #D32F2F 100%)',
                  }}
                >
                  <Send size={13} />
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
