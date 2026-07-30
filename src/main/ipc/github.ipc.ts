import { BrowserWindow, ipcMain } from 'electron'
import type Database from 'better-sqlite3'
import { IpcChannels } from '@shared/ipcContract'
import type { SyncResult } from '@shared/ipcContract'
import { loadToken } from '../secureStore'
import { createGithubClient } from '../github/client'
import { runSync } from '../github/syncService'

export function registerGithubIpc(db: Database.Database): void {
  ipcMain.handle(IpcChannels.syncRun, async (event): Promise<SyncResult> => {
    const token = loadToken(db)
    if (!token) {
      return { ok: false, errorKind: 'auth', message: 'No GitHub token configured' }
    }

    const octokit = createGithubClient(token)
    const senderWindow = BrowserWindow.fromWebContents(event.sender)

    return runSync(db, octokit, (progress) => {
      senderWindow?.webContents.send(IpcChannels.syncProgress, progress)
    })
  })
}
