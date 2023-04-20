const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const con = require('../config.js')
const multer  = require('multer');



// Define middleware function to check if user is logged in
function requireLogin(req, res, next) {
  if (req.session && req.session.email) {
    // User is logged in, call the next middleware function
    return next();
  } else {
    // User is not logged in, check if current route is sign-up route
    if (req.originalUrl === '/faculty_signup.ejs') {
      // User is trying to sign up, call the next middleware function
      return next();
    } 
    else {
      // User is not trying to sign up, redirect to login page
      return res.redirect('/faculty_signin.ejs');
    }
  }
}
// multer set up 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });





// EVENT HANDLER SIGN UP -> GET 
router.get('/faculty_signin.ejs', (req, res) => {
    res.render('faculty/faculty_signin');
  });

router.post('/faculty_signin.ejs', (req, res) => {
    const email = req.body.email
    const password = req.body.password
  
    // check if email and password are correct
    if (email === 'srm@srmist.edu.in' && password === 'srm') {
      // if email and password are correct, redirect to a specific page
      return res.redirect('/faculty_common_signin.ejs')
    } else {
      // if email and password are incorrect, show an error message
      return res.send('Incorrect email or password')
    }
  })



// EVENT HANDLER SIGN UP -> GET 
router.get('/event_handler_signup.ejs', (req, res) => {
    res.render('faculty/event_handler_signup');
  });


// EVENT HANDLER SIGN UP -> POST 
router.post('/event_handler_signup.ejs', (req, res) => {
    
  var name = req.body.name;
  var email = req.body.email;

  const allowedDomain = 'srmist.edu.in';
  const emailDomain = email.split('@')[1];
  if (emailDomain !== allowedDomain) {
    res.redirect('/event_handler_signup.ejs');
    // alert('USE SRM MAIL ID ONLY ');
  }


  var password =req.body.password;
  var cpassword =req.body.cpassword;
  var reg_num =req.body.reg_num;
  var phone =req.body.phone;
  var dept =req.body.dept;

  if (password !== cpassword) {
    res.status(400).send('Password and confirm password fields do not match')
    return
  }

  con.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal server error');
      return;
    }

    const emailQuery = 'SELECT * FROM eventhandler WHERE email = ?';
    connection.query(emailQuery, [email], (err, results) => {
      connection.release();
      if (err) {
        console.error(err);
        res.status(500).send('Internal server error');
        return;
      }

      if (results.length > 0) {
        res.status(400).send('Email already exists');
        return;
      }






  con.getConnection((err, connection) => {
    if (err) {
      console.log('Error getting connection from pool:', err)
      res.status(500).send('An error occurred while trying to insert data')
      return
    }
    var hashpassword = bcrypt.hashSync(password, 10);
    connection.query('INSERT INTO eventhandler (email, password,name,reg_num,phone,dept) VALUES (?,?,?,?,?,?)', [email, hashpassword,name,reg_num,phone,dept], (err, results) => {
      connection.release() // release the connection back to the pool

      if (err) {
        console.log('Error inserting data into database:', err)
        res.status(500).send('An error occurred while trying to insert data')
      } else {
        res.redirect('/event_handler_signin.ejs');
      }
    })
  })})});

  });





// EVENT HANDLER SIGN IN -> GET  
router.get('/event_handler_signin.ejs', (req, res) => {
    res.render('faculty/event_handler_signin');
  });


// EVENT HANDLER  -> POST
router.post('/event_handler_signin.ejs', (req, res) => {
    
 
  var email = req.body.email;
  var password =req.body.password;
  
  
  var sql = 'select * from eventhandler where email = ?;';
  
  con.query(sql,[email], function(err,result, fields){
    if(err) throw err;

    if(result.length && bcrypt.compareSync(password, result[0].password)){
      req.session.email = email;
      res.redirect('/event_handler_event.ejs');
    }else{
      req.session.flag = 4;
      res.redirect('/event_handler_signin.ejs');
    }
  });
  
  });

  // taking faculty event page 
  router.get('/event_handler_event.ejs',requireLogin, (req, res) => {
    con.getConnection((error, connection) => {
      if (error) {
        console.error('Failed to get a connection from the pool:', error);
        res.status(500).send('Failed to get a connection from the pool');
      } else {
        // Define a SQL query to retrieve all events
        const sql = 'SELECT * FROM newevent';
  
        // Execute the SQL query
        connection.query(sql, (error, results) => {
          // Release the connection back to the pool
          connection.release();
  
          if (error) {
            console.error('Failed to retrieve events:', error);
            res.status(500).send('Failed to retrieve events');
          } else {
            var name =req.session.name; 
            // Render the EJS view template and pass the retrieved events as a data object
            res.render('faculty/event_handler_event', { name, newevent: results  });
          }
        });
      }
    });
  });

  // taking faculty event page 
  router.post('/event_handler_event.ejs', (req, res) => {

     res.render('faculty/event_handler_event');
   
  });


  // taking faculty event page 
  router.get('/event_handler_event_info.ejs/:eventId',requireLogin, (req, res) => {
    const eventId = req.params.eventId;
    con.getConnection((error, connection) => {
      if (error) {
        console.error('Failed to get a connection from the pool:', error);
        res.status(500).send('Failed to get a connection from the pool');
      } else {
        // Define a SQL query to retrieve all events
        const sql = 'SELECT * FROM newevent WHERE id = ?';
  
        // Execute the SQL query
        connection.query(sql,[eventId], (error, results) => {
          // Release the connection back to the pool
          connection.release();
  
          if (error) {
            console.error('Failed to retrieve events:', error);
            res.status(500).send('Failed to retrieve events');
          } else {
            // var name =req.session.name; 
            // Render the EJS view template and pass the retrieved events as a data object
            const event = results[0];
            res.render('faculty/event_handler_event_info', { event  });
          }
        });
      }
    });
    // res.render('faculty/event_handler_event_info');
  });


  // taking faculty event page 
  router.post('/event_handler_event_info.ejs', (req, res) => {
    res.render('faculty/event_handler_event_info');
  });





  // taking faculty event page 
  router.get('/event_handler_create_event.ejs',requireLogin, (req, res) => {
    res.render('faculty/event_handler_create_event');
  });








