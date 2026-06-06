let db = JSON.parse(localStorage.getItem('ikonex_db') || 'null') || {
  streams: [], subjects: [], students: [], scores: [],
  nextId: { stream: 1, subject: 1, student: 1, score: 1 }
};

const GRADE_SCALE = [
  { min: 80, grade: 'A', points: 12, label: 'Distinction' },
  { min: 70, grade: 'B+', points: 11, label: 'Very Good' },
  { min: 60, grade: 'B', points: 10, label: 'Good' },
  { min: 55, grade: 'B-', points: 9, label: 'Above Average' },
  { min: 50, grade: 'C+', points: 8, label: 'Average' },
  { min: 45, grade: 'C', points: 7, label: 'Below Average' },
  { min: 40, grade: 'C-', points: 6, label: 'Pass' },
  { min: 35, grade: 'D+', points: 5, label: 'Weak Pass' },
  { min: 30, grade: 'D', points: 4, label: 'Weak' },
  { min: 25, grade: 'D-', points: 3, label: 'Very Weak' },
  { min: 0, grade: 'E', points: 2, label: 'Fail' }
];

function saveDB(){ localStorage.setItem('ikonex_db', JSON.stringify(db)); }
function uid(type){ return db.nextId[type]++; }
function $(id){ return document.getElementById(id); }
function getGrade(pct){ return GRADE_SCALE.find(g => pct >= g.min) || GRADE_SCALE[GRADE_SCALE.length-1]; }
function initials(s){ const p=s.trim().split(' '); return ((p[0]?.[0]||'')+(p[1]?.[0]||'')).toUpperCase(); }
function getStreamName(id){ return db.streams.find(x=>x.id===id)?.name || '—'; }
function getSubjectName(id){ return db.subjects.find(x=>x.id===id)?.name || '—'; }
function getStudentName(id){ const s=db.students.find(x=>x.id===id); return s ? `${s.fname} ${s.lname}` : '—'; }
function gradeColor(g){ if(['A','A-'].includes(g)) return 'badge-green'; if(['B+','B','B-'].includes(g)) return 'badge-teal'; if(['C+','C','C-'].includes(g)) return 'badge-blue'; if(['D+','D','D-'].includes(g)) return 'badge-amber'; return 'badge-red'; }
async function openModal(id) {
    $(id)?.classList.add('open');

    if (id === 'modal-subject') {
        await populateSubjectStreamCheckboxes();
    }

    if (id === 'modal-student') {
        await populateStudentStreamDropdowns();
    }

    if (id === 'modal-score') {
        await populateScoreFilters();
    }
}
function closeModal(id){ const modal=$(id); if(!modal) return; modal.classList.remove('open'); modal.querySelectorAll('input,select,textarea').forEach(el=>{ if(el.type!=='hidden') el.value=''; }); document.querySelectorAll('[id$="-form-alert"]').forEach(el=>el.innerHTML=''); }
function showAlert(containerId,msg,type='danger'){ const el=$(containerId); if(!el) return alert(msg); el.innerHTML=`<div class="alert alert-${type}">${msg}</div>`; setTimeout(()=>el.innerHTML='',4000); }
function setActiveNav(){ const page=document.body.dataset.page; document.querySelectorAll('.nav-item').forEach(a=>a.classList.toggle('active', a.dataset.page===page)); }

