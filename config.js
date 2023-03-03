const mysql = require('mysql2');

const con = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'srmod',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

con.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database: ', err);
    return;
  }

  console.log('Database connection successful');

  connection.release();
});

module.exports = con
