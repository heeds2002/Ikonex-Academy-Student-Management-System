const { run, all, get } = require('../config/db');

async function gradeFor(percent) {
  return await get('SELECT * FROM grading_scales WHERE ? >= min_score ORDER BY min_score DESC LIMIT 1', [percent]);
}

exports.createScore = async (req, res) => {
  try {
    const { student_id, subject_id, assessment_type, score, max_score = 100 } = req.body;
    if (!student_id || !subject_id || !assessment_type) return res.status(400).json({ message: 'Student, subject and assessment type are required' });
    if (score < 0 || score > max_score) return res.status(400).json({ message: 'Score must be between 0 and maximum score' });
    const duplicate = await get('SELECT id FROM scores WHERE student_id=? AND subject_id=? AND assessment_type=?', [student_id, subject_id, assessment_type]);
    if (duplicate) return res.status(409).json({ message: 'Duplicate score. Edit existing score instead.' });
    const result = await run('INSERT INTO scores(student_id,subject_id,assessment_type,score,max_score) VALUES(?,?,?,?,?)', [student_id, subject_id, assessment_type, score, max_score]);
    res.status(201).json({ id: result.id, message: 'Score recorded successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getScores = async (req, res) => {
  try {
    const rows = await all(`SELECT sc.*, st.first_name, st.last_name, st.admission_no, st.stream_id, cs.name AS stream_name, sub.name AS subject_name, sub.code AS subject_code
      FROM scores sc
      JOIN students st ON st.id=sc.student_id
      JOIN subjects sub ON sub.id=sc.subject_id
      LEFT JOIN class_streams cs ON cs.id=st.stream_id
      ORDER BY sc.id DESC`);
    for (const r of rows) {
      r.percent = Math.round((r.score / r.max_score) * 100);
      r.grade = await gradeFor(r.percent);
    }
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateScore = async (req, res) => {
  try {
    const { student_id, subject_id, assessment_type, score, max_score = 100 } = req.body;
    if (score < 0 || score > max_score) return res.status(400).json({ message: 'Score must be between 0 and maximum score' });
    const result = await run('UPDATE scores SET student_id=?, subject_id=?, assessment_type=?, score=?, max_score=? WHERE id=?', [student_id, subject_id, assessment_type, score, max_score, req.params.id]);
    if (!result.changes) return res.status(404).json({ message: 'Score not found' });
    res.json({ message: 'Score updated successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteScore = async (req, res) => {
  try {
    const result = await run('DELETE FROM scores WHERE id=?', [req.params.id]);
    if (!result.changes) return res.status(404).json({ message: 'Score not found' });
    res.json({ message: 'Score deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
