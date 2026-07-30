export interface RemoteRepoSummary {
  id: number
  fullName: string
  defaultBranch: string
  pushedAt: string | null
}

export interface LocalRepoSummary {
  id: number
  fullName: string
  defaultBranch: string
  pushedAt: string | null
  lastSyncedSha: string | null
}

/**
 * First-pass, zero-extra-call filter: only repos whose pushed_at moved (or
 * that we've never seen, or that never completed a full sync) warrant the
 * extra branch-head API call to check the real commit SHA.
 */
export function needsShaCheck(remote: RemoteRepoSummary, local: LocalRepoSummary | undefined): boolean {
  if (!local) return true
  if (!local.lastSyncedSha) return true
  if (!remote.pushedAt || !local.pushedAt) return true
  return new Date(remote.pushedAt).getTime() > new Date(local.pushedAt).getTime()
}

/**
 * Second-pass, precise check: only repos whose default-branch head SHA
 * actually changed warrant refetching commits/languages.
 */
export function needsFullRefetch(headSha: string, local: LocalRepoSummary | undefined): boolean {
  if (!local) return true
  return local.lastSyncedSha !== headSha
}
