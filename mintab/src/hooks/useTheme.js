import { useEffect, useState } from 'react'
import { useSettings } from '../store/settings'

export function useTheme() {
  const { useSystemTheme, themeMode } = useSettings((s) => s.settings)
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const theme = useSystemTheme ? (systemDark ? 'dark' : 'light') : themeMode

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}