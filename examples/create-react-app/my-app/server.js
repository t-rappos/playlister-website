const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');

var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var db = require('./db');
var bcrypt = require('bcrypt');


function authenticateUser(username, password, cb){
  db.User.findOne({where:{username:username}})
  .then((user)=>{
    if (!user) { return cb(null, false); }
    if (!bcrypt.compareSync(password, user.password)) { return cb(null, false); }
    return cb(null, user);
  })
  .catch((e)=>{
    console.log(e);
    return cb(err);
  });
}

passport.use(new Strategy(authenticateUser));
passport.use(new BasicStrategy(authenticateUser));


passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.User.findOne({where:{id:id}})
  .then((user)=>{
    cb(null, user);
  })
  .catch((e)=>{
    console.log(e);
    return cb(err);
  });
});

var app = express();

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized:true,cookie: { secure: false } }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'build')));

console.log(process.env.PORT || 8080);

function isLoggedIn(req, res, next) {
      // if user is authenticated in the session, carry on 
      if (req.isAuthenticated())
          return next();
      // if they aren't redirect them to the home page
      res.json([{
        id: 1,
        username: "not logged in"
      }]);
  }
app.get('/api/me',
  passport.authenticate('basic', { session: false }),
  function(req, res) {
    res.json(req.user);
});

//require('connect-ensure-login').ensureLoggedIn() //<-- this doesnt work?
app.get('/settings', isLoggedIn,
function(req, res) {
  res.json([{
  	id: 1,
  	username: "s1"
  }, {
  	id: 2,
  	username: "D0loresH4z11"
  }]);
});


/* GET users listing. */
app.get('/users', function(req, res, next) {

  res.json([{
  	id: 1,
  	username: "usrs"
  }, {
  	id: 2,
  	username: "D0loresH4z11"
  }]);
});


app.post('/login', 
passport.authenticate('local'),
  function(req, res) {
    req.login(req.user,function(err){
      console.log("logged in");
      res.redirect('/');
      //return res.send('Login successful');
    });
});

app.post('/register',(req,res)=>{
    //TODO: think about moving DB calls out of this file.
    db.User.create({
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 8),
      email : req.body.email
    })
    .then((acc)=>{
      console.log("created registered account");
      res.redirect('/login');
    })
    .catch((e)=>{
      console.log(e);
    });
  });

module.exports = app;

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/build/index.html'));
});


app.listen(process.env.PORT || 8080);