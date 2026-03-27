require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST, database: process.env.DB_NAME, port: process.env.DB_PORT
});
async function main() {
    const cols = await pool.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'resources'
        ORDER BY ordinal_position`);
    console.log('resources table columns:', JSON.stringify(cols.rows, null, 2));
    const sample = await pool.query('SELECT * FROM resources LIMIT 3');
    console.log('sample rows:', JSON.stringify(sample.rows, null, 2));
    await pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
