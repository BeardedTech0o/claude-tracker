import type { GithubClient } from './client'

export type GhRepoListItem = Awaited<
  ReturnType<GithubClient['rest']['repos']['listForAuthenticatedUser']>
>['data'][number]

export type GhCommitItem = Awaited<
  ReturnType<GithubClient['rest']['repos']['listCommits']>
>['data'][number]
