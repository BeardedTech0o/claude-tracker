import type { RepoWithDetails } from '@shared/ipcContract'
import { formatRelativeTime } from '@renderer/utils/relativeTime'
import LanguageBar from './LanguageBar'
import CommitList from './CommitList'

interface RepoTileProps {
  repo: RepoWithDetails
}

function RepoTile({ repo }: RepoTileProps): React.JSX.Element {
  return (
    <article className="repo-tile">
      <header className="repo-tile__header">
        <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="repo-tile__name">
          {repo.name}
        </a>
        <span className="repo-tile__branch">{repo.defaultBranch}</span>
      </header>

      {repo.description && <p className="repo-tile__description">{repo.description}</p>}

      <div className="repo-tile__stats">
        <span title="Stars">★ {repo.stargazersCount}</span>
        <span title="Open issues">◇ {repo.openIssuesCount}</span>
        <span title="Last updated">{formatRelativeTime(repo.pushedAt)}</span>
      </div>

      <LanguageBar languages={repo.languages} />

      <div className="repo-tile__commits">
        <CommitList commits={repo.commits} />
      </div>
    </article>
  )
}

export default RepoTile
