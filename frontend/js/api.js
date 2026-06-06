const API_URL = "https://ikonex-academy-student-management-system.onrender.com/api";

// ================= STREAMS =================

async function getStreams() {
    const response = await fetch(`${API_URL}/streams`);
    return await response.json();
}

async function createStream(streamData) {
    const response = await fetch(`${API_URL}/streams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(streamData)
    });

    return await response.json();
}

async function updateStream(id, streamData) {
    const response = await fetch(`${API_URL}/streams/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(streamData)
    });

    return await response.json();
}

async function deleteStreamApi(id) {
    const response = await fetch(`${API_URL}/streams/${id}`, {
        method: "DELETE"
    });

    return await response.json();
}

// ================= STUDENTS =================

async function getStudents() {
    const response = await fetch(`${API_URL}/students`);
    return await response.json();
}

async function createStudent(studentData) {
    const response = await fetch(`${API_URL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
    });

    return await response.json();
}

async function updateStudent(id, studentData) {
    const response = await fetch(`${API_URL}/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
    });

    return await response.json();
}

async function deleteStudentApi(id) {
    const response = await fetch(`${API_URL}/students/${id}`, {
        method: "DELETE"
    });

    return await response.json();
}

// ================= SUBJECTS =================

async function getSubjects() {
    const response = await fetch(`${API_URL}/subjects`);
    return await response.json();
}

async function createSubject(subjectData) {
    const response = await fetch(`${API_URL}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subjectData)
    });

    return await response.json();
}

async function updateSubject(id, subjectData) {
    const response = await fetch(`${API_URL}/subjects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subjectData)
    });

    return await response.json();
}

async function deleteSubjectApi(id) {
    const response = await fetch(`${API_URL}/subjects/${id}`, {
        method: "DELETE"
    });

    return await response.json();
}

// ================= SCORES =================

async function getScores() {
    const response = await fetch(`${API_URL}/scores`);
    return await response.json();
}

async function createScore(scoreData) {
    const response = await fetch(`${API_URL}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoreData)
    });

    return await response.json();
}

async function updateScore(id, scoreData) {
    const response = await fetch(`${API_URL}/scores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoreData)
    });

    return await response.json();
}

async function deleteScoreApi(id) {
    const response = await fetch(`${API_URL}/scores/${id}`, {
        method: "DELETE"
    });

    return await response.json();
}

// ================= RESULTS / REPORTS =================

async function getResults() {
    const response = await fetch(`${API_URL}/results`);
    return await response.json();
}

async function getReports() {
    const response = await fetch(`${API_URL}/reports`);
    return await response.json();
}