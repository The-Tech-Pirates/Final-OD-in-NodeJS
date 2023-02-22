const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'srmod'
});

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to the database: ' + error.stack);
    return;
  }
  console.log('Connected to the database as ID ' + connection.threadId);
});
