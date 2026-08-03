import React from "react"

export function SkelBox({
  className = "",
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`skel-box skel-shimmer ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}
