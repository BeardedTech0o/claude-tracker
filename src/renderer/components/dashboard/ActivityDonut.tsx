import type { DashboardStats } from '@shared/ipcContract'
import { OTHER_BUCKET_VAR, STATUS_VARS } from '@renderer/theme/palette'
import DonutChart from './DonutChart'

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
  const segments = activityBreakdown.map((a) => ({
    label: STATUS_LABEL[a.status],
    value: a.count,
    color: STATUS_COLOR[a.status]
  }))

  return (
    <div className="dashboard-donut">
      <h3>Repo activity</h3>
      <DonutChart segments={segments} />
    </div>
  )
}

export default ActivityDonut
