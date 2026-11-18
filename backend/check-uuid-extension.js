const { pool } = require('./config/database');

async function check() {
  try {
    const result = await pool.query(
      "SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp'"
    );

    console.log('UUID extension:', result.rows);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

check();