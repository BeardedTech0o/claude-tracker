import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'
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

// Explicitly opt into per-monitor high-DPI support. Chromium/Electron
// normally pick this up from the exe's embedded manifest, but an unsigned,
// freshly-installed exe can get Windows' legacy DPI-virtualization
// compatibility heuristic applied to it, which bitmap-scales the whole
// window and makes text/vector graphics look blurry/pixelated. This switch
// doesn't override anything Windows sets at the OS level (see the app's
// Properties > Compatibility tab if this doesn't resolve it), but it's the
// documented app-side mitigation and doesn't hurt on displays where it
// wasn't needed.
app.commandLine.appendSwitch('high-dpi-support', '1')

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    icon,
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
