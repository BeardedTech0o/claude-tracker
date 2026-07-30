import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { getDbPath } from './appPaths'
import { closeDb, getDb } from './db/connection'
import { registerReposIpc } from './ipc/repos.ipc'
import { registerSettingsIpc } from './ipc/settings.ipc'
import { registerGithubIpc } from './ipc/github.ipc'

function fatalStartupError(context: string, err: unknown): void {
  const message = err instanceof Error ? (err.stack ?? err.message) : String(err)
  // eslint-disable-next-line no-console
  console.error(`[fatal] ${context}:`, message)
  dialog.showErrorBox(`claude-tracker failed to start (${context})`, message)
  app.exit(1)
}

process.on('uncaughtException', (err) => fatalStartupError('uncaughtException', err))
process.on('unhandledRejection', (err) => fatalStartupError('unhandledRejection', err))

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    fatalStartupError('renderer failed to load', `${errorCode}: ${errorDescription}`)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  try {
    const db = getDb(getDbPath())
    registerReposIpc(db)
    registerSettingsIpc(db)
    registerGithubIpc(db)

    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    if (app.isPackaged) {
      autoUpdater.checkForUpdatesAndNotify().catch(() => {
        // No release feed configured yet - safe to ignore until one exists.
      })
    }
  } catch (err) {
    fatalStartupError('startup', err)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  closeDb()
})
