import { useState } from 'react'
import { ChevronDown, Chart, Trash } from '../components/Icons'
import { Sparkline } from '../components/Sparkline'
import { EXERCISES, type ExerciseId } from '../data/exercises'
import { getDayPlan } from '../data/plan'
import { daysAgo, formatDate, relativeDay } from '../lib/date'
import {
  allExerciseIds,
  deleteSession,
  doneSets,
  formatKg,
  formatLoad,
  formatSets,
  progression,
  sessionHasData,
  sortedSessions,
  type AppData,
} from '../lib/store'

type View = 'exercises' | 'sessions'

export function HistoryPage({ data }: { data: AppData }) {
  const [view, setView] = useState<View>('exercises')
  const sessions = sortedSessions(data).filter(sessionHasData)

  return (
    <div className="space-y-4 px-4 pt-4">
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Progress</h1>

      <div role="tablist" className="grid grid-cols-2 rounded-2xl bg-zinc-900 p-1">
        {(['exercises', 'sessions'] as View[]).map((v) => (
          <button
            key={v}
            role="tab"
            type="button"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`h-10 rounded-xl text-sm font-semibold transition ${
              view === v ? 'bg-zinc-700 text-white' : 'text-zinc-400'
            }`}
          >
            {v === 'exercises' ? 'By exercise' : `Workouts (${sessions.length})`}
          </button>
        ))}
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl bg-zinc-900 px-6 py-12 text-center">
          <Chart className="h-10 w-10 text-zinc-600" />
          <h2 className="mt-3 font-semibold text-white">No workouts logged yet</h2>
          <p className="mt-1 text-sm text-zinc-400">Complete a set on the Workout tab and your progress shows up here.</p>
        </div>
      ) : view === 'exercises' ? (
        <ExerciseProgress data={data} />
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => {
            const plan = getDayPlan(s.day)
            const entries = plan.exercises
              .concat((Object.keys(s.entries) as ExerciseId[]).filter((id) => !plan.exercises.includes(id)))
              .map((id) => ({ id, sets: doneSets(s.entries[id]) }))
              .filter((e) => e.sets.length)
            return (
              <li key={s.id} className="rounded-3xl bg-zinc-900 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {formatDate(s.date)}
                      {daysAgo(s.date) < 7 ? ` · ${relativeDay(s.date)}` : ''}
                    </div>
                    <div className="font-semibold text-white">
                      Day {s.day} · <span className="text-accent">{plan.title}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Delete workout"
                    onClick={() => {
                      if (confirm(`Delete the ${formatDate(s.date)} workout?`)) deleteSession(s.id)
                    }}
                    className="-m-1 p-2 text-zinc-600 active:text-red-400"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
                <ul className="mt-3 divide-y divide-white/5">
                  {entries.map((e) => (
                    <li key={e.id} className="flex justify-between gap-3 py-2 text-sm">
                      <span className="text-zinc-300">{EXERCISES[e.id].name}</span>
                      <span className="text-right font-medium tabular-nums text-white">{formatSets(e.sets)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function ExerciseProgress({ data }: { data: AppData }) {
  const [open, setOpen] = useState<ExerciseId | null>(null)
  const rows = allExerciseIds
    .map((id) => ({ id, ex: EXERCISES[id], points: progression(data, id) }))
    .filter((r) => r.points.length > 0)

  return (
    <ul className="space-y-2.5">
      {rows.map(({ id, ex, points }) => {
        const first = points[0]
        const latest = points[points.length - 1]
        // Bodyweight-only exercises are tracked by reps instead of kg.
        const bw = points.every((p) => p.kg === 0)
        const metric = (p: { kg: number; reps: number }) => (bw ? p.reps : p.kg)
        const unit = bw ? 'reps' : 'kg'
        const best = Math.max(...points.map(metric))
        const delta = metric(latest) - metric(first)
        const isOpen = open === id
        return (
          <li key={id} className="overflow-hidden rounded-3xl bg-zinc-900">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : id)}
              className="flex w-full items-center gap-3 p-3 text-left"
            >
              <img src={ex.images[0]} alt="" loading="lazy" className="h-12 w-14 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-white">{ex.name}</div>
                <div className="text-sm text-zinc-400">
                  <span className="font-semibold tabular-nums text-white">
                    {formatLoad(latest.kg)} × {latest.reps}
                  </span>
                  {points.length > 1 && (
                    <span
                      className={`ml-2 font-semibold ${delta > 0 ? 'text-accent' : delta < 0 ? 'text-red-400' : 'text-zinc-500'}`}
                    >
                      {delta > 0 ? '+' : ''}
                      {formatKg(delta)} {unit}
                    </span>
                  )}
                </div>
              </div>
              <Sparkline values={points.map(metric)} width={72} />
              <ChevronDown className={`h-5 w-5 shrink-0 text-zinc-600 transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="border-t border-white/5 px-4 pb-3 pt-2 text-sm">
                <div className="mb-1 flex justify-between text-xs text-zinc-500">
                  <span>
                    {points.length} workout{points.length === 1 ? '' : 's'}
                  </span>
                  <span>
                    Best {formatKg(best)} {unit}
                  </span>
                </div>
                <ul className="divide-y divide-white/5">
                  {[...points].reverse().map((p, i) => (
                    <li key={`${p.date}-${i}`} className="flex justify-between py-1.5">
                      <span className="text-zinc-400">{formatDate(p.date)}</span>
                      <span className="font-medium tabular-nums text-white">
                        {formatLoad(p.kg)} × {p.reps}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
