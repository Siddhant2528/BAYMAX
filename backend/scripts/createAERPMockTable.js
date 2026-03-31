require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../src/config/db');

/**
 * Generates a 90-day log of attendance data.
 * High-risk students get clustered absences in the last 2 weeks.
 */
function generateAttendanceLogs(isHighRisk) {
    const logs = [];
    const today = new Date();
    const DAYS = 90;

    for (let i = DAYS - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

        // Skip weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            continue;
        }

        const dateStr = date.toISOString().split('T')[0];

        let status;
        if (isHighRisk) {
            // Last 14 days: high chance of absent (simulating stress crash)
            if (i < 14) {
                status = Math.random() < 0.65 ? 'absent' : 'present';
            } else if (i < 30) {
                status = Math.random() < 0.40 ? 'absent' : 'present';
            } else {
                status = Math.random() < 0.15 ? 'absent' : 'present';
            }
        } else {
            // Normal student: mostly present
            status = Math.random() < 0.10 ? 'absent' : 'present';
        }

        logs.push({ date: dateStr, status });
    }

    return logs;
}

async function seedAERP() {
    try {
        console.log("Creating dummy_aerp table...");
        
        await pool.query(`
            DROP TABLE IF EXISTS dummy_aerp CASCADE;
            CREATE TABLE dummy_aerp (
                college_id VARCHAR(50) PRIMARY KEY,
                attendance_percentage NUMERIC(5, 2),
                current_cgpa NUMERIC(4, 2),
                failed_subjects_count INTEGER DEFAULT 0,
                academic_warning BOOLEAN DEFAULT FALSE,
                attendance_logs JSONB DEFAULT '[]',
                last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log("Fetching students...");
        const usersRes = await pool.query("SELECT id, name, college_id FROM users WHERE role = 'student' AND college_id IS NOT NULL");
        const students = usersRes.rows;
        
        console.log(`Found ${students.length} students with a college_id.`);
        
        for (const student of students) {
            const isHighRisk = ['John', 'Siddhant ', 'Sagar'].includes(student.name);

            let cgpa = (6.0 + Math.random() * 4.0).toFixed(2);
            let failed = Math.floor(Math.random() * 2); 
            let warning = false;

            if (isHighRisk) {
                cgpa = (4.0 + Math.random() * 2.5).toFixed(2);
                failed = Math.floor(Math.random() * 4) + 1;
                warning = true;
            }

            // Generate logs first, then derive attendance_percentage from them
            const logs = generateAttendanceLogs(isHighRisk);
            const presentDays = logs.filter(l => l.status === 'present').length;
            const att = logs.length > 0 ? ((presentDays / logs.length) * 100).toFixed(2) : '0.00';

            await pool.query(`
                INSERT INTO dummy_aerp (college_id, attendance_percentage, current_cgpa, failed_subjects_count, academic_warning, attendance_logs)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [student.college_id, att, cgpa, failed, warning, JSON.stringify(logs)]);
            
            console.log(`- Seeded AERP for ${student.name} (${student.college_id}): CGPA ${cgpa}, Att ${att}%, Logs: ${logs.length} days`);
        }
        
        console.log("✅ AERP Database seeded successfully.");
    } catch (err) {
        console.error("❌ Error seeding AERP database:", err);
    } finally {
        await pool.end();
    }
}

seedAERP();