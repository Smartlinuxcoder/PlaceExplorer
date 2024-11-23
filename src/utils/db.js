import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open an SQLite in-memory database
const dbPromise = open({
  filename: ':memory:',
  driver: sqlite3.Database,
});

export async function initializeDatabase() {
  const db = await dbPromise;

  // Example schema
  await db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      country TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database initialized');
  return db;
}

export async function getDatabase() {
  return dbPromise;
}
