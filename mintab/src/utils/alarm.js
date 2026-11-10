export function playAlarm() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    const beep = (offset) => {
      const t = ctx.currentTime + offset
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.32)
    }
    ;[0, 0.45, 0.9].forEach(beep)
    setTimeout(() => ctx.close(), 1800)
  } catch {
    // Audio blocked or unavailable: the on-page and tab-title states still show it
  }
}