// taking faculty event page 
  router.post('/event_handler_create_event.ejs', upload.single('image'), (req, res) => {
    const image = req.file.filename;
    var { name, reg_num,email, contact, eventname, eventsubname, clubname, eventprice,studentlimit,startdate,enddate,dept,description} = req.body;
   
   // Define the SQL query and values
const sql = 'INSERT INTO newevent (facultyname, facultyreg_num, facultyemail, phone, eventname, eventsubname, description, fees, startdate, enddate, image, dept, studentlimit, clubname) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
const values = [name, reg_num, email, contact, eventname, eventsubname, description, eventprice, startdate, enddate,  image , dept, studentlimit, clubname];

// Get a connection from the pool and execute the query
con.getConnection((err, connection) => {
  if (err) throw err;

  connection.query(sql, values, (err, result) => {
    if (err) throw err;
    console.log(`Inserted ${result.affectedRows} row(s)`);
    connection.release();
 
 res.redirect('/event_handler_event.ejs');
    
  });
});
    
    
  });



  // taking faculty event page 
  router.get('/faculty_common_signin.ejs', (req, res) => {
    res.render('faculty/faculty_common_signin');
  });


  
  // taking faculty event page 
  router.get('/hod_signin.ejs', (req, res) => {
    res.render('faculty/hod_signin');
  });


  // taking faculty event page 
  router.post('/hod_signin.ejs', (req, res) => {

    const email = req.body.email
    req.session.email= email;
    const password = req.body.password
  
    // check if email and password are correct
    if (email === 'srm@srmist.edu.in' && password === 'srm') {
      // if email and password are correct, redirect to a specific page
      return res.redirect('/hod_event.ejs')
    } else {
      // if email and password are incorrect, show an error message
       res.redirect('/hod_signin.ejs');
    }

    
  });





  
  // taking faculty event page 
  router.get('/hod_event.ejs', (req, res) => {
    
    
     
  con.getConnection((error, connection) => {
    if (error) throw error;
  
    const query = 'SELECT * FROM applyevent WHERE eventhandler_approved = ?';
    const email = req.session.email;
  
    connection.query(query, ['1'], (error, results) => {
      connection.release();
      if (error) throw error;
  
      res.render('faculty/hod_event', { events: results });
    });


    
  })

  });


  router.post('/hod_event.ejs', (req, res) => {

    con.getConnection((error, connection) => {
      if (error) throw error;
    
      
      const hodemail = req.session.email;
   
      if (req.body.approveAll) {
        // Update the status of all rows to "approved"
        
        connection.query('UPDATE applyevent SET hod_approved = ? ', ['1'], (error, results) => {
          if (error) throw error;
          res.redirect('/hod_event.ejs');
        });
      } else if (req.body.declineAll) {
        // Delete all rows from the table
        
        connection.query('DELETE FROM applyevent ' , (error, results) => {
          if (error) throw error;
          res.redirect('/hod_event.ejs');
        });
      } else if (req.body.approve) {
        // Update the status of the row to "approved"
        // const id = req.body.approve;
        var [email, id] = req.body.approve.split(',');
        connection.query('UPDATE applyevent SET hod_approved = ?  WHERE studentemail = ? AND eventid = ? ' , ['1', email,id], (error, results) => {
          if (error) throw error;
          console.log(id);
          res.redirect('/hod_event.ejs');
        });
      } else if (req.body.decline) {
        // Delete the row from the table
        // const id = req.body.decline;
         var [email, id] = req.body.decline.split(',');
         console.log(id);
        connection.query('DELETE FROM applyevent WHERE studentemail= ? AND eventid = ? ', [email,id], (error, results) => {
          if (error) throw error;
          res.redirect('/hod_event.ejs');
        });
      }


    });




    
  });





  // TEACHER SIGN UP -> GET 
  router.get('/teacher_signup.ejs', (req, res) => {
    res.render('faculty/teacher_signup');
  });


