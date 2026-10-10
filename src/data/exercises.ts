import exerciseDb from './exerciseDb.json'

export type ExerciseId = keyof typeof exerciseDb

export interface Exercise {
  id: ExerciseId
  name: string
  /** Short hint about the machine / equipment to look for in the gym. */
  machine: string
  sets: number
  reps: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  images: string[]
}

interface ExerciseMeta {
  name: string
  machine: string
  sets?: number
  reps?: string
}

const META: Record<ExerciseId, ExerciseMeta> = {
  'chest-press': { name: 'Chest Press', machine: 'Seated chest press machine' },
  'incline-press': { name: 'Incline Press', machine: 'Incline chest press machine (or incline bench)' },
  'lat-pulldown': { name: 'Lat Pulldown', machine: 'Cable pulldown station, wide bar' },
  'seated-row': { name: 'Seated Row', machine: 'Seated cable row, close-grip handle' },
  'bicep-curls': { name: 'Bicep Curls', machine: 'Dumbbells' },
  'tricep-pushdowns': { name: 'Tricep Pushdowns', machine: 'Cable station, high pulley + bar' },
  'barbell-squats': { name: 'Barbell Squats', machine: 'Squat rack + barbell', sets: 4, reps: '6–10' },
  rdl: { name: 'RDLs (Romanian Deadlifts)', machine: 'Barbell' },
  'leg-press': { name: 'Leg Press', machine: 'Leg press machine (45°)', reps: '10–12' },
  'leg-extensions': { name: 'Leg Extensions', machine: 'Leg extension machine', reps: '12–15' },
  'calf-press': { name: 'Calf Press', machine: 'Leg press machine — toes on the edge', reps: '12–15' },
  'hamstring-curls': { name: 'Hamstring Curls', machine: 'Leg curl machine (lying or seated)', reps: '10–12' },
  'shoulder-press': { name: 'Shoulder Press', machine: 'Seated shoulder press machine' },
  'lateral-raises': { name: 'Lateral Raises', machine: 'Dumbbells', reps: '12–15' },
  'chest-flies': { name: 'Chest Flies', machine: 'Pec deck / butterfly machine', reps: '10–12' },
  'rear-delt-flies': { name: 'Rear Delt Flies', machine: 'Pec deck, facing the pad (reverse fly)', reps: '12–15' },
  'overhead-tricep-extensions': {
    name: 'Overhead Tricep Extensions',
    machine: 'Cable station, low pulley + rope',
    reps: '10–12',
  },
  'walking-lunges': { name: 'Walking Lunges', machine: 'Bodyweight or dumbbells', reps: '10 / leg' },
  'goblet-squat': {
    name: 'Goblet Squat',
    machine: 'Dumbbell or kettlebell at chest',
    reps: '10–12',
  },
  'dumbbell-calf-raise': {
    name: 'Dumbbell Calf Raise',
    machine: 'Dumbbells + a step or weight plate',
    reps: '12–15',
  },
}

const BASE = import.meta.env.BASE_URL

export const EXERCISES = Object.fromEntries(
  (Object.keys(META) as ExerciseId[]).map((id) => {
    const db = exerciseDb[id]
    const meta = META[id]
    const ex: Exercise = {
      id,
      name: meta.name,
      machine: meta.machine,
      sets: meta.sets ?? 3,
      reps: meta.reps ?? '8–12',
      primaryMuscles: db.primaryMuscles,
      secondaryMuscles: db.secondaryMuscles,
      instructions: db.instructions,
      images: db.images.map((p) => BASE + p),
    }
    return [id, ex]
  }),
) as Record<ExerciseId, Exercise>
