const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Bikash@2000',
    database: 'learn_online',
});

module.exports = {
    query: async (sql, params) => {
        const [results] = await pool.query(sql, params);
        return results;
    }
};
