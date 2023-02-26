const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const con = require('../config.js')

// taking faculty login page responses 
router.get('/faculty_login.ejs', (req, res) => {
    res.render('faculty/faculty_login');
  });




// taking faculty login page responses 
router.post('/faculty_login.ejs', (req, res) => {
    
  var email = req.body.username;
  var password =req.body.password;
  
  var sql = 'select * from faculty where facultyemail = ?;';
  
  con.query(sql,[email], function(err,result, fields){
    if(err) throw err;

    if(result.length && bcrypt.compareSync(password, result[0].password)){
      req.session.email = email;
      res.redirect('/faculty_event.ejs');
    }else{
      req.session.flag = 4;
      res.redirect('/faculty_login.ejs');
    }
  });
  
  });

  // taking faculty event page 
  router.get('/faculty_event.ejs', (req, res) => {
    res.render('faculty/faculty_event');
  });






module.exports = router