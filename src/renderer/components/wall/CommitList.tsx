import type { RepoCommit } from '@shared/ipcContract'
import { formatRelativeTime } from '@renderer/utils/relativeTime'

interface CommitListProps {
  commits: RepoCommit[]
}

function CommitList({ commits }: CommitListProps): React.JSX.Element {
  if (commits.length === 0) {
    return <p className="commit-list__empty">No commits synced yet.</p>
  }

  return (
    <ul className="commit-list">
      {commits.map((commit) => (
        <li key={commit.sha} className="commit-list__item">
          <span className="commit-list__message" title={commit.message}>
            {commit.message}
          </span>
          <span className="commit-list__meta">
            <code>{commit.sha.slice(0, 7)}</code>
            {commit.authorName ? ` · ${commit.authorName}` : ''} ·{' '}
            {formatRelativeTime(commit.authoredAt)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default CommitList
