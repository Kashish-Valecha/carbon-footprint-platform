import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Ensure data directory exists
const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database setup
export const db = new Database(path.join(dbDir, "ecosense.db"));

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone_number TEXT UNIQUE,
      hashed_password TEXT NOT NULL,
      city TEXT,
      country TEXT,
      profile_picture TEXT,
      is_verified INTEGER DEFAULT 0,
      green_points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS otp_verification (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      otp_code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      attempt_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Upgrade existing daily_logs if it doesn't have user_id, 
    -- but SQLite doesn't easily ALTER TABLE ADD COLUMN IF NOT EXISTS without pragma table_info.
    -- We can recreate it or just create if not exists
    CREATE TABLE IF NOT EXISTS daily_logs_v2 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      transport_mode TEXT,
      distance_km REAL,
      meals_json TEXT,
      electricity_kwh REAL,
      total_co2_kg REAL,
      green_points INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS streaks_v2 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_log_date TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_name TEXT NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(user_id, achievement_name)
    );
  `);
}

initDb();
