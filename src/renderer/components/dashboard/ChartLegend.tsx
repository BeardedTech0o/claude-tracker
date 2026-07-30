import type { DonutSegment } from './DonutChart'

interface ChartLegendProps {
  segments: DonutSegment[]
  hovered: string | null
  onHover: (label: string | null) => void
}

function ChartLegend({ segments, hovered, onHover }: ChartLegendProps): React.JSX.Element {
  return (
    <ul className="chart-legend" onMouseLeave={() => onHover(null)}>
      {segments
        .filter((s) => s.value > 0)
        .map((seg) => (
          <li
            key={seg.label}
            className={hovered === seg.label ? 'is-hovered' : hovered ? 'is-dimmed' : ''}
            onMouseEnter={() => onHover(seg.label)}
          >
            <span className="chart-legend__dot" style={{ background: seg.color }} />
            <span className="chart-legend__label">{seg.label}</span>
            <span className="chart-legend__value" style={{ color: seg.color }}>
              {seg.displayValue}
            </span>
          </li>
        ))}
    </ul>
  )
}

export default ChartLegend
