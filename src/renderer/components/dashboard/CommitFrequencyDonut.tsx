import type { DashboardStats } from '@shared/ipcContract'
import { SEQUENTIAL_BLUE_VARS } from '@renderer/theme/palette'
import DonutChart from './DonutChart'

interface CommitFrequencyDonutProps {
  commitFrequency: DashboardStats['commitFrequency']
}

function stepForIndex(index: number, count: number): string {
  if (count <= 1) return SEQUENTIAL_BLUE_VARS[SEQUENTIAL_BLUE_VARS.length - 1]
  const stepIndex = Math.round((index / (count - 1)) * (SEQUENTIAL_BLUE_VARS.length - 1))
  return SEQUENTIAL_BLUE_VARS[stepIndex]
}

function CommitFrequencyDonut({ commitFrequency }: CommitFrequencyDonutProps): React.JSX.Element {
  const segments = commitFrequency.map((bucket, i) => ({
    label: `Wk ${bucket.bucket.split('-')[1] ?? i + 1}`,
    value: bucket.count,
    color: stepForIndex(i, commitFrequency.length)
  }))

  return (
    <div className="dashboard-donut">
      <h3>Commit frequency (8wk)</h3>
      <DonutChart segments={segments} />
    </div>
  )
}

export default CommitFrequencyDonut
