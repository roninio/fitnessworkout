# Gym Plan

A mobile-first workout app (installable PWA) for a 4-day split. It shows today's exercises with a picture of each machine and lets you log kg and reps for every set. There is no backend or database. Your log is saved on your phone.

## Features

- **Auto-picks today's workout** (Mon = Day 1 … Sun = Day 7). Tap any day to switch, e.g. if you're doing Monday's workout on Tuesday.
- **Exercise pictures** (start and finish positions, auto-animated, tap to view full screen), plus the machine to look for, target muscles and how-to steps.
- **Set logger**: ± steppers for kg and reps, and a ✓ for each set. New sets are prefilled with last session's numbers. Changing the weight of a set also updates the following sets.
- **Last time** and **personal best** for each exercise, including a "New PR!" badge. History is shared when an exercise appears on several days (e.g. Lat Pulldown on Day 1 and Day 4).
- **Rest timer** after each set, with a sound and vibration.
- **Machine notes** per exercise (seat height, pin position…).
- **Progress**: per-exercise trend and a list of past workouts.
- **Offline**: the app and all images are cached.
- **Backup**: export/import JSON from Settings.

## The plan

| Day | Focus | Exercises |
| --- | --- | --- |
| 1 (Mon) | Chest, Back & Arms | Chest Press, Incline Press, Lat Pulldown, Seated Row, Bicep Curls, Tricep Pushdowns |
| 2 (Tue) | Quads, Hamstrings & Calves | Barbell Squats, RDLs, Goblet Squat, Leg Extensions, Dumbbell Calf Raise, Hamstring Curls |
| 3 (Wed) | Rest | |
| 4 (Thu) | Shoulders, Chest & Back | Shoulder Press, Lateral Raises, Chest Flies, Lat Pulldown, Rear Delt Flies, Overhead Tricep Extensions |
| 5 (Fri) | Glutes, Hamstrings & Quads | Leg Extensions, Goblet Squat, Hamstring Curls, Walking Lunges, Dumbbell Calf Raise, RDLs |
| 6–7 | Rest | |

Leg Press and Calf Press were swapped for free-weight versions (Goblet Squat and Dumbbell Calf Raise). The machine versions are still in the exercise catalog, so you can switch back in `plan.ts`.

Edit the plan in [src/data/plan.ts](src/data/plan.ts) and the names, machines and set/rep targets in [src/data/exercises.ts](src/data/exercises.ts).

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173 (also reachable from your phone on the same Wi-Fi)
npm run build && npm run preview   # test the production build, incl. offline
```

> On a plain `http://` LAN address, phones won't install the app or enable offline mode, because PWAs need HTTPS. Deploy it for that (below).

## Deploy to GitHub Pages (free, HTTPS)

1. Create an empty GitHub repo (e.g. `fitnessworkout`).
2. Push this folder:
   ```bash
   git add -A && git commit -m "Gym Plan app"
   git remote add origin https://github.com/<you>/fitnessworkout.git
   git push -u origin main
   ```
3. Deploy:
   ```bash
   npm run deploy
   ```
   This builds with the correct base path (`/<repo-name>/`) and publishes `dist/` to the `gh-pages` branch.
4. First time only: in the repo, go to **Settings → Pages → Source: Deploy from a branch → `gh-pages` / root**.
5. Open `https://<you>.github.io/fitnessworkout/` on your phone.

Run `npm run deploy` again after any change. Installed apps update automatically the next time they're opened online.

## Install on your phone

- **iPhone (Safari):** Share → **Add to Home Screen**.
- **Android (Chrome):** tap **Install** in the app banner, or ⋮ → **Add to Home screen**.

Installing matters on iPhone: Safari may clear data for websites you haven't visited in a while, but not for home-screen apps. Use **Settings → Export backup** occasionally anyway.

## Exercise images

Images and instructions come from [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public domain / Unlicense). They are bundled in `public/exercises/`. To change which image an exercise uses, edit the mapping in [scripts/fetch-exercises.mjs](scripts/fetch-exercises.mjs), delete that exercise's folder in `public/exercises/`, and run:

```bash
npm run fetch-exercises
```

## Tech

Vite + React + TypeScript, Tailwind CSS v4, `vite-plugin-pwa` (Workbox). Data is stored in `localStorage` under the key `gym-plan:v1`.
