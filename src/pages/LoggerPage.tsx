import { useEffect, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Dumbbell, Note, Plus, Trash, Trophy } from '../components/Icons'
import { ImageViewer } from '../components/ImageViewer'
import { SetRow } from '../components/SetRow'
import { EXERCISES } from '../data/exercises'
import { getDayPlan, type DayNumber } from '../data/plan'
import { relativeDay } from '../lib/date'
import {
  exerciseState,
  formatKg,
  formatSets,
  personalBest,
  setExerciseSets,
  setNote,
  type AppData,
  type SetLog,
} from '../lib/store'

interface Props {
  data: AppData
  date: string
  day: DayNumber
  index: number
  onIndexChange: (i: number) => void
  onClose: () => void
  onSetCompleted: () => void
  bottomSlot?: ReactNode
}

export function LoggerPage({ data, date, day, index, onIndexChange, onClose, onSetCompleted, bottomSlot }: Props) {
  const plan = getDayPlan(day)
  const ex = EXERCISES[plan.exercises[index]]
  const { sid, last, sets, done, total } = exerciseState(data, date, day, ex)
  const prevBest = personalBest(data, ex.id, sid)
  const sessionBest = Math.max(0, ...sets.filter((s) => s.done).map((s) => s.kg))
  const isPR = prevBest > 0 && sessionBest > prevBest
  const isLast = index === plan.exercises.length - 1
  const allDone = done >= total && total > 0

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [index])

  const save = (next: SetLog[]) => setExerciseSets(date, day, ex.id, next)

  const update = (i: number, patch: Partial<SetLog>) => {
    const next = sets.map((s) => ({ ...s }))
    if (patch.kg !== undefined) {
      // Carry a weight change forward to the following not-yet-done sets that had the same weight.
      const old = next[i].kg
      for (let j = i + 1; j < next.length; j++) if (!next[j].done && next[j].kg === old) next[j].kg = patch.kg
    }
    next[i] = { ...next[i], ...patch }
    save(next)
  }

  const toggleDone = (i: number) => {
    const becomingDone = !sets[i].done
    update(i, { done: becomingDone })
    if (becomingDone) {
      navigator.vibrate?.(30)
      onSetCompleted()
    }
  }

  const addSet = () => {
    const src = sets[sets.length - 1] ?? { kg: 0, reps: 10 }
    save([...sets, { kg: src.kg, reps: src.reps, done: false }])
  }

  const removeSet = () => {
    if (sets.length > 1) save(sets.slice(0, -1))
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 bg-zinc-950/90 pt-safe backdrop-blur-xl">
        <div className="flex h-14 items-center gap-2 px-2">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 items-center gap-0.5 rounded-xl pl-1 pr-3 font-semibold text-accent active:bg-white/5"
          >
            <ChevronLeft className="h-6 w-6" /> Day {day}
          </button>
          <div className="flex-1" />
          <div className="flex gap-1" aria-label={`Exercise ${index + 1} of ${plan.exercises.length}`}>
            {plan.exercises.map((id, i) => (
              <button
                key={id}
                type="button"
                aria-label={`Go to ${EXERCISES[id].name}`}
                onClick={() => onIndexChange(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-5 bg-accent' : 'w-2 bg-zinc-700'}`}
              />
            ))}
          </div>
          <div className="w-3" />
        </div>
      </header>

      <main className="flex-1 space-y-5 px-4 pb-6 pt-1">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            Exercise {index + 1} of {plan.exercises.length}
          </p>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white">{ex.name}</h1>
        </div>

        <ImageViewer key={ex.id} images={ex.images} alt={ex.name} />

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1.5 text-zinc-200">
            <Dumbbell className="h-4 w-4 text-accent" /> {ex.machine}
          </span>
          <span className="rounded-full bg-zinc-900 px-3 py-1.5 font-semibold text-zinc-200">
            {ex.sets} sets × {ex.reps} reps
          </span>
        </div>

        <section className="flex items-stretch gap-2">
          <div className="flex-1 rounded-2xl bg-zinc-900 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Last time{last ? ` · ${relativeDay(last.session.date)}` : ''}
            </div>
            <div className="mt-0.5 font-semibold text-white">{last ? formatSets(last.sets) : 'First time, find a comfortable weight'}</div>
          </div>
          {prevBest > 0 && (
            <div
              className={`flex flex-col items-center justify-center rounded-2xl px-3 ${
                isPR ? 'animate-pop bg-accent text-zinc-950' : 'bg-zinc-900 text-zinc-300'
              }`}
            >
              <Trophy className="h-4 w-4" />
              <div className="text-sm font-bold tabular-nums">{formatKg(isPR ? sessionBest : prevBest)} kg</div>
              <div className="text-[10px] font-semibold uppercase">{isPR ? 'New PR!' : 'Best'}</div>
            </div>
          )}
        </section>

        <section aria-label="Sets">
          <div className="mb-2 grid grid-cols-[1.75rem_1.2fr_1fr_2.75rem] gap-2 px-2 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <span>Set</span>
            <span>kg</span>
            <span>Reps</span>
            <span>Done</span>
          </div>
          <div className="space-y-2">
            {sets.map((s, i) => (
              <SetRow
                key={i}
                index={i}
                set={s}
                kgStep={data.settings.kgStep}
                onChange={(p) => update(i, p)}
                onToggleDone={() => toggleDone(i)}
              />
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={addSet}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 text-sm font-semibold text-zinc-200 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" /> Add set
            </button>
            <button
              type="button"
              onClick={removeSet}
              disabled={sets.length <= 1}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-zinc-400 active:scale-[0.98] disabled:opacity-40"
            >
              <Trash className="h-4 w-4" /> Remove
            </button>
          </div>
        </section>

        <NoteField key={ex.id} value={data.notes[ex.id] ?? ''} onSave={(v) => setNote(ex.id, v)} />

        <details className="group rounded-2xl bg-zinc-900 p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-white">
            How to do it
            <ChevronDown className="h-5 w-5 text-zinc-500 transition group-open:rotate-180" />
          </summary>
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {[...ex.primaryMuscles, ...ex.secondaryMuscles].map((m, i) => (
              <span
                key={m}
                className={`rounded-full px-2.5 py-1 capitalize ${
                  i < ex.primaryMuscles.length ? 'bg-accent/15 font-semibold text-accent' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {m}
              </span>
            ))}
          </div>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-300">
            {ex.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </details>
      </main>

      <footer className="sticky bottom-0 z-20">
        {bottomSlot}
        <div className="border-t border-white/5 bg-zinc-950/90 pb-safe backdrop-blur-xl">
          <div className="flex gap-2 p-3">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onIndexChange(index - 1)}
              aria-label="Previous exercise"
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-zinc-900 text-zinc-200 active:scale-95 disabled:opacity-30"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => (isLast ? onClose() : onIndexChange(index + 1))}
              className={`flex h-14 min-w-0 flex-1 items-center justify-center gap-1 rounded-2xl px-3 text-lg font-bold transition active:scale-[0.98] ${
                allDone ? 'bg-accent text-zinc-950' : 'bg-zinc-800 text-white'
              }`}
            >
              {isLast ? (
                'Finish workout'
              ) : (
                <>
                  <span className="truncate">Next: {EXERCISES[plan.exercises[index + 1]].name}</span>
                  <ChevronRight className="h-5 w-5 shrink-0" />
                </>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NoteField({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [text, setText] = useState(value)
  return (
    <label className="block rounded-2xl bg-zinc-900 p-3">
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
        <Note className="h-3.5 w-3.5" /> Machine notes
      </span>
      <textarea
        rows={2}
        value={text}
        placeholder="e.g. seat height 4, back pad 2"
        onChange={(e) => {
          setText(e.target.value)
          onSave(e.target.value)
        }}
        className="mt-1 w-full resize-none bg-transparent text-base text-white placeholder:text-zinc-600 outline-none"
      />
    </label>
  )
}
