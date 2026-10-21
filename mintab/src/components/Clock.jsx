import { useState, useEffect } from 'react'

export default function Clock() {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const hours = time.getHours().toString().padStart(2, '0')
    const minutes = time.getMinutes().toString().padStart(2, '0')

    const dateStr = time.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })

    return (
        <section
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
            aria-label="Current time and date"
        >
            <time className="text-[#f6f6f6] text-9xl font-normal tracking-wide">
                {hours}:{minutes}
            </time>
            <time className="text-[#f6f6f6] text-lg font-normal tracking-[1.98px]">
                {dateStr}
            </time>
        </section>
    )
}