interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

function SearchBox({ value, onChange }: SearchBoxProps): React.JSX.Element {
  return (
    <input
      className="search-box"
      type="search"
      placeholder="Search repos..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search repos by name"
    />
  )
}

export default SearchBox
