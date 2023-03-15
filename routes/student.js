const express = require("express");
const router = express.Router();
const con = require("../config.js");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { sendVerificationCode } = require("../mail");

// Define middleware function to check if user is logged in
function requireLogin(req, res, next) {
  if (req.session && req.session.email) {
    // User is logged in, call the next middleware function
    return next();
  } else {
    // User is not logged in, check if current route is sign-up route
    if (req.originalUrl === "/batch_signup.ejs") {
      // User is trying to sign up, call the next middleware function
      return next();
    } else {
      // User is not trying to sign up, redirect to login page
      return res.redirect("/batch_signin.ejs");
    }
  }
}

// Multer Set up for uploading Images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// BATCH SIGN UP  -> GET

router.get("/batch_signup.ejs", (req, res) => {
  res.render("student/batch_signup");
});

// BATCH SIGN UP  -> POST

router.post("/batch_signup.ejs", function (req, res, next) {
  var name = req.body.name;

  var email = req.body.email;

  // FOR CHECKING SRM MAIL ID
  const allowedDomain = "srmist.edu.in";
  const emailDomain = email.split("@")[1];
  if (emailDomain !== allowedDomain) {
    res.redirect("/batch_signup.ejs");
    // alert('USE SRM MAIL ID ONLY ');
  }

  var reg_num = req.body.reg_num;

  req.session.password = req.body.password;
  var password = req.session.password;

  var cpassword = req.body.cpassword;

  // CHECKING MAIL IN DATABASE

  con.getConnection((error, connection) => {
    if (error) {
      console.log(error);
    } else {
      con.query(
        `SELECT * FROM users WHERE studentemail = '${email}'`,
        (error, results) => {
          connection.release();
          if (error) {
            console.error("Error querying database: ", error);
            res.status(500).send("Error querying database");
          } else if (results.length === 0) {
            console.log(`User with email ${email} does not exist`);
            res.status(401).send("Invalid email or password");
          } else {
            if (cpassword == password) {
              var sql = "select * from users where studentemail = ?  ; ";

              con.getConnection((error, connection) => {
                if (error) {
                  console.log(error);
                } else {
                  con.query(sql, [email], function (err, result, fields) {
                    connection.release();
                    if (err) throw err;

                    if (result.length === 0) {
                      req.session.flag = 1;
                      res.redirect("/batch_signup.ejs");
                    } else {
                      req.session.name = result[0].studentname;
                      req.session.email = result[0].studentemail;
                      req.session.reg_num = result[0].reg_num;
                      req.session.year = result[0].year;
                      req.session.id = result[0].id;

                      con.getConnection((error, connection) => {
                        if (error) {
                          console.log(error);
                        } else {
                          var sql =
                            "select * from batch1 where studentemail = ? UNION   SELECT * FROM batch2 WHERE studentemail = ? UNION   SELECT * FROM batch3 WHERE studentemail = ?;";
                          con.query(
                            sql,
                            [email, email, email],
                            function (err, result, fields) {
                              connection.release();
                              if (err) throw err;

                              if (result.length !== 0) {
                                req.session.flag = 1;
                                res.redirect("/batch_signup.ejs");
                              } else {
                                // req.session.password = result[0].studentname;

                                const verificationCode =
                                  sendVerificationCode(email);
                                req.session.verificationCode = verificationCode;

                                res.render("student/student_verify", { email });
                              }
                            }
                          );
                        }
                      });
                    }
                  });
                }
              });
            } else {
              req.session.flag = 3;
              res.redirect("/batch_signup.ejs");
            }
          }
        }
      );
    }
  });
});

// STUDENT VERIFY -> GET

router.get("/student_verify.ejs", (req, res) => {
  const email = req.session.email;
  res.render("student/student_verify", { email });
});

// STUDENT VERIFY -> POST

