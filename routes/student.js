const express = require('express');
const router = express.Router();
const con = require('../config.js')
const bcrypt = require('bcrypt')


// taking student login page responses 
router.get('/student_login.ejs', (req, res) => {
    res.render('student/student_login');
  });
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
            res.redirect('/batch_signin.ejs');
          });
        }
      });
    }else{
      req.session.flag = 3;
      res.redirect('/batch_signup.ejs');
    }
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

    if(result.length && bcrypt.compareSync(password, result[0].password)){
      req.session.email = email;
      res.redirect('/student_event.ejs');
    }else{
      req.session.flag = 4;
      res.redirect('/batch_signin.ejs');
    }
  });
});


// taking student signin page responses 
router.get('/student_event.ejs', (req, res) => {
  res.render('student/student_event');
});


module.exports = router
