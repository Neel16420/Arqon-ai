import { useState } from 'react'
import { CreditCard, Check, Download, Award } from 'lucide-react'

export default function UserBilling() {
  const [currentTier, setCurrentTier] = useState<'Starter' | 'Pro' | 'Enterprise'>('Pro')

  const plans = [
    {
      name: 'Starter',
      price: '$19',
      period: '/month',
      tokens: '1.0M Tokens/mo',
      models: 'GPT-3.5, Claude Instant',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$49',
      period: '/month',
      tokens: '5.0M Tokens/mo',
      models: 'GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      tokens: 'Unlimited Custom Quotas',
      models: 'All Models + Custom Fine-tuned LLMs',
      popular: false,
    },
  ]

  const invoices = [
    { id: 'INV-2026-007', date: 'Jul 01, 2026', amount: '$49.00', status: 'Paid' },
    { id: 'INV-2026-006', date: 'Jun 01, 2026', amount: '$49.00', status: 'Paid' },
    { id: 'INV-2026-005', date: 'May 01, 2026', amount: '$49.00', status: 'Paid' },
  ]

  return (
    <div className="space-y-6 pb-12 animate-page-enter max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-foreground flex items-center gap-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <CreditCard className="text-emerald-400" size={24} />
          Billing & Subscription
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage active plan, review token usage quotas, view invoices, and update payment methods.
        </p>
      </div>

      {/* Active Plan Card */}
      <div className="relative overflow-hidden rounded-2xl glass-surface glass-border p-6 hover-lift">
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent uppercase tracking-wider flex items-center gap-1">
                <Award size={12} />
                Current Active Tier
              </span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-breathe-green" />
                Active Subscription
              </span>
            </div>

            <h2
              className="text-2xl font-extrabold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Pro Tier — $49 / month
            </h2>

            <p className="text-xs text-muted">
              Renews automatically on <span className="font-semibold text-foreground">August 1, 2026</span> via Visa ending in 4242.
            </p>
          </div>

          <div className="shrink-0 space-y-2 text-right">
            <div className="text-xs font-mono text-muted">Monthly Token Consumption</div>
            <div className="text-lg font-bold text-foreground">1.25M / 5.00M Tokens</div>
            <div className="w-48 h-2 rounded-full bg-surface-2 overflow-hidden mx-auto sm:ml-auto">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-accent" style={{ width: '25%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Plans Grid */}
      <div>
        <h3
          className="text-base font-bold text-foreground mb-3"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Subscription Tier Comparison
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const isCurrent = currentTier === plan.name
            return (
              <div
                key={plan.name}
                className={`group p-5 rounded-2xl glass-surface glass-border flex flex-col justify-between transition-all relative ${
                  plan.popular ? 'border-accent/40 shadow-xl' : ''
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-4 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-accent text-white shadow">
                    MOST POPULAR
                  </span>
                )}

                <div>
                  <h4 className="text-base font-bold text-foreground">{plan.name}</h4>
                  <div className="mt-2 mb-4 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted font-mono">{plan.period}</span>
                  </div>

                  <ul className="space-y-2 text-xs text-muted">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span>{plan.tokens}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span>{plan.models}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span>Sub-300ms Routing Latency</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setCurrentTier(plan.name as any)}
                  className={`mt-6 w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-surface-2 text-muted border border-border cursor-default'
                      : 'bg-accent text-white hover:brightness-110 shadow-md active:scale-95'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : `Switch to ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invoice History */}
      <div className="glass-surface glass-border rounded-2xl p-6 space-y-4">
        <h3
          className="text-base font-bold text-foreground border-b border-border pb-3"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Invoice & Payment History
        </h3>

        <div className="divide-y divide-border/40 text-xs">
          {invoices.map((inv) => (
            <div key={inv.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-muted">{inv.id}</span>
                <span className="font-semibold text-foreground">{inv.date}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-foreground font-bold">{inv.amount}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                  {inv.status}
                </span>
                <button className="p-1 rounded text-muted hover:text-foreground cursor-pointer" title="Download Invoice">
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
