import type { Exercise } from '../data/exercises'
import { formatKg, topSet, type LastPerformance } from '../lib/store'
import { Check, ChevronRight } from './Icons'

interface Props {
  index: number
  exercise: Exercise
  done: number
  total: number
  last: LastPerformance | null
  onOpen: () => void
}

export function ExerciseCard({ index, exercise, done, total, last, onOpen }: Props) {
  const complete = total > 0 && done >= total
  const top = last ? topSet(last.sets) : null
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full items-center gap-3 rounded-3xl p-2.5 pr-3 text-left transition active:scale-[0.98] ${
        complete ? 'bg-accent/10 ring-1 ring-accent/30' : 'bg-zinc-900'
      }`}
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-zinc-800">
        <img src={exercise.images[0]} alt="" loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-xs font-bold text-white">
          {index + 1}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-semibold text-white">{exercise.name}</div>
        <div className="truncate text-xs text-zinc-400">{exercise.machine}</div>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="shrink-0 whitespace-nowrap rounded-md bg-zinc-800 px-1.5 py-0.5 font-medium text-zinc-300">
            {exercise.sets} × {exercise.reps}
          </span>
          {top ? (
            <span className="truncate text-zinc-400">
              Last: <span className="font-medium text-zinc-200">{formatKg(top.kg)} kg × {top.reps}</span>
            </span>
          ) : (
            <span className="truncate text-zinc-500">No log yet</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        {complete ? (
          <span className="animate-pop grid h-9 w-9 place-items-center rounded-full bg-accent text-zinc-950">
            <Check className="h-5 w-5" />
          </span>
        ) : done > 0 ? (
          <span className="grid h-9 min-w-9 place-items-center rounded-full bg-zinc-800 px-1 text-xs font-bold tabular-nums text-accent">
            {done}/{total}
          </span>
        ) : (
          <ChevronRight className="h-5 w-5 text-zinc-600" />
        )}
      </div>
    </button>
  )
}
