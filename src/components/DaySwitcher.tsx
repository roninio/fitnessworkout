import { PLAN, type DayNumber } from '../data/plan'
import { WEEKDAY_SHORT } from '../lib/date'
import { Moon, Wave } from './Icons'

interface Props {
  selected: DayNumber
  today: DayNumber
  completed: Set<DayNumber>
  onSelect: (d: DayNumber) => void
}

export function DaySwitcher({ selected, today, completed, onSelect }: Props) {
  return (
    <div role="tablist" aria-label="Plan day" className="grid grid-cols-7 gap-1.5">
      {PLAN.map((p) => {
        const active = p.day === selected
        const isToday = p.day === today
        return (
          <button
            key={p.day}
            role="tab"
            type="button"
            aria-selected={active}
            aria-label={`Day ${p.day}, ${WEEKDAY_SHORT[p.day - 1]}, ${p.title}${isToday ? ', today' : ''}`}
            onClick={() => onSelect(p.day)}
            className={`relative flex h-16 flex-col items-center justify-center rounded-2xl text-xs font-semibold transition active:scale-95 ${
              active ? 'bg-accent text-zinc-950' : p.rest ? 'bg-zinc-900 text-zinc-500' : 'bg-zinc-900 text-zinc-200'
            } ${isToday && !active ? 'ring-2 ring-inset ring-accent/60' : ''}`}
          >
            <span className={`text-[10px] uppercase ${active ? 'text-zinc-900/70' : 'text-zinc-500'}`}>
              {isToday ? 'Today' : WEEKDAY_SHORT[p.day - 1]}
            </span>
            {p.rest ? (
              <Moon className="mt-0.5 h-4 w-4" />
            ) : p.surf ? (
              <Wave className={`mt-0.5 h-5 w-5 ${active ? '' : 'text-sky-400'}`} />
            ) : (
              <span className="text-base leading-tight">D{p.day}</span>
            )}
            {completed.has(p.day) && (
              <span className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${active ? 'bg-zinc-950' : 'bg-accent'}`} />
            )}
          </button>
        )
      })}
    </div>
  )
}
