import { useState, useEffect } from 'react'
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
  const {
    useCustomBackground, backgroundImage,
    showSidebar, sidebarPosition, keepSidebarExpanded,
  } = useSettings((s) => s.settings)
  const [sidebarOpen, setSidebarOpen] = useState(keepSidebarExpanded)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    if (keepSidebarExpanded) setSidebarOpen(true)
  }, [keepSidebarExpanded])

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
      {showSidebar && (
        <>
          <SidebarToggle isOpen={sidebarOpen} onClick={() => setSidebarOpen((p) => !p)} position={sidebarPosition} />
          <Sidebar isOpen={sidebarOpen} />
        </>
      )}
      {settingsOpen && (
        <Settings
          onClose={() => {
            setSettingsOpen(false)
            if (keepSidebarExpanded) setSidebarOpen(true)
          }}
        />
      )}
    </main>
  )
}

export default App