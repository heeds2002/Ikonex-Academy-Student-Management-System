const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DATABASE_FILE || path.join(__dirname, '..', 'database', 'ikonex.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection failed:', err.message);
  else console.log('SQLite database connected:', dbPath);
});

db.run('PRAGMA foreign_keys = ON');

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDatabase() {
  await run(`CREATE TABLE IF NOT EXISTS class_streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    year TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    admission_no TEXT NOT NULL UNIQUE,
    gender TEXT,
    dob TEXT,
    guardian_contact TEXT,
    stream_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(stream_id) REFERENCES class_streams(id) ON DELETE SET NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS class_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stream_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    UNIQUE(stream_id, subject_id),
    FOREIGN KEY(stream_id) REFERENCES class_streams(id) ON DELETE CASCADE,
    FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  )`);

  await run(`CREATE TABLE IF NOT EXISTS grading_scales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    min_score INTEGER NOT NULL,
    grade TEXT NOT NULL,
    points INTEGER NOT NULL,
    remark TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    assessment_type TEXT NOT NULL,
    score REAL NOT NULL,
    max_score REAL NOT NULL DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id, assessment_type),
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  )`);

  const gradeCount = await get('SELECT COUNT(*) AS total FROM grading_scales');
  if (!gradeCount || gradeCount.total === 0) {
    const grades = [
      [80, 'A', 12, 'Distinction'], [70, 'B+', 11, 'Very Good'], [60, 'B', 10, 'Good'],
      [55, 'B-', 9, 'Above Average'], [50, 'C+', 8, 'Average'], [45, 'C', 7, 'Below Average'],
      [40, 'C-', 6, 'Pass'], [35, 'D+', 5, 'Weak Pass'], [30, 'D', 4, 'Weak'],
      [25, 'D-', 3, 'Very Weak'], [0, 'E', 2, 'Fail']
    ];
    for (const g of grades) await run('INSERT INTO grading_scales(min_score, grade, points, remark) VALUES(?,?,?,?)', g);
  }
}

module.exports = { db, run, get, all, initDatabase };
