import type React from "react"

import { useState } from "react"

import { motion, AnimatePresence } from "framer-motion"

import {
  X,
  LayoutDashboard,
  Server,
  FileText,
  Settings,
  Activity,
  Layers,
  GitBranch,
  BarChart2,
  Key,
  Terminal,
  Users,
  Shield,
  Sliders,
  ClipboardList,
  History,
} from "lucide-react"

import { cn } from "../utils"
import { useAuth } from "../hooks/useAuth"

export type Page = "overview" | "providers" | "logs" | "settings" | "requests" | "models" | "routing" | "analytics" | "api-keys" | "playground" | "team" | "roles" | "limits" | "audit-logs" | "timeline"

interface NavItem {
  id: Page

  label: string

  icon: React.ReactNode

  badge?: number | string
}

interface NavSection {
  title: string

  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "Main",

    items: [
      {
        id: "overview",
        label: "Overview",
        icon: <LayoutDashboard size={18} />,
      },

      { id: "analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
    ],
  },

  {
    title: "Orchestration",

    items: [
      { id: "models", label: "Models", icon: <Layers size={18} /> },

      { id: "providers", label: "Providers", icon: <Server size={18} /> },

      { id: "routing", label: "Routing", icon: <GitBranch size={18} /> },

      { id: "playground", label: "Playground", icon: <Terminal size={18} /> },
    ],
  },

  {
    title: "System",

    items: [
      {
        id: "requests",
        label: "Requests",
        icon: <Activity size={18} />,
        badge: 3,
      },

      { id: "logs", label: "Logs", icon: <FileText size={18} />, badge: 12 },

      { id: "api-keys", label: "API Keys", icon: <Key size={18} /> },

      { id: "team", label: "Team", icon: <Users size={18} /> },

      { id: "settings", label: "Settings", icon: <Settings size={18} /> },
    ],
  },

  {
    title: "Enterprise",

    items: [
      { id: "roles", label: "Roles & Perms", icon: <Shield size={18} /> },

      { id: "limits", label: "Usage Limits", icon: <Sliders size={18} /> },

      { id: "audit-logs", label: "Audit Logs", icon: <ClipboardList size={18} /> },

      { id: "timeline", label: "Timeline", icon: <History size={18} /> },
    ],
  },
]


