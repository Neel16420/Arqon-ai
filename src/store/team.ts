import { useState, useEffect } from "react"

export type Role = "Super Admin" | "Administrator" | "Admin" | "Manager" | "Developer" | "Analyst" | "Viewer" | string
export type MemberStatus = "online" | "offline" | "invited" | "suspended"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  status: MemberStatus
  department: string
  avatar: string
  avatarUrl?: string
  avatarColor: string
  joined: string
  lastActive: string
  notes?: string
}

export interface ActivityEvent {
  id: string
  type: "invite" | "join" | "role_change" | "remove" | "api_key" | "provider"
  actor: string
  target?: string
  detail: string
  time: string
}

export const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "m1",
    name: "Sahil Desai",
    email: "sahil@arqon.internal",
    role: "Administrator",
    status: "online",
    department: "Engineering",
    avatar: "SD",
    avatarUrl: "/avatars/avatar-1.png",
    avatarColor: "#FF3B3B",
    joined: "Jan 12, 2024",
    lastActive: "Just now",
    notes: "Founder and lead engineer.",
  },
  {
    id: "m2",
    name: "Priya Sharma",
    email: "priya@arqon.internal",
    role: "Manager",
    status: "online",
    department: "Product",
    avatar: "PS",
    avatarUrl: "/avatars/avatar-2.png",
    avatarColor: "#3B82F6",
    joined: "Feb 3, 2024",
    lastActive: "5 min ago",
  },
  {
    id: "m3",
    name: "Arjun Mehta",
    email: "arjun@arqon.internal",
    role: "Developer",
    status: "offline",
    department: "Engineering",
    avatar: "AM",
    avatarUrl: "/avatars/avatar-3.png",
    avatarColor: "#22C55E",
    joined: "Mar 19, 2024",
    lastActive: "2 hrs ago",
  },
  {
    id: "m4",
    name: "Kavya Nair",
    email: "kavya@arqon.internal",
    role: "Developer",
    status: "online",
    department: "Engineering",
    avatar: "KN",
    avatarUrl: "/avatars/avatar-4.png",
    avatarColor: "#F59E0B",
    joined: "Apr 5, 2024",
    lastActive: "12 min ago",
  },
  {
    id: "m5",
    name: "Rahul Verma",
    email: "rahul@arqon.internal",
    role: "Viewer",
    status: "invited",
    department: "Design",
    avatar: "RV",
    avatarUrl: "/avatars/avatar-5.png",
    avatarColor: "#8B5CF6",
    joined: "—",
    lastActive: "—",
  },
  {
    id: "m6",
    name: "Ananya Gupta",
    email: "ananya@arqon.internal",
    role: "Manager",
    status: "offline",
    department: "Operations",
    avatar: "AG",
    avatarUrl: "/avatars/avatar-6.png",
    avatarColor: "#EC4899",
    joined: "May 22, 2024",
    lastActive: "Yesterday",
  },
  {
    id: "m7",
    name: "Vikram Singh",
    email: "vikram@arqon.internal",
    role: "Developer",
    status: "suspended",
    department: "Engineering",
    avatar: "VS",
    avatarUrl: "/avatars/avatar-7.png",
    avatarColor: "#6B7280",
    joined: "Jun 7, 2024",
    lastActive: "3 days ago",
    notes: "Account suspended pending review.",
  },
  {
    id: "m8",
    name: "Meera Patel",
    email: "meera@arqon.internal",
    role: "Developer",
    status: "online",
    department: "Design",
    avatar: "MP",
    avatarUrl: "/avatars/avatar-8.png",
    avatarColor: "#10B981",
    joined: "Jul 14, 2024",
    lastActive: "1 hr ago",
    notes: "Lead UX researcher and interface designer.",
  },
]

export const INITIAL_ACTIVITY: ActivityEvent[] = [
  {
    id: "a1",
    type: "invite",
    actor: "Sahil Desai",
    target: "Rahul Verma",
    detail: "invited Rahul Verma",
    time: "2 min ago",
  },
  {
    id: "a2",
    type: "api_key",
    actor: "Priya Sharma",
    detail: "updated OpenAI API key",
    time: "18 min ago",
  },
  {
    id: "a3",
    type: "role_change",
    actor: "Sahil Desai",
    target: "Kavya Nair",
    detail: "changed Kavya's role to Developer",
    time: "1 hr ago",
  },
  {
    id: "a4",
    type: "provider",
    actor: "Arjun Mehta",
    detail: "added Anthropic provider",
    time: "3 hrs ago",
  },
  {
    id: "a5",
    type: "join",
    actor: "Kavya Nair",
    detail: "joined the team",
    time: "Apr 5, 2024",
  },
  {
    id: "a6",
    type: "remove",
    actor: "Sahil Desai",
    target: "Old Member",
    detail: "removed a member",
    time: "Apr 2, 2024",
  },
  {
    id: "a7",
    type: "join",
    actor: "Arjun Mehta",
    detail: "joined the team",
    time: "Mar 19, 2024",
  },
]

type Listener = () => void
let currentMembers: TeamMember[] = [...INITIAL_MEMBERS]
let currentActivity: ActivityEvent[] = [...INITIAL_ACTIVITY]
const listeners = new Set<Listener>()

const emit = () => {
  listeners.forEach((l) => l())
}

export const teamStore = {
  getMembers: () => currentMembers,
  setMembers: (updater: TeamMember[] | ((prev: TeamMember[]) => TeamMember[])) => {
    currentMembers = typeof updater === "function" ? updater(currentMembers) : updater
    emit()
  },
  getActivity: () => {
    // If all members are removed, activity timeline should also clear or reflect active members
    if (currentMembers.length === 0) return []
    return currentActivity
  },
  setActivity: (updater: ActivityEvent[] | ((prev: ActivityEvent[]) => ActivityEvent[])) => {
    currentActivity = typeof updater === "function" ? updater(currentActivity) : updater
    emit()
  },
  reset: () => {
    currentMembers = [...INITIAL_MEMBERS]
    currentActivity = [...INITIAL_ACTIVITY]
    emit()
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

export function useTeamStore() {
  const [members, setMembersLocal] = useState(teamStore.getMembers())

  useEffect(() => {
    return teamStore.subscribe(() => {
      setMembersLocal(teamStore.getMembers())
    })
  }, [])

  return [members, teamStore.setMembers] as const
}

export function useTeamActivity() {
  const [events, setEventsLocal] = useState(teamStore.getActivity())

  useEffect(() => {
    return teamStore.subscribe(() => {
      setEventsLocal(teamStore.getActivity())
    })
  }, [])

  return [events, teamStore.setActivity] as const
}
