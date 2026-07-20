import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { useCountUp } from '../motion/useCountUp'

export default function TokenUsageCard() {
  const MAX_TOKENS = 25000
  const USED_TODAY = 320
  
  const remaining = MAX_TOKENS - USED_TODAY
  const remainingK = remaining / 1000
  const percentage = (remaining / MAX_TOKENS) * 100

  // Base circumference for the SVG circle (r=70)
  const circumference = 2 * Math.PI * 70
  const finalOffset = circumference * (1 - (percentage / 100))

  // State for the SVG ring offset (starts empty)
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    // 50ms delay to ensure the browser renders the initial empty state
    // before applying the final offset to trigger the CSS transition cleanly.
    const timer = setTimeout(() => {
      setOffset(finalOffset)
    }, 50)
    
    return () => clearTimeout(timer)
  }, [finalOffset])

  const animatedPercent = useCountUp(percentage, 1400, 2)
  const animatedRemaining = useCountUp(remainingK, 1400, 2)
  const animatedToday = useCountUp(USED_TODAY, 1400, 0)

  return (
    <>
      <style>{`
        .token-circle-glow {
          filter: drop-shadow(0 0 2px rgba(255, 77, 90, 0.15));
          transition: filter 0.3s ease;
        }
        .hover-lift:hover .token-circle-glow {
          filter: drop-shadow(0 0 4px rgba(255, 77, 90, 0.25));
        }
        .token-ring-bg {
          stroke: rgba(255, 255, 255, 0.1);
        }
        :root.light .token-ring-bg {
          stroke: rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      <div 
        className="hover-lift relative flex flex-col p-5 rounded-xl overflow-hidden h-full w-full"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-xs text-muted mb-2 shrink-0">Token Usage</p>

        {/* Circular Graph */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full">
          <div className="relative flex items-center justify-center w-full h-full max-w-[110px] max-h-[110px] md:max-w-[130px] md:max-h-[130px] xl:max-w-[155px] xl:max-h-[155px] aspect-square">
            <svg width="100%" height="100%" viewBox="0 0 160 160" className="overflow-visible">
              {/* Outer circle */}
              <circle 
                cx="80" cy="80" r="70" 
                fill="none" 
                strokeWidth="10" 
                className="token-ring-bg"
              />
              {/* Progress circle */}
              <circle 
                cx="80" cy="80" r="70" 
                fill="none" 
                stroke="#ff4d5a" 
                strokeWidth="10" 
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="token-circle-glow"
                style={{
                  transition: 'stroke-dashoffset 1.4s cubic-bezier(0.215, 0.61, 0.355, 1)',
                  transformOrigin: '50% 50%',
                  transform: 'rotate(-90deg)'
                }}
              />
            </svg>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span 
                className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight leading-none"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {animatedRemaining}K
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider text-muted font-medium mt-1 mb-0.5 leading-none">
                Remaining
              </span>
              <span className="text-[10px] md:text-xs font-bold text-[#ff4d5a] leading-none">
                {animatedPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Small Details / Bottom Section */}
        <div className="pt-3 mt-3 shrink-0 space-y-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Today</span>
            <div className="flex items-center gap-1.5">
              <span className="text-foreground font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {animatedToday} Tokens
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Reset</span>
            <div className="flex items-center gap-1.5">
              <span className="text-foreground font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                4h 32m
              </span>
              <Clock size={12} className="text-muted" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
