import { create } from 'zustand'
import type { DashboardStats, RepoWithDetails } from '@shared/ipcContract'

interface ReposState {
  repos: RepoWithDetails[]
  stats: DashboardStats | null
  loading: boolean
  fetchAll: () => Promise<void>
}

export const useReposStore = create<ReposState>((set) => ({
  repos: [],
  stats: null,
  loading: false,
  fetchAll: async () => {
    set({ loading: true })
    const [repos, stats] = await Promise.all([window.api.repos.list(), window.api.repos.stats()])
    set({ repos, stats, loading: false })
  }
}))
