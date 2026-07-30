export interface DonutSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
  centerValue?: string
  centerLabel?: string
  showLegend?: boolean
}

function DonutChart({
  segments,
  size = 120,
  strokeWidth,
  centerValue,
  centerLabel,
  showLegend = true
}: DonutChartProps): React.JSX.Element {
  const sw = strokeWidth ?? Math.round(size * 0.16)
  const radius = (size - sw) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const visible = segments.filter((s) => s.value > 0)
  const gap = total > 0 && visible.length > 1 ? sw * 0.5 : 0

  let cumulativeRaw = 0

  return (
    <div className="donut-chart">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={
          visible.length > 0
            ? `Breakdown: ${visible.map((s) => `${s.label} ${s.value}`).join(', ')}`
            : 'No data yet'
        }
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {total === 0 ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--gridline)"
              strokeWidth={sw}
            />
          ) : (
            visible.map((seg) => {
              const rawLength = (seg.value / total) * circumference
              const dashLength = Math.max(rawLength - gap, 0)
              const dashOffset = -cumulativeRaw
              cumulativeRaw += rawLength
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
            })
          )}
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

      {showLegend && visible.length > 0 && (
        <ul className="donut-chart__legend">
          {visible.map((seg) => (
            <li key={seg.label}>
              <span className="donut-chart__swatch" style={{ background: seg.color }} />
              <span className="donut-chart__legend-label">{seg.label}</span>
              <span className="donut-chart__legend-value">{seg.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DonutChart
