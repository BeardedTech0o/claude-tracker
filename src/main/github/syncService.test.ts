import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type Database from 'better-sqlite3'
import { openDb } from '../db/connection'
import { upsertRepo, getAllRepoSummaries } from '../db/reposRepo'
import { ensureCommitHistoryBackfill } from './syncService'

let dir: string
let db: Database.Database

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'claude-tracker-sync-test-'))
  db = openDb(join(dir, 'test.db'))
})

afterEach(() => {
  db.close()
  rmSync(dir, { recursive: true, force: true })
})

describe('ensureCommitHistoryBackfill', () => {
  it('clears every repo last_synced_sha the first time it runs', () => {
    upsertRepo(db, {
      id: 1,
      name: 'repo',
      fullName: 'user/repo',
      description: null,
      htmlUrl: 'https://github.com/user/repo',
      primaryLanguage: null,
      defaultBranch: 'main',
      stargazersCount: 0,
      openIssuesCount: 0,
      isPrivate: false,
      isArchived: false,
      pushedAt: null,
      updatedAt: null
    })
    db.prepare('UPDATE repos SET last_synced_sha = ? WHERE id = ?').run('old-sha', 1)

    ensureCommitHistoryBackfill(db)

    expect(getAllRepoSummaries(db)[0].lastSyncedSha).toBeNull()
  })

  it('only clears once - a second run leaves a re-synced sha alone', () => {
    upsertRepo(db, {
      id: 1,
      name: 'repo',
      fullName: 'user/repo',
      description: null,
      htmlUrl: 'https://github.com/user/repo',
      primaryLanguage: null,
      defaultBranch: 'main',
      stargazersCount: 0,
      openIssuesCount: 0,
      isPrivate: false,
      isArchived: false,
      pushedAt: null,
      updatedAt: null
    })

    ensureCommitHistoryBackfill(db)
    db.prepare('UPDATE repos SET last_synced_sha = ? WHERE id = ?').run('freshly-synced-sha', 1)
    ensureCommitHistoryBackfill(db)

    expect(getAllRepoSummaries(db)[0].lastSyncedSha).toBe('freshly-synced-sha')
  })
})
