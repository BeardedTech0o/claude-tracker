import { Octokit } from '@octokit/rest'
import { throttling } from '@octokit/plugin-throttling'
import { retry } from '@octokit/plugin-retry'

const ThrottledOctokit = Octokit.plugin(throttling, retry)

export function createGithubClient(token: string): InstanceType<typeof ThrottledOctokit> {
  return new ThrottledOctokit({
    auth: token,
    throttle: {
      onRateLimit: (_retryAfter, _options, _octokit, retryCount) => retryCount < 1,
      onSecondaryRateLimit: (_retryAfter, _options, _octokit, retryCount) => retryCount < 1
    }
  })
}

export type GithubClient = InstanceType<typeof ThrottledOctokit>
