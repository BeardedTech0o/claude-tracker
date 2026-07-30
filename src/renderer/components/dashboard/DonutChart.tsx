export interface DonutSegment {
  label: string
  value: number
  displayValue: string
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
  /** Shown in the hole when nothing is hovered. */
  centerValue: string
  centerLabel: string
  hovered: string | null
  onHover: (label: string | null) => void
}

const MIN_SEGMENT_PX = 3
const STROKE = 16
const HOVER_STROKE = 21

function DonutChart({
  segments,
  size = 148,
  centerValue,
  centerLabel,
  hovered,
  onHover
}: DonutChartProps): React.JSX.Element {
  const radius = (size - HOVER_STROKE) / 2
  const circumference = 2 * Math.PI * radius
  const visible = segments.filter((s) => s.value > 0)
  const total = visible.reduce((sum, s) => sum + s.value, 0)
  const gap = visible.length > 1 ? 4 : 0

  // Give tiny slices a visible minimum arc, borrowed proportionally from
  // the larger ones so the ring still closes exactly.
  const rawLengths = visible.map((seg) => (seg.value / total) * circumference)
  const deficits = rawLengths.map((len) => Math.max(MIN_SEGMENT_PX - len, 0))
  const totalDeficit = deficits.reduce((a, b) => a + b, 0)
  const roomAboveFloor = rawLengths.reduce((sum, len, i) => sum + (deficits[i] > 0 ? 0 : len), 0)
  const lengths = rawLengths.map((len, i) =>
    deficits[i] > 0
      ? MIN_SEGMENT_PX
      : roomAboveFloor > 0
        ? len - (totalDeficit * len) / roomAboveFloor
        : len
  )

  const active = hovered ? visible.find((s) => s.label === hovered) : undefined
  let cumulative = 0

  return (
    <svg
      className="donut"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Breakdown: ${visible.map((s) => `${s.label} ${s.displayValue}`).join(', ')}`}
      onMouseLeave={() => onHover(null)}
    >
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--track)"
          strokeWidth={STROKE}
        />
        {visible.map((seg, i) => {
          const dashLength = Math.max(lengths[i] - gap, 1)
          const dashOffset = -cumulative
          cumulative += lengths[i]
          const isHovered = hovered === seg.label
          return (
            <circle
              key={seg.label}
              className="donut__segment"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={isHovered ? HOVER_STROKE : STROKE}
              strokeLinecap="round"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              opacity={hovered && !isHovered ? 0.3 : 1}
              onMouseEnter={() => onHover(seg.label)}
            />
          )
        })}
      </g>
      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="donut__value">
        {active ? active.displayValue : centerValue}
      </text>
      <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" className="donut__label">
        {active ? active.label : centerLabel}
      </text>
    </svg>
  )
}

export default DonutChart
