const BASE = 'https://countapi.mileshilliard.com/api/v1'
const PREFIX = 'mintab-dau' 

export async function pingDailyUser() {
  const today = new Date().toISOString().slice(0, 10) // UTC date
  if (localStorage.getItem('mintab-last-ping') === today) return
  try {
    const res = await fetch(`${BASE}/hit/${PREFIX}-${today}`)
    if (res.ok) localStorage.setItem('mintab-last-ping', today)
  } catch {
  }
}