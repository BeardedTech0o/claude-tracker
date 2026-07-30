import type Database from 'better-sqlite3'
import type { RepoCommit } from '@shared/ipcContract'

interface CommitRow {
  sha: string
  message: string
  author_name: string | null
  authored_at: string
}

export function replaceCommits(db: Database.Database, repoId: number, commits: RepoCommit[]): void {
  const del = db.prepare('DELETE FROM commits WHERE repo_id = ?')
  const insert = db.prepare(
    'INSERT INTO commits (repo_id, sha, message, author_name, authored_at) VALUES (?, ?, ?, ?, ?)'
  )
  const tx = db.transaction(() => {
    del.run(repoId)
    for (const commit of commits) {
      insert.run(repoId, commit.sha, commit.message, commit.authorName, commit.authoredAt)
    }
  })
  tx()
}

export function getCommitsForRepo(db: Database.Database, repoId: number): RepoCommit[] {
  const rows = db
    .prepare(
      'SELECT sha, message, author_name, authored_at FROM commits WHERE repo_id = ? ORDER BY authored_at DESC LIMIT 5'
    )
    .all(repoId) as CommitRow[]

  return rows.map((r) => ({
    sha: r.sha,
    message: r.message,
    authorName: r.author_name,
    authoredAt: r.authored_at
  }))
}
