require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});
async function run() {
  // Check users table columns
  const cols = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position");
  console.log('users columns:', JSON.stringify(cols.rows, null, 2));
  
  // Check existing constraints on session_notes if any
  const cns = await pool.query("SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name='session_notes'");
  console.log('session_notes constraints:', JSON.stringify(cns.rows, null, 2));

  // Try to manually create a simple FK test
  try {
    await pool.query("CREATE TABLE IF NOT EXISTS _fk_test (id SERIAL PRIMARY KEY, uid INTEGER REFERENCES users(id))");
    console.log('FK test table created OK');
    await pool.query("DROP TABLE IF EXISTS _fk_test");
  } catch(e) {
    console.error('FK test failed:', e.message);
  }
  
  process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
