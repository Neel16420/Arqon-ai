import { Construction } from 'lucide-react'

interface ComingSoonProps {
  title: string
  description: string
  eta?: string
}

export default function ComingSoon({ title, description, eta }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div
        className="flex items-center justify-center w-12 h-12 rounded-xl mb-6"
        style={{ background: 'rgb(var(--color-accent-rgb) / 0.08)', border: '1px solid rgb(var(--color-accent-rgb) / 0.2)' }}
      >
        <Construction size={22} className="text-accent" />
      </div>
      <h2
        className="text-lg font-semibold text-foreground mb-2"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {title}
      </h2>
      <p className="text-sm text-muted max-w-sm leading-relaxed">{description}</p>
      {eta && (
        <div
          className="mt-6 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            color: 'var(--color-info)',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          ETA: {eta}
        </div>
      )}
    </div>
  )
}
