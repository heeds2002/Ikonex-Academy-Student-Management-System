# Ikonex Academy Backend API

This backend supports the Ikonex Academy Student Management System.

## Tech Used

- Node.js
- Express.js
- SQLite database
- PDFKit for PDF report generation

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Server runs on:

```text
http://localhost:5000
```

## Main API Endpoints

### Streams

```text
GET    /api/streams
POST   /api/streams
GET    /api/streams/:id
PUT    /api/streams/:id
DELETE /api/streams/:id
```

### Students

```text
GET    /api/students
POST   /api/students
GET    /api/students/:id
PUT    /api/students/:id
DELETE /api/students/:id
```

### Subjects

```text
GET    /api/subjects
POST   /api/subjects
GET    /api/subjects/:id
PUT    /api/subjects/:id
DELETE /api/subjects/:id
```

### Scores

```text
GET    /api/scores
POST   /api/scores
PUT    /api/scores/:id
DELETE /api/scores/:id
```

### Results

```text
GET /api/results/class?stream_id=1
GET /api/results/subject?stream_id=1&subject_id=1
GET /api/results/grades
PUT /api/results/grades
```

### Reports

```text
GET /api/reports/student/:studentId/pdf
GET /api/reports/class/:streamId/pdf
```

## Example JSON

Create stream:

```json
{
  "name": "Form 1A",
  "year": "Form 1"
}
```

Create student:

```json
{
  "first_name": "Alice",
  "last_name": "Wanjiru",
  "admission_no": "ADM001",
  "gender": "Female",
  "dob": "2010-03-15",
  "guardian_contact": "0712345678",
  "stream_id": 1
}
```

Create subject:

```json
{
  "name": "Mathematics",
  "code": "MATH101",
  "stream_ids": [1, 2]
}
```

Create score:

```json
{
  "student_id": 1,
  "subject_id": 1,
  "assessment_type": "Exam",
  "score": 78,
  "max_score": 100
}
```