function seedDemo(){
  if(db.streams.length || db.subjects.length || db.students.length) return;
  db.streams=[{id:uid('stream'),name:'Form 1A',year:'Form 1'},{id:uid('stream'),name:'Form 1B',year:'Form 1'},{id:uid('stream'),name:'Form 2A',year:'Form 2'}];
  db.subjects=[{id:uid('subject'),name:'Mathematics',code:'MATH101',streams:[1,2,3]},{id:uid('subject'),name:'English',code:'ENG101',streams:[1,2,3]},{id:uid('subject'),name:'Science',code:'SCI101',streams:[1,2]},{id:uid('subject'),name:'History',code:'HIST101',streams:[1,3]}];
  db.students=[
    {id:uid('student'),fname:'Alice',lname:'Wanjiru',adm:'ADM001',streamId:1,gender:'Female',dob:'2010-03-15',contact:'0712345678',createdAt:'01/01/2025'},
    {id:uid('student'),fname:'Brian',lname:'Otieno',adm:'ADM002',streamId:1,gender:'Male',dob:'2010-07-22',contact:'0723456789',createdAt:'01/01/2025'},
    {id:uid('student'),fname:'Carol',lname:'Muthoni',adm:'ADM003',streamId:1,gender:'Female',dob:'2010-11-08',contact:'0734567890',createdAt:'02/01/2025'},
    {id:uid('student'),fname:'David',lname:'Kamau',adm:'ADM004',streamId:2,gender:'Male',dob:'2010-05-19',contact:'0745678901',createdAt:'02/01/2025'},
    {id:uid('student'),fname:'Eve',lname:'Achieng',adm:'ADM005',streamId:2,gender:'Female',dob:'2010-09-30',contact:'0756789012',createdAt:'03/01/2025'},
    {id:uid('student'),fname:'Frank',lname:'Njenga',adm:'ADM006',streamId:3,gender:'Male',dob:'2009-12-01',contact:'0767890123',createdAt:'03/01/2025'}
  ];
  [[1,1,'Exam',78,100],[1,2,'Exam',85,100],[1,3,'Exam',72,100],[1,4,'Exam',90,100],[2,1,'Exam',65,100],[2,2,'Exam',70,100],[2,3,'Exam',60,100],[3,1,'Exam',88,100],[3,2,'Exam',92,100],[3,3,'Exam',80,100],[3,4,'Exam',85,100],[4,1,'Exam',55,100],[4,2,'Exam',62,100],[4,3,'Exam',48,100],[5,1,'Exam',73,100],[5,2,'Exam',79,100],[5,3,'Exam',68,100],[6,1,'Exam',82,100],[6,2,'Exam',77,100],[6,4,'Exam',88,100]].forEach(([studentId,subjectId,type,score,max])=>db.scores.push({id:uid('score'),studentId,subjectId,type,score,max}));
  saveDB();
}

async function renderDashboard() {
    if (!$('ds-students')) return;

    const students = await getStudents();
    const streams = await getStreams();
    const subjects = await getSubjects();
    const scores = await getScores();

    $('ds-students').textContent = students.length;
    $('ds-streams').textContent = streams.length;
    $('ds-subjects').textContent = subjects.length;
    $('ds-scores').textContent = scores.length;

    $('ds-recent-students').innerHTML = students.length
        ? students.slice(-5).reverse().map(s => `
            <div class="flex" style="padding:8px 0;border-bottom:0.5px solid var(--color-border-tertiary)">
                <div class="avatar">
                    ${initials((s.first_name || '') + ' ' + (s.last_name || ''))}
                </div>
                <div>
                    <div style="font-size:13px">
                        ${s.first_name || ''} ${s.last_name || ''}
                    </div>
                    <div style="font-size:11px;color:var(--color-text-secondary)">
                        ${s.admission_no || ''} · ${s.stream_name || '—'}
                    </div>
                </div>
            </div>
        `).join('')
        : '<div class="empty">No students yet</div>';

    $('ds-streams-list').innerHTML = streams.length
        ? streams.map(stream => {
            const count = students.filter(st => st.stream_id == stream.id).length;

            return `
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--color-border-tertiary);font-size:13px">
                    <span class="badge badge-teal">${stream.name}</span>
                    <span style="color:var(--color-text-secondary)">
                        ${count} students
                    </span>
                </div>
            `;
        }).join('')
        : '<div class="empty">No streams yet</div>';
}

async function saveStream() {
    const id = document.getElementById("stream-edit-id").value;
    const name = document.getElementById("stream-name").value.trim();
    const year = document.getElementById("stream-year").value.trim();

    if (!name) {
        alert("Stream name is required");
        return;
    }

    try {

        if (id) {
            await updateStream(id, {
                name,
                year
            });
        } else {
            await createStream({
                name,
                year
            });
        }

        

        closeModal("modal-stream");

        await loadStreams();

        alert("Stream saved successfully");

    } catch (error) {

        console.error(error);
        alert("Failed to save stream");

    }
}

async function editStream(id) {

    const streams = await getStreams();

    const stream = streams.find(s => s.id == id);

    if (!stream) return;

    document.getElementById("stream-edit-id").value = stream.id;
    document.getElementById("stream-name").value = stream.name;
    document.getElementById("stream-year").value = stream.year || "";

    document.getElementById("modal-stream-title").textContent =
        "Edit Stream";

    openModal("modal-stream");
}

async function deleteStream(id) {

    if (!confirm("Delete this stream?")) return;

    try {

        await deleteStreamApi(id);

        await loadStreams();

        alert("Stream deleted successfully");

    } catch (error) {

        console.error(error);

        alert("Failed to delete stream");

    }
}

