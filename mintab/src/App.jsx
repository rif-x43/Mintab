import { useState } from 'react'
import Clock from './components/Clock'
import Weather from './components/Weather'
import SettingsButton from './components/SettingsButton'
import SidebarToggle from './components/SidebarToggle'
import Sidebar from './components/Sidebar'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  return (
    <main className="w-screen h-screen bg-[#121212] relative overflow-hidden">
      <Clock />
      <Weather />
      <SettingsButton onClick={() => { setSidebarOpen(false); setSettingsOpen(true) }} />
      <SidebarToggle
        isOpen={sidebarOpen}
        onClick={() => setSidebarOpen(prev => !prev)}
      />
      <Sidebar isOpen={sidebarOpen} />
    </main>
  )
}

export default App