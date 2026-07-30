import type { DashboardStats } from '@shared/ipcContract'
import { OTHER_BUCKET_VAR, STATUS_VARS } from '@renderer/theme/palette'
import DonutCard from './DonutCard'

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
    displayValue: String(a.count),
    color: STATUS_COLOR[a.status]
  }))
  const total = activityBreakdown.reduce((sum, a) => sum + a.count, 0)

  return (
    <DonutCard
      title="Repo activity"
      segments={segments}
      centerValue={String(total)}
      centerLabel="repos"
    />
  )
}

export default ActivityDonut