function ArqonLogo({
  compact,
  onToggle,
}: {
  compact: boolean
  onToggle?: () => void
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-5 shrink-0 transition-all overflow-hidden",
        compact ? "justify-center" : "",
      )}
      style={{ borderBottom: "1px solid var(--color-sidebar-border-right)" }}
    >
      {/* Logo icon — doubles as the desktop collapse toggle */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96, transition: { duration: 0.12 } }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        title={compact ? "Expand sidebar" : "Collapse sidebar"}
        className="shrink-0 flex items-center justify-center rounded-lg relative hidden md:flex"
        style={{
          width: "32px",

          height: "32px",

          cursor: "pointer",

          background: "rgb(var(--color-accent-rgb) / 0.08)",

          border: "1px solid rgb(var(--color-accent-rgb) / 0.18)",

          boxShadow: "0 0 10px rgb(var(--color-accent-rgb) / 0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 0 18px rgb(var(--color-accent-rgb) / 0.25), 0 0 6px rgb(var(--color-accent-rgb) / 0.1)"

          e.currentTarget.style.borderColor =
            "rgb(var(--color-accent-rgb) / 0.35)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow =
            "0 0 10px rgb(var(--color-accent-rgb) / 0.1)"

          e.currentTarget.style.borderColor =
            "rgb(var(--color-accent-rgb) / 0.18)"
        }}
      >
        <img
          src="/logo/arqon-logo.png"
          alt="Arqon"
          style={{
            width: "26px",
            height: "26px",
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
      </motion.button>

      {/* Non-interactive logo for mobile (mobile uses the X close button) */}
      <div
        className="shrink-0 flex items-center justify-center rounded-lg md:hidden"
        style={{
          width: "32px",

          height: "32px",

          background: "rgb(var(--color-accent-rgb) / 0.08)",

          border: "1px solid rgb(var(--color-accent-rgb) / 0.18)",

          boxShadow: "0 0 10px rgb(var(--color-accent-rgb) / 0.1)",
        }}
      >
        <img
          src="/logo/arqon-logo.png"
          alt="Arqon"
          style={{ width: "26px", height: "26px", objectFit: "contain" }}
        />
      </div>

      <AnimatePresence initial={false}>
        {!compact && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col whitespace-nowrap"
          >
            <span
              className="text-[15px] font-bold tracking-tight leading-tight"
              style={{
                color: "var(--color-sidebar-text-active)",

                fontFamily: "'Space Grotesk', sans-serif",

                letterSpacing: "-0.02em",
              }}
            >
              ARQON
            </span>
            <span
              className="font-semibold leading-tight"
              style={{
                color: "var(--color-sidebar-text-inactive)",

                fontFamily: "'Inter', sans-serif",

                fontSize: "10px",

                letterSpacing: "0.06em",

                textTransform: "uppercase",
              }}
            >
              Orchestration Engine
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Tooltip({
  children,
  label,
  disabled,
}: {
  children: React.ReactNode
  label: string
  disabled: boolean
}) {
  const [show, setShow] = useState(false)

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => !disabled && setShow(true)}
      onMouseLeave={() => !disabled && setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && !disabled && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-[calc(100%+8px)] z-50 whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium glass-surface glass-border glass-shadow"
            style={{
              color: "var(--color-sidebar-text-active)",

              fontFamily: "'Inter', sans-serif",
            }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface SidebarProps {
  activePage: Page

  setActivePage: (p: Page) => void

  open: boolean

  onClose: () => void

  isCollapsed?: boolean

  onToggleCollapse?: () => void
}

export default function Sidebar({
  activePage,

  setActivePage,

  open,

  onClose,

  isCollapsed = false,

  onToggleCollapse,
}: SidebarProps) {
  const { session } = useAuth()

  const handleNav = (page: Page, e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()

    setActivePage(page)

    onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden glass-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 64 : 224 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 flex flex-col overflow-hidden shrink-0",

          "md:translate-x-0 w-64 md:w-auto", // Overridden by motion inline style on desktop

          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        style={{
          background: "var(--color-sidebar-bg)",

          borderRight: "1px solid var(--color-sidebar-border-right)",
        }}
      >
        {/* Close button on mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-foreground md:hidden z-50"
          style={{ background: "var(--color-surface-2)" }}
        >
          <X size={14} />
        </button>

        <ArqonLogo compact={isCollapsed} onToggle={onToggleCollapse} />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 py-4 scrollbar-hide">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="px-3 flex flex-col gap-0.5">
              {/* Section Header */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-3 pb-2 pt-1 uppercase tracking-widest text-[10px] font-bold text-muted/60 select-none whitespace-nowrap"
                  >
                    {section.title}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Items */}
              {section.items.map((item) => {
                const active = activePage === item.id

                return (
                  <Tooltip
                    key={item.id}
                    label={item.label}
                    disabled={!isCollapsed}
                  >
                    <button
                      onClick={(e) => handleNav(item.id, e)}
                      className={cn(
                        "relative w-full flex items-center rounded-lg text-sm group transition-colors duration-200 overflow-hidden",

                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",

                        active
                          ? "nav-item-active font-semibold"
                          : "text-muted hover:text-foreground hover:bg-[var(--color-sidebar-item-hover-bg)]",

                        isCollapsed
                          ? "justify-center px-0 py-2.5"
                          : "px-3 py-2.5 gap-3",
                      )}
                    >
                      {/* Active Indicator */}
                      {active && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 rounded-lg pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(90deg, rgba(var(--color-accent-rgb)/0.15) 0%, rgba(var(--color-accent-rgb)/0) 100%)",

                            boxShadow: "inset 1px 0 0 0 var(--color-accent)",
                          }}
                          transition={{ duration: 0.2 }}
                        />
                      )}

                      <span
                        className={cn(
                          "relative z-10 transition-all duration-300 flex-shrink-0 flex items-center justify-center",

                          active
                            ? "nav-icon-active"
                            : "group-hover:text-foreground group-hover:scale-110",

                          // Subtly rotate the active icon if specified by requirements

                          active &&
                            "rotate-[-4deg] scale-110 drop-shadow-[0_0_8px_rgba(var(--color-accent-rgb)/0.5)]",
                        )}
                        style={{ width: 18, height: 18 }}
                      >
                        {item.icon}
                      </span>

                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="relative z-10 font-medium truncate flex-1 text-left whitespace-nowrap"
                            style={{
                              fontFamily: "'Inter', sans-serif",

                              fontSize: "13px",
                            }}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      <AnimatePresence initial={false}>
                        {!isCollapsed && item.badge && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative z-10 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-accent bg-accent/10 whitespace-nowrap"
                          >
                            {item.badge}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Small badge dot for collapsed mode */}
                      {isCollapsed && item.badge && (
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      )}
                    </button>
                  </Tooltip>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Account */}
        <div
          className="p-3 shrink-0"
          style={{ borderTop: "1px solid var(--color-sidebar-border-right)" }}
        >
          <div
            className={cn(
              "flex items-center rounded-lg cursor-pointer transition-colors hover:bg-[var(--color-sidebar-item-hover-bg)]",

              isCollapsed ? "justify-center p-1" : "gap-3 px-2 py-1.5",
            )}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-accent shrink-0 relative group-hover:drop-shadow-[0_0_8px_rgba(var(--color-accent-rgb)/0.3)] transition-all overflow-hidden"
              style={{
                background: "rgb(var(--color-accent-rgb) / 0.1)",

                border: "1px solid rgb(var(--color-accent-rgb) / 0.2)",

                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {session.userAvatar ? (
                <img src={session.userAvatar} alt={session.userName} className="w-full h-full object-cover rounded-lg" />
              ) : (
                session.userName ? session.userName.slice(0, 2).toUpperCase() : "AD"
              )}
            </div>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="min-w-0 flex-1 whitespace-nowrap overflow-hidden"
                >
                  <p
                    className="text-[13px] font-medium truncate"
                    style={{ color: "var(--color-sidebar-text-active)" }}
                  >
                    {session.userName || "Administrator"}
                  </p>
                  <p
                    className="text-[10px] truncate"
                    style={{
                      color: "var(--color-sidebar-text-inactive)",

                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {session.userEmail || "admin@arqon.internal"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
