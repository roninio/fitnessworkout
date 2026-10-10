import { useState } from 'react'
import { isIOS, isStandalone, useInstallPrompt } from '../lib/install'
import { Share, X } from './Icons'

const KEY = 'gym-plan:install-dismissed'

export function InstallBanner() {
  const { canPrompt, prompt } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(KEY) === '1')

  if (dismissed || isStandalone()) return null
  const ios = isIOS()
  if (!ios && !canPrompt) return null

  const dismiss = () => {
    localStorage.setItem(KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="animate-slide-up flex items-start gap-3 rounded-2xl bg-zinc-900 p-3 ring-1 ring-white/5">
      <img src={`${import.meta.env.BASE_URL}icons/pwa-64x64.png`} alt="" className="h-10 w-10 rounded-xl" />
      <div className="flex-1 text-sm">
        <div className="font-semibold text-white">Install the app</div>
        {ios ? (
          <p className="text-zinc-400">
            Tap <Share className="inline h-4 w-4 align-text-bottom text-sky-400" /> Share, then{' '}
            <span className="font-medium text-zinc-200">Add to Home Screen</span>. It works offline and keeps your log safe.
          </p>
        ) : (
          <p className="text-zinc-400">Add it to your home screen. It works offline at the gym.</p>
        )}
        {canPrompt && (
          <button
            type="button"
            onClick={() => void prompt()}
            className="mt-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-zinc-950 active:scale-95"
          >
            Install
          </button>
        )}
      </div>
      <button type="button" aria-label="Dismiss" onClick={dismiss} className="-m-1 p-1 text-zinc-500">
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}
