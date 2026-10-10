import exerciseDb from './exerciseDb.json'

interface ExerciseSource {
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  images: string[]
  /** Labels for each image; defaults to Start / Finish. */
  frameLabels?: string[]
}

/** Exercises that aren't in free-exercise-db, with our own illustrations in public/exercises/. */
const CUSTOM = {
  'popup-drill': {
    primaryMuscles: ['chest', 'abdominals'],
    secondaryMuscles: ['triceps', 'shoulders', 'hip flexors'],
    instructions: [
      'Mark your stance on the floor with tape: back foot near the tail, front foot about shoulder-width and a bit more ahead.',
      'Lie face down as if on your board, hands flat beside your lower ribs, elbows up, toes on the floor.',
      'Explosively press your chest up and, in one motion, pull your knees to your chest and swing your feet under you.',
      'Land quietly with both feet at the same time on your marks: knees bent, hips low, chest up, eyes forward, arms out for balance.',
      'Hold the stance for 2 seconds, then lie back down. Quality over speed for the first weeks; then make it as fast as you can.',
    ],
    images: ['exercises/popup-drill/0.svg', 'exercises/popup-drill/1.svg'],
    frameLabels: ['Start', 'Pop up'],
  },
  'burpee-popup': {
    primaryMuscles: ['chest', 'quadriceps'],
    secondaryMuscles: ['abdominals', 'shoulders', 'glutes'],
    instructions: [
      'Stand tall, then drop to the floor and lie flat on your chest (like lying on the board).',
      'Place your hands by your ribs and do one explosive pop-up straight into your surf stance.',
      'Stand up and repeat for 20 seconds, then rest 40 seconds. Log how many pop-ups you did per round.',
      'This trains popping up when you are already tired from paddling, so keep the landing clean even at the end.',
    ],
    images: ['exercises/burpee-popup/0.svg', 'exercises/burpee-popup/1.svg', 'exercises/burpee-popup/2.svg'],
    frameLabels: ['Stand', 'Chest down', 'Pop up'],
  },
} satisfies Record<string, ExerciseSource>

const SOURCES: Record<keyof typeof exerciseDb | keyof typeof CUSTOM, ExerciseSource> = { ...exerciseDb, ...CUSTOM }

export type ExerciseId = keyof typeof SOURCES

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
  frameLabels: string[]
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
  'goblet-squat': { name: 'Goblet Squat', machine: 'Dumbbell or kettlebell at chest', reps: '10–12' },
  'dumbbell-calf-raise': { name: 'Dumbbell Calf Raise', machine: 'Dumbbells + a step or weight plate', reps: '12–15' },

  // Surf pop-up session
  'worlds-greatest-stretch': { name: "World's Greatest Stretch", machine: 'Mat · warm-up', sets: 2, reps: '5 / side' },
  'plyo-push-up': { name: 'Plyo Push-Up', machine: 'Bodyweight · hands leave the floor', sets: 4, reps: '5' },
  'popup-drill': { name: 'Pop-Up Drill', machine: 'Floor + tape marks for your stance', sets: 4, reps: '5' },
  'ball-knee-tuck': { name: 'Ball Knee Tuck', machine: 'Stability ball (or fast mountain climbers)', reps: '12' },
  'knee-raise': { name: 'Knee Raise', machine: "Captain's chair / dip station", reps: '10' },
  'face-pull': { name: 'Face Pull', machine: 'Cable station, high pulley + rope', reps: '12–15' },
  'burpee-popup': { name: 'Burpee to Pop-Up', machine: '20 s on / 40 s off · log reps per round', sets: 6, reps: '4–6' },
}

const BASE = import.meta.env.BASE_URL

export const EXERCISES = Object.fromEntries(
  (Object.keys(META) as ExerciseId[]).map((id) => {
    const src = SOURCES[id]
    const meta = META[id]
    const ex: Exercise = {
      id,
      name: meta.name,
      machine: meta.machine,
      sets: meta.sets ?? 3,
      reps: meta.reps ?? '8–12',
      primaryMuscles: src.primaryMuscles,
      secondaryMuscles: src.secondaryMuscles,
      instructions: src.instructions,
      images: src.images.map((p) => BASE + p),
      frameLabels: src.frameLabels ?? ['Start', 'Finish'],
    }
    return [id, ex]
  }),
) as Record<ExerciseId, Exercise>
