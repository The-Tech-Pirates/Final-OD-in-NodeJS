const express = require('express');
const router = express.Router();

// taking landing page responses 

router.get('/', (req, res) => {
    res.render('main/index');
  });
  

  // taking main login page responses 
router.get('/main_login.ejs', (req, res) => {
    res.render('main/main_login');
  });

module.exports = router