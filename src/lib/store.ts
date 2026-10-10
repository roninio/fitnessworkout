import { useSyncExternalStore } from 'react'
import { EXERCISES, type Exercise, type ExerciseId } from '../data/exercises'
import type { DayNumber } from '../data/plan'

export interface SetLog {
  kg: number
  reps: number
  done: boolean
}

export interface Session {
  id: string
  date: string // YYYY-MM-DD
  day: DayNumber
  entries: Partial<Record<ExerciseId, SetLog[]>>
  updatedAt: number
}

export interface Settings {
  restTimerEnabled: boolean
  restSeconds: number
  kgStep: number
}

export interface AppData {
  version: 1
  sessions: Record<string, Session>
  /** Per-exercise persistent notes, e.g. "seat height 4". */
  notes: Partial<Record<ExerciseId, string>>
  settings: Settings
}

const STORAGE_KEY = 'gym-plan:v1'

export const DEFAULT_SETTINGS: Settings = { restTimerEnabled: true, restSeconds: 90, kgStep: 2.5 }

const emptyData = (): AppData => ({ version: 1, sessions: {}, notes: {}, settings: { ...DEFAULT_SETTINGS } })

export const sessionId = (date: string, day: DayNumber) => `${date}_d${day}`

function isValidData(x: unknown): x is AppData {
  if (!x || typeof x !== 'object') return false
  const d = x as Partial<AppData>
  return d.version === 1 && typeof d.sessions === 'object' && d.sessions !== null
}

function normalize(d: AppData): AppData {
  return {
    version: 1,
    sessions: d.sessions ?? {},
    notes: d.notes ?? {},
    settings: { ...DEFAULT_SETTINGS, ...(d.settings ?? {}) },
  }
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed: unknown = JSON.parse(raw)
    return isValidData(parsed) ? normalize(parsed) : emptyData()
  } catch {
    return emptyData()
  }
}

let data: AppData = load()
const listeners = new Set<() => void>()
let saveError: string | null = null

function emit() {
  listeners.forEach((l) => l())
}

function commit(next: AppData) {
  data = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    saveError = null
  } catch (e) {
    saveError = e instanceof Error ? e.message : 'Could not save'
  }
  emit()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      data = load()
      emit()
    }
  })
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export const useAppData = () => useSyncExternalStore(subscribe, () => data)
export const getSaveError = () => saveError

// ---------- mutations ----------

export function setExerciseSets(date: string, day: DayNumber, exId: ExerciseId, sets: SetLog[]) {
  const id = sessionId(date, day)
  const prev = data.sessions[id] ?? { id, date, day, entries: {}, updatedAt: 0 }
  const entries = { ...prev.entries, [exId]: sets }
  const sessions = { ...data.sessions }
  if (Object.values(entries).some((s) => s && s.length)) {
    sessions[id] = { ...prev, entries, updatedAt: Date.now() }
  } else {
    delete sessions[id]
  }
  commit({ ...data, sessions })
}

export function setNote(exId: ExerciseId, note: string) {
  const notes = { ...data.notes }
  if (note.trim()) notes[exId] = note
  else delete notes[exId]
  commit({ ...data, notes })
}

export function deleteSession(id: string) {
  const sessions = { ...data.sessions }
  delete sessions[id]
  commit({ ...data, sessions })
}

export function updateSettings(patch: Partial<Settings>) {
  commit({ ...data, settings: { ...data.settings, ...patch } })
}

export function resetAll() {
  commit(emptyData())
}

export function exportJSON(): string {
  return JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2)
}

export function importJSON(text: string): { ok: true; sessions: number } | { ok: false; error: string } {
  try {
    const parsed: unknown = JSON.parse(text)
    if (!isValidData(parsed)) return { ok: false, error: 'This file is not a Gym Plan backup.' }
    const next = normalize(parsed)
    commit(next)
    return { ok: true, sessions: Object.keys(next.sessions).length }
  } catch {
    return { ok: false, error: 'Could not read the file (invalid JSON).' }
  }
}

