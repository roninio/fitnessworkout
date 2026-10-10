// Builds the app with the right base path for GitHub Pages and publishes dist/ to the gh-pages branch.
// Usage: npm run deploy   (requires a GitHub "origin" remote)
import { execSync } from 'node:child_process'

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })

let remote
try {
  remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim()
} catch {
  console.error('No git "origin" remote found. Create a GitHub repo and run:\n  git remote add origin <url>')
  process.exit(1)
}

const repo = remote.replace(/\.git$/, '').split(/[/:]/).pop()
const base = repo.endsWith('.github.io') ? '/' : `/${repo}/`
console.log(`Deploying ${repo} with base ${base}`)

run(`npx tsc -b && npx vite build --base=${base}`)
run('npx gh-pages -d dist --nojekyll')
console.log('Done. Enable Pages (Settings -> Pages -> Branch: gh-pages) if this is the first deploy.')
