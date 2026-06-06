CREATE TABLE class_streams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  year TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
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
);

CREATE TABLE subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE class_subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stream_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  UNIQUE(stream_id, subject_id),
  FOREIGN KEY(stream_id) REFERENCES class_streams(id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE scores (
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
);

CREATE TABLE grading_scales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  min_score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  points INTEGER NOT NULL,
  remark TEXT NOT NULL
);
