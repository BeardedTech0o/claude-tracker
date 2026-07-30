import type { DashboardStats } from '@shared/ipcContract'
import WeeklyBarChart from './WeeklyBarChart'

interface CommitFrequencyDonutProps {
  commitFrequency: DashboardStats['commitFrequency']
}

function CommitFrequencyDonut({ commitFrequency }: CommitFrequencyDonutProps): React.JSX.Element {
  const bars = commitFrequency.map((bucket, i) => ({
    label: `W${bucket.bucket.split('-')[1] ?? i + 1}`,
    value: bucket.count
  }))
  const total = bars.reduce((sum, b) => sum + b.value, 0)

  return (
    <section className="card">
      <h3 className="card__title">Commit frequency (8wk)</h3>
      {total > 0 ? (
        <WeeklyBarChart bars={bars} />
      ) : (
        <p className="card__empty">No commits in the last 8 weeks</p>
      )}
    </section>
  )
}

export default CommitFrequencyDonut
