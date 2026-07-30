import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/ipcContract'
import type {
  DashboardStats,
  RepoWithDetails,
  PreloadApi,
  Settings,
  SyncProgress,
  SyncResult,
  Accent
} from '@shared/ipcContract'

const api: PreloadApi = {
  repos: {
    list: (): Promise<RepoWithDetails[]> => ipcRenderer.invoke(IpcChannels.reposList),
    stats: (): Promise<DashboardStats> => ipcRenderer.invoke(IpcChannels.reposStats)
  },
  sync: {
    run: (): Promise<SyncResult> => ipcRenderer.invoke(IpcChannels.syncRun),
    onProgress: (callback: (progress: SyncProgress) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, progress: SyncProgress): void =>
        callback(progress)
      ipcRenderer.on(IpcChannels.syncProgress, listener)
      return () => ipcRenderer.removeListener(IpcChannels.syncProgress, listener)
    }
  },
  settings: {
    get: (): Promise<Settings> => ipcRenderer.invoke(IpcChannels.settingsGet),
    setAccent: (accent: Accent): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.settingsSetAccent, accent),
    setToken: (token: string): Promise<void> => ipcRenderer.invoke(IpcChannels.settingsSetToken, token),
    hasToken: (): Promise<boolean> => ipcRenderer.invoke(IpcChannels.settingsHasToken)
  }
}

contextBridge.exposeInMainWorld('api', api)
