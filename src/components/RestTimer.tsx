import { useEffect, useRef, useState } from 'react'
import { restDoneAlert } from '../lib/rest'
import { Timer, X } from './Icons'

export interface RestState {
  endsAt: number
  total: number
}

interface Props {
  rest: RestState
  onChange: (r: RestState | null) => void
}

export function RestTimer({ rest, onChange }: Props) {
  const [now, setNow] = useState(() => Date.now())
  const alerted = useRef(false)

  useEffect(() => {
    alerted.current = false
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [rest.endsAt])

  const remainingMs = rest.endsAt - now
  const remaining = Math.max(0, Math.ceil(remainingMs / 1000))
  const finished = remainingMs <= 0

  useEffect(() => {
    if (finished && !alerted.current) {
      alerted.current = true
      restDoneAlert()
    }
    if (remainingMs < -4000) onChange(null)
  }, [finished, remainingMs, onChange])

  const pct = Math.min(100, Math.max(0, (1 - remainingMs / (rest.total * 1000)) * 100))
  const mm = Math.floor(remaining / 60)
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <div className="animate-slide-up pointer-events-auto mx-auto w-full max-w-md px-3 pb-2">
      <div
        role="timer"
        aria-live="polite"
        className={`relative overflow-hidden rounded-2xl shadow-xl shadow-black/50 ring-1 ${
          finished ? 'bg-accent text-zinc-950 ring-accent' : 'bg-zinc-800 text-white ring-white/10'
        }`}
      >
        {!finished && <div className="absolute inset-y-0 left-0 bg-accent/20 transition-[width] duration-300" style={{ width: `${pct}%` }} />}
        <div className="relative flex items-center gap-3 px-4 py-2.5">
          <Timer className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-medium uppercase tracking-wide opacity-70">{finished ? 'Rest over' : 'Rest'}</div>
            <div className="text-xl font-bold tabular-nums leading-tight">{finished ? 'Next set!' : `${mm}:${ss}`}</div>
          </div>
          {!finished && (
            <>
              <button
                type="button"
                className="h-10 rounded-xl bg-white/10 px-3 text-sm font-semibold active:scale-95"
                onClick={() => onChange({ endsAt: rest.endsAt - 15_000, total: rest.total })}
              >
                −15s
              </button>
              <button
                type="button"
                className="h-10 rounded-xl bg-white/10 px-3 text-sm font-semibold active:scale-95"
                onClick={() => onChange({ endsAt: rest.endsAt + 30_000, total: rest.total + 30 })}
              >
                +30s
              </button>
            </>
          )}
          <button
            type="button"
            aria-label="Dismiss timer"
            className={`grid h-10 w-10 place-items-center rounded-xl active:scale-95 ${finished ? 'bg-black/10' : 'bg-white/10'}`}
            onClick={() => onChange(null)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
