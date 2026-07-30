import { useMemo, useState } from 'react'
import type { RepoWithDetails } from '@shared/ipcContract'
import RepoTile from './RepoTile'
import SortControl, { type SortKey } from './SortControl'
import SearchBox from './SearchBox'
import EmptyState from '../shared/EmptyState'

interface TileGridProps {
  repos: RepoWithDetails[]
}

function sortRepos(repos: RepoWithDetails[], sortKey: SortKey): RepoWithDetails[] {
  const copy = [...repos]
  switch (sortKey) {
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'stars':
      return copy.sort((a, b) => b.stargazersCount - a.stargazersCount)
    case 'updated':
    default:
      return copy.sort((a, b) => (b.pushedAt ?? '').localeCompare(a.pushedAt ?? ''))
  }
}

function TileGrid({ repos }: TileGridProps): React.JSX.Element {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('updated')

  const visibleRepos = useMemo(() => {
    const filtered = search.trim()
      ? repos.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()))
      : repos
    return sortRepos(filtered, sortKey)
  }, [repos, search, sortKey])

  return (
    <section className="tile-grid-section">
      <div className="tile-grid-controls">
        <SearchBox value={search} onChange={setSearch} />
        <SortControl value={sortKey} onChange={setSortKey} />
      </div>

      {visibleRepos.length === 0 ? (
        <EmptyState
          title={repos.length === 0 ? 'No repos synced yet' : 'No repos match your search'}
          description={
            repos.length === 0
              ? 'Add a GitHub token in Settings and refresh to pull in your repos.'
              : undefined
          }
        />
      ) : (
        <div className="tile-grid">
          {visibleRepos.map((repo) => (
            <RepoTile key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </section>
  )
}

export default TileGrid
