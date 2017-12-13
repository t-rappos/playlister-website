var React = require('react');
var ReactDOMServer = require('react-dom/server');
var HelloWorld = require('./components/HelloWorld');
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var db = require('./db');
var bcrypt = require('bcrypt');


// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.

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

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
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


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + 'src/views');
app.set('view engine', 'ejs');

app.use(express.static('public'));

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.get('/api/me',
  passport.authenticate('basic', { session: false }),
  function(req, res) {
    res.json(req.user);
  });

// Define routes.
app.get('/', function (req, res) {
  res.render('layout', {
    content: ReactDOMServer.renderToString(<HelloWorld />)
  });
});

//app.get('/',
//  function(req, res) {
//    res.render('home', { user: req.user });
//  });

app.get('/login',
  function(req, res){
    res.render('login');
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/register',(req,res)=>{
  res.render('register');
});

app.post('/register',(req,res)=>{

  //TODO: think about moving DB calls out of this file.
  db.User.create({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, 8),
    email : req.body.email
  })
  .then((acc)=>{
    res.redirect('/login');
  })
  .catch((e)=>{
    console.log(e);
  });
});

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.listen(3000);
