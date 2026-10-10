import { useCallback, useEffect, useState } from 'react'
import { BottomNav, type Tab } from './components/BottomNav'
import { RestTimer, type RestState } from './components/RestTimer'
import type { DayNumber } from './data/plan'
import { planDayForDate, todayISO } from './lib/date'
import { requestPersistentStorage } from './lib/install'
import { unlockAudio } from './lib/rest'
import { useAppData } from './lib/store'
import { HistoryPage } from './pages/HistoryPage'
import { LoggerPage } from './pages/LoggerPage'
import { SettingsPage } from './pages/SettingsPage'
import { TodayPage } from './pages/TodayPage'

/** Re-reads the calendar date when the app comes back to the foreground (e.g. opened the next day). */
function useToday() {
  const [date, setDate] = useState(todayISO)
  useEffect(() => {
    const check = () => setDate(todayISO())
    document.addEventListener('visibilitychange', check)
    const t = setInterval(check, 60_000)
    return () => {
      document.removeEventListener('visibilitychange', check)
      clearInterval(t)
    }
  }, [])
  return date
}

export default function App() {
  const data = useAppData()
  const date = useToday()
  const todayDay = planDayForDate(new Date(`${date}T12:00:00`))
  const [selectedDay, setSelectedDay] = useState<DayNumber>(todayDay)
  const [selectedFor, setSelectedFor] = useState(todayDay)
  const [tab, setTab] = useState<Tab>('today')
  const [loggerIndex, setLoggerIndex] = useState<number | null>(null)
  const [rest, setRest] = useState<RestState | null>(null)

  // When the calendar day rolls over, jump back to that day's plan.
  if (selectedFor !== todayDay) {
    setSelectedFor(todayDay)
    setSelectedDay(todayDay)
  }
  useEffect(requestPersistentStorage, [])

  // Make the phone/browser back button close the exercise screen instead of leaving the app.
  useEffect(() => {
    const onPop = () => setLoggerIndex(null)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const openLogger = (i: number) => {
    history.pushState({ logger: true }, '')
    setLoggerIndex(i)
  }
  const closeLogger = () => {
    if ((history.state as { logger?: boolean } | null)?.logger) history.back()
    else setLoggerIndex(null)
  }

  const onSetCompleted = useCallback(() => {
    if (!data.settings.restTimerEnabled) return
    unlockAudio()
    const total = data.settings.restSeconds
    setRest({ endsAt: Date.now() + total * 1000, total })
  }, [data.settings.restTimerEnabled, data.settings.restSeconds])

  const restBar = rest && <RestTimer rest={rest} onChange={setRest} />

  if (loggerIndex !== null) {
    return (
      <div className="mx-auto max-w-md">
        <LoggerPage
          data={data}
          date={date}
          day={selectedDay}
          index={loggerIndex}
          onIndexChange={setLoggerIndex}
          onClose={closeLogger}
          onSetCompleted={onSetCompleted}
          bottomSlot={restBar}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <main className={`flex-1 pt-safe ${rest ? "pb-48" : "pb-28"}`}>
        {tab === 'today' && (
          <TodayPage
            data={data}
            date={date}
            todayDay={todayDay}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onOpenExercise={openLogger}
          />
        )}
        {tab === 'history' && <HistoryPage data={data} />}
        {tab === 'settings' && <SettingsPage data={data} />}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-30">
        {restBar}
        <BottomNav
          tab={tab}
          onChange={(t) => {
            setTab(t)
            window.scrollTo({ top: 0 })
          }}
        />
      </div>
    </div>
  )
}
