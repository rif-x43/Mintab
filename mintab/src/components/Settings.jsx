import { useState, useEffect } from 'react'
import { useSettings, DEFAULTS, CITIES } from '../store/settings'
import { formatDate, DATE_FORMATS } from '../utils/formatDate'
import { useBookmarks, folderOptions } from './Bookmarks'

const TABS = ['General', 'Appearance', 'Sidebar', 'Backup', 'About']

/* ---------- small UI pieces ---------- */

function Checkbox({ checked, onChange }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center cursor-pointer border border-[#f6f6f6] transition-colors
        ${checked ? 'bg-[#f6f6f6]' : 'bg-[#1e1e1e]'}`}
    >
      {checked && (
        <svg className="w-3 h-3 text-[#141414]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

function Segmented({ value, options, onChange }) {
  return (
    <div className="w-[104px] h-6 bg-[#141414] rounded-[5px] p-0.5 flex">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-[3px] text-base leading-none cursor-pointer transition-colors
            ${value === o.value ? 'bg-[#efefef] text-[#121212]' : 'text-[#f6f6f6]'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function SelectBox({ value, options, onChange }) {
  return (
    <div className="relative w-64 h-6 bg-[#141414] rounded-[5px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full appearance-none bg-transparent text-right pr-2 pl-6 text-base text-[#f6f6f6] cursor-pointer outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#141414] text-[#f6f6f6]">
            {o.label}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute left-1.5 top-1.5 w-3 h-3 text-[#f6f6f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    </div>
  )
}

// A label row. `sub` indents it, `dim` fades + disables it.
function Row({ label, sub, dim, children }) {
  return (
    <div className={`flex items-center justify-between h-7 text-lg text-[#f6f6f6] ${sub ? 'pl-8' : ''} ${dim ? 'opacity-60 pointer-events-none' : ''}`}>
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

/* ---------- Main panel ---------- */

export default function Settings({ onClose }) {
  const saved = useSettings((s) => s.settings)
  const saveSettings = useSettings((s) => s.saveSettings)

  const [tab, setTab] = useState('General')
  const [draft, setDraft] = useState(saved)

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[845px] h-[890px] max-w-[95vw] max-h-[95vh] bg-[#141414] rounded-2xl flex flex-col pt-[33px] pb-8 text-[#f6f6f6]"
      >
        <h1 className="text-2xl text-center text-[#efefef] h-[30px] leading-[30px]">Settings</h1>

        {/* Tabs */}
        <nav className="mx-[57px] mt-[27px] h-11 shrink-0 bg-[#1b1b1b] rounded-2xl flex items-center justify-between px-3">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 h-[38px] flex flex-col items-center justify-center gap-0.5 text-lg cursor-pointer transition-opacity ${tab === t ? '' : 'opacity-60 hover:opacity-100'}`}
            >
              <span>{t}</span>
              <span className={`h-0.5 w-[22px] rounded-full ${tab === t ? 'bg-[#f6f6f6]' : 'bg-transparent'}`} />
            </button>
          ))}
        </nav>

        {/* Content */}
        <section className="mx-[57px] mt-[30px] flex-1 min-h-0 bg-[#1b1b1b] rounded-2xl p-[45px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tab === 'General' ? (
            <GeneralTab draft={draft} set={set} />
          ) : (
            <p className="opacity-40 text-lg">{tab} tab coming next...</p>
          )}
        </section>

        {/* Footer */}
        <footer className="mx-[57px] mt-[30px] flex justify-end gap-[30px] shrink-0">
          {tab !== 'About' && (
            <button
              onClick={() => saveSettings(draft)}
              disabled={!dirty}
              className={`h-12 px-6 bg-[#1b1b1b] rounded-2xl flex items-center gap-2 text-lg transition-opacity
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
            className="h-12 px-6 bg-[#1b1b1b] rounded-2xl flex items-center gap-2 text-lg cursor-pointer hover:opacity-80"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m10.9-3.652a8.25 8.25 0 00-14.37-2.1M3.12 13a8.25 8.25 0 0014.37 2.1" />
            </svg>
            Reset to Default
          </button>
        </footer>
      </div>
    </div>
  )
}