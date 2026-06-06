const { run, all, get } = require('../config/db');

exports.createSubject = async (req, res) => {
  try {
    const { name, code, stream_ids = [] } = req.body;
    if (!name || !code) return res.status(400).json({ message: 'Subject name and code are required' });
    const result = await run('INSERT INTO subjects(name, code) VALUES(?,?)', [name.trim(), code.trim()]);
    for (const streamId of stream_ids) await run('INSERT OR IGNORE INTO class_subjects(stream_id, subject_id) VALUES(?,?)', [streamId, result.id]);
    res.status(201).json({ id: result.id, message: 'Subject created successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await all('SELECT * FROM subjects ORDER BY id DESC');
    for (const subject of subjects) {
      subject.streams = await all(`SELECT cs.id, cs.name FROM class_streams cs JOIN class_subjects csub ON csub.stream_id=cs.id WHERE csub.subject_id=?`, [subject.id]);
    }
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getSubject = async (req, res) => {
  try {
    const subject = await get('SELECT * FROM subjects WHERE id=?', [req.params.id]);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    subject.streams = await all(`SELECT cs.id, cs.name FROM class_streams cs JOIN class_subjects csub ON csub.stream_id=cs.id WHERE csub.subject_id=?`, [req.params.id]);
    res.json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateSubject = async (req, res) => {
  try {
    const { name, code, stream_ids = [] } = req.body;
    const result = await run('UPDATE subjects SET name=?, code=? WHERE id=?', [name, code, req.params.id]);
    if (!result.changes) return res.status(404).json({ message: 'Subject not found' });
    await run('DELETE FROM class_subjects WHERE subject_id=?', [req.params.id]);
    for (const streamId of stream_ids) await run('INSERT OR IGNORE INTO class_subjects(stream_id, subject_id) VALUES(?,?)', [streamId, req.params.id]);
    res.json({ message: 'Subject updated successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteSubject = async (req, res) => {
  try {
    const result = await run('DELETE FROM subjects WHERE id=?', [req.params.id]);
    if (!result.changes) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
