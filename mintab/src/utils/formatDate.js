const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export const DATE_FORMATS = ['full', 'short', 'numeric']

export function formatDate(date, format = 'full') {
  const d = date.getDate()
  const m = date.getMonth() + 1
  const y = date.getFullYear()

  if (format === 'short') {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }
  if (format === 'numeric') {
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
  }
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  return `${weekday}, ${month} ${ordinal(d)}, ${y}`
}