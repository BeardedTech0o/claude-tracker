export interface BubbleSegment {
  label: string
  value: number
  displayValue: string
  color: string
}

interface BubbleClusterProps {
  /** Already sorted descending by value, capped at 4 entries. */
  segments: BubbleSegment[]
  height?: number
}

interface BubblePosition {
  top: string
  left: string
}

const LAYOUTS: Record<number, BubblePosition[]> = {
  1: [{ top: '50%', left: '50%' }],
  2: [
    { top: '38%', left: '32%' },
    { top: '64%', left: '68%' }
  ],
  3: [
    { top: '34%', left: '30%' },
    { top: '32%', left: '74%' },
    { top: '76%', left: '52%' }
  ],
  4: [
    { top: '28%', left: '26%' },
    { top: '26%', left: '72%' },
    { top: '72%', left: '76%' },
    { top: '76%', left: '26%' }
  ]
}

function BubbleCluster({ segments, height = 180 }: BubbleClusterProps): React.JSX.Element {
  const visible = segments.filter((s) => s.value > 0).slice(0, 4)

  if (visible.length === 0) {
    return (
      <div className="bubble-cluster bubble-cluster--empty" style={{ height }}>
        <p className="bubble-cluster__empty">No data yet</p>
      </div>
    )
  }

  const maxValue = Math.max(...visible.map((s) => s.value))
  const baseSize = height * 0.48
  const minSize = baseSize * 0.42
  const positions = LAYOUTS[visible.length]

  return (
    <div className="bubble-cluster" style={{ height }}>
      {visible.map((seg, i) => {
        const size = minSize + (baseSize - minSize) * Math.sqrt(seg.value / maxValue)
        const pos = positions[i]
        return (
          <div
            key={seg.label}
            className="bubble"
            title={`${seg.label}: ${seg.displayValue}`}
            style={{
              width: size,
              height: size,
              top: pos.top,
              left: pos.left,
              background: seg.color
            }}
          >
            <span className="bubble__value" style={{ fontSize: size * 0.22 }}>
              {seg.displayValue}
            </span>
            {size > 60 && (
              <span className="bubble__label" style={{ fontSize: size * 0.11 }}>
                {seg.label}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default BubbleCluster
