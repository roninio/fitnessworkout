import { useState } from 'react'
import { Minus, Plus } from './Icons'

interface Props {
  value: number
  onChange: (v: number) => void
  step: number
  min?: number
  max?: number
  decimal?: boolean
  label: string
}

const round = (n: number) => Math.round(n * 100) / 100

export function Stepper({ value, onChange, step, min = 0, max = 999, decimal, label }: Props) {
  const [text, setText] = useState(String(value))
  const [prevValue, setPrevValue] = useState(value)

  const clamp = (n: number) => Math.min(max, Math.max(min, round(n)))

  const parse = (raw: string) => {
    const n = Number(raw.replace(',', '.'))
    return raw.trim() !== '' && Number.isFinite(n) ? clamp(n) : null
  }

  // Sync the text box when the value changes from outside (± buttons, carried-forward weights),
  // but leave it alone while the typed text already represents the value (e.g. "42." while typing).
  if (value !== prevValue) {
    setPrevValue(value)
    if (parse(text) !== value) setText(String(value))
  }

  const btn =
    'grid h-11 w-8 shrink-0 place-items-center rounded-xl bg-zinc-800 text-zinc-200 active:scale-95 active:bg-zinc-700 transition'

  return (
    <div className="flex items-center gap-1">
      <button type="button" className={btn} aria-label={`Decrease ${label}`} onClick={() => onChange(clamp(value - step))}>
        <Minus className="h-4 w-4" />
      </button>
      <input
        aria-label={label}
        type="text"
        inputMode={decimal ? 'decimal' : 'numeric'}
        enterKeyHint="done"
        className={`h-11 w-full min-w-0 rounded-xl bg-zinc-900 px-0 text-center ${text.length >= 5 ? "text-[15px]" : "text-lg"} font-semibold tabular-nums text-white outline-none ring-accent/60 focus:ring-2`}
        value={text}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          setText(e.target.value)
          const n = parse(e.target.value)
          if (n !== null && n !== value) onChange(n)
        }}
        onBlur={() => setText(String(value))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
      />
      <button type="button" className={btn} aria-label={`Increase ${label}`} onClick={() => onChange(clamp(value + step))}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
