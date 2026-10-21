import { useState, useEffect } from 'react'
import { useSettings } from '../store/settings'
import { formatDate } from '../utils/formatDate'

export default function Clock({ shifted = false }) {
  const { showClock, showDate, clockFormat, dateFormat } = useSettings((s) => s.settings)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!showClock && !showDate) return null

  const is12 = clockFormat === '12h'
  const rawHours = time.getHours()
  const hours = (is12 ? rawHours % 12 || 12 : rawHours).toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const period = rawHours >= 12 ? 'PM' : 'AM'

  return (
    <section
      style={{ left: shifted ? 'calc((95vw - min(845px, 90vw)) / 2)' : '50%' }}
      className="absolute top-[42%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-[left] duration-500 ease-in-out"
      aria-label="Current time and date"
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
    </section>
  )
}