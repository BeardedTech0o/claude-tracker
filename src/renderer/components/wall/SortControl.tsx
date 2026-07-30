export type SortKey = 'updated' | 'name' | 'stars'

interface SortControlProps {
  value: SortKey
  onChange: (value: SortKey) => void
}

function SortControl({ value, onChange }: SortControlProps): React.JSX.Element {
  return (
    <select
      className="sort-control"
      value={value}
      onChange={(e) => onChange(e.target.value as SortKey)}
      aria-label="Sort repos"
    >
      <option value="updated">Last updated</option>
      <option value="name">Name</option>
      <option value="stars">Stars</option>
    </select>
  )
}

export default SortControl
