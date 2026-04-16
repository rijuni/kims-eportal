const mysql = require('mysql2/promise');

async function check() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'kims@123',
        database: 'kims_portal'
    });

    try {
        const [rows] = await pool.query('SELECT * FROM birthdays');
        console.log('--- BIRTHDAY TABLE DATA ---');
        console.table(rows);
        
        const today = new Date();
        const d = today.getDate(); // 16
        const mLong = today.toLocaleString('default', { month: 'long' }).toLowerCase(); // april
        const mShort = today.toLocaleString('default', { month: 'short' }).toLowerCase(); // apr
        
        console.log(`\nChecking for Date Match: Day ${d}, Month: ${mLong} (${mShort})`);
        
        const matches = rows.filter(b => {
             const dob = String(b.date_of_birth || '').toLowerCase();
             // Fuzzy match check
             return dob.includes(String(d)) && (dob.includes(mLong) || dob.includes(mShort));
        });
        
        if (matches.length > 0) {
            console.log('\nSUCCESS: TODAY MATCHES FOUND:');
            matches.forEach(m => console.log(`- ${m.name} (${m.date_of_birth})`));
        } else {
            console.log('\nRESULT: NO MATCHES FOUND FOR TODAY IN DATABASE.');
            console.log('Ensure you have uploaded an Excel with "Birthday" containing today\'s date (e.g. "April 16" or "16-Apr").');
        }

    } catch (err) {
        console.error('DIAGNOSIS ERROR:', err.message);
    } finally {
        await pool.end();
    }
}

check();
