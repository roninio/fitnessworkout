import type { ExerciseId } from './exercises'

export type DayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface DayPlan {
  day: DayNumber
  title: string
  rest: boolean
  /** Lighter skill/conditioning day, shown with a wave icon. */
  surf?: boolean
  exercises: ExerciseId[]
}

const SURF_POPUP: ExerciseId[] = [
  'worlds-greatest-stretch',
  'plyo-push-up',
  'popup-drill',
  'ball-knee-tuck',
  'knee-raise',
  'face-pull',
  'burpee-popup',
]

export const PLAN: DayPlan[] = [
  {
    day: 1,
    title: 'Chest, Back & Arms',
    rest: false,
    exercises: ['chest-press', 'incline-press', 'lat-pulldown', 'seated-row', 'bicep-curls', 'tricep-pushdowns'],
  },
  {
    day: 2,
    title: 'Quads, Hamstrings & Calves',
    rest: false,
    exercises: ['barbell-squats', 'rdl', 'goblet-squat', 'leg-extensions', 'dumbbell-calf-raise', 'hamstring-curls'],
  },
  { day: 3, title: 'Surf Pop-Up', rest: false, surf: true, exercises: SURF_POPUP },
  {
    day: 4,
    title: 'Shoulders, Chest & Back',
    rest: false,
    exercises: [
      'shoulder-press',
      'lateral-raises',
      'chest-flies',
      'lat-pulldown',
      'rear-delt-flies',
      'overhead-tricep-extensions',
    ],
  },
  {
    day: 5,
    title: 'Glutes, Hamstrings & Quads',
    rest: false,
    exercises: ['leg-extensions', 'goblet-squat', 'hamstring-curls', 'walking-lunges', 'dumbbell-calf-raise', 'rdl'],
  },
  { day: 6, title: 'Surf Pop-Up', rest: false, surf: true, exercises: SURF_POPUP },
  { day: 7, title: 'Rest Day', rest: true, exercises: [] },
]

export const getDayPlan = (day: DayNumber): DayPlan => PLAN[day - 1]

export const nextWorkoutDay = (day: DayNumber): DayPlan => {
  for (let i = 1; i <= 7; i++) {
    const p = PLAN[(day - 1 + i) % 7]
    if (!p.rest) return p
  }
  return PLAN[0]
}
