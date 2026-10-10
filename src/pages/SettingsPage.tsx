import { useRef, useState, type ReactNode } from 'react'
import { Download, Trash, Upload } from '../components/Icons'
import { todayISO } from '../lib/date'
import { isStandalone } from '../lib/install'
import { exportJSON, getSaveError, importJSON, resetAll, sessionHasData, updateSettings, type AppData } from '../lib/store'

const REST_OPTIONS = [60, 90, 120, 180]
const STEP_OPTIONS = [1, 2.5, 5]

export function SettingsPage({ data }: { data: AppData }) {
  const { settings } = data
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const workouts = Object.values(data.sessions).filter(sessionHasData).length
  const saveError = getSaveError()

  const doExport = async () => {
    const name = `gym-plan-backup-${todayISO()}.json`
    const file = new File([exportJSON()], name, { type: 'application/json' })
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Gym Plan backup' })
        return
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
    }
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const doImport = async (f: File | undefined) => {
    if (!f) return
    if (!confirm('Replace all current data with this backup?')) return
    const res = importJSON(await f.text())
    setMessage(res.ok ? { ok: true, text: `Backup restored (${res.sessions} workouts).` } : { ok: false, text: res.error })
  }

  return (
    <div className="space-y-6 px-4 pt-4">
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>

      {saveError && (
        <p className="rounded-2xl bg-red-500/15 p-3 text-sm text-red-300">Couldn't save to this device: {saveError}</p>
      )}

      <Group title="Rest timer">
        <Row label="Start timer after each set">
          <Toggle checked={settings.restTimerEnabled} onChange={(v) => updateSettings({ restTimerEnabled: v })} />
        </Row>
        <Row label="Rest length">
          <Chips
            options={REST_OPTIONS}
            value={settings.restSeconds}
            format={(s) => (s % 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s / 60} min`)}
            onChange={(restSeconds) => updateSettings({ restSeconds })}
          />
        </Row>
      </Group>

      <Group title="Weights">
        <Row label="+/− step">
          <Chips options={STEP_OPTIONS} value={settings.kgStep} format={(v) => `${v} kg`} onChange={(kgStep) => updateSettings({ kgStep })} />
        </Row>
      </Group>

      <Group title="Your data">
        <p className="px-4 pt-3 text-sm text-zinc-400">
          {workouts} workout{workouts === 1 ? '' : 's'} saved on this device only. Export a backup now and then so you
          don't lose your history if you change phones.
        </p>
        <div className="grid grid-cols-2 gap-2 p-3">
          <ActionButton onClick={() => void doExport()} icon={<Download className="h-5 w-5" />}>
            Export backup
          </ActionButton>
          <ActionButton onClick={() => fileRef.current?.click()} icon={<Upload className="h-5 w-5" />}>
            Import backup
          </ActionButton>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            void doImport(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        {message && (
          <p className={`px-4 pb-3 text-sm ${message.ok ? 'text-accent' : 'text-red-400'}`} role="status">
            {message.text}
          </p>
        )}
      </Group>

      <Group title="Danger zone">
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              if (confirm('Delete ALL workouts, notes and settings? This cannot be undone.')) {
                resetAll()
                setMessage({ ok: true, text: 'All data deleted.' })
              }
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 font-semibold text-red-400 active:scale-[0.98]"
          >
            <Trash className="h-5 w-5" /> Reset all data
          </button>
        </div>
      </Group>

      <div className="space-y-1 pb-4 text-center text-xs text-zinc-600">
        <p>{isStandalone() ? 'Running as installed app' : 'Tip: add to your home screen for offline use'}</p>
        <p>
          Exercise images & instructions:{' '}
          <a className="underline" href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noreferrer">
            free-exercise-db
          </a>{' '}
          (public domain)
        </p>
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</h2>
      <div className="divide-y divide-white/5 overflow-hidden rounded-2xl bg-zinc-900">{children}</div>
    </section>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-4 py-2.5">
      <span className="text-zinc-200">{label}</span>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 rounded-full transition ${checked ? 'bg-accent' : 'bg-zinc-700'}`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'left-7' : 'left-1'}`}
      />
    </button>
  )
}

function Chips<T extends number>({
  options,
  value,
  onChange,
  format,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  format: (v: T) => string
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
          className={`h-9 rounded-xl px-3 text-sm font-semibold transition active:scale-95 ${
            o === value ? 'bg-accent text-zinc-950' : 'bg-zinc-800 text-zinc-300'
          }`}
        >
          {format(o)}
        </button>
      ))}
    </div>
  )
}

function ActionButton({ onClick, icon, children }: { onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-800 text-sm font-semibold text-white active:scale-[0.98]"
    >
      {icon}
      {children}
    </button>
  )
}
