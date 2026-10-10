import { DaySwitcher } from '../components/DaySwitcher'
import { ExerciseCard } from '../components/ExerciseCard'
import { ChevronRight, Moon, Trophy } from '../components/Icons'
import { InstallBanner } from '../components/InstallBanner'
import { EXERCISES } from '../data/exercises'
import { getDayPlan, nextWorkoutDay, type DayNumber } from '../data/plan'
import { formatDate, toISODate, WEEKDAY_SHORT } from '../lib/date'
import { exerciseState, sessionHasData, type AppData } from '../lib/store'

interface Props {
  data: AppData
  date: string
  todayDay: DayNumber
  selectedDay: DayNumber
  onSelectDay: (d: DayNumber) => void
  onOpenExercise: (index: number) => void
}

/** Plan days that already have logged sets in the current Mon–Sun week. */
function completedThisWeek(data: AppData, date: string, todayDay: DayNumber): Set<DayNumber> {
  const [y, m, d] = date.split('-').map(Number)
  const monday = toISODate(new Date(y, m - 1, d - (todayDay - 1)))
  const set = new Set<DayNumber>()
  for (const s of Object.values(data.sessions)) {
    if (s.date >= monday && s.date <= date && sessionHasData(s)) set.add(s.day)
  }
  return set
}

export function TodayPage({ data, date, todayDay, selectedDay, onSelectDay, onOpenExercise }: Props) {
  const plan = getDayPlan(selectedDay)
  const isToday = selectedDay === todayDay
  const states = plan.exercises.map((id) => exerciseState(data, date, selectedDay, EXERCISES[id]))
  const exercisesDone = states.filter((s) => s.done >= s.total && s.total > 0).length
  const setsDone = states.reduce((n, s) => n + s.done, 0)
  const setsTotal = states.reduce((n, s) => n + s.total, 0)
  const allDone = !plan.rest && exercisesDone === plan.exercises.length

  return (
    <div className="space-y-5 px-4 pt-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-400">{formatDate(date, { weekday: 'long' })}</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {plan.rest ? 'Rest Day' : `Day ${plan.day}`}
          </h1>
          {!plan.rest && <p className="text-base font-medium text-accent">{plan.title}</p>}
        </div>
        {!plan.rest && (
          <div className="text-right">
            <div className="text-2xl font-bold tabular-nums text-white">
              {exercisesDone}
              <span className="text-zinc-500">/{plan.exercises.length}</span>
            </div>
            <div className="text-xs text-zinc-500">exercises</div>
          </div>
        )}
      </header>

      <DaySwitcher
        selected={selectedDay}
        today={todayDay}
        completed={completedThisWeek(data, date, todayDay)}
        onSelect={onSelectDay}
      />

      {!isToday && (
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm">
          <span className="text-zinc-400">
            Logging <span className="font-semibold text-zinc-200">Day {selectedDay}</span> for today
          </span>
          <button type="button" className="font-semibold text-accent" onClick={() => onSelectDay(todayDay)}>
            Back to today
          </button>
        </div>
      )}

      <InstallBanner />

      {plan.rest ? (
        <RestDay day={selectedDay} onPreview={onSelectDay} />
      ) : (
        <>
          <div>
            <div className="mb-1.5 flex justify-between text-xs font-medium text-zinc-400">
              <span>Workout progress</span>
              <span className="tabular-nums">
                {setsDone}/{setsTotal} sets
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${setsTotal ? (setsDone / setsTotal) * 100 : 0}%` }}
              />
            </div>
          </div>

          {allDone && (
            <div className="animate-slide-up flex items-center gap-3 rounded-2xl bg-accent p-4 text-zinc-950">
              <Trophy className="h-8 w-8 shrink-0" />
              <div>
                <div className="font-bold">Workout complete!</div>
                <div className="text-sm opacity-80">Great work. Your weights are saved for next time.</div>
              </div>
            </div>
          )}

          <ol className="space-y-2.5">
            {plan.exercises.map((id, i) => (
              <li key={id}>
                <ExerciseCard
                  index={i}
                  exercise={EXERCISES[id]}
                  done={states[i].done}
                  total={states[i].total}
                  last={states[i].last}
                  onOpen={() => onOpenExercise(i)}
                />
              </li>
            ))}
          </ol>

          {setsDone === 0 && (
            <button
              type="button"
              onClick={() => onOpenExercise(0)}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-lg font-bold text-zinc-950 active:scale-[0.98]"
            >
              Start workout <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </>
      )}
    </div>
  )
}

function RestDay({ day, onPreview }: { day: DayNumber; onPreview: (d: DayNumber) => void }) {
  const next = nextWorkoutDay(day)
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center rounded-3xl bg-zinc-900 px-6 py-10 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-indigo-500/15 text-indigo-300">
          <Moon className="h-10 w-10" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-white">Recover & recharge</h2>
        <p className="mt-1 max-w-xs text-sm text-zinc-400">
          Muscles grow when you rest. Sleep well, eat enough protein, and maybe go for a walk.
        </p>
      </div>
      <button
        type="button"
        onClick={() => onPreview(next.day)}
        className="flex w-full items-center gap-3 rounded-2xl bg-zinc-900 p-4 text-left active:scale-[0.98]"
      >
        <div className="flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">Next workout</div>
          <div className="font-semibold text-white">
            Day {next.day} · {WEEKDAY_SHORT[next.day - 1]}
          </div>
          <div className="text-sm text-accent">{next.title}</div>
        </div>
        <ChevronRight className="h-5 w-5 text-zinc-500" />
      </button>
      <p className="text-center text-xs text-zinc-500">Training anyway? Pick a workout day above.</p>
    </div>
  )
}
