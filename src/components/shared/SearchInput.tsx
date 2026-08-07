import { useState, useRef } from "react"
import { Search, X } from "lucide-react"

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  style,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasText = value.length > 0
  const isFloat = focused || hasText

  return (
    <div
      className={`relative h-9 rounded-xl transition-all duration-200 ease-out flex items-center px-3 gap-2.5 shrink-0 select-none ${
        focused ? "w-full sm:w-[280px]" : "w-full sm:w-64"
      } ${className}`}
      style={{
        background: "var(--color-surface-2)",
        border: focused ? "1.5px solid rgba(255, 59, 59, 0.75)" : "1px solid var(--color-border)",
        boxShadow: focused ? "0 0 14px 1px rgba(255, 59, 59, 0.35)" : "none",
        ...style,
      }}
    >
      <Search
        size={14}
        className={`shrink-0 transition-all duration-200 pointer-events-none transform ${
          focused ? "scale-[1.15] text-[#FF3B3B]" : "scale-100 text-muted"
        }`}
      />
      <div className="relative flex-1 h-full flex items-center overflow-visible">
        <label
          onClick={() => inputRef.current?.focus()}
          className={`absolute left-0 transition-all duration-200 pointer-events-none truncate select-none z-10 ${
            isFloat
              ? "-translate-y-[18px] text-[9px] font-semibold text-[#FF3B3B] opacity-95 tracking-wider uppercase px-1.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)]"
              : "translate-y-0 text-xs text-muted opacity-100"
          }`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {placeholder}
        </label>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onChange("")
              inputRef.current?.blur()
            }
          }}
          className="no-global-input-style w-full h-full bg-transparent text-xs text-foreground outline-none border-none pr-6 transition-colors"
          style={{ border: "none", boxShadow: "none", outline: "none", background: "transparent" }}
          aria-label={placeholder}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          onChange("")
          inputRef.current?.focus()
        }}
        className={`absolute right-2.5 p-1 rounded-md text-muted hover:text-foreground transition-all duration-150 ${
          hasText ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-75 pointer-events-none"
        }`}
        aria-label="Clear search"
      >
        <X size={12} />
      </button>
    </div>
  )
}
