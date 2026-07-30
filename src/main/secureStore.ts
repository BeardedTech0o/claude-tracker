import { safeStorage } from 'electron'
import type Database from 'better-sqlite3'
import { clearEncryptedToken, getEncryptedToken, setEncryptedToken } from './db/settingsRepo'

// Session-only fallback used when the OS keychain (safeStorage) is unavailable.
// Never written to disk in plaintext - the user must re-enter the token next launch.
let inMemoryToken: string | null = null

export function isSecureStorageAvailable(): boolean {
  return safeStorage.isEncryptionAvailable()
}

export function saveToken(db: Database.Database, token: string): void {
  if (isSecureStorageAvailable()) {
    const ciphertext = safeStorage.encryptString(token).toString('base64')
    setEncryptedToken(db, ciphertext)
    inMemoryToken = null
  } else {
    inMemoryToken = token
  }
}

export function loadToken(db: Database.Database): string | null {
  if (inMemoryToken) return inMemoryToken

  const ciphertext = getEncryptedToken(db)
  if (!ciphertext || !isSecureStorageAvailable()) return null

  try {
    return safeStorage.decryptString(Buffer.from(ciphertext, 'base64'))
  } catch {
    // Ciphertext can't be decrypted under the current OS key (e.g. after a
    // machine/user migration) - drop it and ask the user to re-enter.
    clearEncryptedToken(db)
    return null
  }
}

export function hasToken(db: Database.Database): boolean {
  return inMemoryToken !== null || getEncryptedToken(db) !== null
}
