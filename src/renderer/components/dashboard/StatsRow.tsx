import type { DashboardStats } from '@shared/ipcContract'
import StatTile from './StatTile'

interface StatsRowProps {
  stats: DashboardStats
}

function StatsRow({ stats }: StatsRowProps): React.JSX.Element {
  return (
    <div className="stats-row">
      <StatTile label="Total repos" value={stats.totalRepos} />
      <StatTile label="Active repos" value={stats.activeRepos} accent />
      <StatTile label="Commits this week" value={stats.commitsThisWeek} accent />
      <StatTile label="Total stars" value={stats.totalStars} />
    </div>
  )
}

export default StatsRow
