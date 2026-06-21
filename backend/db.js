const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect((err) => {
    if (err) {
        console.error('Ошибка подключения:', err.message);
    } else {
        console.log('Подключено к Supabase!');
    }
});

module.exports = pool;