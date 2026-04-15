const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({ host:'localhost', user:'root', password:'kims@123', database:'kims_portal' });
  
  const [r1] = await pool.query("SHOW COLUMNS FROM notices LIKE 'is_visible'");
  console.log('notices.is_visible:', r1.length > 0 ? 'EXISTS ✓' : 'MISSING ✗');
  
  const [r2] = await pool.query("SHOW COLUMNS FROM holidays LIKE 'is_visible'");
  console.log('holidays.is_visible:', r2.length > 0 ? 'EXISTS ✓' : 'MISSING ✗');

  // If missing, add them
  if (r1.length === 0) {
    await pool.query('ALTER TABLE notices ADD COLUMN is_visible TINYINT(1) DEFAULT 1');
    await pool.query('UPDATE notices SET is_visible = 1 WHERE is_visible IS NULL');
    console.log('  → Added is_visible to notices');
  }
  if (r2.length === 0) {
    await pool.query('ALTER TABLE holidays ADD COLUMN is_visible TINYINT(1) DEFAULT 1');
    await pool.query('UPDATE holidays SET is_visible = 1 WHERE is_visible IS NULL');
    console.log('  → Added is_visible to holidays');
  }

  await pool.end();
  console.log('Done.');
}

test().catch(console.error);
