CREATE TABLE IF NOT EXISTS personal_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'note',
  summary TEXT DEFAULT '',
  content TEXT NOT NULL,
  cover_image TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  author_id INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  published_at INTEGER,
  FOREIGN KEY (author_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_personal_notes_public ON personal_notes(status, published_at DESC, id DESC);
