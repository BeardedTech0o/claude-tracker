import type Database from 'better-sqlite3'
import type { RequestError } from '@octokit/request-error'
import type { SyncErrorKind, SyncProgress, SyncResult } from '@shared/ipcContract'
import {
  getAllRepoSummaries,
  replaceLanguages,
  updateSyncedSha,
  upsertRepo,
  type RepoUpsertInput,
  type StoredRepoSummary
} from '../db/reposRepo'
import { replaceCommits } from '../db/commitsRepo'
import { getSettingValue, setSettingValue } from '../db/settingsRepo'
import { needsFullRefetch, needsShaCheck } from './diff'
import type { GithubClient } from './client'
import type { GhCommitItem, GhRepoListItem } from './types'

// Bumping the per-repo commit fetch depth (see COMMIT_HISTORY_PER_PAGE)
// only helps repos that actually get re-fetched - the SHA-diff logic skips
// any repo whose default-branch head hasn't moved since its last sync, so
// installs upgrading from an older version would otherwise keep their old,
// shallow (5-commit) history forever. Force everyone through one full
// refetch, once, the first time this runs post-upgrade.
const COMMIT_HISTORY_BACKFILL_KEY = 'commit_history_backfill_v2'

export function ensureCommitHistoryBackfill(db: Database.Database): void {
  if (getSettingValue(db, COMMIT_HISTORY_BACKFILL_KEY) === '1') return
  db.prepare('UPDATE repos SET last_synced_sha = NULL').run()
  setSettingValue(db, COMMIT_HISTORY_BACKFILL_KEY, '1')
}

function mapRepoToUpsert(repo: GhRepoListItem): RepoUpsertInput {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    htmlUrl: repo.html_url,
    primaryLanguage: repo.language,
    defaultBranch: repo.default_branch,
    stargazersCount: repo.stargazers_count ?? 0,
    openIssuesCount: repo.open_issues_count ?? 0,
    isPrivate: repo.private,
    isArchived: repo.archived ?? false,
    pushedAt: repo.pushed_at,
    updatedAt: repo.updated_at
  }
}

function mapCommit(commit: GhCommitItem): { sha: string; message: string; authorName: string | null; authoredAt: string } {
  return {
    sha: commit.sha,
    message: commit.commit.message.split('\n')[0],
    authorName: commit.commit.author?.name ?? commit.author?.login ?? null,
    authoredAt: commit.commit.author?.date ?? commit.commit.committer?.date ?? new Date().toISOString()
  }
}

// The dashboard's "commits this week" stat and 8-week frequency chart need
// more than just the 5 commits shown on a tile - fetch a wider window so
// those aggregates are accurate. getCommitsForRepo() still LIMITs to 5 for
// tile display, so this only affects storage depth, not what's shown there.
const COMMIT_HISTORY_PER_PAGE = 100

function isRequestError(err: unknown): err is RequestError {
  return typeof err === 'object' && err !== null && 'status' in err
}

function mapErrorToSyncResult(err: unknown): SyncResult {
  if (isRequestError(err)) {
    const status = err.status
    if (status === 401) {
      return { ok: false, errorKind: 'auth', message: 'GitHub token is invalid or missing required scopes' }
    }
    if (status === 403 || status === 429) {
      const resetHeader = err.response?.headers?.['x-ratelimit-reset']
      const resetAt = resetHeader ? new Date(Number(resetHeader) * 1000).toISOString() : undefined
      return { ok: false, errorKind: 'rate_limited', message: 'GitHub API rate limit exceeded', rateLimitResetAt: resetAt }
    }
  }

  if (err instanceof Error && /ENOTFOUND|ETIMEDOUT|ECONNREFUSED|network/i.test(err.message)) {
    return { ok: false, errorKind: 'offline', message: 'Could not reach GitHub - check your network connection' }
  }

  const kind: SyncErrorKind = 'unknown'
  return { ok: false, errorKind: kind, message: err instanceof Error ? err.message : String(err) }
}

export async function runSync(
  db: Database.Database,
  octokit: GithubClient,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult> {
  try {
    ensureCommitHistoryBackfill(db)

    const remoteRepos: GhRepoListItem[] = []
    const iterator = octokit.paginate.iterator(octokit.rest.repos.listForAuthenticatedUser, {
      visibility: 'all',
      affiliation: 'owner',
      per_page: 100,
      sort: 'updated'
    })

    for await (const response of iterator) {
      remoteRepos.push(...response.data)
    }

    const localByFullName = new Map<string, StoredRepoSummary>(
      getAllRepoSummaries(db).map((r) => [r.fullName, r])
    )

    const failures: { repoFullName: string; message: string }[] = []
    let synced = 0

    for (let i = 0; i < remoteRepos.length; i++) {
      const repo = remoteRepos[i]
      onProgress?.({ done: i, total: remoteRepos.length, currentRepo: repo.full_name })

      upsertRepo(db, mapRepoToUpsert(repo))

      const local = localByFullName.get(repo.full_name)
      const shouldCheckSha = needsShaCheck(
        { id: repo.id, fullName: repo.full_name, defaultBranch: repo.default_branch, pushedAt: repo.pushed_at },
        local
      )
      if (!shouldCheckSha) continue

      try {
        const owner = repo.owner?.login
        if (!owner) continue

        const branch = await octokit.rest.repos.getBranch({
          owner,
          repo: repo.name,
          branch: repo.default_branch
        })
        const headSha = branch.data.commit.sha

        if (!needsFullRefetch(headSha, local)) continue

        // No `since` bound here on purpose: the tile always needs the repo's
        // true latest 5 commits regardless of age, so this can't be limited
        // to the 8-week frequency-chart window without going empty for
        // repos that have been quiet longer than that.
        const [commitsResp, languagesResp] = await Promise.all([
          octokit.rest.repos.listCommits({
            owner,
            repo: repo.name,
            sha: repo.default_branch,
            per_page: COMMIT_HISTORY_PER_PAGE
          }),
          octokit.rest.repos.listLanguages({ owner, repo: repo.name })
        ])

        replaceCommits(db, repo.id, commitsResp.data.map(mapCommit))
        replaceLanguages(
          db,
          repo.id,
          Object.entries(languagesResp.data).map(([language, byteCount]) => ({
            language,
            byteCount: byteCount ?? 0
          }))
        )
        updateSyncedSha(db, repo.id, headSha)
        synced++
      } catch (err) {
        failures.push({
          repoFullName: repo.full_name,
          message: err instanceof Error ? err.message : String(err)
        })
      }
    }

    onProgress?.({ done: remoteRepos.length, total: remoteRepos.length })

    return { ok: true, reposSynced: synced, reposFailed: failures }
  } catch (err) {
    return mapErrorToSyncResult(err)
  }
}
