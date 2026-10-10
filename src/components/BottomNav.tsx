import { Chart, Dumbbell, Gear } from './Icons'

export type Tab = 'today' | 'history' | 'settings'

const TABS: { id: Tab; label: string; Icon: typeof Dumbbell }[] = [
  { id: 'today', label: 'Workout', Icon: Dumbbell },
  { id: 'history', label: 'Progress', Icon: Chart },
  { id: 'settings', label: 'Settings', Icon: Gear },
]

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="border-t border-white/5 bg-zinc-950/90 pb-safe backdrop-blur-xl">
      <div className="mx-auto flex max-w-md">
        {TABS.map(({ id, label, Icon }) => {
          const active = id === tab
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
                active ? 'text-accent' : 'text-zinc-500 active:text-zinc-300'
              }`}
            >
              <Icon className="h-6 w-6" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
