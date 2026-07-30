import type { DashboardStats } from '@shared/ipcContract'
import StatsRow from './StatsRow'
import LanguageDonut from './LanguageDonut'
import ActivityDonut from './ActivityDonut'
import CommitFrequencyDonut from './CommitFrequencyDonut'

interface DashboardProps {
  stats: DashboardStats
}

function Dashboard({ stats }: DashboardProps): React.JSX.Element {
  return (
    <section className="dashboard">
      <StatsRow stats={stats} />
      <div className="dashboard-donuts">
        <LanguageDonut languageBreakdown={stats.languageBreakdown} />
        <ActivityDonut activityBreakdown={stats.activityBreakdown} />
        <CommitFrequencyDonut commitFrequency={stats.commitFrequency} />
      </div>
    </section>
  )
}

export default Dashboard
