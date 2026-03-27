require('dotenv').config();
const { pool } = require('./src/config/db');

async function main() {
  console.log('\n====== COUNSELORS IN DB ======');
  const counselors = await pool.query(
    `SELECT id, name, email FROM users WHERE role='counselor'`
  );
  counselors.rows.forEach(c =>
    console.log(`  [${c.id}] ${c.name} <${c.email}>`)
  );

  console.log('\n====== ALL APPOINTMENTS IN DB ======');
  const appts = await pool.query(
    `SELECT a.id, a.student_id, a.counselor_id, a.status, a.appointment_date,
            u.name AS student_name, u.email AS student_email,
            c.name AS counselor_name
     FROM appointments a
     JOIN users u ON u.id = a.student_id
     LEFT JOIN users c ON c.id = a.counselor_id
     ORDER BY a.created_at DESC
     LIMIT 20`
  );
  if (appts.rows.length === 0) {
    console.log('  ⚠  No appointments found in the table at all.');
  } else {
    appts.rows.forEach(a =>
      console.log(`  id=${a.id} | status=${a.status} | student=${a.student_name}(${a.student_email}) | counselor=${a.counselor_name || '⚠ NULL'} | date=${a.appointment_date}`)
    );
  }

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
