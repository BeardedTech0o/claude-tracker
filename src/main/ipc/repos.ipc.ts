import { ipcMain } from 'electron'
import type Database from 'better-sqlite3'
import { IpcChannels } from '@shared/ipcContract'
import { getDashboardStats, getReposWithDetails } from '../db/reposRepo'

export function registerReposIpc(db: Database.Database): void {
  ipcMain.handle(IpcChannels.reposList, () => getReposWithDetails(db))
  ipcMain.handle(IpcChannels.reposStats, () => getDashboardStats(db))
}