// Teacher SIGN UP -> POST 
router.post('/teacher_signup.ejs', (req, res) => {
    
  var name = req.body.name;
  var email = req.body.email;

  const allowedDomain = 'srmist.edu.in';
  const emailDomain = email.split('@')[1];
  if (emailDomain !== allowedDomain) {
    res.redirect('/teacher_signup.ejs');
    // alert('USE SRM MAIL ID ONLY ');
  }


  var password =req.body.password;
  var cpassword =req.body.cpassword;
  var reg_num =req.body.reg_num;
  var phone =req.body.phone;
  var dept =req.body.dept;

  if (password !== cpassword) {
    res.status(400).send('Password and confirm password fields do not match')
    return
  }

  con.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal server error');
      return;
    }

    const emailQuery = 'SELECT * FROM teacher WHERE email = ?';
    connection.query(emailQuery, [req.body.email], (err, results) => {
      connection.release();
      if (err) {
        console.error(err);
        res.status(500).send('Internal server error');
        return;
      }

      if (results.length > 0) {
        res.status(400).send('Email already exists');
        return;
      }






  con.getConnection((err, connection) => {
    if (err) {
      console.log('Error getting connection from pool:', err)
      res.status(500).send('An error occurred while trying to insert data')
      return
    }
    var hashpassword = bcrypt.hashSync(password, 10);
    connection.query('INSERT INTO teacher (email, password,name,reg_num,phone,dept) VALUES (?,?,?,?,?,?)', [email, hashpassword,name,reg_num,phone,dept], (err, results) => {
      connection.release() // release the connection back to the pool

      if (err) {
        console.log('Error inserting data into database:', err)
        res.status(500).send('An error occurred while trying to insert data')
      } else {
        res.redirect('/teacher_signin.ejs');
      }
    })
  })})});

  });





  // TEACHER SIGN IN -> GET 
  router.get('/teacher_signin.ejs', (req, res) => {
    res.render('faculty/teacher_signin');
  });



// TEACHER SIGN IN  -> POST
router.post('/teacher_signin.ejs', (req, res) => {
    
 
  var email = req.body.email;
  var password =req.body.password;
  


// To get a connection from the pool, use the `getConnection()` method
con.getConnection((error, connection) => {
  if (error) {
    console.error('Error getting connection from pool:', error);
    return;
  }
  var sql = 'select * from teacher where email = ?;';
  
  con.query(sql,[email], function(err,result, fields){
    if(err) throw err;

    if(result.length && bcrypt.compareSync(password, result[0].password)){
      req.session.email = email;
      res.redirect('/teacher_event.ejs');
    }else{
      req.session.flag = 4;
      res.redirect('/teacher_signin.ejs');
    }
  });
 
});
});





router.get("/event_handler_approval.ejs", requireLogin, (req, res) => {

  
  con.getConnection((error, connection) => {
    if (error) throw error;
  
    const query = 'SELECT * FROM applyevent WHERE facultyemail = ?';
    const email = req.session.email;
  
    connection.query(query, [email], (error, results) => {
      connection.release();
      if (error) throw error;
  
      res.render('faculty/event_handler_approval', { events: results });
    });
  });
  
  } )

  router.post("/event_handler_approval.ejs", requireLogin, (req, res) => {


    con.getConnection((error, connection) => {
      if (error) throw error;
    
      
      var facultyemail = req.session.email;
   
      if (req.body.approveAll) {
        // Update the status of all rows to "approved"
        
        connection.query('UPDATE applyevent SET eventhandler_approved = ? WHERE facultyemail = ? ', ['1',facultyemail], (error, results) => {
          if (error) throw error;
          res.redirect('/event_handler_approval.ejs');
        });
      } else if (req.body.declineAll) {
        // Delete all rows from the table
        
        connection.query('DELETE FROM applyevent WHERE facultyemail = ? ',[facultyemail] , (error, results) => {
          if (error) throw error;
          res.redirect('/event_handler_approval.ejs');
        });
      } else if (req.body.approve) {
        // Update the status of the row to "approved"
        // const id = req.body.approve;
        var [email, id] = req.body.approve.split(',');
        connection.query('UPDATE applyevent SET eventhandler_approved = ?  WHERE studentemail = ? AND eventid = ? ' , ['1', email,id], (error, results) => {
          if (error) throw error;
          console.log(id);
          res.redirect('/event_handler_approval.ejs');
        });
      } else if (req.body.decline) {
        // Delete the row from the table
        // const id = req.body.decline;
         var [email, id] = req.body.decline.split(',');
         console.log(id);
        connection.query('DELETE FROM applyevent WHERE studentemail= ? AND eventid = ? ', [email,id], (error, results) => {
          if (error) throw error;
          res.redirect('/event_handler_approval.ejs');
        });
      }


    });




  
    




  });



module.exports = router