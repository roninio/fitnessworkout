import type { SetLog } from '../lib/store'
import { Check } from './Icons'
import { Stepper } from './Stepper'

interface Props {
  index: number
  set: SetLog
  kgStep: number
  onChange: (patch: Partial<SetLog>) => void
  onToggleDone: () => void
}

export function SetRow({ index, set, kgStep, onChange, onToggleDone }: Props) {
  return (
    <div
      className={`grid grid-cols-[1.75rem_1.2fr_1fr_2.75rem] items-center gap-2 rounded-2xl p-2 transition-colors ${
        set.done ? 'bg-accent/10 ring-1 ring-accent/30' : 'bg-zinc-900/60'
      }`}
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-full text-sm font-bold ${
          set.done ? 'bg-accent text-zinc-950' : 'bg-zinc-800 text-zinc-400'
        }`}
      >
        {index + 1}
      </span>
      <Stepper label={`Set ${index + 1} weight in kg`} value={set.kg} step={kgStep} decimal onChange={(kg) => onChange({ kg })} />
      <Stepper label={`Set ${index + 1} reps`} value={set.reps} step={1} max={100} onChange={(reps) => onChange({ reps })} />
      <button
        type="button"
        onClick={onToggleDone}
        aria-pressed={set.done}
        aria-label={set.done ? `Mark set ${index + 1} not done` : `Complete set ${index + 1}`}
        className={`grid h-11 w-11 place-items-center rounded-xl transition active:scale-90 ${
          set.done ? 'animate-pop bg-accent text-zinc-950' : 'bg-zinc-800 text-zinc-500'
        }`}
      >
        <Check className="h-5 w-5" />
      </button>
    </div>
  )
}
