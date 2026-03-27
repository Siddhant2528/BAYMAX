/**
 * seedResources.js
 * Run once: node scripts/seedResources.js
 * Seeds the PostgreSQL `resources` table from yt_results.json.
 * Also migrates the `type` CHECK constraint to allow category names.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: false,
});

async function seed() {
  const client = await pool.connect();

  try {
    // 1. Ensure the resources table exists (full schema)
    await client.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id          SERIAL PRIMARY KEY,
        title       TEXT NOT NULL,
        description TEXT,
        type        TEXT NOT NULL,
        url         TEXT NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // 2. Drop the old restrictive CHECK constraint on `type` if it exists
    //    (original schema only allowed: video, article, pdf, link)
    await client.query(`
      ALTER TABLE resources
        DROP CONSTRAINT IF EXISTS resources_type_check
    `);

    // 3. Drop the UNIQUE constraint on url if it exists (some videos repeat across searches)
    await client.query(`
      ALTER TABLE resources
        DROP CONSTRAINT IF EXISTS resources_url_key
    `);

    console.log('✅ Table schema ready.');

    // 4. Load yt_results.json
    const jsonPath = path.join(__dirname, '..', '..', 'frontend', 'yt_results.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ yt_results.json not found at:', jsonPath);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    let inserted = 0;
    let skipped = 0;

    for (const [category, items] of Object.entries(data)) {
      for (const item of items) {
        const title = item.title;
        const description = item.subtitle || item.desc || '';
        const url = item.link;

        // Idempotent: skip if same title+type already exists
        const existing = await client.query(
          'SELECT id FROM resources WHERE title = $1 AND type = $2',
          [title, category]
        );

        if (existing.rows.length > 0) {
          skipped++;
          continue;
        }

        await client.query(
          `INSERT INTO resources (title, description, type, url)
           VALUES ($1, $2, $3, $4)`,
          [title, description, category, url]
        );
        inserted++;
      }
    }

    console.log(`\n✅ Done! Inserted: ${inserted} | Skipped (already existed): ${skipped}`);
    console.log(`   Total in DB: ${inserted + skipped} resources across 5 categories.`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
