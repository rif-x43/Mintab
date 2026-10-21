import { Cloud, CloudRain, CloudLightning, Moon, CloudMoon, Sun, CloudSun, Building2, House } from 'lucide-react'

// code = Open-Meteo weather_code, isDay = is_day === 1
export function WeatherIcon({ code, isDay = true, size = 18 }) {
  let Icon = Cloud
  if (code === 0) Icon = isDay ? Sun : Moon
  else if (code <= 2) Icon = isDay ? CloudSun : CloudMoon
  else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) Icon = CloudRain
  else if (code >= 95) Icon = CloudLightning
  return <Icon size={size} strokeWidth={1.5} className="shrink-0" />
}

// device location = house, chosen city = building
export function LocationIcon({ auto, size = 18 }) {
  const Icon = auto ? House : Building2
  return <Icon size={size} strokeWidth={1.5} className="shrink-0" />
}