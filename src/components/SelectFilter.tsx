import { useState, useMemo, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"

export interface SelectOption {
  value: string
  label: string
}

export function SelectFilter({
  value,
  onChange,
  options,
  placeholder = "Select",
  showAllOption = true,
  allValue = "",
  className = "",
  style,
}: {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  showAllOption?: boolean
  allValue?: string
  className?: string
  style?: React.CSSProperties
}) {
  const [open, setOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState<number>(-1)
  const ref = useRef<HTMLDivElement>(null)

  const allOptions = useMemo(
    () => (showAllOption ? [{ value: allValue, label: placeholder }, ...options] : options),
    [showAllOption, placeholder, options, allValue]
  )

  const currentLabel = useMemo(() => {
    const found = options.find((o) => o.value === value)
    return found ? found.label : placeholder
  }, [value, options, placeholder])

  useEffect(() => {
    if (!open) return
    const currentIdx = allOptions.findIndex((o) => o.value === value)
    setHighlightIdx(currentIdx >= 0 ? currentIdx : 0)

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlightIdx((prev) => (prev + 1) % allOptions.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlightIdx((prev) => (prev - 1 + allOptions.length) % allOptions.length)
      } else if (e.key === "Enter" && open) {
        e.preventDefault()
        setHighlightIdx((idx) => {
          if (idx >= 0 && idx < allOptions.length) {
            const selectedOpt = allOptions[idx]
            if (selectedOpt !== undefined) onChange(selectedOpt.value)
          }
          return idx
        })
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, value, allOptions, onChange])

  return (
    <div ref={ref} className={`relative select-none shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-2.5 h-9 px-3.5 rounded-xl text-xs transition-all duration-200 border cursor-pointer hover-lift group w-full"
        style={{
          background: open ? "var(--color-surface-2)" : "var(--color-surface)",
          border: (value && value !== allValue) || open ? "1.5px solid rgba(255, 59, 59, 0.55)" : "1px solid var(--color-border)",
          boxShadow: open ? "0 4px 16px rgba(255, 59, 59, 0.12)" : "none",
          color: (value && value !== allValue) || !showAllOption ? "var(--color-foreground)" : "var(--color-muted)",
          fontFamily: "'Space Grotesk', sans-serif",
          ...style,
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="font-medium truncate max-w-[140px]">{currentLabel}</span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-muted group-hover:text-foreground transition-transform duration-[180ms] ${
            open ? "rotate-180 text-[#FF3B3B]" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown Menu using transform + opacity strictly */}
      <div
        className={`absolute left-0 top-[calc(100%+6px)] z-50 min-w-[160px] rounded-xl overflow-hidden glass-surface glass-border glass-shadow p-1 transition-all duration-[180ms] ease-out origin-top ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-[0.97] -translate-y-2 pointer-events-none"
        }`}
        style={{ background: "var(--color-surface)", backdropFilter: "blur(16px)" }}
        role="listbox"
      >
        {allOptions.map((o, idx) => {
          const isSelected = o.value === value
          const isHighlighted = idx === highlightIdx
          return (
            <div
              key={o.value}
              role="option"
              aria-selected={isSelected}
              onMouseEnter={() => setHighlightIdx(idx)}
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
              className="flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors duration-150"
              style={{
                background: isSelected
                  ? "rgba(255, 59, 59, 0.12)"
                  : isHighlighted
                  ? "var(--color-surface-2)"
                  : "transparent",
                color: isSelected
                  ? "#FF3B3B"
                  : isHighlighted
                  ? "var(--color-foreground)"
                  : "var(--color-muted)",
                fontFamily: isSelected ? "'Space Grotesk', sans-serif" : "'Inter', sans-serif",
                fontWeight: isSelected ? 600 : 400,
              }}
            >
              <span className="truncate">{o.label}</span>
              {isSelected && <Check size={12} className="text-[#FF3B3B] shrink-0 ml-2" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
