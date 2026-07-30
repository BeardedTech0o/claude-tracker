import { app } from 'electron'
import { join } from 'path'

export function getDbPath(): string {
  return join(app.getPath('userData'), 'claude-tracker.db')
}
