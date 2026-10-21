import { useState, useEffect } from 'react'
import { useSettings, CITIES } from '../store/settings'

function getCondition(code) {
  if (code === 0) return 'Clear Sky'
  if (code <= 2) return 'Partly Cloudy'
  if (code === 3) return 'Overcast'
  if (code <= 48) return 'Foggy'
  if (code <= 57) return 'Drizzle'
  if (code <= 67) return 'Rainy'
  if (code <= 77) return 'Snowy'
  if (code <= 82) return 'Rain Showers'
  if (code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

export default function Weather() {
  const { showWeather, temperatureUnit, location: locSetting } = useSettings((s) => s.settings)
  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!showWeather) return
    let cancelled = false
    setError(false)

    const load = async (lat, lon, label) => {
      try {
        const unit = temperatureUnit === 'F' ? 'fahrenheit' : 'celsius'
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&temperature_unit=${unit}`
        )
        const data = await res.json()
        if (cancelled) return
        setWeather(`${getCondition(data.current.weathercode)}, ${Math.round(data.current.temperature_2m)}°${temperatureUnit}`)

        if (label) {
          setLocation(label)
        } else {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          )
          const geo = await geoRes.json()
          if (cancelled) return
          const a = geo.address || {}
          setLocation(`${a.city || a.town || a.village || 'Unknown'}, ${a.country || ''}`)
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }

    if (locSetting !== 'auto' && CITIES[locSetting]) {
      const c = CITIES[locSetting]
      load(c.lat, c.lon, c.label)
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude, null),
        () => !cancelled && setError(true)
      )
    }

    return () => { cancelled = true }
  }, [showWeather, temperatureUnit, locSetting])

  if (!showWeather || error) return null

  return (
    <section className="absolute bottom-8 left-8 flex flex-col gap-1" aria-label="Weather and location">
      <div className="flex items-center gap-2 text-fg text-xl font-normal">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        </svg>
        <span>{weather ?? 'Loading...'}</span>
      </div>
      <div className="flex items-center gap-2 text-fg text-xl font-normal">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
        <span>{location ?? 'Locating...'}</span>
      </div>
    </section>
  )
}