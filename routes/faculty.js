const express = require('express');
const router = express.Router();

// taking faculty login page responses 
router.get('/faculty_login.ejs', (req, res) => {
    res.render('faculty/faculty_login');
  });

module.exports = router