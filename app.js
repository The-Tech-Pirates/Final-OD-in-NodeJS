const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const config = require('./config');
const main = require('./routes/main.js');
const faculty = require('./routes/faculty.js');
const student = require('./routes/student.js');

const app = express();
const port = process.env.PORT || 3000;
// setting the view engine the folder views for all ejs templates 
app.set('view engine','ejs');
// using public folder for all static things like css and images etc 
app.use(express.static('public'));


app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // Session expires after 1 hour (in milliseconds)
}));








app.use('',main)
app.use('',student)
app.use('',faculty)







// Logout
app.get('/logout.ejs', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start server
app.listen(port || 3000, () => {
  console.log('Server started on port 3000');
});
