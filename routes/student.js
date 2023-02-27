const express = require('express');
const router = express.Router();
const con = require('../config.js')
const bcrypt = require('bcrypt')
const { sendVerificationCode } = require('../mail');



// taking student sign up page responses 
router.get('/batch_signup.ejs', (req, res) => {
    res.render('student/batch_signup');
  });

router.post('/batch_signup.ejs', function(req, res, next){

    var fullname = req.body.name;
    var email = req.body.email;
    var reg_num = req.body.reg_num;
    var password = req.body.password;
    var cpassword = req.body.cpassword;
  
    if(cpassword == password){
  
      var sql = 'select * from users where studentemail = ?;';
  
      con.query(sql,[email], function(err, result, fields){
        if(err) throw err;
  
        if(result.length > 0){
          req.session.flag = 1;
          res.redirect('/batch_signup.ejs');
        }else{
  
          var hashpassword = bcrypt.hashSync(password, 10);
          var sql = 'insert into users(studentname,reg_num,studentemail,password) values(?,?,?,?);';
  
          con.query(sql,[fullname,reg_num,email, hashpassword], function(err, result, fields){
            if(err) throw err;
            req.session.flag = 2;
            // res.redirect('/batch_signin.ejs');

            const verificationCode = sendVerificationCode(email);
            req.session.verificationCode = verificationCode;
            req.session.email = email;
            res.render('student/student_verify', { email  });


          });
        }
      });
    }else{
      req.session.flag = 3;
      res.redirect('/batch_signup.ejs');
    }
  });

// student verification file 


router.get('/student_verify.ejs', (req, res) => {
  const email = req.session.email;
  res.render('student/student_verify',{email});
  
});


router.post('/student_verify.ejs', (req, res) => {
  const enteredCode = req.body.code;
  const savedCode = req.session.verificationCode;
  const email = req.session.email;

  if (enteredCode == savedCode) {
    con.query(`UPDATE users SET verified = true WHERE studentemail='${email}'`, (error, result) => {
      if (error) {
        console.log(error);
        res.render('student/student_verify', { email, error: 'Database error' });
      } else {
        res.redirect('/batch_signin.ejs');
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
router.post('/batch_signin.ejs', function(req,res,next){

  var email = req.body.email;
  var password =req.body.password;

  var sql = 'select * from users where studentemail = ?;';
  
  

  
  con.query(sql,[email], function(err,result, fields){
    if(err) throw err;

    if(result.length && bcrypt.compareSync(password, result[0].password) && result[0].verified){
      req.session.email = email;

      
      res.redirect('/student_event.ejs');
      

    }else{
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
