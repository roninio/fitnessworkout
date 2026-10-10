export function Sparkline({ values, width = 96, height = 32 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden>
        <circle cx={width / 2} cy={height / 2} r={3} fill="var(--color-accent)" />
      </svg>
    )
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pad = 3
  const pts = values.map((v, i) => [
    pad + (i / (values.length - 1)) * (width - pad * 2),
    height - pad - ((v - min) / span) * (height - pad * 2),
  ])
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lx, ly] = pts[pts.length - 1]
  return (
    <svg width={width} height={height} aria-hidden>
      <path d={d} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r={3} fill="var(--color-accent)" />
    </svg>
  )
}
