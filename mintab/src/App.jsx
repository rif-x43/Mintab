import { useState } from 'react'
import Clock from './components/Clock'
import Weather from './components/Weather'
import SettingsButton from './components/SettingsButton'
import SidebarToggle from './components/SidebarToggle'
import Sidebar from './components/Sidebar'
import Settings from './components/Settings'
import { useSettings } from './store/settings'
import { useTheme } from './hooks/useTheme'

function App() {
  useTheme()
  const { useCustomBackground, backgroundImage } = useSettings((s) => s.settings)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <main className="w-screen h-screen bg-bg relative overflow-hidden">
      {useCustomBackground && backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-bg/40" />
        </>
      )}
      <Clock />
      <Weather />
      <SettingsButton onClick={() => { setSidebarOpen(false); setSettingsOpen(true) }} />
      <SidebarToggle isOpen={sidebarOpen} onClick={() => setSidebarOpen((p) => !p)} />
      <Sidebar isOpen={sidebarOpen} />
      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </main>
  )
}

export default App