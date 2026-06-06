const { run, get, all } = require('../config/db');

exports.createStudent = async (req, res) => {
  try {
    const { first_name, last_name, admission_no, gender, dob, guardian_contact, stream_id } = req.body;
    if (!first_name || !last_name || !admission_no || !stream_id) return res.status(400).json({ message: 'First name, last name, admission number and stream are required' });
    const result = await run(`INSERT INTO students(first_name,last_name,admission_no,gender,dob,guardian_contact,stream_id)
      VALUES(?,?,?,?,?,?,?)`, [first_name, last_name, admission_no, gender || null, dob || null, guardian_contact || null, stream_id]);
    res.status(201).json({ id: result.id, message: 'Student registered successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStudents = async (req, res) => {
  try {
    const { stream_id } = req.query;
    let sql = `SELECT st.*, cs.name AS stream_name FROM students st LEFT JOIN class_streams cs ON cs.id=st.stream_id`;
    const params = [];
    if (stream_id) { sql += ' WHERE st.stream_id=?'; params.push(stream_id); }
    sql += ' ORDER BY st.id DESC';
    res.json(await all(sql, params));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await get(`SELECT st.*, cs.name AS stream_name FROM students st LEFT JOIN class_streams cs ON cs.id=st.stream_id WHERE st.id=?`, [req.params.id]);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const scores = await all(`SELECT sc.*, sub.name AS subject_name, sub.code AS subject_code FROM scores sc JOIN subjects sub ON sub.id=sc.subject_id WHERE sc.student_id=?`, [req.params.id]);
    res.json({ ...student, scores });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStudent = async (req, res) => {
  try {
    const { first_name, last_name, admission_no, gender, dob, guardian_contact, stream_id } = req.body;
    const result = await run(`UPDATE students SET first_name=?, last_name=?, admission_no=?, gender=?, dob=?, guardian_contact=?, stream_id=? WHERE id=?`,
      [first_name, last_name, admission_no, gender || null, dob || null, guardian_contact || null, stream_id, req.params.id]);
    if (!result.changes) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student updated successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteStudent = async (req, res) => {
  try {
    const result = await run('DELETE FROM students WHERE id=?', [req.params.id]);
    if (!result.changes) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
