const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: '127.0.0.1', 
  user: 'root', 
  password: '',   
  database: 'kurka',     
  connectionLimit: 5      
});

async function queryDatabase(query, params) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(query, params);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release(); 
  }
}

module.exports = {
  queryDatabase
};
