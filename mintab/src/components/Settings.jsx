import { useState, useEffect, useRef } from 'react'
import { useSettings, DEFAULTS, CITIES } from '../store/settings'
import { formatDate, DATE_FORMATS } from '../utils/formatDate'
import { useBookmarks, folderOptions } from './Bookmarks'
import iconWhite from '../assets/appicon_white.svg'
import iconBlack from '../assets/appicon_black.svg'
import NotificationsView from './NotificationsView'
import { useNotifications, useHasUnread } from '../store/notifications'

const TABS = ['General', 'Appearance', 'Sidebar', 'Backup', 'About']

/* ---------- small UI pieces ---------- */

function Checkbox({ checked, onChange }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center cursor-pointer border border-fg transition-colors
        ${checked ? 'bg-fg' : 'bg-item'}`}
    >
      {checked && (
        <svg className="w-3 h-3 text-card" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

function Segmented({ value, options, onChange }) {
  return (
    <div className="w-[104px] h-6 bg-card rounded-[5px] p-0.5 flex">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-[3px] text-base leading-none cursor-pointer transition-colors
            ${value === o.value ? 'bg-fg text-bg' : 'text-fg'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function SelectBox({ value, options, onChange }) {
  return (
    <div className="relative w-64 h-6 bg-card rounded-[5px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full appearance-none bg-transparent text-right pr-2 pl-6 text-base text-fg cursor-pointer outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-card text-fg">
            {o.label}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute left-1.5 top-1.5 w-3 h-3 text-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    </div>
  )
}

// A label row. `sub` indents it, `dim` fades + disables it.
function Row({ label, sub, dim, children }) {
  return (
    <div className={`flex items-center justify-between h-7 text-lg text-fg ${sub ? 'pl-8' : ''} ${dim ? 'opacity-60 pointer-events-none' : ''}`}>
      <span>{label}</span>
      {children}
    </div>
  )
}

/* ---------- General tab ---------- */

function GeneralTab({ draft, set }) {
  const roots = useBookmarks()
  const now = new Date()
  const locationOptions = [
    { value: 'auto', label: 'Use device location' },
    ...Object.entries(CITIES).map(([k, c]) => ({ value: k, label: c.label })),
  ]
  const dateOptions = DATE_FORMATS.map((f) => ({ value: f, label: formatDate(now, f) }))

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Row label="Show Clock">
          <Checkbox checked={draft.showClock} onChange={(v) => set('showClock', v)} />
        </Row>
        <Row label="Clock Format" sub dim={!draft.showClock}>
          <Segmented
            value={draft.clockFormat}
            onChange={(v) => set('clockFormat', v)}
            options={[{ value: '24h', label: '24h' }, { value: '12h', label: '12h' }]}
          />
        </Row>
      </div>

      <div>
        <Row label="Show Date">
          <Checkbox checked={draft.showDate} onChange={(v) => set('showDate', v)} />
        </Row>
        <Row label="Date Format" sub dim={!draft.showDate}>
          <SelectBox value={draft.dateFormat} options={dateOptions} onChange={(v) => set('dateFormat', v)} />
        </Row>
      </div>

      <div>
        <Row label="Show Weather">
          <Checkbox checked={draft.showWeather} onChange={(v) => set('showWeather', v)} />
        </Row>
        <Row label="Unit of Temperature" sub dim={!draft.showWeather}>
          <Segmented
            value={draft.temperatureUnit}
            onChange={(v) => set('temperatureUnit', v)}
            options={[{ value: 'C', label: '°C' }, { value: 'F', label: '°F' }]}
          />
        </Row>
        <Row label="Use Your Location" sub dim={!draft.showWeather}>
          <SelectBox value={draft.location} options={locationOptions} onChange={(v) => set('location', v)} />
        </Row>
      </div>

      <div>
        <Row label="Show Bookmarks">
          <Checkbox checked={draft.showBookmarks} onChange={(v) => set('showBookmarks', v)} />
        </Row>
        <Row label="Select Folder" sub dim={!draft.showBookmarks}>
          <SelectBox
            value={draft.bookmarkFolder}
            onChange={(v) => set('bookmarkFolder', v)}
            options={[{ value: 'all', label: 'All Bookmarks' }, ...folderOptions(roots)]}
          />
        </Row>
        <Row label="Expand Bookmarks by Default" sub dim={!draft.showBookmarks}>
          <Checkbox checked={draft.expandBookmarks} onChange={(v) => set('expandBookmarks', v)} />
        </Row>
      </div>
    </div>
  )
}

/* ---------- Appearance tab ---------- */

// Resize + compress so it fits in localStorage
function fileToDataUrl(file, maxSize = 1920) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = reject
    img.src = url
  })
}

const SunIcon = (
  <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="4" />
    <path strokeLinecap="round" d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4l1.4-1.4" />
  </svg>
)
const MoonIcon = (
  <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
  </svg>
)

// Image icon — more semantic than a bare arrow
const ImageUploadIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinejoin="round" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
  </svg>
)

function AppearanceTab({ draft, set }) {
  const fileRef = useRef(null)

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      set('backgroundImage', await fileToDataUrl(file))
      set('useCustomBackground', true)
    } catch {
      /* ignore invalid image */
    }
  }

  const removeImage = () => {
    set('backgroundImage', '')
    set('useCustomBackground', false)
  }

  const hasImage = !!draft.backgroundImage

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Row label="Use System Theme">
          <Checkbox checked={draft.useSystemTheme} onChange={(v) => set('useSystemTheme', v)} />
        </Row>
        <Row label="Custom Theme Mode" sub dim={draft.useSystemTheme}>
          <Segmented
            value={draft.themeMode}
            onChange={(v) => set('themeMode', v)}
            options={[{ value: 'light', label: SunIcon }, { value: 'dark', label: MoonIcon }]}
          />
        </Row>
      </div>

      <div>
        <Row label="Use Custom Background">
          <Checkbox
            checked={draft.useCustomBackground}
            onChange={(v) => {
              set('useCustomBackground', v)
              if (!v) set('backgroundImage', '')
            }}
          />
        </Row>

        {/* Sub-rows grouped with breathing room */}
        <div className="flex flex-col gap-2 mt-1">
          <Row label="Background Image" sub dim={!draft.useCustomBackground}>
            <div className="flex items-center gap-2">
              {hasImage && (
                <div className="relative w-[72px] h-10 rounded-[5px] overflow-hidden group">
                  <img src={draft.backgroundImage} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Remove background image"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-10 px-3 bg-card rounded-[5px] flex items-center gap-2 text-base cursor-pointer hover:opacity-80 transition-opacity"
                aria-label="Upload background image"
              >
                {ImageUploadIcon}
                <span>{hasImage ? 'Replace' : 'Upload'}</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
            </div>
          </Row>

          <Row label="Background Shade" sub dim={!draft.useCustomBackground || !hasImage}>
            <div className="flex h-6 bg-card rounded-[5px] p-0.5 gap-0.5">
              {[0, 20, 40, 60, 80].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('backgroundShade', v)}
                  className={`w-12 pt-1 rounded-[3px] text-base leading-none cursor-pointer transition-colors
                    ${draft.backgroundShade === v ? 'bg-fg text-bg' : 'text-fg hover:opacity-80'}`}
                >
                  {v}%
                </button>
              ))}
            </div>
          </Row>
        </div>
      </div>
    </div>
  )
}

/* ---------- Sidebar tab ---------- */

function SidebarTab({ draft, set }) {
  const off = !draft.showSidebar
  return (
    <div className="flex flex-col gap-10">
      <div>
        <Row label="Show Sidebar">
          <Checkbox checked={draft.showSidebar} onChange={(v) => set('showSidebar', v)} />
        </Row>
        <Row label="Sidebar Position" sub dim={off}>
          <Segmented
            value={draft.sidebarPosition}
            onChange={(v) => set('sidebarPosition', v)}
            options={[{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }]}
          />
        </Row>
      </div>

      <div>
        <Row label="Widgets" dim={off} />
        <Row label="Calendar" sub dim={off}>
          <Checkbox checked={draft.showCalendar} onChange={(v) => set('showCalendar', v)} />
        </Row>
        <Row label="Tasks" sub dim={off}>
          <Checkbox checked={draft.showTasks} onChange={(v) => set('showTasks', v)} />
        </Row>
      </div>

      <Row label="Keep Sidebar Expanded" dim={off}>
        <Checkbox checked={draft.keepSidebarExpanded} onChange={(v) => set('keepSidebarExpanded', v)} />
      </Row>
    </div>
  )
}

/* ---------- Backup tab ---------- */

function BackupTab({ saved, onImport }) {
  const fileRef = useRef(null)
  const [msg, setMsg] = useState(null)

  const download = () => {
    const data = { app: 'mintab', version: 1, settings: saved }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mintab-settings.json'
    a.click()
    URL.revokeObjectURL(url)
    setMsg({ ok: true, text: 'Settings downloaded.' })
  }

  const upload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const json = JSON.parse(await file.text())
      const incoming = json.settings ?? json
      const clean = {}
      // Keep only known keys with the right type
      for (const key of Object.keys(DEFAULTS)) {
        if (typeof incoming[key] === typeof DEFAULTS[key]) clean[key] = incoming[key]
      }
      if (Object.keys(clean).length === 0) throw new Error('empty')
      onImport(clean)
      setMsg({ ok: true, text: 'Settings restored and applied.' })
    } catch {
      setMsg({ ok: false, text: 'Invalid settings file.' })
    }
  }

  const btn = 'w-[100px] h-10 bg-card rounded-[5px] flex items-center justify-center cursor-pointer hover:opacity-80'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-lg">
        <span>Upload User Settings</span>
        <button type="button" onClick={() => fileRef.current?.click()} className={btn} aria-label="Upload settings file">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
          </svg>
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={upload} className="hidden" />
      </div>

      <div className="flex items-center justify-between text-lg">
        <span>Download User Settings</span>
        <button type="button" onClick={download} className={btn} aria-label="Download settings file">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
          </svg>
        </button>
      </div>

      {msg && (
        <p className={`text-base ${msg.ok ? 'opacity-60' : 'text-red-400'}`}>{msg.text}</p>
      )}
    </div>
  )
}

/* ---------- About tab ---------- */

const VERSION = '1.0.1'

// Leave a url empty and its icon shows dimmed and unclickable
const LINKS = [
  {
    label: 'GitHub',
    url: 'https://github.com/rif-x43/Mintab',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />,
  },
  {
    label: 'Chrome Web Store',
    url: '',
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 9.5A5 5 0 1017 12h-5" />
      </>
    ),
  },
  {
    label: 'Google Drive',
    url: 'https://drive.google.com/drive/folders/1-Z7XUCSqu7UbEFpvcFSlp0QiO1KlpGT3',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8l6 10-4 8H6l-4-8L8 3zm0 0l8 14m0-14L8 17m-6-4h20" />,
  },
  {
    label: 'Website',
    url: '',
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </>
    ),
  },
]

function AboutTab() {
  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-5">
        <p className="text-lg">About Us?</p>
        <div className="flex items-end gap-2">
          <img src={iconWhite} alt="" className="w-16 h-16 block light:hidden" />
          <img src={iconBlack} alt="" className="w-16 h-16 hidden light:block" />
          <span className="font-hero text-6xl leading-none tracking-wide ml-3">Mintab</span>
          <span className="font-hero font-light text-base opacity-80 mb-1">v{VERSION}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-lg">
          Where to get <span className="font-medium">Mintab</span>?
        </p>
        <div className="flex gap-5">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.url || undefined}
              target="_blank"
              rel="noreferrer"
              aria-label={l.label}
              title={l.label}
              className={l.url ? 'hover:opacity-70 transition-opacity' : 'opacity-30 pointer-events-none'}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                {l.icon}
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- Main panel ---------- */

const BellIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
)
const GearIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

export default function Settings({ open, onClose }) {

  const saved = useSettings((s) => s.settings)
  const saveSettings = useSettings((s) => s.saveSettings)

  const [tab, setTab] = useState('General')
  const [view, setView] = useState('settings') // 'settings' | 'notifications'
  const [draft, setDraft] = useState(saved)
  const panelRef = useRef(null)

  const unread = useHasUnread()
  const items = useNotifications((s) => s.items)
  const markAllRead = useNotifications((s) => s.markAllRead)

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const inSettings = view === 'settings'

  // Reset unsaved changes and go back to settings each time the panel opens
  useEffect(() => {
    if (open) {
      setDraft(saved)
      setView('settings')
    }
  }, [open, saved])

  // Viewing notifications marks them all as read
  useEffect(() => {
    if (open && view === 'notifications') markAllRead()
  }, [open, view, items, markAllRead])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
  if (!open) return
  const onDown = (e) => {
    if (panelRef.current?.contains(e.target)) return
    // let the gear button handle its own toggle
    if (e.target.closest?.('[aria-label="Open settings"]')) return
    onClose()
  }
  document.addEventListener('mousedown', onDown)
  return () => document.removeEventListener('mousedown', onDown)
}, [open, onClose])

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-end overflow-hidden pr-[5%]">
      <div
        ref={panelRef}   
        aria-hidden={!open}
        className={`w-[845px] h-[890px] max-w-[90vw] max-h-[95vh] bg-card rounded-2xl flex flex-col pt-[33px] pb-8 text-fg
          transition-[translate,visibility] duration-500 ease-in-out
          ${open ? 'pointer-events-auto visible translate-x-0' : 'invisible translate-x-[calc(100%+6vw)]'}`}
      >
        <h1 className="text-2xl text-center text-fg h-[30px] leading-[30px]">
          {inSettings ? 'Settings' : 'Notifications'}
        </h1>

        {/* Tabs */}
        {inSettings && (
          <nav className="mx-[57px] mt-[27px] h-11 shrink-0 bg-item rounded-2xl flex items-center justify-between px-3">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 h-[38px] flex flex-col items-center justify-center gap-0.5 text-lg cursor-pointer transition-opacity ${tab === t ? '' : 'opacity-60 hover:opacity-100'}`}
              >
                <span>{t}</span>
                <span className={`h-0.5 w-[22px] rounded-full ${tab === t ? 'bg-fg' : 'bg-transparent'}`} />
              </button>
            ))}
          </nav>
        )}

        {/* Content */}
        <section
          className={`mx-[57px] ${inSettings ? 'mt-[30px]' : 'mt-[27px]'} flex-1 min-h-0 bg-item rounded-2xl p-[45px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        >
          {!inSettings ? (
            <NotificationsView />
          ) : (
            <>
              {tab === 'General' && <GeneralTab draft={draft} set={set} />}
              {tab === 'Appearance' && <AppearanceTab draft={draft} set={set} />}
              {tab === 'Sidebar' && <SidebarTab draft={draft} set={set} />}
              {tab === 'Backup' && (
                <BackupTab
                  saved={saved}
                  onImport={(imported) => {
                    const next = { ...DEFAULTS, ...imported }
                    saveSettings(next)
                    setDraft(next)
                  }}
                />
              )}
              {tab === 'About' && <AboutTab />}
            </>
          )}
        </section>

        {/* Footer */}
        <footer className="mx-[57px] mt-[30px] flex justify-between shrink-0">
          <div className="relative">
          <button
            onClick={() => setView(inSettings ? 'notifications' : 'settings')}
            aria-label={inSettings ? 'Open notifications' : 'Back to settings'}
            className="h-12 w-12 bg-item rounded-2xl flex items-center justify-center cursor-pointer hover:opacity-80"
          >
            {inSettings ? BellIcon : GearIcon}
          </button>
          {inSettings && unread && (
            <span className="pointer-events-none absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500" />
          )}
        </div>

          {inSettings && (
            <div className="flex gap-[30px]">
              {tab !== 'About' && (
                <button
                  onClick={() => saveSettings(draft)}
                  disabled={!dirty}
                  className={`h-12 px-6 bg-item rounded-2xl flex items-center gap-2 text-lg transition-opacity
                    ${dirty ? 'cursor-pointer hover:opacity-80' : 'opacity-40 cursor-default'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
                  </svg>
                  Save Changes
                </button>
              )}
              <button
                onClick={() => setDraft(DEFAULTS)}
                className="h-12 px-6 bg-item rounded-2xl flex items-center gap-2 text-lg cursor-pointer hover:opacity-80"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m10.9-3.652a8.25 8.25 0 00-14.37-2.1M3.12 13a8.25 8.25 0 0014.37 2.1" />
                </svg>
                Reset to Default
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  )
}