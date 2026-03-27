require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST,
  database: process.env.DB_NAME, password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT, ssl: false,
});
pool.query(`
  SELECT type, COUNT(*) as count
  FROM resources
  GROUP BY type
  ORDER BY type
`).then(r => {
  console.log('\n📊 Resources in DB by category:');
  let total = 0;
  r.rows.forEach(row => { console.log(`   ${row.type}: ${row.count}`); total += parseInt(row.count); });
  console.log(`\n   ✅ TOTAL: ${total} resources`);
}).catch(e => console.error(e.message)).finally(() => pool.end());
