let ctx: AudioContext | null = null

/** Must be called from a user gesture (iOS only allows audio that was unlocked by a tap). */
export function unlockAudio() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    ctx ??= new AC()
    if (ctx.state === 'suspended') void ctx.resume()
  } catch {
    ctx = null
  }
}

export function restDoneAlert() {
  navigator.vibrate?.([200, 100, 200])
  if (!ctx) return
  const now = ctx.currentTime
  for (const [i, freq] of [880, 1320].entries()) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, now + i * 0.18)
    gain.gain.exponentialRampToValueAtTime(0.3, now + i * 0.18 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.16)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now + i * 0.18)
    osc.stop(now + i * 0.18 + 0.18)
  }
}
