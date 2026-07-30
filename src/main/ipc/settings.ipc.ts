import { ipcMain } from 'electron'
import type Database from 'better-sqlite3'
import { IpcChannels } from '@shared/ipcContract'
import type { Accent, Settings } from '@shared/ipcContract'
import { getSettings, setAccent } from '../db/settingsRepo'
import { hasToken as secureHasToken, saveToken } from '../secureStore'

export function registerSettingsIpc(db: Database.Database): void {
  ipcMain.handle(
    IpcChannels.settingsGet,
    (): Settings => ({ ...getSettings(db), hasToken: secureHasToken(db) })
  )

  ipcMain.handle(IpcChannels.settingsSetAccent, (_event, accent: Accent) => {
    setAccent(db, accent)
  })

  ipcMain.handle(IpcChannels.settingsSetToken, (_event, token: string) => {
    saveToken(db, token)
  })

  ipcMain.handle(IpcChannels.settingsHasToken, () => secureHasToken(db))
}
