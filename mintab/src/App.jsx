import { useState, useEffect } from 'react'
import Clock from './components/Clock'
import Weather from './components/Weather'
import SettingsButton from './components/SettingsButton'
import SidebarToggle from './components/SidebarToggle'
import Sidebar from './components/Sidebar'
import Settings from './components/Settings'
import { useSettings } from './store/settings'
import { useTheme } from './hooks/useTheme'
import iconWhite from './assets/icon_white.svg'
import iconBlack from './assets/icon_black.svg'
import Bookmarks from './components/Bookmarks'

function App() {
  useTheme()
  const {
    useCustomBackground, backgroundImage, backgroundShade,
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
          <div
            className="absolute inset-0 bg-bg transition-opacity duration-300"
            style={{ opacity: backgroundShade / 100 }}
          />
        </>
      )}
      {/* Watermark */}
      <img
        src={iconWhite}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-38 -bottom-36 w-96 select-none opacity-[0.01] light:hidden"
      />
      <img
        src={iconBlack}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-38 -bottom-36 hidden w-96 select-none opacity-[0.04] light:block"
      />
      <Clock shifted={settingsOpen} />
      <Weather />
      <Bookmarks />
      <SettingsButton onClick={() => { setSidebarOpen(false); setSettingsOpen((p) => !p) }} />
      {showSidebar && (
        <>
          <SidebarToggle isOpen={sidebarOpen} onClick={() => { setSettingsOpen(false); setSidebarOpen((p) => !p) }} position={sidebarPosition} />
          <Sidebar isOpen={sidebarOpen} />
        </>
      )}
      <Settings
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false)
          if (keepSidebarExpanded) setSidebarOpen(true)
        }}
      />
    </main>
  )
}

export default App