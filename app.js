const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const config = require('./config');

const app = express();
// setting the view engine the folder views for all ejs templates 
app.set('view engine','ejs');
// using public folder for all static things like css and images etc 
app.use(express.static('public'));


app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true
}));

// taking landing page responses 

app.get('/', (req, res) => {
  res.render('index');
});

// taking main login page responses 
app.get('/main_login.ejs', (req, res) => {
  res.render('main_login');
});

// taking faculty login page responses 
app.get('/faculty_login.ejs', (req, res) => {
  res.render('faculty_login');
});

// taking student login page responses 
app.get('/student_login.ejs', (req, res) => {
  res.render('student_login');
});



// Login page
app.get('/login', (req, res) => {
  res.send(`
    <h1>Login</h1>
    <form method="post" action="/login">
      <input type="text" name="email" placeholder="Email" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
  `);
});

// Login verification
app.post('/student_login.ejs', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const conn = await mysql.createConnection(config);

  try {
    // Find user by email
    const [rows] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (user) {
      // Compare password hash
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.userId = user.id;
        res.redirect('/student_event.ejs');
      } else {
        res.send('Incorrect password');
      }
    } else {
      res.send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.send('Error');
  } finally {
    await conn.end();
  }
});

// Event 
app.get('/student_event.ejs', (req, res) => {
  if (req.session.userId) {
    res.send(`
      <h1>Dashboard</h1>
      <p>Welcome user ${req.session.userId}!</p>
      <a href="/logout">Logout</a>
    `);
  } else {
    res.redirect('/student_login.ejs');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
