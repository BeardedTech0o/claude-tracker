import { create } from 'zustand'
import type { SyncProgress, SyncResult } from '@shared/ipcContract'
import { useReposStore } from './reposStore'

interface SyncState {
  status: 'idle' | 'syncing' | 'error'
  progress: SyncProgress | null
  lastResult: SyncResult | null
  runSync: () => Promise<void>
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'idle',
  progress: null,
  lastResult: null,
  runSync: async () => {
    if (get().status === 'syncing') return

    set({ status: 'syncing', progress: null, lastResult: null })
    const unsubscribe = window.api.sync.onProgress((progress) => set({ progress }))

    let result: SyncResult
    try {
      result = await window.api.sync.run()
    } finally {
      unsubscribe()
    }

    if (result.ok) {
      await useReposStore.getState().fetchAll()
    }

    set({ status: result.ok ? 'idle' : 'error', lastResult: result, progress: null })
  }
}))