async function renderStreams(q = '') {
    if (!$('streams-table')) return;

    const streams = await getStreams();

    const rows = streams.filter(s =>
        !q || s.name.toLowerCase().includes(q.toLowerCase())
    );

    $('streams-table').innerHTML = rows.length ? rows.map(s => `
        <tr>
            <td>
                <span class="badge badge-teal">${s.name}</span>
                <span style="font-size:11px;color:var(--color-text-secondary)">
                    ${s.year || ''}
                </span>
            </td>
            <td>${s.student_count || 0}</td>
            <td>${s.subject_count || 0}</td>
            <td>
                <button class="btn btn-sm" onclick="editStream(${s.id})">
                    <i class="ti ti-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStream(${s.id})">
                    <i class="ti ti-trash"></i>
                </button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="4" class="empty">No streams found</td></tr>';
}

async function populateSubjectStreamCheckboxes() {
    if (!$('subject-streams-checkboxes')) return;

    const streams = await getStreams();
    const editId = $('subject-edit-id')?.value;
    let selectedStreams = [];

    if (editId) {
        const subjects = await getSubjects();
        const subject = subjects.find(s => s.id == editId);

        if (subject && subject.streams) {
            selectedStreams = Array.isArray(subject.streams)
                ? subject.streams
                : JSON.parse(subject.streams || "[]");
        }
    }

    $('subject-streams-checkboxes').innerHTML = streams.length
        ? streams.map(s => `
            <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer">
                <input 
                    type="checkbox" 
                    value="${s.id}" 
                    ${selectedStreams.includes(s.id) ? 'checked' : ''} 
                    style="width:auto;padding:0"
                > 
                ${s.name}
            </label>
        `).join('')
        : '<span style="font-size:12px;color:var(--color-text-secondary)">No streams available</span>';
}

async function saveSubject() {
    const id = $('subject-edit-id').value;
    const name = $('subject-name').value.trim();
    const code = $('subject-code').value.trim();

    if (!name || !code) {
        return showAlert('subject-form-alert', 'Name and code are required');
    }

    const streams = [...document.querySelectorAll('#subject-streams-checkboxes input:checked')]
        .map(x => parseInt(x.value));

    try {
        if (id) {
            await updateSubject(id, { name, code, streams });
        } else {
            await createSubject({ name, code, streams });
        }

        closeModal('modal-subject');

        await renderSubjects();
        await populateSubjectStreamCheckboxes();

        alert('Subject saved successfully');

    } catch (error) {
        console.error(error);
        showAlert('subject-form-alert', 'Failed to save subject');
    }
}

async function editSubject(id) {
    const subjects = await getSubjects();
    const subject = subjects.find(s => s.id == id);

    if (!subject) return;

    $('subject-edit-id').value = subject.id;
    $('subject-name').value = subject.name;
    $('subject-code').value = subject.code;

    $('modal-subject-title').textContent = 'Edit Subject';

    await populateSubjectStreamCheckboxes();

    openModal('modal-subject');
}

async function deleteSubject(id) {
    if (!confirm('Delete this subject?')) return;

    try {
        await deleteSubjectApi(id);

        await renderSubjects();

        alert('Subject deleted successfully');

    } catch (error) {
        console.error(error);
        alert('Failed to delete subject');
    }
}

async function renderSubjects(q = '') {
    if (!$('subjects-table')) return;

    const subjects = await getSubjects();
    const streams = await getStreams();

    const rows = subjects.filter(s =>
        !q || (s.name + s.code).toLowerCase().includes(q.toLowerCase())
    );

    $('subjects-table').innerHTML = rows.length ? rows.map(s => {
        let assignedStreams = [];

        if (Array.isArray(s.streams)) {
            assignedStreams = s.streams;
        } else {
            try {
                assignedStreams = JSON.parse(s.streams || "[]");
            } catch {
                assignedStreams = [];
            }
        }

        const streamBadges = assignedStreams.length
            ? assignedStreams.map(streamId => {
                const stream = streams.find(st => st.id == streamId);
                return stream
                    ? `<span class="badge badge-gray" style="margin:1px">${stream.name}</span>`
                    : '';
            }).join(' ')
            : '<span style="color:var(--color-text-tertiary);font-size:12px">None</span>';

        return `
            <tr>
                <td><strong style="font-weight:500">${s.name}</strong></td>
                <td><span class="badge badge-blue">${s.code}</span></td>
                <td>${streamBadges}</td>
                <td>
                    <button class="btn btn-sm" onclick="editSubject(${s.id})">
                        <i class="ti ti-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSubject(${s.id})">
                        <i class="ti ti-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('') : '<tr><td colspan="4" class="empty">No subjects found</td></tr>';
}

async function populateStudentStreamDropdowns() {
    const streams = await getStreams();

    ['student-stream', 'filter-stream'].forEach(id => {
        const el = $(id);
        if (!el) return;

        const currentValue = el.value;

        const firstOption = id === 'filter-stream'
            ? '<option value="">All Streams</option>'
            : '<option value="">Select stream...</option>';

        el.innerHTML = firstOption + streams.map(s => `
            <option value="${s.id}">${s.name}</option>
        `).join('');

        el.value = currentValue;
    });
}

async function saveStudent() {
    const id = $('student-edit-id').value;

    const studentData = {
        first_name: $('student-fname').value.trim(),
        last_name: $('student-lname').value.trim(),
        admission_no: $('student-adm').value.trim(),
        stream_id: parseInt($('student-stream').value) || null,
        gender: $('student-gender').value,
        dob: $('student-dob').value,
        guardian_contact: $('student-contact').value.trim()
    };

    if (!studentData.first_name || !studentData.last_name) {
        return showAlert('student-form-alert', 'First and last name are required');
    }

    if (!studentData.admission_no) {
        return showAlert('student-form-alert', 'Admission number is required');
    }

    if (!studentData.stream_id) {
        return showAlert('student-form-alert', 'Please assign a class stream');
    }

    try {
        let result;

        if (id) {
            result = await updateStudent(id, studentData);
        } else {
            result = await createStudent(studentData);
        }

        if (result.error) {
            return showAlert('student-form-alert', result.error);
        }

        closeModal('modal-student');

        await populateStudentStreamDropdowns();
        await renderStudents();

        alert('Student saved successfully');

    } catch (error) {
        console.error(error);
        showAlert('student-form-alert', 'Failed to save student');
    }
}

async function editStudent(id) {
    const students = await getStudents();
    const student = students.find(s => s.id == id);

    if (!student) return;

    await populateStudentStreamDropdowns();

    $('student-edit-id').value = student.id;
    $('student-fname').value = student.first_name || '';
    $('student-lname').value = student.last_name || '';
    $('student-adm').value = student.admission_no || '';
    $('student-stream').value = student.stream_id || '';
    $('student-gender').value = student.gender || 'Male';
    $('student-dob').value = student.dob || '';
    $('student-contact').value = student.guardian_contact || '';

    $('modal-student-title').textContent = 'Edit Student';

    openModal('modal-student');
}

async function deleteStudent(id) {
    if (!confirm('Delete this student? All their scores will also be removed.')) return;

    try {
        await deleteStudentApi(id);

        await renderStudents();

        alert('Student deleted successfully');

    } catch (error) {
        console.error(error);
        alert('Failed to delete student');
    }
}

async function renderStudents(q = '', streamFilter = '') {
    if (!$('students-table')) return;

    const students = await getStudents();

    const rows = students.filter(s => {
        const fullText = `${s.first_name || ''} ${s.last_name || ''} ${s.admission_no || ''}`.toLowerCase();

        if (q && !fullText.includes(q.toLowerCase())) return false;
        if (streamFilter && s.stream_id != streamFilter) return false;

        return true;
    });

    $('students-table').innerHTML = rows.length ? rows.map(s => `
        <tr>
            <td>
                <div class="flex">
                    <div class="avatar">${initials((s.first_name || '') + ' ' + (s.last_name || ''))}</div>
                    ${s.first_name || ''} ${s.last_name || ''}
                </div>
            </td>
            <td>${s.admission_no || ''}</td>
            <td><span class="badge badge-teal">${s.stream_name || '—'}</span></td>
            <td>${s.gender || '—'}</td>
            <td>
                <button class="btn btn-sm" onclick="viewStudent(${s.id})">
                    <i class="ti ti-eye"></i>
                </button>
                <button class="btn btn-sm" onclick="editStudent(${s.id})">
                    <i class="ti ti-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStudent(${s.id})">
                    <i class="ti ti-trash"></i>
                </button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="5" class="empty">No students found</td></tr>';
}

async function viewStudent(id) {
    const students = await getStudents();

    const s = students.find(st => st.id == id);

    if (!s) {
        alert("Student not found");
        return;
    }

    const details = `
Student Name: ${s.first_name || ''} ${s.last_name || ''}

Admission No: ${s.admission_no || ''}

Class Stream: ${s.stream_name || ''}

Gender: ${s.gender || ''}

Date of Birth: ${s.dob || ''}

Guardian Contact: ${s.guardian_contact || ''}
`;

    alert(details);
}

async function populateScoreFilters() {
    const streams = await getStreams();
    const subjects = await getSubjects();

    if ($('score-filter-stream')) {
        $('score-filter-stream').innerHTML =
            '<option value="">All Streams</option>' +
            streams.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    if ($('score-filter-subject')) {
        $('score-filter-subject').innerHTML =
            '<option value="">All Subjects</option>' +
            subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    if ($('score-stream')) {
        $('score-stream').innerHTML =
            '<option value="">Select stream...</option>' +
            streams.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    if ($('score-subject')) {
        $('score-subject').innerHTML =
            '<option value="">Select subject...</option>' +
            subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }
}

async function populateScoreStudents() {
    const streamId = parseInt($('score-stream').value) || null;
    const students = await getStudents();

    const filteredStudents = streamId
        ? students.filter(s => s.stream_id == streamId)
        : students;

    $('score-student').innerHTML =
        '<option value="">Select student...</option>' +
        filteredStudents.map(s => `
            <option value="${s.id}">
                ${s.first_name} ${s.last_name} (${s.admission_no})
            </option>
        `).join('');
}

async function saveScore() {
    const id = $('score-edit-id').value;

    const scoreData = {
        student_id: parseInt($('score-student').value) || null,
        subject_id: parseInt($('score-subject').value) || null,
        assessment_type: $('score-type').value,
        score: parseFloat($('score-val').value),
        max_score: parseFloat($('score-max').value) || 100
    };

    if (!scoreData.student_id) {
        return showAlert('score-form-alert', 'Please select a student');
    }

    if (!scoreData.subject_id) {
        return showAlert('score-form-alert', 'Please select a subject');
    }

    if (isNaN(scoreData.score) || scoreData.score < 0) {
        return showAlert('score-form-alert', 'Enter a valid score');
    }

    if (scoreData.score > scoreData.max_score) {
        return showAlert('score-form-alert', `Score cannot exceed maximum (${scoreData.max_score})`);
    }

    try {
        let result;

        if (id) {
            result = await updateScore(id, scoreData);
        } else {
            result = await createScore(scoreData);
        }

        if (result.error) {
            return showAlert('score-form-alert', result.error);
        }

        closeModal('modal-score');

        await renderScores();

        alert('Score saved successfully');

    } catch (error) {
        console.error(error);
        showAlert('score-form-alert', 'Failed to save score');
    }
}

async function editScore(id) {
    const scores = await getScores();
    const score = scores.find(s => s.id == id);

    if (!score) return;

    await populateScoreFilters();

    $('score-edit-id').value = score.id;
    $('score-stream').value = score.stream_id || '';
    await populateScoreStudents();

    $('score-student').value = score.student_id || '';
    $('score-subject').value = score.subject_id || '';
    $('score-type').value = score.assessment_type || 'Exam';
    $('score-val').value = score.score || '';
    $('score-max').value = score.max_score || 100;

    $('modal-score-title').textContent = 'Edit Score';

    openModal('modal-score');
}

async function deleteScore(id) {
    if (!confirm('Remove this score entry?')) return;

    try {
        await deleteScoreApi(id);

        await renderScores();

        alert('Score deleted successfully');

    } catch (error) {
        console.error(error);
        alert('Failed to delete score');
    }
}

async function renderScores() {
    if (!$('scores-table')) return;

    const scores = await getScores();

    const streamFilter = $('score-filter-stream')?.value || '';
    const subjectFilter = $('score-filter-subject')?.value || '';
    const typeFilter = $('score-filter-type')?.value || '';

    const rows = scores.filter(sc => {
        if (streamFilter && sc.stream_id != streamFilter) return false;
        if (subjectFilter && sc.subject_id != subjectFilter) return false;
        if (typeFilter && sc.assessment_type !== typeFilter) return false;
        return true;
    });

    $('scores-table').innerHTML = rows.length ? rows.map(sc => {
        const pct = Math.round((sc.score / sc.max_score) * 100);
        const g = getGrade(pct);

        return `
            <tr>
                <td>${sc.first_name || ''} ${sc.last_name || ''}</td>
                <td><span class="badge badge-teal">${sc.stream_name || '—'}</span></td>
                <td>${sc.subject_name || '—'}</td>
                <td><span class="badge badge-gray">${sc.assessment_type || ''}</span></td>
                <td>${sc.score}</td>
                <td>${sc.max_score}</td>
                <td>${pct}%</td>
                <td><span class="badge ${gradeColor(g.grade)}">${g.grade}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="editScore(${sc.id})">
                        <i class="ti ti-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteScore(${sc.id})">
                        <i class="ti ti-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('') : '<tr><td colspan="9" class="empty">No scores found</td></tr>';
}



async function populateResultsDropdowns() {
    const streams = await getStreams();
    const subjects = await getSubjects();

    if ($('results-stream')) {
        $('results-stream').innerHTML =
            '<option value="">Select Stream...</option>' +
            streams.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    if ($('results-subject')) {
        $('results-subject').innerHTML =
            '<option value="">All Subjects</option>' +
            subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }
}

async function calcStudentResults(streamId, subjectId = null) {
    const students = await getStudents();
    const scores = await getScores();

    const classStudents = students.filter(s => s.stream_id == streamId);

    const results = classStudents.map(student => {
        let studentScores = scores.filter(sc => sc.student_id == student.id);

        if (subjectId) {
            studentScores = studentScores.filter(sc => sc.subject_id == subjectId);
        }

        const totalRaw = studentScores.reduce((sum, sc) => sum + Number(sc.score || 0), 0);
        const totalPossible = studentScores.reduce((sum, sc) => sum + Number(sc.max_score || 0), 0);

        const avg = totalPossible > 0
            ? Math.round((totalRaw / totalPossible) * 100)
            : 0;

        const grade = getGrade(avg);

        return {
            ...student,
            scores: studentScores,
            totalRaw,
            totalPossible,
            avg,
            grade
        };
    });

    return results
        .sort((a, b) => b.avg - a.avg)
        .map((student, index) => ({
            ...student,
            position: index + 1
        }));
}

async function renderResults() {
    if (!$('results-content')) return;

    const streamId = parseInt($('results-stream').value) || null;
    const subjectId = parseInt($('results-subject').value) || null;

    if (!streamId) {
        $('results-content').innerHTML =
            '<div class="card"><div class="empty">Select a stream to view results</div></div>';
        return;
    }

    const results = await calcStudentResults(streamId, subjectId);
    const streams = await getStreams();
    const subjects = await getSubjects();

    const stream = streams.find(s => s.id == streamId);
    const subject = subjects.find(s => s.id == subjectId);

    if (!results.length) {
        $('results-content').innerHTML =
            '<div class="card"><div class="empty">No students in this stream</div></div>';
        return;
    }

    const classAverage = Math.round(
        results.reduce((sum, s) => sum + s.avg, 0) / results.length
    );

    const topScore = results[0]?.avg || 0;

    const passRate = Math.round(
        (results.filter(s => s.avg >= 40).length / results.length) * 100
    );

    $('results-content').innerHTML = `
        <div class="stats-grid" style="margin-bottom:16px">
            <div class="stat-card">
                <div class="stat-label">Students</div>
                <div class="stat-val">${results.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Average</div>
                <div class="stat-val">${classAverage}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Top Score</div>
                <div class="stat-val">${topScore}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Pass Rate</div>
                <div class="stat-val">${passRate}%</div>
            </div>
        </div>

        <div class="card">
            <div class="section-hdr">
                <span class="section-title">
                    Rankings — ${stream ? stream.name : ''}
                    ${subject ? ' / ' + subject.name : ''}
                </span>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Student</th>
                        <th>Adm No.</th>
                        <th>Entries</th>
                        <th>Avg %</th>
                        <th>Total</th>
                        <th>Grade</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(s => `
                        <tr>
                            <td><strong>${s.position}</strong></td>
                            <td>
                                <div class="flex">
                                    <div class="avatar">
                                        ${initials((s.first_name || '') + ' ' + (s.last_name || ''))}
                                    </div>
                                    ${s.first_name || ''} ${s.last_name || ''}
                                </div>
                            </td>
                            <td>${s.admission_no || ''}</td>
                            <td>${s.scores.length}</td>
                            <td>
                                <div style="display:flex;align-items:center;gap:8px">
                                    <div class="progress-bar" style="width:60px">
                                        <div class="progress-fill" style="width:${s.avg}%"></div>
                                    </div>
                                    <span>${s.avg}%</span>
                                </div>
                            </td>
                            <td>${s.totalRaw}/${s.totalPossible}</td>
                            <td>
                                <span class="badge ${gradeColor(s.grade.grade)}">
                                    ${s.grade.grade}
                                </span>
                            </td>
                            <td>${s.grade.points}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function populateReportDropdowns() {
    const streams = await getStreams();

    if ($('report-stream')) {
        $('report-stream').innerHTML =
            '<option value="">Select Stream...</option>' +
            streams.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    if ($('report-student')) {
        $('report-student').innerHTML =
            '<option value="">Select Student...</option>';
    }
}

async function populateReportStudents() {
    const streamId = parseInt($('report-stream').value) || null;
    const students = await getStudents();

    const filteredStudents = streamId
        ? students.filter(s => s.stream_id == streamId)
        : [];

    $('report-student').innerHTML =
        '<option value="">Whole Class Report</option>' +
        filteredStudents.map(s => `
            <option value="${s.id}">
                ${s.first_name} ${s.last_name} (${s.admission_no})
            </option>
        `).join('');
}

async function generateReport() {
    const studentId = parseInt($('report-student').value) || null;
    const streamId = parseInt($('report-stream').value) || null;
    const output = $('report-output');

    if (!streamId) {
        output.innerHTML =
            '<div class="card"><div class="empty">Select a stream first</div></div>';
        return;
    }

    const streams = await getStreams();
    const students = await getStudents();
    const scores = await getScores();

    const stream = streams.find(s => s.id == streamId);
    const classResults = await calcStudentResults(streamId);

    if (studentId) {
        const student = students.find(s => s.id == studentId);
        const studentResult = classResults.find(s => s.id == studentId);

        if (!student || !studentResult) {
            output.innerHTML =
                '<div class="card"><div class="empty">Student result not found</div></div>';
            return;
        }

        const studentScores = scores.filter(sc => sc.student_id == studentId);

        const classAverage = classResults.length
            ? Math.round(classResults.reduce((sum, s) => sum + s.avg, 0) / classResults.length)
            : 0;

        output.innerHTML = `
            <div class="report-card">
                <div class="rc-header">
                    <div class="rc-school">IKONEX ACADEMY</div>
                    <div class="rc-sub">
                        P.O. Box 100 · Tel: +254 700 000 000 · info@ikonexacademy.ac.ke
                    </div>
                    <div style="font-size:14px;font-weight:500;margin-top:8px">
                        STUDENT REPORT CARD — TERM 2, 2025
                    </div>
                </div>

                <div class="rc-grid">
                    <div class="rc-row">
                        <span class="rc-label">Student Name</span>
                        <span class="rc-val">${student.first_name} ${student.last_name}</span>
                    </div>
                    <div class="rc-row">
                        <span class="rc-label">Admission No.</span>
                        <span class="rc-val">${student.admission_no}</span>
                    </div>
                    <div class="rc-row">
                        <span class="rc-label">Class Stream</span>
                        <span class="rc-val">${stream ? stream.name : ''}</span>
                    </div>
                    <div class="rc-row">
                        <span class="rc-label">Gender</span>
                        <span class="rc-val">${student.gender || '—'}</span>
                    </div>
                    <div class="rc-row">
                        <span class="rc-label">Class Position</span>
                        <span class="rc-val">${studentResult.position} of ${classResults.length}</span>
                    </div>
                    <div class="rc-row">
                        <span class="rc-label">Class Average</span>
                        <span class="rc-val">${classAverage}%</span>
                    </div>
                </div>

                <div class="rc-scores">
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Type</th>
                                <th>Score</th>
                                <th>Max</th>
                                <th>%</th>
                                <th>Grade</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${studentScores.length ? studentScores.map(sc => {
                                const pct = Math.round((sc.score / sc.max_score) * 100);
                                const grade = getGrade(pct);

                                return `
                                    <tr>
                                        <td>${sc.subject_name || '—'}</td>
                                        <td>${sc.assessment_type || ''}</td>
                                        <td>${sc.score}</td>
                                        <td>${sc.max_score}</td>
                                        <td>${pct}%</td>
                                        <td style="font-weight:500;color:#1D9E75">${grade.grade}</td>
                                        <td>${grade.label}</td>
                                    </tr>
                                `;
                            }).join('') : `
                                <tr>
                                    <td colspan="7" style="text-align:center;color:#888">
                                        No scores recorded
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>

                <div class="rc-summary">
                    <div class="rc-sum-card">
                        <div class="rc-sum-val">${studentResult.avg}%</div>
                        <div class="rc-sum-lbl">Average Score</div>
                    </div>
                    <div class="rc-sum-card">
                        <div class="rc-sum-val">${studentResult.totalRaw}/${studentResult.totalPossible}</div>
                        <div class="rc-sum-lbl">Total Marks</div>
                    </div>
                    <div class="rc-sum-card">
                        <div class="rc-sum-val">${studentResult.grade.grade}</div>
                        <div class="rc-sum-lbl">Overall Grade</div>
                    </div>
                    <div class="rc-sum-card">
                        <div class="rc-sum-val">${studentResult.position}</div>
                        <div class="rc-sum-lbl">Class Position</div>
                    </div>
                </div>

                <div style="margin-top:16px;border-top:0.5px solid #eee;padding-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:11px">
                    <div>
                        <div style="margin-bottom:20px;border-bottom:0.5px solid #ddd;padding-bottom:4px">
                            Class Teacher's Signature: _______________
                        </div>
                    </div>
                    <div>
                        <div style="margin-bottom:20px;border-bottom:0.5px solid #ddd;padding-bottom:4px">
                            Principal's Signature: _______________
                        </div>
                    </div>
                    <div style="color:#888">Generated: ${new Date().toLocaleDateString()}</div>
                    <div style="color:#888;text-align:right">Ikonex Academy SMS v1.0</div>
                </div>
            </div>

            <div class="no-print" style="text-align:center;margin-top:12px">
                <button class="btn btn-primary" onclick="window.print()">
                    <i class="ti ti-printer"></i>Print / Save as PDF
                </button>
            </div>
        `;

    } else {
        const classAverage = classResults.length
            ? Math.round(classResults.reduce((sum, s) => sum + s.avg, 0) / classResults.length)
            : 0;

        output.innerHTML = `
            <div class="report-card">
                <div class="rc-header">
                    <div class="rc-school">IKONEX ACADEMY</div>
                    <div class="rc-sub">
                        CLASS PERFORMANCE REPORT — ${stream ? stream.name : ''} — Term 2, 2025
                    </div>
                </div>

                <div class="rc-summary" style="margin-bottom:16px">
                    <div class="rc-sum-card">
                        <div class="rc-sum-val">${classResults.length}</div>
                        <div class="rc-sum-lbl">Students</div>
                    </div>
                    <div class="rc-sum-card">
                        <div class="rc-sum-val">${classAverage}%</div>
                        <div class="rc-sum-lbl">Class Average</div>
                    </div>
                    <div class="rc-sum-card">
                        <div class="rc-sum-val">${classResults[0]?.avg || 0}%</div>
                        <div class="rc-sum-lbl">Top Score</div>
                    </div>
                    <div class="rc-sum-card">
                        <div class="rc-sum-val">
                            ${classResults.length
                                ? Math.round((classResults.filter(s => s.avg >= 40).length / classResults.length) * 100)
                                : 0}%
                        </div>
                        <div class="rc-sum-lbl">Pass Rate</div>
                    </div>
                </div>

                <div class="rc-scores">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student</th>
                                <th>Adm No.</th>
                                <th>Total</th>
                                <th>Average</th>
                                <th>Grade</th>
                                <th>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${classResults.map(s => `
                                <tr>
                                    <td>${s.position}</td>
                                    <td>${s.first_name} ${s.last_name}</td>
                                    <td>${s.admission_no}</td>
                                    <td>${s.totalRaw}/${s.totalPossible}</td>
                                    <td>${s.avg}%</td>
                                    <td style="font-weight:500;color:#1D9E75">${s.grade.grade}</td>
                                    <td>${s.grade.points}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top:16px;border-top:0.5px solid #eee;padding-top:8px;font-size:11px;color:#888;display:flex;justify-content:space-between">
                    <span>Generated: ${new Date().toLocaleDateString()}</span>
                    <span>Ikonex Academy SMS v1.0</span>
                </div>
            </div>

            <div class="no-print" style="text-align:center;margin-top:12px">
                <button class="btn btn-primary" onclick="window.print()">
                    <i class="ti ti-printer"></i>Print / Save as PDF
                </button>
            </div>
        `;
    }
}

async function initPage() {
    setActiveNav();

    await populateStudentStreamDropdowns();
    await populateSubjectStreamCheckboxes();
    await populateScoreFilters();
    await populateResultsDropdowns();
    await populateReportDropdowns();

    await renderDashboard();
    await renderStreams();
    await renderSubjects();
    await renderStudents();
    await renderScores();
    await renderResults();
}

document.addEventListener('DOMContentLoaded', initPage);

async function testBackendConnection() {
    const streams = await getStreams();
    console.log("Streams from backend:", streams);
}

testBackendConnection();

async function loadStreams() {
    await renderStreams();
}