CREATE TABLE repos (
  id                 INTEGER PRIMARY KEY,
  name               TEXT NOT NULL,
  full_name          TEXT NOT NULL,
  description        TEXT,
  html_url           TEXT NOT NULL,
  primary_language   TEXT,
  default_branch     TEXT NOT NULL,
  stargazers_count   INTEGER NOT NULL DEFAULT 0,
  open_issues_count  INTEGER NOT NULL DEFAULT 0,
  is_private         INTEGER NOT NULL DEFAULT 0,
  is_archived        INTEGER NOT NULL DEFAULT 0,
  pushed_at          TEXT,
  updated_at         TEXT,
  last_synced_sha    TEXT,
  last_full_sync_at  TEXT,
  created_at_local   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE repo_languages (
  repo_id     INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  language    TEXT NOT NULL,
  byte_count  INTEGER NOT NULL,
  PRIMARY KEY (repo_id, language)
);

CREATE TABLE commits (
  repo_id      INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  sha          TEXT NOT NULL,
  message      TEXT NOT NULL,
  author_name  TEXT,
  authored_at  TEXT NOT NULL,
  PRIMARY KEY (repo_id, sha)
);
CREATE INDEX idx_commits_repo_authored ON commits(repo_id, authored_at DESC);

CREATE TABLE sync_meta (
  id                     INTEGER PRIMARY KEY CHECK (id = 1),
  last_sync_started_at   TEXT,
  last_sync_finished_at  TEXT,
  last_sync_status       TEXT,
  rate_limit_remaining   INTEGER,
  rate_limit_reset_at    TEXT
);

CREATE TABLE settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);

CREATE TABLE schema_version (version INTEGER NOT NULL);
INSERT INTO schema_version VALUES (1);
