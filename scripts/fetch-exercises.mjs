// One-off script: downloads public-domain exercise images + instructions from
// https://github.com/yuhonas/free-exercise-db (Unlicense) into the app so it works offline.
// Usage: npm run fetch-exercises
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const RAW = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main'

// app exercise id -> free-exercise-db id
const MAPPING = {
  'chest-press': 'Leverage_Chest_Press',
  'incline-press': 'Leverage_Incline_Chest_Press',
  'lat-pulldown': 'Wide-Grip_Lat_Pulldown',
  'seated-row': 'Seated_Cable_Rows',
  'bicep-curls': 'Dumbbell_Bicep_Curl',
  'tricep-pushdowns': 'Triceps_Pushdown',
  'barbell-squats': 'Barbell_Squat',
  rdl: 'Romanian_Deadlift',
  'leg-press': 'Leg_Press',
  'leg-extensions': 'Leg_Extensions',
  'calf-press': 'Calf_Press_On_The_Leg_Press_Machine',
  'hamstring-curls': 'Lying_Leg_Curls',
  'shoulder-press': 'Leverage_Shoulder_Press',
  'lateral-raises': 'Side_Lateral_Raise',
  'chest-flies': 'Butterfly',
  'rear-delt-flies': 'Reverse_Machine_Flyes',
  'overhead-tricep-extensions': 'Cable_Rope_Overhead_Triceps_Extension',
  'walking-lunges': 'Bodyweight_Walking_Lunge',
}

const res = await fetch(`${RAW}/dist/exercises.json`)
if (!res.ok) throw new Error(`Failed to fetch exercises.json: ${res.status}`)
const all = await res.json()

const out = {}
for (const [appId, srcId] of Object.entries(MAPPING)) {
  const ex = all.find((e) => e.id === srcId)
  if (!ex) throw new Error(`Missing exercise in DB: ${srcId}`)
  const dir = path.join(root, 'public', 'exercises', appId)
  await mkdir(dir, { recursive: true })
  const images = []
  for (const [i, img] of ex.images.entries()) {
    const file = path.join(dir, `${i}.jpg`)
    if (!existsSync(file)) {
      const r = await fetch(`${RAW}/exercises/${img}`)
      if (!r.ok) throw new Error(`Failed image ${img}: ${r.status}`)
      await writeFile(file, Buffer.from(await r.arrayBuffer()))
    }
    images.push(`exercises/${appId}/${i}.jpg`)
  }
  out[appId] = {
    sourceId: srcId,
    sourceName: ex.name,
    equipment: ex.equipment,
    primaryMuscles: ex.primaryMuscles,
    secondaryMuscles: ex.secondaryMuscles,
    instructions: ex.instructions,
    images,
  }
  console.log(`✓ ${appId} <- ${srcId} (${images.length} images)`)
}

await mkdir(path.join(root, 'src', 'data'), { recursive: true })
await writeFile(path.join(root, 'src', 'data', 'exerciseDb.json'), JSON.stringify(out, null, 2) + '\n')
console.log('Wrote src/data/exerciseDb.json')
