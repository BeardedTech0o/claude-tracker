export const IpcChannels = {
  reposList: 'repos:list',
  reposStats: 'repos:stats',
  syncRun: 'sync:run',
  syncProgress: 'sync:progress',
  settingsGet: 'settings:get',
  settingsSetAccent: 'settings:setAccent',
  settingsSetToken: 'settings:setToken',
  settingsHasToken: 'settings:hasToken'
} as const

export type Accent = 'lime' | 'blue' | 'violet' | 'coral' | 'teal' | 'pink'

export interface RepoLanguage {
  language: string
  byteCount: number
}

export interface RepoCommit {
  sha: string
  message: string
  authorName: string | null
  authoredAt: string
}

export interface RepoWithDetails {
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
  languages: RepoLanguage[]
  commits: RepoCommit[]
}

export interface DashboardStats {
  totalRepos: number
  activeRepos: number
  commitsThisWeek: number
  totalStars: number
  languageBreakdown: { language: string; byteCount: number }[]
  activityBreakdown: { status: 'active' | 'stale' | 'archived'; count: number }[]
  commitFrequency: { bucket: string; count: number }[]
}

export type SyncErrorKind = 'auth' | 'offline' | 'rate_limited' | 'unknown'

export interface SyncResult {
  ok: boolean
  errorKind?: SyncErrorKind
  message?: string
  rateLimitResetAt?: string
  reposSynced?: number
  reposFailed?: { repoFullName: string; message: string }[]
}

export interface SyncProgress {
  done: number
  total: number
  currentRepo?: string
}

export interface Settings {
  accent: Accent
  hasToken: boolean
}

export interface PreloadApi {
  repos: {
    list: () => Promise<RepoWithDetails[]>
    stats: () => Promise<DashboardStats>
  }
  sync: {
    run: () => Promise<SyncResult>
    onProgress: (callback: (progress: SyncProgress) => void) => () => void
  }
  settings: {
    get: () => Promise<Settings>
    setAccent: (accent: Accent) => Promise<void>
    setToken: (token: string) => Promise<void>
    hasToken: () => Promise<boolean>
  }
}