// ---------- queries ----------

const byRecent = (a: Session, b: Session) => (a.date === b.date ? b.updatedAt - a.updatedAt : a.date < b.date ? 1 : -1)

export const sortedSessions = (d: AppData): Session[] => Object.values(d.sessions).sort(byRecent)

export const doneSets = (sets: SetLog[] | undefined): SetLog[] => (sets ?? []).filter((s) => s.done)

export interface LastPerformance {
  session: Session
  sets: SetLog[]
}

/** Most recent logged (done) sets for an exercise, excluding the given session. */
export function lastPerformance(d: AppData, exId: ExerciseId, excludeSessionId?: string): LastPerformance | null {
  for (const s of sortedSessions(d)) {
    if (s.id === excludeSessionId) continue
    const sets = doneSets(s.entries[exId])
    if (sets.length) return { session: s, sets }
  }
  return null
}

const firstNumber = (reps: string) => {
  const m = reps.match(/\d+/)
  return m ? Number(m[0]) : 10
}

/** Initial set rows for an exercise: copies last session's weights/reps, or the plan default. */
export function initialSets(ex: Exercise, last: LastPerformance | null): SetLog[] {
  const count = Math.max(ex.sets, last?.sets.length ?? 0)
  return Array.from({ length: count }, (_, i) => {
    const src = last?.sets[Math.min(i, last.sets.length - 1)]
    return { kg: src?.kg ?? 0, reps: src?.reps ?? firstNumber(ex.reps), done: false }
  })
}

export const topSet = (sets: SetLog[]): SetLog | null =>
  sets.reduce<SetLog | null>(
    (best, s) => (!best || s.kg > best.kg || (s.kg === best.kg && s.reps > best.reps) ? s : best),
    null,
  )

/** Per-session top weight for an exercise, oldest first. */
export function progression(d: AppData, exId: ExerciseId): { date: string; kg: number; reps: number }[] {
  return sortedSessions(d)
    .map((s) => ({ s, top: topSet(doneSets(s.entries[exId])) }))
    .filter((x): x is { s: Session; top: SetLog } => x.top !== null)
    .map(({ s, top }) => ({ date: s.date, kg: top.kg, reps: top.reps }))
    .reverse()
}

export const formatKg = (kg: number) => String(Math.round(kg * 100) / 100)

/** "40 kg", or "BW" for bodyweight-only sets. */
export const formatLoad = (kg: number) => (kg === 0 ? 'BW' : `${formatKg(kg)} kg`)

export const formatSets = (sets: SetLog[]) => {
  if (!sets.length) return ''
  const sameKg = sets.every((s) => s.kg === sets[0].kg)
  if (sameKg) return `${formatLoad(sets[0].kg)} × ${sets.map((s) => s.reps).join(', ')}`
  return sets.map((s) => `${s.kg === 0 ? 'BW' : formatKg(s.kg)}×${s.reps}`).join(' · ')
}

export const allExerciseIds = Object.keys(EXERCISES) as ExerciseId[]

/** Everything the UI needs about one exercise in one session. */
export function exerciseState(d: AppData, date: string, day: DayNumber, ex: Exercise) {
  const sid = sessionId(date, day)
  const last = lastPerformance(d, ex.id, sid)
  const stored = d.sessions[sid]?.entries[ex.id]
  const sets = stored ?? initialSets(ex, last)
  return { sid, last, sets, done: doneSets(stored).length, total: sets.length }
}

/** Heaviest weight ever completed for an exercise, optionally excluding one session. */
export function personalBest(d: AppData, exId: ExerciseId, excludeSessionId?: string): number {
  let best = 0
  for (const s of Object.values(d.sessions)) {
    if (s.id === excludeSessionId) continue
    for (const set of doneSets(s.entries[exId])) best = Math.max(best, set.kg)
  }
  return best
}

export const sessionHasData = (s: Session) => Object.values(s.entries).some((sets) => doneSets(sets).length > 0)
