const { run, get, all } = require('../config/db');

exports.createStream = async (req, res) => {
  try {
    const { name, year } = req.body;
    if (!name) return res.status(400).json({ message: 'Stream name is required' });
    const result = await run('INSERT INTO class_streams(name, year) VALUES(?,?)', [name.trim(), year || null]);
    res.status(201).json({ id: result.id, name, year });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStreams = async (req, res) => {
  try {
    const rows = await all(`SELECT cs.*, 
      COUNT(DISTINCT st.id) AS student_count,
      COUNT(DISTINCT csub.subject_id) AS subject_count
      FROM class_streams cs
      LEFT JOIN students st ON st.stream_id = cs.id
      LEFT JOIN class_subjects csub ON csub.stream_id = cs.id
      GROUP BY cs.id ORDER BY cs.id DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStream = async (req, res) => {
  try {
    const id = req.params.id;
    const stream = await get('SELECT * FROM class_streams WHERE id=?', [id]);
    if (!stream) return res.status(404).json({ message: 'Stream not found' });
    const students = await all('SELECT * FROM students WHERE stream_id=? ORDER BY first_name', [id]);
    const subjects = await all(`SELECT s.* FROM subjects s INNER JOIN class_subjects cs ON cs.subject_id=s.id WHERE cs.stream_id=?`, [id]);
    res.json({ ...stream, students, subjects });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStream = async (req, res) => {
  try {
    const { name, year } = req.body;
    if (!name) return res.status(400).json({ message: 'Stream name is required' });
    const result = await run('UPDATE class_streams SET name=?, year=? WHERE id=?', [name.trim(), year || null, req.params.id]);
    if (!result.changes) return res.status(404).json({ message: 'Stream not found' });
    res.json({ message: 'Stream updated successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteStream = async (req, res) => {
  try {
    const result = await run('DELETE FROM class_streams WHERE id=?', [req.params.id]);
    if (!result.changes) return res.status(404).json({ message: 'Stream not found' });
    res.json({ message: 'Stream deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
