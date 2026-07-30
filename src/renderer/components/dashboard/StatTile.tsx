import { formatCompactNumber } from '@renderer/utils/formatNumber'

interface StatTileProps {
  label: string
  value: number
  /** Gradient-accented values are the ones worth a glance; muted ones are context. */
  accent?: boolean
}

function StatTile({ label, value, accent = false }: StatTileProps): React.JSX.Element {
  return (
    <div className={`stat-tile${accent ? '' : ' stat-tile--muted'}`}>
      <span className="stat-tile__label">{label}</span>
      <span className="stat-tile__value">{formatCompactNumber(value)}</span>
    </div>
  )
}

export default StatTile
