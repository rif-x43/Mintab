import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../store/settings'

function Calendar({ picker = false, selected = null, onSelect }) {
    const [current, setCurrent] = useState(selected ?? new Date())
    const today = new Date()

    const year = current.getFullYear()
    const month = current.getMonth()
    const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrev = new Date(year, month, 0).getDate()

    const cells = []
    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ day: daysInPrev - i, current: false, offset: -1 })
    }
    for (let i = 1; i <= daysInMonth; i++) {
        cells.push({ day: i, current: true, offset: 0 })
    }
    while (cells.length % 7 !== 0) {
        cells.push({ day: cells.length - daysInMonth - firstDay + 1, current: false, offset: 1 })
    }

    const sameDay = (a, b) =>
        a && b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()

    return (
        <div className={picker
            ? 'flex flex-col'
            : 'bg-card rounded-2xl p-5 w-(--card-w) min-h-[calc(var(--card-w)*0.75)] pointer-events-auto flex flex-col justify-between'}
        >
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={() => setCurrent(new Date(year, month - 1))}
                    className="text-fg opacity-50 hover:opacity-100 transition-opacity"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-fg text-base font-normal tracking-wide">{monthName}</span>
                <button
                    type="button"
                    onClick={() => setCurrent(new Date(year, month + 1))}
                    className="text-fg opacity-30 hover:opacity-100 transition-opacity"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-center text-fg text-xs opacity-60">{d}</span>
                ))}
            </div>

            {/* Date grid */}
            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((cell, i) => {
                    const date = new Date(year, month + cell.offset, cell.day)
                    const isToday = cell.current && sameDay(date, today)
                    const isSel = picker && sameDay(date, selected)
                    const filled = picker ? isSel : isToday
                    const ring = picker && isToday && !isSel ? ' ring-1 ring-fg/50' : ''
                    const cls = `w-7 h-7 flex items-center justify-center text-sm rounded-full${ring}
                        ${filled ? 'bg-fg text-bg font-medium' : cell.current ? 'text-fg' : 'text-fg opacity-20'}`

                    return (
                        <div key={i} className="flex items-center justify-center h-7">
                            {picker ? (
                                <button
                                    type="button"
                                    onClick={() => onSelect?.(date)}
                                    className={`${cls} cursor-pointer ${filled ? '' : 'hover:bg-item'}`}
                                >
                                    {cell.day}
                                </button>
                            ) : (
                                <span className={cls}>{cell.day}</span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/* ---------- Time picker: scrollable columns ---------- */

const pad = (n) => String(n).padStart(2, '0')

function TimeColumn({ items, value, onPick }) {
    const ref = useRef(null)

    // scroll the selected value to the middle when the picker opens
    useEffect(() => {
        const box = ref.current
        const el = box?.querySelector('[data-sel="true"]')
        if (box && el) box.scrollTop = el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2
    }, [])

    return (
        <div
            ref={ref}
            className="relative flex-1 h-40 overflow-y-auto bg-item rounded-[9px] p-1 flex flex-col gap-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
            {items.map((it) => {
                const sel = it.value === value
                return (
                    <button
                        key={it.value}
                        type="button"
                        data-sel={sel}
                        onClick={() => onPick(it.value)}
                        className={`h-8 shrink-0 rounded-[7px] text-base cursor-pointer transition-colors
                            ${sel ? 'bg-fg text-bg' : 'text-fg opacity-60 hover:opacity-100'}`}
                    >
                        {it.label}
                    </button>
                )
            })}
        </div>
    )
}

function TimePicker({ value, onChange }) {
    const { clockFormat } = useSettings((s) => s.settings)
    const is12 = clockFormat === '12h'
    const h24 = value.getHours()
    const m = value.getMinutes()
    const pm = h24 >= 12
    const h12 = h24 % 12 || 12

    const hours = is12
        ? Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: pad(i + 1) }))
        : Array.from({ length: 24 }, (_, i) => ({ value: i, label: pad(i) }))
    const minutes = Array.from({ length: 60 }, (_, i) => ({ value: i, label: pad(i) }))

    const pickHour = (h) => onChange(is12 ? (h % 12) + (pm ? 12 : 0) : h, m)
    const pickAmPm = (isPm) => onChange((h12 % 12) + (isPm ? 12 : 0), m)

    return (
        <div className="flex gap-2 mt-4">
            <TimeColumn items={hours} value={is12 ? h12 : h24} onPick={pickHour} />
            <TimeColumn items={minutes} value={m} onPick={(min) => onChange(h24, min)} />
            {is12 && (
                <TimeColumn
                    items={[{ value: false, label: 'AM' }, { value: true, label: 'PM' }]}
                    value={pm}
                    onPick={pickAmPm}
                />
            )}
        </div>
    )
}

/* ---------- Tasks ---------- */

const at = (dayOffset, h, m) => {
    const d = new Date()
    d.setDate(d.getDate() + dayOffset)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
}

const formatDue = (iso, hour12 = true) => {
    if (!iso) return ''
    const d = new Date(iso)
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12 })
    const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate())
    const diff = Math.round((startOf(d) - startOf(new Date())) / 86400000)
    const label =
        diff === 0 ? 'Today' :
            diff === 1 ? 'Tomorrow' :
                diff === -1 ? 'Yesterday' :
                    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${label}, ${time}`
}

function Tasks() {
    const { sidebarPosition, clockFormat } = useSettings((s) => s.settings)
    const hour12 = clockFormat === '12h'

    const [tasks, setTasks] = useState([])
    const [name, setName] = useState('')
    const [deadline, setDeadline] = useState(null) // Date | null
    const [adding, setAdding] = useState(false)
    const [pickerOpen, setPickerOpen] = useState(false)
    const popRef = useRef(null)
    const btnRef = useRef(null)

    // close the picker when clicking outside it
    useEffect(() => {
        if (!pickerOpen) return
        const close = (e) => {
            if (!popRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) {
                setPickerOpen(false)
            }
        }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [pickerOpen])

    const toggle = (id) =>
        setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)))

    const cancel = () => { setAdding(false); setPickerOpen(false); setName(''); setDeadline(null) }

    const add = () => {
        if (!name.trim()) { cancel(); return }
        setTasks(prev => [
            ...prev,
            {
                id: Date.now(),
                text: name.trim(),
                due: deadline ? deadline.toISOString() : '',
                done: false,
            },
        ])
        cancel()
    }

    // date and time are picked independently; the other half falls back to "now"
    const base = deadline ?? new Date()
    const pickDate = (d) =>
        setDeadline(new Date(d.getFullYear(), d.getMonth(), d.getDate(), base.getHours(), base.getMinutes()))
    const pickTime = (h, m) =>
        setDeadline(new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m))

    // Deletes only the checked (faded) tasks
    const deleteCompleted = () => setTasks(prev => prev.filter(t => !t.done))

    const onKey = (e) => {
        if (e.key === 'Enter') add()
        if (e.key === 'Escape') cancel()
    }

    return (
        <div className="relative bg-card rounded-2xl p-5 w-(--card-w) pointer-events-auto flex flex-col">
            <p className="text-fg text-base font-normal text-center mb-4 tracking-widest shrink-0">Tasks</p>

            {/* Fixed-height card: list scrolls inside it */}
            <div className="flex flex-col gap-2 h-[178px] shrink-0 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
                {tasks.length === 0 && !adding && (
                    <div className="flex-1 flex items-center justify-center text-fg text-base opacity-40">
                        No tasks yet
                    </div>
                )}

                {tasks.map(task => (
    <div
        key={task.id}
        className={`w-full bg-item rounded-[9px] px-3 py-2 flex items-start gap-2 shrink-0 ${task.done ? 'opacity-40' : ''}`}
    >
        <div className="flex flex-col flex-1 min-w-0">
            <span className={`text-fg text-base leading-snug break-words ${task.done ? 'line-through' : ''}`}>
                {task.text}
            </span>
            {task.due && (
                <span className={`text-fg text-xs opacity-70 ${task.done ? 'line-through' : ''}`}>
                    {formatDue(task.due, hour12)}
                </span>
            )}
        </div>
        <button
            onClick={() => toggle(task.id)}
            className={`ml-auto w-5 h-5 shrink-0 mt-0.5 rounded-[5px] border flex items-center justify-center transition-colors cursor-pointer
                ${task.done ? 'bg-fg border-fg' : 'bg-item border-fg'}`}
        >
            {task.done && (
                <svg className="w-3 h-3 text-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            )}
        </button>
    </div>
))}

                {adding && (
                    <div className="w-full bg-item rounded-[9px] px-3 py-2 flex flex-col gap-1 shrink-0">
                        <input
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyDown={onKey}
                            placeholder="Task name..."
                            className="w-full bg-transparent text-fg text-base outline-none placeholder:opacity-30"
                        />
                        <button
                            ref={btnRef}
                            type="button"
                            onClick={() => setPickerOpen((o) => !o)}
                            className="w-fit bg-transparent text-fg text-xs opacity-70 hover:opacity-100 cursor-pointer"
                        >
                            {deadline ? formatDue(deadline.toISOString(), hour12) : 'Set deadline'}
                        </button>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-4 shrink-0">
                <button
                    onClick={() => (adding ? add() : setAdding(true))}
                    className="w-9.5 h-6.5 bg-item rounded-[9px] flex items-center justify-center text-fg opacity-60 hover:opacity-100 transition-opacity text-lg cursor-pointer"
                    aria-label="Add task"
                >
                    +
                </button>
                <button
                    onClick={deleteCompleted}
                    className="w-9.5 h-6.5 bg-item rounded-[9px] flex items-center justify-center text-fg opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Delete completed tasks"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
            </div>

            {/* Deadline picker: opens beside the card, outside the scrolling list */}
            {adding && pickerOpen && (
                <div
                    ref={popRef}
                    className={`absolute bottom-0 z-20 w-72 bg-card rounded-2xl p-5 shadow-xl
                        ${sidebarPosition === 'right' ? 'right-full mr-4' : 'left-full ml-4'}`}
                >
                    <Calendar picker selected={deadline} onSelect={pickDate} />
                    <TimePicker value={base} onChange={pickTime} />
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={() => { setDeadline(null); setPickerOpen(false) }}
                            className="h-6.5 px-3 bg-item rounded-[9px] text-fg text-sm opacity-60 hover:opacity-100 cursor-pointer"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => setPickerOpen(false)}
                            className="h-6.5 px-3 bg-item rounded-[9px] text-fg text-sm cursor-pointer"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Sidebar({ isOpen }) {
  const { sidebarPosition, showCalendar, showTasks } = useSettings((s) => s.settings)
  const isRight = sidebarPosition === 'right'

  if (!showCalendar && !showTasks) return null

  return (
    <aside
      style={{ '--card-w': 'clamp(400px, 20vw, 480px)' }}
      className={`
        absolute top-0 h-full
        ${isRight ? 'right-0 pr-[7%]' : 'left-0 pl-[7%]'}
        flex flex-col justify-center gap-28
        pointer-events-none
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : isRight ? 'translate-x-full' : '-translate-x-full'}
      `}
    >
      {showCalendar && <Calendar />}
      {showTasks && <Tasks />}
    </aside>
  )
}