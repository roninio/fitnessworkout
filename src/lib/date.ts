import type { DayNumber } from '../data/plan'

export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

/** Monday = Day 1 … Sunday = Day 7 */
export const planDayForDate = (d: Date): DayNumber => (((d.getDay() + 6) % 7) + 1) as DayNumber

export const toISODate = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const todayISO = () => toISODate(new Date())

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = {}) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...opts,
  })
}

export const daysAgo = (iso: string): number => {
  const [y, m, d] = iso.split('-').map(Number)
  const then = new Date(y, m - 1, d).getTime()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.round((today - then) / 86_400_000)
}

export const relativeDay = (iso: string): string => {
  const n = daysAgo(iso)
  if (n === 0) return 'today'
  if (n === 1) return 'yesterday'
  if (n < 7) return `${n} days ago`
  return formatDate(iso)
}
