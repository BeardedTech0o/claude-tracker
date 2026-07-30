export interface WeekBar {
  label: string
  value: number
}

interface WeeklyBarChartProps {
  bars: WeekBar[]
  height?: number
}

function WeeklyBarChart({ bars, height = 140 }: WeeklyBarChartProps): React.JSX.Element {
  const max = Math.max(...bars.map((b) => b.value), 1)
  const lastIndex = bars.length - 1

  return (
    <div className="weekly-bar-chart" style={{ height }} role="img" aria-label={`Commits per week: ${bars.map((b) => `${b.label} ${b.value}`).join(', ')}`}>
      {bars.map((bar, i) => {
        const barHeight = bar.value > 0 ? Math.max((bar.value / max) * (height - 24), 4) : 4
        return (
          <div className="weekly-bar-chart__col" key={bar.label}>
            <div className="weekly-bar-chart__track" style={{ height: height - 24 }}>
              <div
                className={`weekly-bar-chart__bar${i === lastIndex ? ' weekly-bar-chart__bar--current' : ''}`}
                style={{ height: barHeight }}
              />
            </div>
            <span className="weekly-bar-chart__label">{bar.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default WeeklyBarChart
