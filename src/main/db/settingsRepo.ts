import type Database from 'better-sqlite3'
import type { Accent, Settings, Theme } from '@shared/ipcContract'

const DEFAULT_THEME: Theme = 'dark'
const DEFAULT_ACCENT: Accent = 'lime'
const TOKEN_KEY = 'encrypted_token'

export function getSettingValue(db: Database.Database, key: string): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row?.value ?? null
}

export function setSettingValue(db: Database.Database, key: string, value: string): void {
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(key, value)
}

export function deleteSettingValue(db: Database.Database, key: string): void {
  db.prepare('DELETE FROM settings WHERE key = ?').run(key)
}

export function getSettings(db: Database.Database): Settings {
  const theme = (getSettingValue(db, 'theme') as Theme | null) ?? DEFAULT_THEME
  const accent = (getSettingValue(db, 'accent') as Accent | null) ?? DEFAULT_ACCENT
  const hasToken = getSettingValue(db, TOKEN_KEY) !== null

  return { theme, accent, hasToken }
}

export function setTheme(db: Database.Database, theme: Theme): void {
  setSettingValue(db, 'theme', theme)
}

export function setAccent(db: Database.Database, accent: Accent): void {
  setSettingValue(db, 'accent', accent)
}

export function getEncryptedToken(db: Database.Database): string | null {
  return getSettingValue(db, TOKEN_KEY)
}

export function setEncryptedToken(db: Database.Database, ciphertextBase64: string): void {
  setSettingValue(db, TOKEN_KEY, ciphertextBase64)
}

export function clearEncryptedToken(db: Database.Database): void {
  deleteSettingValue(db, TOKEN_KEY)
}
