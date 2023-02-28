const express = require('express');
const router = express.Router();
const con = require('../config.js')
const bcrypt = require('bcrypt')
const { sendVerificationCode } = require('../mail');



// taking student sign up page responses 
router.get('/batch_signup.ejs', (req, res) => {
  res.render('student/batch_signup');
});

router.post('/batch_signup.ejs', function (req, res, next) {

  var fullname = req.body.name;
  req.session.fullname = fullname;

  var email = req.body.email;
  req.session.email = email;

  const allowedDomain = 'srmist.edu.in';
  const emailDomain = email.split('@')[1];

  if (emailDomain !== allowedDomain) {
    res.redirect('/batch_signup.ejs');
    // alert('USE SRM MAIL ID ONLY ');
  }

  var reg_num = req.body.reg_num;
  req.session.reg_num = reg_num;

  var password = req.body.password;
  req.session.password = password;

  var cpassword = req.body.cpassword;
  req.session.cpassword = cpassword;

  // -------  TEMP MAIL START  -------

  // Check if email exists in database
  con.query(
    `SELECT * FROM users WHERE studentemail = '${email}'`,
    (error, results) => {
      if (error) {
        console.error('Error querying database: ', error);
        res.status(500).send('Error querying database');
      } else if (results.length === 0) {
        console.log(`User with email ${email} does not exist`);
        res.status(401).send('Invalid email or password');
      } else {
        if (cpassword == password) {

          var sql = 'select * from users where studentemail = ?;';

          con.query(sql, [email], function (err, result, fields) {
            if (err) throw err;

            if (result.length === 0) {
              req.session.flag = 1;
              res.redirect('/batch_signup.ejs');
            } else {


              const verificationCode = sendVerificationCode(email);
              req.session.verificationCode = verificationCode;

              res.render('student/student_verify', { email });

            }
          });
        }

        else {
          req.session.flag = 3;
          res.redirect('/batch_signup.ejs');
        }

      }
    }
  );

  // -------  TEMP MAIL START  -------


});

// student verification file 


router.get('/student_verify.ejs', (req, res) => {
  const email = req.session.email;
  res.render('student/student_verify', { email });


});


router.post('/student_verify.ejs', (req, res) => {
  const enteredCode = req.body.code;
  const savedCode = req.session.verificationCode;
  const email = req.session.email;
  const password = req.session.password;
  const fullname = req.session.fullname;
  const reg_num = req.session.reg_num;





  if (enteredCode == savedCode) {
    con.query(`UPDATE users SET verified = true WHERE studentemail='${email}'`, (error, result) => {
      if (error) {
        console.log(error);
        res.render('student/student_verify', { email, error: 'Database error' });
      }

      else {
        var hashpassword = bcrypt.hashSync(password, 10);
        const originalString = reg_num;
        const batch = originalString.slice(2, 4); // "21"
        // console.log(substring);
        var sql;
        var sql2;
        if (batch === '22') {
         sql = `insert into batch1 (studentname,reg_num,studentemail,password,verified) values(?,?,?,?,?);`;
          sql2 = 'UPDATE users SET studentname = ?, reg_num = ?, password = ?,verified=? WHERE studentemail = ?';
        } else if (batch === '21') {
          sql = `insert into batch2 (studentname,reg_num,studentemail,password,verified) values(?,?,?,?,?); `;
          sql2 = 'UPDATE users SET studentname = ?, reg_num = ?, password = ?,verified=? WHERE studentemail = ?';
        } else if (batch === '20') {
         sql = `insert into batch3 (studentname,reg_num,studentemail,password,verified) values(?,?,?,?,?); `;
         sql2 = 'UPDATE users SET studentname = ?, reg_num = ?, password = ?,verified=? WHERE studentemail = ?';
        } else {
          console.error('Invalid value');
        }
        
        // const values = [fullname, reg_num,email,hashpassword, true];
        // var sql = 'insert into users(studentname,reg_num,studentemail,password,verified) values(?,?,?,?,?);';
        // var sql = 'UPDATE users SET studentname = ?, reg_num = ?,password = ?,verified = ? WHERE studentemail = ?';

        con.query(sql, [fullname, reg_num,email,hashpassword, true] , function (err, result, fields) {
          if (err) { throw err; }
          else {

            res.redirect('/batch_signin.ejs');
          }
        });
        con.query(sql2, [fullname, reg_num,hashpassword, true,email] , function (err, result, fields) {
          if (err) { throw err; }
          
        });


        // res.redirect('/batch_signin.ejs');
      }
    });
  } else {
    res.render('student/student_verify', { email, error: 'Invalid verification code' });
  }
});





// resent code 

router.get('/student_resend.ejs', (req, res) => {
  const email = req.session.email;
  const verificationCode = sendVerificationCode(email);
  req.session.verificationCode = verificationCode;
  res.redirect('/student_verify.ejs');

});







// taking student signin page responses 
router.get('/batch_signin.ejs', (req, res) => {
  res.render('student/batch_signin');
});



//Handle POST request for User Login
router.post('/batch_signin.ejs', function (req, res, next) {

  var email = req.body.email;
  var password = req.body.password;




  var sql = 'select * from users where studentemail = ?;';




  con.query(sql, [email], function (err, result, fields) {
    if (err) { throw err; }

    if (result.length && bcrypt.compareSync(password, result[0].password) && result[0].verified) {
      req.session.email = email;


      res.redirect('/student_event.ejs');


    } else {
      req.session.flag = 4;
      res.redirect('/batch_signin.ejs');


    }
  });
});


// taking student event page responses 
router.get('/student_event.ejs', (req, res) => {
  res.render('student/student_event');
});
// taking student event page responses 
router.post('/student_event.ejs', (req, res) => {
  res.redirect('/student_event.ejs');
});





// taking student event info page responses 
router.get('/student_event_info.ejs', (req, res) => {
  res.render('student/student_event_info');
});


module.exports = router
