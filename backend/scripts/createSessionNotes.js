require('dotenv').config();
const { pool } = require('../src/config/db');

async function createSessionNotesTable() {
  try {
    // Drop first in case a broken partial table exists from a previous attempt
    await pool.query(`DROP TABLE IF EXISTS session_notes;`);

    await pool.query(`
      CREATE TABLE session_notes (
        id                   SERIAL PRIMARY KEY,
        counselor_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        student_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        problem_description  TEXT NOT NULL,
        diagnostics_advices  TEXT NOT NULL,
        created_at           TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅  session_notes table created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌  Failed to create table:', err.message);
    process.exit(1);
  }
}

createSessionNotesTable();
