import { useState } from 'react'

function Calendar() {
    const [current, setCurrent] = useState(new Date())
    const today = new Date()

    const year = current.getFullYear()
    const month = current.getMonth()
    const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrev = new Date(year, month, 0).getDate()

    const cells = []
    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ day: daysInPrev - i, current: false })
    }
    for (let i = 1; i <= daysInMonth; i++) {
        cells.push({ day: i, current: true })
    }
    while (cells.length % 7 !== 0) {
        cells.push({ day: cells.length - daysInMonth - firstDay + 1, current: false })
    }

    const isToday = (day, isCurrent) =>
        isCurrent &&
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()

    return (
        <div className="bg-[#141414] rounded-2xl p-5 w-(--card-w) min-h-[calc(var(--card-w)*0.75)] pointer-events-auto flex flex-col justify-between">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setCurrent(new Date(year, month - 1))}
                    className="text-[#f6f6f6] opacity-50 hover:opacity-100 transition-opacity"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-[#f6f6f6] text-base font-normal tracking-wide">{monthName}</span>
                <button
                    onClick={() => setCurrent(new Date(year, month + 1))}
                    className="text-[#f6f6f6] opacity-30 hover:opacity-100 transition-opacity"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-center text-[#f6f6f6] text-xs opacity-60">{d}</span>
                ))}
            </div>

            {/* Date grid */}
            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((cell, i) => (
                    <div key={i} className="flex items-center justify-center h-7">
                        <span
                            className={`w-7 h-7 flex items-center justify-center text-sm rounded-full
                ${isToday(cell.day, cell.current)
                                    ? 'bg-[#f6f6f6] text-[#121212] font-medium'
                                    : cell.current
                                        ? 'text-[#f6f6f6]'
                                        : 'text-[#f6f6f6] opacity-20'}`}
                        >
                            {cell.day}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const at = (dayOffset, h, m) => {
    const d = new Date()
    d.setDate(d.getDate() + dayOffset)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
}

const formatDue = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
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
    const [tasks, setTasks] = useState([])
    const [name, setName] = useState('')
    const [deadline, setDeadline] = useState('')
    const [adding, setAdding] = useState(false)

    const toggle = (id) =>
        setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)))

    const cancel = () => { setAdding(false); setName(''); setDeadline('') }

    const add = () => {
        if (!name.trim()) { cancel(); return }
        setTasks(prev => [
            ...prev,
            {
                id: Date.now(),
                text: name.trim(),
                due: deadline ? new Date(deadline).toISOString() : '',
                done: false,
            },
        ])
        cancel()
    }

    // Deletes only the checked (faded) tasks
    const deleteCompleted = () => setTasks(prev => prev.filter(t => !t.done))

    const onKey = (e) => {
        if (e.key === 'Enter') add()
        if (e.key === 'Escape') cancel()
    }

    return (
        <div className="bg-[#141414] rounded-2xl p-5 w-(--card-w) pointer-events-auto flex flex-col">
            <p className="text-[#f6f6f6] text-base font-normal text-center mb-4 tracking-widest shrink-0">Tasks</p>

            {/* Fixed-height card: list scrolls inside it */}
            <div className="flex flex-col gap-2 h-[178px] shrink-0 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className={`w-full bg-[#1b1b1b] rounded-[9px] px-3 py-2 flex items-start justify-between gap-2 shrink-0 ${task.done ? 'opacity-40' : ''}`}
                    >
                        <div className="flex flex-col">
                            <span className={`text-[#f6f6f6] text-base leading-snug ${task.done ? 'line-through' : ''}`}>
                                {task.text}
                            </span>
                            {task.due && (
                                <span className={`text-[#efefef] text-xs opacity-70 ${task.done ? 'line-through' : ''}`}>
                                    {formatDue(task.due)}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => toggle(task.id)}
                            className={`w-5 h-5 shrink-0 mt-0.5 rounded-[5px] border flex items-center justify-center transition-colors cursor-pointer
                ${task.done ? 'bg-[#f6f6f6] border-[#f6f6f6]' : 'bg-[#1e1e1e] border-[#f6f6f6]'}`}
                        >
                            {task.done && (
                                <svg className="w-3 h-3 text-[#121212]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    </div>
                ))}

                {adding && (
                    <div className="w-full bg-[#1b1b1b] rounded-[9px] px-3 py-2 flex flex-col gap-1 shrink-0">
                        <input
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyDown={onKey}
                            placeholder="Task name..."
                            className="w-full bg-transparent text-[#f6f6f6] text-base outline-none placeholder:opacity-30"
                        />
                        <input
                            type="datetime-local"
                            value={deadline}
                            onChange={e => setDeadline(e.target.value)}
                            onKeyDown={onKey}
                            className="w-full bg-transparent text-[#efefef] text-xs opacity-70 outline-none scheme-dark"
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-4 shrink-0">
                <button
                    onClick={() => (adding ? add() : setAdding(true))}
                    className="w-9.5 h-6.5 bg-[#1b1b1b] rounded-[9px] flex items-center justify-center text-[#f6f6f6] opacity-60 hover:opacity-100 transition-opacity text-lg cursor-pointer"
                    aria-label="Add task"
                >
                    +
                </button>
                <button
                    onClick={deleteCompleted}
                    className="w-9.5 h-6.5 bg-[#1b1b1b] rounded-[9px] flex items-center justify-center text-[#f6f6f6] opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Delete completed tasks"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default function Sidebar({ isOpen }) {
    return (
        <aside
            style={{ '--card-w': 'clamp(300px, 20vw, 400px)' }}
            className={`
        absolute top-0 right-0 h-full pr-[7%]
        flex flex-col justify-center gap-28
        pointer-events-none
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
        >
            <Calendar />
            <Tasks />
        </aside>
    )
}