import { useState, useEffect } from 'react'
import { useSettings, CITIES } from '../store/settings'
import { WeatherIcon, LocationIcon } from './WeatherIcons'

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
  const [icon, setIcon] = useState({ code: 3, isDay: true })
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
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,is_day&temperature_unit=${unit}`
        )
        const data = await res.json()
        if (cancelled) return
        setWeather(`${getCondition(data.current.weathercode)}, ${Math.round(data.current.temperature_2m)}°${temperatureUnit}`)
        setIcon({ code: data.current.weathercode, isDay: data.current.is_day === 1 })

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
        <WeatherIcon code={icon.code} isDay={icon.isDay} size={20} />
        <span>{weather ?? 'Loading...'}</span>
      </div>
      <div className="flex items-center gap-2 text-fg text-xl font-normal">
        <LocationIcon auto={locSetting === 'auto'} size={20} />
        <span>{location ?? 'Locating...'}</span>
      </div>
    </section>
  )
}