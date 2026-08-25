-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  status TEXT DEFAULT 'draft',
  ai_generated INTEGER DEFAULT 0,
  author_id INTEGER,
  published_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL,
  original_price REAL,
  images TEXT,
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  store_name TEXT,
  store_address TEXT,
  store_phone TEXT,
  is_soft_ad INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Chronicles table
CREATE TABLE IF NOT EXISTS chronicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  era TEXT,
  tags TEXT,
  status TEXT DEFAULT 'published',
  created_at INTEGER DEFAULT (unixepoch())
);

-- Villages table
CREATE TABLE IF NOT EXISTS villages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  district TEXT,
  township TEXT,
  location TEXT,
  population TEXT,
  farmland TEXT,
  surnames TEXT,
  history TEXT,
  evolution TEXT,
  remark TEXT,
  version_tag TEXT,
  source_file TEXT,
  status TEXT DEFAULT 'published',
  created_at INTEGER DEFAULT (unixepoch())
);

-- AI Ops Logs table
CREATE TABLE IF NOT EXISTS ai_ops_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_type TEXT,
  status TEXT,
  input TEXT,
  output TEXT,
  metadata TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
