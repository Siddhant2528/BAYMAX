const { pool } = require('../../config/db');

/** Create a new session note */
const createNote = async (counselorId, studentId, problemDescription, diagnosticsAdvices, sessionDate) => {
  const result = await pool.query(
    `INSERT INTO session_notes
       (counselor_id, student_id, session_date, problem_description, diagnostics_advices)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [counselorId, studentId, sessionDate, problemDescription, diagnosticsAdvices]
  );
  return result.rows[0];
};

/** Get all session notes written by this counselor (with student info) */
const getNotesByCounselor = async (counselorId) => {
  const result = await pool.query(
    `SELECT
        sn.id,
        sn.session_date,
        sn.problem_description,
        sn.diagnostics_advices,
        sn.created_at,
        u.id          AS student_id,
        u.name        AS student_name,
        u.department  AS student_department,
        u.college_id  AS student_college_id
     FROM session_notes sn
     JOIN users u ON u.id = sn.student_id
     WHERE sn.counselor_id = $1
     ORDER BY sn.session_date DESC`,
    [counselorId]
  );
  return result.rows;
};

module.exports = { createNote, getNotesByCounselor };
