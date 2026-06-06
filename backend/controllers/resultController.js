const { all, get, run } = require('../config/db');

async function gradeFor(percent) {
  return await get('SELECT * FROM grading_scales WHERE ? >= min_score ORDER BY min_score DESC LIMIT 1', [percent]);
}

async function studentResults(streamId) {
  const students = await all(`SELECT st.*, cs.name AS stream_name FROM students st LEFT JOIN class_streams cs ON cs.id=st.stream_id WHERE st.stream_id=? ORDER BY st.first_name`, [streamId]);
  const results = [];
  for (const student of students) {
    const scores = await all(`SELECT sc.*, sub.name AS subject_name FROM scores sc JOIN subjects sub ON sub.id=sc.subject_id WHERE sc.student_id=?`, [student.id]);
    const totalRaw = scores.reduce((sum, s) => sum + Number(s.score), 0);
    const totalPossible = scores.reduce((sum, s) => sum + Number(s.max_score), 0);
    const average = scores.length ? Math.round(scores.reduce((sum, s) => sum + (s.score / s.max_score * 100), 0) / scores.length) : 0;
    const grade = await gradeFor(average);
    results.push({ ...student, scores, totalRaw, totalPossible, average, grade });
  }
  results.sort((a, b) => b.average - a.average);
  return results.map((r, i) => ({ ...r, position: i + 1 }));
}

exports.getClassResults = async (req, res) => {
  try {
    const { stream_id } = req.query;
    if (!stream_id) return res.status(400).json({ message: 'stream_id is required' });
    const results = await studentResults(stream_id);
    const classAverage = results.length ? Math.round(results.reduce((sum, r) => sum + r.average, 0) / results.length) : 0;
    const passRate = results.length ? Math.round((results.filter(r => r.average >= 40).length / results.length) * 100) : 0;
    res.json({ classAverage, passRate, results });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getSubjectPerformance = async (req, res) => {
  try {
    const { stream_id, subject_id } = req.query;
    if (!stream_id || !subject_id) return res.status(400).json({ message: 'stream_id and subject_id are required' });
    const rows = await all(`SELECT st.id, st.first_name, st.last_name, st.admission_no, sc.score, sc.max_score, sc.assessment_type
      FROM students st
      LEFT JOIN scores sc ON sc.student_id=st.id AND sc.subject_id=?
      WHERE st.stream_id=?
      ORDER BY sc.score DESC`, [subject_id, stream_id]);
    const results = [];
    for (const row of rows) {
      const percent = row.score == null ? 0 : Math.round((row.score / row.max_score) * 100);
      results.push({ ...row, percent, grade: await gradeFor(percent) });
    }
    results.sort((a, b) => b.percent - a.percent);
    res.json(results.map((r, i) => ({ ...r, subject_position: i + 1 })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getGrades = async (req, res) => {
  try { res.json(await all('SELECT * FROM grading_scales ORDER BY min_score DESC')); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateGrades = async (req, res) => {
  try {
    const { grades } = req.body;
    if (!Array.isArray(grades)) return res.status(400).json({ message: 'grades must be an array' });
    await run('DELETE FROM grading_scales');
    for (const g of grades) await run('INSERT INTO grading_scales(min_score, grade, points, remark) VALUES(?,?,?,?)', [g.min_score, g.grade, g.points, g.remark]);
    res.json({ message: 'Grading scale updated successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
