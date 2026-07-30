import type { DashboardStats } from '@shared/ipcContract'
import { ALL_PAIRS_SAFE_CATEGORICAL_VARS, OTHER_BUCKET_VAR } from '@renderer/theme/palette'
import DonutChart from './DonutChart'

interface LanguageDonutProps {
  languageBreakdown: DashboardStats['languageBreakdown']
}

const TOP_N = ALL_PAIRS_SAFE_CATEGORICAL_VARS.length

function LanguageDonut({ languageBreakdown }: LanguageDonutProps): React.JSX.Element {
  const sorted = [...languageBreakdown].sort((a, b) => b.byteCount - a.byteCount)
  const top = sorted.slice(0, TOP_N)
  const restTotal = sorted.slice(TOP_N).reduce((sum, l) => sum + l.byteCount, 0)

  const segments = [
    ...top.map((lang, i) => ({
      label: lang.language,
      value: lang.byteCount,
      color: ALL_PAIRS_SAFE_CATEGORICAL_VARS[i]
    })),
    ...(restTotal > 0 ? [{ label: 'Other', value: restTotal, color: OTHER_BUCKET_VAR }] : [])
  ]

  return (
    <div className="dashboard-donut">
      <h3>Languages</h3>
      <DonutChart segments={segments} />
    </div>
  )
}

export default LanguageDonut
