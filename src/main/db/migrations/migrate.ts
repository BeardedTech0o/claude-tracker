import type Database from 'better-sqlite3'
import migration001 from './001_init.sql?raw'

interface Migration {
  version: number
  sql: string
}

const migrations: Migration[] = [{ version: 1, sql: migration001 }]

export function runMigrations(db: Database.Database): void {
  const hasVersionTable = db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'schema_version'`)
    .get()

  const currentVersion = hasVersionTable
    ? ((db.prepare('SELECT MAX(version) as v FROM schema_version').get() as { v: number | null })
        .v ?? 0)
    : 0

  const pending = migrations.filter((m) => m.version > currentVersion).sort((a, b) => a.version - b.version)

  for (const migration of pending) {
    db.exec(migration.sql)
  }
}
