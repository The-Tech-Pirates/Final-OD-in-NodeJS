const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const config = require('./config');
const main = require('./routes/main.js');
const faculty = require('./routes/faculty.js');
const student = require('./routes/student.js');
const nodemailer = require('nodemailer');
const con = require('./config')


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





const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kanavchauhan001@gmail.com",
    pass: "nckcubawcueyfrik",
  },
});

const mailOptions = {
  from: "kanavchauhan001@gmail.com",
  subject: "SUCCESS - Registered",
  text: ""
};

con.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database: ', err);
    return;
  }

  connection.query(
    "SELECT studentemail, eventname FROM applyevent WHERE hod_approved = true",
    function (error, results, fields) {
      if (error) throw error;

      const recipients = results.map((result) => result.studentemail);
      mailOptions.to = recipients;

      results.forEach(result => {
        const text = `You are successfully registered for the event: ${result.eventname}`;
        mailOptions.text += `${text}\n`;
      });

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) console.log(error);
        else console.log("Email sent: " + info.response);
      });
    }
  );

  connection.release();
});










// Logout
app.get('/logout.ejs', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start server
app.listen(port || 3000, () => {
  console.log('Server started on port 3000');
});
