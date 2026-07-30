import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type Database from 'better-sqlite3'
import { openDb } from './connection'
import { getAllRepoSummaries, getDashboardStats, getReposWithDetails, replaceLanguages, upsertRepo } from './reposRepo'
import { replaceCommits } from './commitsRepo'
import { getSettings, setAccent, setEncryptedToken } from './settingsRepo'

let dir: string
let db: Database.Database

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'claude-tracker-test-'))
  db = openDb(join(dir, 'test.db'))
})

afterEach(() => {
  db.close()
  rmSync(dir, { recursive: true, force: true })
})

describe('reposRepo', () => {
  it('upserts a repo and reads it back with details', () => {
    upsertRepo(db, {
      id: 1,
      name: 'claude-tracker',
      fullName: 'BeardedTech0o/claude-tracker',
      description: 'A tile wall for repos',
      htmlUrl: 'https://github.com/BeardedTech0o/claude-tracker',
      primaryLanguage: 'TypeScript',
      defaultBranch: 'main',
      stargazersCount: 3,
      openIssuesCount: 1,
      isPrivate: false,
      isArchived: false,
      pushedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    replaceLanguages(db, 1, [
      { language: 'TypeScript', byteCount: 5000 },
      { language: 'CSS', byteCount: 500 }
    ])

    replaceCommits(db, 1, [
      { sha: 'abc123', message: 'init', authorName: 'sam', authoredAt: new Date().toISOString() }
    ])

    const repos = getReposWithDetails(db)
    expect(repos).toHaveLength(1)
    expect(repos[0].name).toBe('claude-tracker')
    expect(repos[0].languages).toHaveLength(2)
    expect(repos[0].commits).toHaveLength(1)
    expect(repos[0].commits[0].sha).toBe('abc123')
  })

  it('updates on conflict rather than duplicating', () => {
    const base = {
      id: 1,
      name: 'claude-tracker',
      fullName: 'BeardedTech0o/claude-tracker',
      description: null,
      htmlUrl: 'https://github.com/BeardedTech0o/claude-tracker',
      primaryLanguage: null,
      defaultBranch: 'main',
      stargazersCount: 0,
      openIssuesCount: 0,
      isPrivate: false,
      isArchived: false,
      pushedAt: null,
      updatedAt: null
    }
    upsertRepo(db, base)
    upsertRepo(db, { ...base, stargazersCount: 42 })

    const summaries = getAllRepoSummaries(db)
    expect(summaries).toHaveLength(1)

    const repos = getReposWithDetails(db)
    expect(repos[0].stargazersCount).toBe(42)
  })

  it('computes dashboard stats from repos/languages/commits', () => {
    upsertRepo(db, {
      id: 1,
      name: 'active-repo',
      fullName: 'user/active-repo',
      description: null,
      htmlUrl: 'https://github.com/user/active-repo',
      primaryLanguage: 'TypeScript',
      defaultBranch: 'main',
      stargazersCount: 10,
      openIssuesCount: 0,
      isPrivate: false,
      isArchived: false,
      pushedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    replaceLanguages(db, 1, [{ language: 'TypeScript', byteCount: 1000 }])
    replaceCommits(db, 1, [
      { sha: 'abc', message: 'recent commit', authorName: 'sam', authoredAt: new Date().toISOString() }
    ])

    const stats = getDashboardStats(db)
    expect(stats.totalRepos).toBe(1)
    expect(stats.totalStars).toBe(10)
    expect(stats.commitsThisWeek).toBe(1)
    expect(stats.activeRepos).toBe(1)
    expect(stats.languageBreakdown).toEqual([{ language: 'TypeScript', byteCount: 1000 }])
    expect(stats.activityBreakdown.find((a) => a.status === 'active')?.count).toBe(1)
  })
})

describe('settingsRepo', () => {
  it('defaults accent and reports no token until one is set', () => {
    const settings = getSettings(db)
    expect(settings.accent).toBe('lime')
    expect(settings.hasToken).toBe(false)

    setAccent(db, 'coral')
    setEncryptedToken(db, 'ciphertext-base64')

    const updated = getSettings(db)
    expect(updated.accent).toBe('coral')
    expect(updated.hasToken).toBe(true)
  })
})
