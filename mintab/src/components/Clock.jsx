import { useState, useEffect } from 'react'
import { useSettings } from '../store/settings'
import { formatDate } from '../utils/formatDate'

export default function Clock() {
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
      className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
      aria-label="Current time and date"
    >
      {showClock && (
        <time className="text-[#f6f6f6] text-8xl font-normal tracking-wide">
          {hours}:{minutes}
          {is12 && <span className="text-xl ml-2 tracking-widest">{period}</span>}
        </time>
      )}
      {showDate && (
        <time className="text-[#f6f6f6] text-base font-normal tracking-[1.98px]">
          {formatDate(time, dateFormat)}
        </time>
      )}
    </section>
  )
}