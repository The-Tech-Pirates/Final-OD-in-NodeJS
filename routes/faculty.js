const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const con = require('../config.js')








// taking faculty login page responses 
router.get('/faculty_signup.ejs', (req, res) => {
    res.render('faculty/faculty_signup');
  });

// taking faculty login page responses 
router.get('/faculty_signin.ejs', (req, res) => {
    res.render('faculty/faculty_signin');
  });




// taking faculty login page responses 
router.post('/faculty_signin.ejs', (req, res) => {
    
  var email = req.body.email;
  var password =req.body.password;
  
  var sql = 'select * from faculty where facultyemail = ?;';
  
  con.query(sql,[email], function(err,result, fields){
    if(err) throw err;

    if(result.length && bcrypt.compareSync(password, result[0].password)){
      req.session.email = email;
      res.redirect('/faculty_event.ejs');
    }else{
      req.session.flag = 4;
      res.redirect('/faculty_signin.ejs');
    }
  });
  
  });

  // taking faculty event page 
  router.get('/faculty_event.ejs', (req, res) => {
    res.render('faculty/faculty_event');
  });


  // taking faculty event page 
  router.get('/faculty_event_info.ejs', (req, res) => {
    res.render('faculty/faculty_event_info');
  });

  // taking faculty event page 
  router.get('/faculty_create_event.ejs', (req, res) => {
    res.render('faculty/faculty_create_event');
  });

  // taking faculty event page 
  router.get('/faculty_common_signin.ejs', (req, res) => {
    res.render('faculty/faculty_common_signin');
  });

// dsafadfadfasdfasdfasdfasdf
  
  // taking faculty event page 
  router.get('/hod_signin.ejs', (req, res) => {
    res.render('faculty/hod_signin');
  });


  // taking faculty event page 
  router.get('/teacher_signin.ejs', (req, res) => {
    res.render('faculty/teacher_signin');
  });







module.exports = router