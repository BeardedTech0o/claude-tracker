import { formatCompactNumber } from '@renderer/utils/formatNumber'

interface StatTileProps {
  label: string
  value: number
}

function StatTile({ label, value }: StatTileProps): React.JSX.Element {
  return (
    <div className="stat-tile">
      <span className="stat-tile__value">{formatCompactNumber(value)}</span>
      <span className="stat-tile__label">{label}</span>
    </div>
  )
}

export default StatTile
