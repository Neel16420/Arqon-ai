import { useState } from 'react'
import {
  Bell,
  CheckCheck,
  Shield,
  Zap,
  Info,
  AlertTriangle,
  Trash2,
} from 'lucide-react'

export interface UserNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'alert'
  timestamp: string
  isRead: boolean
}

const INITIAL_NOTIFICATIONS: UserNotification[] = [
  {
    id: 'n-1',
    title: 'API Rate Limit Warning',
    message: 'Your production API key reached 85% of its monthly token ceiling (4.25M / 5.0M tokens).',
    type: 'warning',
    timestamp: '5 minutes ago',
    isRead: false,
  },
  {
    id: 'n-2',
    title: 'New Model Released: DeepSeek R1',
    message: 'DeepSeek R1 reasoning engine is now available for high-speed chain-of-thought execution.',
    type: 'success',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: 'n-3',
    title: 'Security Login from New IP',
    message: 'Successful session authentication detected from Chrome (192.168.1.100).',
    type: 'info',
    timestamp: '3 hours ago',
    isRead: true,
  },
  {
    id: 'n-4',
    title: 'Monthly Subscription Renewed',
    message: 'Pro Tier subscription renewed successfully for $49/month.',
    type: 'success',
    timestamp: 'Yesterday',
    isRead: true,
  },
]

export default function NotificationsCenter() {
  const [notifs, setNotifs] = useState<UserNotification[]>(INITIAL_NOTIFICATIONS)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifs = notifs.filter((n) => (filter === 'unread' ? !n.isRead : true))

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const markRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const deleteNotif = (id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id))
  }

  const getNotifIcon = (type: UserNotification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-400" />
      case 'success':
        return <Zap size={18} className="text-emerald-400" />
      case 'info':
        return <Info size={18} className="text-blue-400" />
      case 'alert':
        return <Shield size={18} className="text-accent" />
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-page-enter max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Bell className="text-accent" size={24} />
            Notification Center
          </h1>
          <p className="text-xs text-muted mt-1">
            System alerts, API quota notifications, and workspace updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-2 hover:bg-surface border border-border text-foreground transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck size={14} className="text-emerald-400" />
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-surface glass-border rounded-xl p-2 flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-accent text-white shadow'
              : 'text-muted hover:text-foreground hover:bg-surface-2'
          }`}
        >
          All ({notifs.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-accent text-white shadow'
              : 'text-muted hover:text-foreground hover:bg-surface-2'
          }`}
        >
          Unread ({notifs.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* Notifications Feed */}
      {filteredNotifs.length === 0 ? (
        <div className="glass-surface glass-border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <Bell size={36} className="text-muted/60" />
          <h3 className="text-base font-bold text-foreground">No Notifications</h3>
          <p className="text-xs text-muted">You are all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => markRead(item.id)}
              className={`group p-4 rounded-2xl transition-all cursor-pointer border flex items-start gap-4 ${
                !item.isRead
                  ? 'glass-surface glass-border border-l-4 border-l-accent shadow-md'
                  : 'glass-surface/60 border-border opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0 mt-0.5">
                {getNotifIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono text-muted shrink-0">
                    {item.timestamp}
                  </span>
                </div>

                <p className="text-xs text-muted mt-1 leading-relaxed">{item.message}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteNotif(item.id)
                }}
                className="p-1 rounded text-muted hover:text-accent transition-colors cursor-pointer shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
