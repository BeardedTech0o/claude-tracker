import { useState } from 'react'
import DonutChart, { type DonutSegment } from './DonutChart'
import ChartLegend from './ChartLegend'

interface DonutCardProps {
  title: string
  segments: DonutSegment[]
  centerValue: string
  centerLabel: string
  emptyMessage?: string
}

function DonutCard({
  title,
  segments,
  centerValue,
  centerLabel,
  emptyMessage = 'No data yet'
}: DonutCardProps): React.JSX.Element {
  const [hovered, setHovered] = useState<string | null>(null)
  const hasData = segments.some((s) => s.value > 0)

  return (
    <section className="card">
      <h3 className="card__title">{title}</h3>
      {hasData ? (
        <div className="card__chart-row">
          <DonutChart
            segments={segments}
            centerValue={centerValue}
            centerLabel={centerLabel}
            hovered={hovered}
            onHover={setHovered}
          />
          <ChartLegend segments={segments} hovered={hovered} onHover={setHovered} />
        </div>
      ) : (
        <p className="card__empty">{emptyMessage}</p>
      )}
    </section>
  )
}

export default DonutCard
