const { pool } = require('../../config/db');

const getStudentAERPRecord = async (collegeId) => {
    const query = `
        SELECT college_id, attendance_percentage, current_cgpa, failed_subjects_count, academic_warning, last_sync
        FROM dummy_aerp
        WHERE college_id = $1
    `;
    const result = await pool.query(query, [collegeId]);
    return result.rows[0] || null;
};

const getAttendanceLogs = async (collegeId) => {
    const query = `
        SELECT attendance_logs
        FROM dummy_aerp
        WHERE college_id = $1
    `;
    const result = await pool.query(query, [collegeId]);
    return result.rows[0]?.attendance_logs || [];
};

module.exports = {
    getStudentAERPRecord,
    getAttendanceLogs,
};