router.post("/student_verify.ejs", (req, res) => {
  const enteredCode = req.body.code;
  const savedCode = req.session.verificationCode;
  const email = req.session.email;
  const password = req.session.password;
  const name = req.session.name;
  const reg_num = req.session.reg_num;

  if (enteredCode == savedCode) {
    var hashpassword = bcrypt.hashSync(password, 10);
    const originalString = reg_num;
    const batch = originalString.slice(2, 4); // "21"
    // console.log(substring);
    var sql;
    var sql2;
    if (batch === "22") {
      sql = `insert into batch1 (studentname,reg_num,studentemail,password,verified,year) values(?,?,?,?,?,?);`;
      // sql2 = 'UPDATE users SET studentname = ?, reg_num = ?, password = ?,verified=? WHERE studentemail = ?';
    } else if (batch === "21") {
      sql = `insert into batch2 (studentname,reg_num,studentemail,password,verified,year) values(?,?,?,?,?,?); `;
      // sql2 = 'UPDATE users SET studentname = ?, reg_num = ?, password = ?,verified=? WHERE studentemail = ?';
    } else if (batch === "20") {
      sql = `insert into batch3 (studentname,reg_num,studentemail,password,verified,year) values(?,?,?,?,?,?); `;
      //  sql2 = 'UPDATE users SET studentname = ?, reg_num = ?, password = ?,verified=? WHERE studentemail = ?';
    } else {
      console.error("Invalid value");
    }

    // const values = [name, reg_num,email,hashpassword, true];
    // var sql = 'insert into users(studentname,reg_num,studentemail,password,verified) values(?,?,?,?,?);';
    // var sql = 'UPDATE users SET studentname = ?, reg_num = ?,password = ?,verified = ? WHERE studentemail = ?';

    con.getConnection((error, connection) => {
      if (error) {
        console.log(error);
      } else {
        con.query(
          sql,
          [
            req.session.name,
            req.session.reg_num,
            req.session.email,
            hashpassword,
            true,
            req.session.year,
          ],
          function (err, result, fields) {
            connection.release();
            if (err) {
              throw err;
            } else {
              res.redirect("/batch_signin.ejs");
            }
          }
        );
        // con.query(sql2, [name, reg_num,hashpassword, true,email] , function (err, result, fields) {
        //   connection.release();
        //   if (err) { throw err; }

        // });
      }
    });
    // res.redirect('/batch_signin.ejs');
  } else {
    res.render("student/student_verify", {
      email,
      error: "Invalid verification code",
    });
  }
});

// STUDENT RESEND -> GET

router.get("/student_resend.ejs", (req, res) => {
  const email = req.session.email;
  const verificationCode = sendVerificationCode(email);
  req.session.verificationCode = verificationCode;
  res.redirect("/student_verify.ejs");
});

// BATCH SIGNIN -> GET

router.get("/batch_signin.ejs", (req, res) => {
  res.render("student/batch_signin");
});

// BATCH SIGNIN -> POST

router.post("/batch_signin.ejs", function (req, res, next) {
  var email = req.body.email;
  req.session.email = email;
  var password = req.body.password;
  var sql =
    "select * from batch1 where studentemail = ? UNION   SELECT * FROM batch2 WHERE studentemail = ? UNION   SELECT * FROM batch3 WHERE studentemail = ?;";

  con.getConnection((error, connection) => {
    if (error) {
      console.log(error);
    } else {
      con.query(sql, [email, email, email], function (err, result, fields) {
        connection.release();
        if (err) {
          throw err;
        }

        if (
          result.length &&
          bcrypt.compareSync(password, result[0].password) &&
          result[0].verified
        ) {
          req.session.email = email;
          req.session.name = result[0].studentname;
          res.redirect("/student_event.ejs");
        } else {
          req.session.flag = 4;
          res.redirect("/batch_signin.ejs");
        }
      });
    }
  });
});

// taking student event page responses
router.get("/student_event.ejs", requireLogin, (req, res) => {
  con.getConnection((error, connection) => {
    if (error) {
      console.error("Failed to get a connection from the pool:", error);
      res.status(500).send("Failed to get a connection from the pool");
    } else {
      // Define a SQL query to retrieve all events
      const sql = "SELECT * FROM newevent";

      // Execute the SQL query
      connection.query(sql, (error, results) => {
        // Release the connection back to the pool
        connection.release();

        if (error) {
          console.error("Failed to retrieve events:", error);
          res.status(500).send("Failed to retrieve events");
        } else {
          var name = req.session.name;
          // Render the EJS view template and pass the retrieved events as a data object
          res.render("student/student_event", { name, newevent: results });
        }
      });
    }
  });
});
// taking student event page responses
router.post("/student_event_form.ejs", requireLogin, (req, res) => {
  res.redirect("/student_event_form.ejs");
});

