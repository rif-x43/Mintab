const hasChrome = typeof chrome !== 'undefined' && chrome.storage?.local

export const storage = {
  async get(key) {
    if (hasChrome) return (await chrome.storage.local.get(key))[key]
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : undefined
  },
  async set(key, value) {
    if (hasChrome) return chrome.storage.local.set({ [key]: value })
    localStorage.setItem(key, JSON.stringify(value))
  },
}