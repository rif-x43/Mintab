import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../store/settings'
import { useClockTools, readValue } from '../store/clockTools'
import { formatDate } from '../utils/formatDate'
import { formatDuration } from '../utils/formatDuration'
import { playAlarm } from '../utils/alarm'

/* ---------- hooks ---------- */
function useNow(active) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    let worker
    let fallback
    try {
      worker = new Worker(new URL('../utils/tickWorker.js', import.meta.url), { type: 'module' })
      worker.onmessage = () => setNow(Date.now())
      worker.postMessage('start')
    } catch {
      fallback = setInterval(() => setNow(Date.now()), 500)
    }
    return () => {
      worker?.terminate()
      clearInterval(fallback)
    }
  }, [active])

  return now
}

function usePageHidden() {
  const [hidden, setHidden] = useState(() => document.hidden)
  useEffect(() => {
    const onChange = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
  return hidden
}

function useViewport() {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return vp
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

/* ---------- icons + small pieces ---------- */

function Icon({ children }) {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

const StopwatchIcon = (
  <Icon>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2.5M9.5 2h5" />
  </Icon>
)
const TimerIcon = (
  <Icon>
    <path d="M6 2h12M6 22h12M7 2v4a5 5 0 002 4l3 2-3 2a5 5 0 00-2 4v4M17 2v4a5 5 0 01-2 4l-3 2 3 2a5 5 0 012 4v4" />
  </Icon>
)
const PlayIcon = (
  <Icon>
    <path d="M8 5v14l11-7z" />
  </Icon>
)
const PauseIcon = (
  <Icon>
    <path d="M9 5v14M15 5v14" />
  </Icon>
)
const ResetIcon = (
  <Icon>
    <path d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m10.9-3.652a8.25 8.25 0 00-14.37-2.1M3.12 13a8.25 8.25 0 0014.37 2.1" />
  </Icon>
)
const CloseIcon = (
  <Icon>
    <path d="M6 18L18 6M6 6l12 12" />
  </Icon>
)

function IconBtn({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="w-10 h-10 rounded-full flex items-center justify-center text-fg opacity-70 hover:opacity-100 hover:bg-fg/10 transition cursor-pointer"
    >
      {children}
    </button>
  )
}

const pillBtn =
  'h-8 px-3 rounded-[5px] bg-card text-fg text-base cursor-pointer hover:opacity-80 transition-opacity'

/* ---------- timer length picker ---------- */

function TimerSetup({ onStart, onCancel }) {
  const [h, setH] = useState('')
  const [m, setM] = useState('')
  const [s, setS] = useState('')

  const totalMs = ((+h || 0) * 3600 + (+m || 0) * 60 + (+s || 0)) * 1000
  const start = (ms) => ms > 0 && onStart(ms)

  const onKeyDown = (e) => {
    if (e.key === 'Enter') start(totalMs)
    if (e.key === 'Escape') onCancel()
  }

  const fields = [
    { v: h, set: setH, unit: 'h', label: 'Hours' },
    { v: m, set: setM, unit: 'm', label: 'Minutes', focus: true },
    { v: s, set: setS, unit: 's', label: 'Seconds' },
  ]

  return (
    <div className="flex flex-col items-center gap-3 whitespace-nowrap">
      <div className="flex items-center gap-3 text-fg">
        {fields.map((f) => (
          <label key={f.unit} className="flex items-baseline gap-1">
            <input
              value={f.v}
              onChange={(e) => f.set(e.target.value.replace(/\D/g, '').slice(0, 2))}
              onKeyDown={onKeyDown}
              inputMode="numeric"
              placeholder="00"
              aria-label={f.label}
              autoFocus={f.focus}
              className="w-12 h-8 rounded-[5px] bg-card text-fg text-center text-lg outline-none placeholder:opacity-40 focus:ring-1 focus:ring-fg"
            />
            <span className="text-sm opacity-60">{f.unit}</span>
          </label>
        ))}
        <button
          type="button"
          onClick={() => start(totalMs)}
          disabled={totalMs <= 0}
          className={`${pillBtn} ${totalMs <= 0 ? 'opacity-40 cursor-default hover:opacity-40' : ''}`}
        >
          Start
        </button>
      </div>
      <div className="flex gap-2">
        {[5, 10, 25].map((min) => (
          <button key={min} type="button" onClick={() => start(min * 60000)} className={pillBtn}>
            {min} min
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- clock ---------- */

export default function Clock({ shifted = false }) {
  const {
    showClock, showDate, clockFormat, dateFormat,
    clockTools, clockTitleTimer, clockCustomLayout, clockScale, clockX, clockY,
  } = useSettings((s) => s.settings)

  const [time, setTime] = useState(new Date())
  const [menuOpen, setMenuOpen] = useState(false)
  const [setupOpen, setSetupOpen] = useState(false)
  const rootRef = useRef(null)
  const originalTitle = useRef(document.title)
  const hidden = usePageHidden()
  const vp = useViewport()

  const {
    mode, running, base, anchor, finished,
    startStopwatch, startTimer, pause, resume, reset, finish, close,
  } = useClockTools()

  const toolsEnabled = clockTools && showClock
  const active = toolsEnabled && mode !== null
  const now = useNow(active && running)

  const value = readValue({ mode, running, base, anchor }, now)
  const seconds = mode === 'timer' ? Math.ceil(value / 1000) : Math.floor(value / 1000)
  const label = formatDuration(seconds)

  // Normal clock tick
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Turning the feature off clears anything running
  useEffect(() => {
    if (!toolsEnabled) {
      setMenuOpen(false)
      setSetupOpen(false)
      if (mode) close()
    }
  }, [toolsEnabled, mode, close])

  // Click outside closes the launcher
  useEffect(() => {
    if (!menuOpen && !setupOpen) return
    const onDown = (e) => {
      if (rootRef.current?.contains(e.target)) return
      setMenuOpen(false)
      setSetupOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen, setupOpen])

  // Timer reached zero
  useEffect(() => {
    if (!active || mode !== 'timer' || !running) return
    const end = anchor + base
    if (now >= end) {
      finish()
      // Only beep if it ended just now, not if the timer ran out while the browser was closed
      if (Date.now() - end < 10000) playAlarm()
    }
  }, [now, active, mode, running, anchor, base, finish])

  // Live value in the tab title while this tab is in the background
  useEffect(() => {
    if (hidden && active && clockTitleTimer) {
      const icon = !running ? '⏸' : mode === 'timer' ? '⏳' : '⏱'
      document.title = finished ? '⏰ Time’s up!' : `${icon} ${label}`
    } else {
      document.title = originalTitle.current
    }
  }, [hidden, active, clockTitleTimer, mode, running, finished, label])

  useEffect(() => {
    const original = originalTitle.current
    return () => {
      document.title = original
    }
  }, [])

  if (!showClock && !showDate) return null

  const is12 = clockFormat === '12h'
  const rawHours = time.getHours()
  const hours = (is12 ? rawHours % 12 || 12 : rawHours).toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const period = rawHours >= 12 ? 'PM' : 'AM'

  const sectionStyle = { left: shifted ? 'calc((95vw - min(845px, 90vw)) / 2)' : '50%' }
  if (clockCustomLayout) {
    const x = clamp(clockX, -vp.w / 2, vp.w / 2)
    const y = clamp(clockY, -vp.h / 2, vp.h / 2)
    // Tailwind v4 centers with the separate `translate` property, so this doesn't clash
    sectionStyle.transform = `translate(${x}px, ${y}px) scale(${clockScale})`
  }

  const toggleMenu = () => {
    if (!toolsEnabled) return
    setSetupOpen(false)
    setMenuOpen((o) => !o)
  }

  const begin = (fn) => {
    setMenuOpen(false)
    setSetupOpen(false)
    fn()
  }

  return (
    <section
      ref={rootRef}
      style={sectionStyle}
      className="absolute top-[42%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-[left] duration-500 ease-in-out"
      aria-label="Current time and date"
    >
      {active ? (
        <>
          <time className="text-fg text-8xl font-normal tracking-wide tabular-nums">
            {finished ? '00:00' : label}
          </time>
          <p className="min-h-6 text-fg text-base tracking-[1.98px]">
            {finished ? 'Time’s up' : !running ? 'Paused' : ''}
          </p>

          <div className="flex items-center gap-2">
            {finished ? (
              <IconBtn label="Restart timer" onClick={() => { reset(); resume() }}>
                {ResetIcon}
              </IconBtn>
            ) : (
              <>
                <IconBtn label={running ? 'Pause' : 'Resume'} onClick={running ? pause : resume}>
                  {running ? PauseIcon : PlayIcon}
                </IconBtn>
                <IconBtn label="Reset" onClick={reset}>
                  {ResetIcon}
                </IconBtn>
              </>
            )}
            <IconBtn label="Close" onClick={close}>
              {CloseIcon}
            </IconBtn>
          </div>

          <p className="flex items-center gap-4 mt-3 text-fg text-sm opacity-60 tracking-wide">
            {showClock && (
              <span>
                {hours}:{minutes}
                {is12 && ` ${period}`}
              </span>
            )}
            {showDate && <span>{formatDate(time, dateFormat)}</span>}
          </p>
        </>
      ) : (
        <>
          <div
            role={toolsEnabled ? 'button' : undefined}
            tabIndex={toolsEnabled ? 0 : undefined}
            aria-expanded={toolsEnabled ? menuOpen : undefined}
            onClick={toggleMenu}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleMenu()
              }
            }}
            className={`flex flex-col items-center gap-2 outline-none ${toolsEnabled ? 'cursor-pointer' : ''}`}
          >
            {showClock && (
              <time className="text-fg text-8xl font-normal tracking-wide">
                {hours}:{minutes}
                {is12 && <span className="text-xl ml-2 tracking-widest">{period}</span>}
              </time>
            )}
            {showDate && (
              <time className="text-fg text-base font-normal tracking-[1.98px]">
                {formatDate(time, dateFormat)}
              </time>
            )}
          </div>

          {toolsEnabled && (
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-5 transition-opacity duration-200
                ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              {setupOpen ? (
                <TimerSetup
                  onStart={(ms) => begin(() => startTimer(ms))}
                  onCancel={() => setSetupOpen(false)}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <IconBtn label="Set a timer" onClick={() => setSetupOpen(true)}>
                    {TimerIcon}
                  </IconBtn>
                  <IconBtn label="Start stopwatch" onClick={() => begin(startStopwatch)}>
                    {StopwatchIcon}
                  </IconBtn>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}