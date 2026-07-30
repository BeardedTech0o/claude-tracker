import Database from 'better-sqlite3'
import { runMigrations } from './migrations/migrate'

let db: Database.Database | null = null

export function openDb(dbPath: string): Database.Database {
  const instance = new Database(dbPath)
  instance.pragma('journal_mode = WAL')
  instance.pragma('foreign_keys = ON')
  runMigrations(instance)
  return instance
}

export function getDb(dbPath: string): Database.Database {
  if (!db) {
    db = openDb(dbPath)
  }
  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
