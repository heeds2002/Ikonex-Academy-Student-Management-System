const PDFDocument = require('pdfkit');
const { all, get } = require('../config/db');

async function gradeFor(percent) {
  return await get('SELECT * FROM grading_scales WHERE ? >= min_score ORDER BY min_score DESC LIMIT 1', [percent]);
}

async function buildStudentResult(studentId) {
  const student = await get(`SELECT st.*, cs.name AS stream_name FROM students st LEFT JOIN class_streams cs ON cs.id=st.stream_id WHERE st.id=?`, [studentId]);
  if (!student) return null;
  const scores = await all(`SELECT sc.*, sub.name AS subject_name, sub.code AS subject_code FROM scores sc JOIN subjects sub ON sub.id=sc.subject_id WHERE sc.student_id=?`, [studentId]);
  let totalRaw = 0, totalPossible = 0, percentSum = 0;
  for (const s of scores) {
    s.percent = Math.round((s.score / s.max_score) * 100);
    s.grade = await gradeFor(s.percent);
    totalRaw += s.score;
    totalPossible += s.max_score;
    percentSum += s.percent;
  }
  const average = scores.length ? Math.round(percentSum / scores.length) : 0;
  const overallGrade = await gradeFor(average);
  return { student, scores, totalRaw, totalPossible, average, overallGrade };
}

exports.studentReportPdf = async (req, res) => {
  try {
    const data = await buildStudentResult(req.params.studentId);
    if (!data) return res.status(404).json({ message: 'Student not found' });
    const { student, scores, totalRaw, totalPossible, average, overallGrade } = data;
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${student.admission_no}_report.pdf`);
    doc.pipe(res);
    doc.fontSize(20).text('IKONEX ACADEMY', { align: 'center' });
    doc.fontSize(12).text('STUDENT REPORT CARD', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(`Name: ${student.first_name} ${student.last_name}`);
    doc.text(`Admission No: ${student.admission_no}`);
    doc.text(`Class Stream: ${student.stream_name || '-'}`);
    doc.text(`Gender: ${student.gender || '-'}`);
    doc.moveDown();
    doc.fontSize(12).text('Subject Scores', { underline: true });
    doc.moveDown(0.5);
    scores.forEach(s => doc.fontSize(10).text(`${s.subject_name} (${s.assessment_type})  ${s.score}/${s.max_score}  ${s.percent}%  Grade: ${s.grade.grade}  ${s.grade.remark}`));
    doc.moveDown();
    doc.fontSize(12).text(`Total Marks: ${totalRaw}/${totalPossible}`);
    doc.text(`Average: ${average}%`);
    doc.text(`Overall Grade: ${overallGrade.grade}`);
    doc.text(`Remarks: ${overallGrade.remark}`);
    doc.moveDown(2);
    doc.text("Class Teacher's Signature: ____________________");
    doc.text("Principal's Signature: ____________________");
    doc.end();
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.classReportPdf = async (req, res) => {
  try {
    const streamId = req.params.streamId;
    const stream = await get('SELECT * FROM class_streams WHERE id=?', [streamId]);
    if (!stream) return res.status(404).json({ message: 'Stream not found' });
    const students = await all('SELECT id FROM students WHERE stream_id=?', [streamId]);
    const results = [];
    for (const s of students) results.push(await buildStudentResult(s.id));
    results.sort((a, b) => b.average - a.average);
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${stream.name.replace(/\s+/g, '_')}_class_report.pdf`);
    doc.pipe(res);
    doc.fontSize(20).text('IKONEX ACADEMY', { align: 'center' });
    doc.fontSize(12).text(`CLASS PERFORMANCE REPORT - ${stream.name}`, { align: 'center' });
    doc.moveDown();
    results.forEach((r, i) => doc.fontSize(10).text(`${i + 1}. ${r.student.first_name} ${r.student.last_name} (${r.student.admission_no}) - Avg: ${r.average}% - Grade: ${r.overallGrade.grade} - Total: ${r.totalRaw}/${r.totalPossible}`));
    doc.end();
  } catch (err) { res.status(500).json({ message: err.message }); }
};
