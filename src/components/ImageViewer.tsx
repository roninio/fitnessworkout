import { useEffect, useRef, useState, type TouchEvent } from 'react'
import { Expand, Pause, Play, X } from './Icons'

interface Props {
  images: string[]
  alt: string
}

const LABELS = ['Start', 'Finish']

/** Shows the exercise frames; auto-alternates start/finish so the movement reads like an animation. */
export function ImageViewer({ images, alt }: Props) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    if (!playing || images.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 1400)
    return () => clearInterval(t)
  }, [playing, images.length])

  const go = (dir: 1 | -1) => {
    setPlaying(false)
    setIndex((i) => (i + dir + images.length) % images.length)
  }

  const swipe = {
    onTouchStart: (e: TouchEvent) => (touchX.current = e.touches[0].clientX),
    onTouchEnd: (e: TouchEvent) => {
      if (touchX.current === null) return
      const dx = e.changedTouches[0].clientX - touchX.current
      touchX.current = null
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
    },
  }

  const frames = (cls: string) =>
    images.map((src, i) => (
      <img
        key={src}
        src={src}
        alt={`${alt} – ${LABELS[i] ?? `frame ${i + 1}`} position`}
        draggable={false}
        className={`${cls} transition-opacity duration-300 ${i === index ? 'opacity-100' : 'opacity-0'}`}
      />
    ))

  return (
    <>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-zinc-900" {...swipe}>
        {frames('absolute inset-0 h-full w-full object-cover')}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
          {LABELS[index] ?? index + 1}
        </span>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show ${LABELS[i] ?? i + 1} position`}
              onClick={() => {
                setPlaying(false)
                setIndex(i)
              }}
              className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-accent' : 'w-2 bg-white/50'}`}
            />
          ))}
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1.5">
          {images.length > 1 && (
            <button
              type="button"
              aria-label={playing ? 'Pause animation' : 'Play animation'}
              onClick={() => setPlaying((p) => !p)}
              className="grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur active:scale-95"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            aria-label="View full screen"
            onClick={() => setFullscreen(true)}
            className="grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur active:scale-95"
          >
            <Expand className="h-4 w-4" />
          </button>
        </div>
      </div>

      {fullscreen && (
        <div
          role="dialog"
          aria-label={`${alt} images`}
          className="fixed inset-0 z-50 flex flex-col bg-black pt-safe pb-safe"
          onClick={() => setFullscreen(false)}
        >
          <div className="flex justify-end p-3">
            <button
              type="button"
              aria-label="Close"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white"
              onClick={() => setFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="relative flex-1" {...swipe} onClick={(e) => e.stopPropagation()}>
            {frames('absolute inset-0 h-full w-full object-contain')}
          </div>
          <p className="p-4 text-center text-sm text-zinc-400">
            {LABELS[index]} position · swipe to switch
          </p>
        </div>
      )}
    </>
  )
}
