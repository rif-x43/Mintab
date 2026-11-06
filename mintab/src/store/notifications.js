import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const URL = 'https://gist.githubusercontent.com/samiya-akhter/7669c5e065931d8698e14a4d3c5bc9e7/raw/notifications.json'
const INTERVAL = 1 * 60 * 1000

export const useNotifications = create(
  persist(
    (set, get) => ({
      items: [],
      seen: [],
      lastFetch: 0,
      fetchNotifications: async (force = false) => {
        if (!force && Date.now() - get().lastFetch < INTERVAL) return
        try {
          const res = await fetch(`${URL}?t=${Date.now()}`, { cache: 'no-store' })
          if (!res.ok) return
          const json = await res.json()
          if (Array.isArray(json.notifications)) {
            set({ items: json.notifications, lastFetch: Date.now() })
          }
        } catch {
          
        }
      },
      markAllRead: () => set({ seen: get().items.map((n) => n.id) }),
    }),
    { name: 'mintab-notifications' }
  )
)

export const useHasUnread = () =>
  useNotifications((s) => s.items.some((n) => !s.seen.includes(n.id)))