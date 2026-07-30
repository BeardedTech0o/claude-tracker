import type { DashboardStats } from '@shared/ipcContract'
import { OTHER_BUCKET_VAR, STATUS_VARS } from '@renderer/theme/palette'
import BubbleCluster from './BubbleCluster'

interface ActivityDonutProps {
  activityBreakdown: DashboardStats['activityBreakdown']
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  stale: 'Stale',
  archived: 'Archived'
}

const STATUS_COLOR: Record<string, string> = {
  active: STATUS_VARS.good,
  stale: STATUS_VARS.warning,
  archived: OTHER_BUCKET_VAR
}

function ActivityDonut({ activityBreakdown }: ActivityDonutProps): React.JSX.Element {
  const sorted = [...activityBreakdown].sort((a, b) => b.count - a.count)
  const segments = sorted.map((a) => ({
    label: STATUS_LABEL[a.status],
    value: a.count,
    displayValue: String(a.count),
    color: STATUS_COLOR[a.status]
  }))

  return (
    <div className="dashboard-donut">
      <h3>Repo activity</h3>
      <BubbleCluster segments={segments} />
      {segments.length > 0 && (
        <ul className="bubble-legend">
          {segments.map((seg) => (
            <li key={seg.label}>
              <span className="bubble-legend__swatch" style={{ background: seg.color }} />
              {seg.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ActivityDonut
