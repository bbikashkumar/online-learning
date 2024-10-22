const mysql = require('mysql2/promise'); // Use the promise-based version

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Bikash@2000',
  database: 'learn_online',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: Handle connection errors
pool.on('error', (err) => {
  console.error('MySQL Pool Error:', err);
});

// Export the pool
module.exports = pool;