// taking student event info page responses
router.get("/student_event_info.ejs/:eventId", requireLogin, (req, res) => {
  
  const eventId = req.params.eventId;
  const email = req.session.email;
  // var isRegistered ;
  con.getConnection((error, connection) => {
    if (error) throw error;
    console.log('Connected to MySQL database!');
  
    const query = `SELECT * FROM applyevent WHERE studentemail='${email}' AND eventid ='${eventId}' `;
    connection.query(query, (error, results) => {
      connection.release();
      if (error) throw error;
    
       if (results.length == 0){
       var isRegistered = false ;

        
       }
       else{
       var isRegistered = true ;
       }
      
       const sql = "SELECT * FROM newevent WHERE id = ?";
  con.query(sql, [eventId], (err, results) => {
    if (err) throw err;
    const event = results[0];
    res.render("student/student_event_info", { event ,isRegistered });
  });
    });

  });

  


 
});


router.post("/delete_event/:eventId",requireLogin,(req,res)=>{
  const eventId = req.params.eventId;
  con.getConnection((error, connection) => {
    if (error) throw error;
    console.log('Connected to MySQL database!');
  
    const query = `DELETE FROM applyevent WHERE eventid = ${eventId} `;
    connection.query(query, (error, results) => {
      connection.release();
      res.redirect("/student_event.ejs");
      
    });

  });

})





// taking student event info page responses
router.post("/student_event_info.ejs/:eventId", requireLogin, (req, res) => {
 
  const eventId = req.params.eventId;
  var email = req.session.email;

// First query to fetch user details based on email
const fetchUserQuery = "SELECT * FROM users WHERE studentemail = ?";
const fetchUserValues = [email]; // Replace email with the actual email value

// Second query to fetch event details based on event ID
const fetchEventQuery = "SELECT * FROM newevent WHERE id = ?";
const fetchEventValues = [eventId]; // Replace eventId with the actual event ID value

// Execute both queries using a single connection from the pool
con.getConnection((err, connection) => {
  if (err) {
    console.error("Error getting connection from pool: ", err);
    // Handle error
  } else {
    // First query to fetch user details
    connection.query(fetchUserQuery, fetchUserValues, (err, userResults) => {
      if (err) {
        console.error("Error fetching user details: ", err);
        connection.release();
        // Handle error
      } else { var name = userResults[0].studentname;
        // Second query to fetch event details
        connection.query(fetchEventQuery, fetchEventValues, (err, eventResults) => {
          if (err) {
            console.error("Error fetching event details: ", err);
            connection.release();
            // Handle error
          } else {
            // Insert new row into applyevent table
            const applyEventQuery = " insert into applyevent (studentname,studentreg_num,studentemail,dept,year,section,eventname,eventid,eventsubname,startdate,enddate,facultyname,facultyreg_num,facultyphone,facultyemail,fees,clubname,studentlimit) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
            const applyEventValues = [
              userResults[0].studentname,
              userResults[0].reg_num,
              userResults[0].studentemail,
              userResults[0].dept,
              userResults[0].year,
              userResults[0].sec,
              eventResults[0].eventname,
              eventResults[0].id,
              eventResults[0].eventsubname,
              eventResults[0].startdate,
              eventResults[0].enddate,
              eventResults[0].facultyname,
              eventResults[0].facultyreg_num,
              eventResults[0].phone,
              eventResults[0].facultyemail,
              eventResults[0].fees,
              eventResults[0].clubname,
              eventResults[0].studentlimit
            ];
            connection.query(applyEventQuery, applyEventValues, (err, results) => {
              connection.release();
              if (err) {
                console.error("Error inserting new row into applyevent table: ", err);
                // Handle error
              } else {
                console.log("New row inserted into applyevent table");
                // Handle success
                res.redirect("/student_event.ejs");
              }
            });
          }
        });
      }
    });
  }
});




 
});

module.exports = router;
