const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, '../../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database
const DB_PATH = path.join(DATA_DIR, 'ltm-cline.db');
const db = new sqlite3.Database(DB_PATH);

// Helper to run SQL as a promise
const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

// Helper to get a single row as a promise
const getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Helper to get all rows as a promise
const allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Helper to execute a simple SQL statement
const execAsync = (sql) => {
  return new Promise((resolve, reject) => {
    db.exec(sql, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables if they don't exist
async function initDatabase() {
  try {
    // Persona table
    await execAsync(`
      CREATE TABLE IF NOT EXISTS persona (
        persona_id TEXT PRIMARY KEY,
        traits TEXT NOT NULL,
        "values" TEXT NOT NULL,
        preferences TEXT NOT NULL, 
        biography TEXT NOT NULL,
        last_updated DATETIME NOT NULL
      )
    `);

    // Conversations table
    await execAsync(`
      CREATE TABLE IF NOT EXISTS conversations (
        conversation_id TEXT PRIMARY KEY,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        participants TEXT NOT NULL,
        raw_text TEXT NOT NULL,
        context TEXT
      )
    `);

    // Memories table
    await execAsync(`
      CREATE TABLE IF NOT EXISTS memories (
        memory_id TEXT PRIMARY KEY,
        conversation_id TEXT,
        summary TEXT NOT NULL,
        importance INTEGER NOT NULL,
        timestamp DATETIME NOT NULL,
        tags TEXT,
        FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
      )
    `);

    // Dreamstate updates table
    await execAsync(`
      CREATE TABLE IF NOT EXISTS dreamstate_updates (
        update_id TEXT PRIMARY KEY,
        persona_id TEXT NOT NULL,
        description TEXT NOT NULL,
        justification TEXT NOT NULL,
        previous_state TEXT NOT NULL,
        new_state TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        FOREIGN KEY (persona_id) REFERENCES persona(persona_id)
      )
    `);

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
}

// Initialize database on module load
initDatabase().catch(console.error);

module.exports = {
  db,
  runAsync,
  getAsync,
  allAsync,
  execAsync,
  initDatabase
};
