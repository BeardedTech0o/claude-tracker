export interface DonutSegment {
  label: string
  value: number
  color: string
  /** Optional legend text override (e.g. a percentage) - falls back to `value`. */
  displayValue?: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
  centerValue?: string
  centerLabel?: string
  showLegend?: boolean
}

const MIN_SEGMENT_PX = 4

function DonutChart({
  segments,
  size = 140,
  strokeWidth,
  centerValue,
  centerLabel,
  showLegend = true
}: DonutChartProps): React.JSX.Element {
  const sw = strokeWidth ?? Math.round(size * 0.2)
  const radius = (size - sw) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const visible = segments.filter((s) => s.value > 0)
  const gap = total > 0 && visible.length > 1 ? sw * 0.5 : 0

  // Keep small slices visible: give every segment at least MIN_SEGMENT_PX of
  // arc, borrowed proportionally from the larger segments so the total still
  // adds up to the full circumference.
  const rawLengths = visible.map((seg) => (seg.value / total) * circumference)
  const deficits = rawLengths.map((len) => Math.max(MIN_SEGMENT_PX - len, 0))
  const totalDeficit = deficits.reduce((a, b) => a + b, 0)
  const totalRawAboveFloor = rawLengths.reduce(
    (sum, len, i) => sum + (deficits[i] > 0 ? 0 : len),
    0
  )
  const adjustedLengths = rawLengths.map((len, i) =>
    deficits[i] > 0
      ? MIN_SEGMENT_PX
      : totalRawAboveFloor > 0
        ? len - (totalDeficit * len) / totalRawAboveFloor
        : len
  )

  let cumulative = 0

  return (
    <div className="donut-chart">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={
          visible.length > 0
            ? `Breakdown: ${visible.map((s) => `${s.label} ${s.displayValue ?? s.value}`).join(', ')}`
            : 'No data yet'
        }
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--gridline)"
            strokeWidth={sw}
          />
          {visible.map((seg, i) => {
            const rawLength = adjustedLengths[i]
            const dashLength = Math.max(rawLength - gap, 0)
            const dashOffset = -cumulative
            cumulative += rawLength
            return (
              <circle
                key={seg.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={sw}
                strokeLinecap="round"
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
              />
            )
          })}
        </g>
        {(centerValue || centerLabel) && (
          <g>
            {centerValue && (
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="donut-chart__center-value"
              >
                {centerValue}
              </text>
            )}
            {centerLabel && (
              <text
                x="50%"
                y="66%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="donut-chart__center-label"
              >
                {centerLabel}
              </text>
            )}
          </g>
        )}
      </svg>

      {showLegend &&
        (visible.length > 0 ? (
          <ul className="donut-chart__legend">
            {visible.map((seg) => (
              <li key={seg.label}>
                <span className="donut-chart__swatch" style={{ background: seg.color }} />
                <span className="donut-chart__legend-label">{seg.label}</span>
                <span className="donut-chart__legend-value">{seg.displayValue ?? seg.value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="donut-chart__empty">No data yet</p>
        ))}
    </div>
  )
}

export default DonutChart
