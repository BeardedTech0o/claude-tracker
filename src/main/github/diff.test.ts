import { describe, expect, it } from 'vitest'
import { needsFullRefetch, needsShaCheck } from './diff'
import type { LocalRepoSummary, RemoteRepoSummary } from './diff'

function remote(overrides: Partial<RemoteRepoSummary> = {}): RemoteRepoSummary {
  return { id: 1, fullName: 'user/repo', defaultBranch: 'main', pushedAt: '2026-07-20T00:00:00Z', ...overrides }
}

function local(overrides: Partial<LocalRepoSummary> = {}): LocalRepoSummary {
  return {
    id: 1,
    fullName: 'user/repo',
    defaultBranch: 'main',
    pushedAt: '2026-07-10T00:00:00Z',
    lastSyncedSha: 'sha-old',
    ...overrides
  }
}

describe('needsShaCheck', () => {
  it('is true for a repo never seen before', () => {
    expect(needsShaCheck(remote(), undefined)).toBe(true)
  })

  it('is true when we have no recorded synced sha yet', () => {
    expect(needsShaCheck(remote(), local({ lastSyncedSha: null }))).toBe(true)
  })

  it('is true when remote pushed_at is newer than local pushed_at', () => {
    expect(
      needsShaCheck(remote({ pushedAt: '2026-07-25T00:00:00Z' }), local({ pushedAt: '2026-07-20T00:00:00Z' }))
    ).toBe(true)
  })

  it('is false when pushed_at has not advanced', () => {
    expect(
      needsShaCheck(remote({ pushedAt: '2026-07-10T00:00:00Z' }), local({ pushedAt: '2026-07-10T00:00:00Z' }))
    ).toBe(false)
  })

  it('is true when pushed_at is missing on either side (fail-safe to checking)', () => {
    expect(needsShaCheck(remote({ pushedAt: null }), local())).toBe(true)
    expect(needsShaCheck(remote(), local({ pushedAt: null }))).toBe(true)
  })
})

describe('needsFullRefetch', () => {
  it('is true for a repo never seen before', () => {
    expect(needsFullRefetch('sha-new', undefined)).toBe(true)
  })

  it('is true when the head sha changed', () => {
    expect(needsFullRefetch('sha-new', local({ lastSyncedSha: 'sha-old' }))).toBe(true)
  })

  it('is false when the head sha is unchanged', () => {
    expect(needsFullRefetch('sha-same', local({ lastSyncedSha: 'sha-same' }))).toBe(false)
  })
})
