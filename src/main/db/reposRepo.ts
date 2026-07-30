import type Database from 'better-sqlite3'
import type { DashboardStats, RepoWithDetails } from '@shared/ipcContract'
import { getCommitsForRepo } from './commitsRepo'

export interface RepoUpsertInput {
  id: number
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  primaryLanguage: string | null
  defaultBranch: string
  stargazersCount: number
  openIssuesCount: number
  isPrivate: boolean
  isArchived: boolean
  pushedAt: string | null
  updatedAt: string | null
}

export interface StoredRepoSummary {
  id: number
  fullName: string
  defaultBranch: string
  pushedAt: string | null
  lastSyncedSha: string | null
}

interface RepoRow {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  primary_language: string | null
  default_branch: string
  stargazers_count: number
  open_issues_count: number
  is_private: number
  is_archived: number
  pushed_at: string | null
  updated_at: string | null
  last_synced_sha: string | null
}

export function upsertRepo(db: Database.Database, repo: RepoUpsertInput): void {
  db.prepare(
    `INSERT INTO repos (
      id, name, full_name, description, html_url, primary_language, default_branch,
      stargazers_count, open_issues_count, is_private, is_archived, pushed_at, updated_at
    ) VALUES (
      @id, @name, @fullName, @description, @htmlUrl, @primaryLanguage, @defaultBranch,
      @stargazersCount, @openIssuesCount, @isPrivate, @isArchived, @pushedAt, @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      full_name = excluded.full_name,
      description = excluded.description,
      html_url = excluded.html_url,
      primary_language = excluded.primary_language,
      default_branch = excluded.default_branch,
      stargazers_count = excluded.stargazers_count,
      open_issues_count = excluded.open_issues_count,
      is_private = excluded.is_private,
      is_archived = excluded.is_archived,
      pushed_at = excluded.pushed_at,
      updated_at = excluded.updated_at`
  ).run({
    ...repo,
    isPrivate: repo.isPrivate ? 1 : 0,
    isArchived: repo.isArchived ? 1 : 0
  })
}

export function updateSyncedSha(db: Database.Database, repoId: number, sha: string): void {
  db.prepare(
    `UPDATE repos SET last_synced_sha = ?, last_full_sync_at = datetime('now') WHERE id = ?`
  ).run(sha, repoId)
}

export function replaceLanguages(
  db: Database.Database,
  repoId: number,
  languages: { language: string; byteCount: number }[]
): void {
  const del = db.prepare('DELETE FROM repo_languages WHERE repo_id = ?')
  const insert = db.prepare(
    'INSERT INTO repo_languages (repo_id, language, byte_count) VALUES (?, ?, ?)'
  )
  const tx = db.transaction(() => {
    del.run(repoId)
    for (const lang of languages) {
      insert.run(repoId, lang.language, lang.byteCount)
    }
  })
  tx()
}

export function getAllRepoSummaries(db: Database.Database): StoredRepoSummary[] {
  const rows = db
    .prepare(
      'SELECT id, full_name, default_branch, pushed_at, last_synced_sha FROM repos'
    )
    .all() as { id: number; full_name: string; default_branch: string; pushed_at: string | null; last_synced_sha: string | null }[]

  return rows.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    defaultBranch: r.default_branch,
    pushedAt: r.pushed_at,
    lastSyncedSha: r.last_synced_sha
  }))
}

function mapRow(row: RepoRow): Omit<RepoWithDetails, 'languages' | 'commits'> {
  return {
    id: row.id,
    name: row.name,
    fullName: row.full_name,
    description: row.description,
    htmlUrl: row.html_url,
    primaryLanguage: row.primary_language,
    defaultBranch: row.default_branch,
    stargazersCount: row.stargazers_count,
    openIssuesCount: row.open_issues_count,
    isPrivate: row.is_private === 1,
    isArchived: row.is_archived === 1,
    pushedAt: row.pushed_at,
    updatedAt: row.updated_at
  }
}

export function getReposWithDetails(db: Database.Database): RepoWithDetails[] {
  const rows = db.prepare('SELECT * FROM repos ORDER BY pushed_at DESC').all() as RepoRow[]
  const languagesStmt = db.prepare(
    'SELECT language, byte_count as byteCount FROM repo_languages WHERE repo_id = ?'
  )

  return rows.map((row) => ({
    ...mapRow(row),
    languages: languagesStmt.all(row.id) as { language: string; byteCount: number }[],
    commits: getCommitsForRepo(db, row.id)
  }))
}

const STALE_AFTER_DAYS = 90

export function getDashboardStats(db: Database.Database): DashboardStats {
  const totalRepos = (
    db.prepare('SELECT COUNT(*) as c FROM repos').get() as { c: number }
  ).c

  const totalStars = (
    db.prepare('SELECT COALESCE(SUM(stargazers_count), 0) as s FROM repos').get() as {
      s: number
    }
  ).s

  const commitsThisWeek = (
    db
      .prepare(
        `SELECT COUNT(*) as c FROM commits WHERE authored_at >= datetime('now', '-7 days')`
      )
      .get() as { c: number }
  ).c

  const activeRepos = (
    db
      .prepare(
        `SELECT COUNT(*) as c FROM repos WHERE is_archived = 0 AND pushed_at >= datetime('now', ?)`
      )
      .get(`-${STALE_AFTER_DAYS} days`) as { c: number }
  ).c

  const languageBreakdown = db
    .prepare(
      `SELECT language, SUM(byte_count) as byteCount FROM repo_languages GROUP BY language ORDER BY byteCount DESC`
    )
    .all() as { language: string; byteCount: number }[]

  const archivedCount = (
    db.prepare('SELECT COUNT(*) as c FROM repos WHERE is_archived = 1').get() as {
      c: number
    }
  ).c

  const staleCount = (
    db
      .prepare(
        `SELECT COUNT(*) as c FROM repos WHERE is_archived = 0 AND (pushed_at IS NULL OR pushed_at < datetime('now', ?))`
      )
      .get(`-${STALE_AFTER_DAYS} days`) as { c: number }
  ).c

  const activityBreakdown: DashboardStats['activityBreakdown'] = [
    { status: 'active', count: activeRepos },
    { status: 'stale', count: staleCount },
    { status: 'archived', count: archivedCount }
  ]

  const commitFrequencyRows = db
    .prepare(
      `SELECT strftime('%Y-%W', authored_at) as bucket, COUNT(*) as count
       FROM commits
       WHERE authored_at >= datetime('now', '-56 days')
       GROUP BY bucket
       ORDER BY bucket ASC`
    )
    .all() as { bucket: string; count: number }[]

  return {
    totalRepos,
    activeRepos,
    commitsThisWeek,
    totalStars,
    languageBreakdown,
    activityBreakdown,
    commitFrequency: commitFrequencyRows
  }
}
