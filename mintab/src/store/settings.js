import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DEFAULTS = {
  showClock: true,
  clockFormat: '24h',
  showDate: true,
  dateFormat: 'full',
  showWeather: true,
  temperatureUnit: 'C',
  location: 'auto',
  showBookmarks: false,
  expandBookmarks: false,
  bookmarkFolder: 'all',
  useSystemTheme: false,
  themeMode: 'dark',
  useCustomBackground: false,
  backgroundImage: '',
  showSidebar: true,
  sidebarPosition: 'right',
  showCalendar: true,
  showTasks: true,
  keepSidebarExpanded: false,
}

export const CITIES = {
  dhaka: { label: 'Dhaka, Bangladesh', lat: 23.81, lon: 90.41 },
  london: { label: 'London, United Kingdom', lat: 51.51, lon: -0.13 },
  newyork: { label: 'New York, United States', lat: 40.71, lon: -74.01 },
  tokyo: { label: 'Tokyo, Japan', lat: 35.68, lon: 139.69 },
}

export const useSettings = create(
  persist(
    (set) => ({
      settings: DEFAULTS,
      saveSettings: (next) => set({ settings: { ...DEFAULTS, ...next } }),
    }),
    {
      name: 'mintab-settings',
      merge: (persisted, current) => ({
        ...current,
        settings: { ...DEFAULTS, ...(persisted?.settings || {}) },
      }),
    }
  )
)