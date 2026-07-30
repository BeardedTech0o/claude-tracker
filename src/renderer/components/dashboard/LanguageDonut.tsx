import type { DashboardStats } from '@shared/ipcContract'
import { ALL_PAIRS_SAFE_CATEGORICAL_VARS, OTHER_BUCKET_VAR } from '@renderer/theme/palette'
import DonutCard from './DonutCard'

interface LanguageDonutProps {
  languageBreakdown: DashboardStats['languageBreakdown']
}

const TOP_N = ALL_PAIRS_SAFE_CATEGORICAL_VARS.length

function LanguageDonut({ languageBreakdown }: LanguageDonutProps): React.JSX.Element {
  const sorted = [...languageBreakdown].sort((a, b) => b.byteCount - a.byteCount)
  const totalBytes = sorted.reduce((sum, l) => sum + l.byteCount, 0)
  const top = sorted.slice(0, TOP_N)
  const restTotal = sorted.slice(TOP_N).reduce((sum, l) => sum + l.byteCount, 0)

  const percent = (bytes: number): string =>
    totalBytes > 0 ? `${Math.round((bytes / totalBytes) * 100)}%` : '0%'

  const segments = [
    ...top.map((lang, i) => ({
      label: lang.language,
      value: lang.byteCount,
      displayValue: percent(lang.byteCount),
      color: ALL_PAIRS_SAFE_CATEGORICAL_VARS[i]
    })),
    ...(restTotal > 0
      ? [
          {
            label: 'Other',
            value: restTotal,
            displayValue: percent(restTotal),
            color: OTHER_BUCKET_VAR
          }
        ]
      : [])
  ]

  return (
    <DonutCard
      title="Languages"
      segments={segments}
      centerValue={totalBytes > 0 ? percent(sorted[0].byteCount) : '0%'}
      centerLabel={sorted[0]?.language ?? ''}
    />
  )
}

export default LanguageDonut
