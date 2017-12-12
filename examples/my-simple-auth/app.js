var express  = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var session = require("express-session");
var bodyParser = require("body-parser");
var GoogleTokenStrategy = require('passport-google-token').Strategy;

const app = express();

var users = [];

function addUser(user){
    console.log("add user", user.name);
    var index = users.indexOf(user);
    if(index <=0){
        console.log("adding user", user.name);
        users.push(user);
        return user;
    } else {
        users[index] = user;
        return user;
    }
}

function getUser(id){
    console.log("get user", id);
    for(var i = 0; i < users.length; i++){
        if(users[i].id == id){
            console.log("found user", users[i].name);
            return users[i];
        }
    }
    
    return null;
}

app.use(express.static("public"));
app.use(session({
    secret: "cats" ,    
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
    done(null, getUser(id));
});

passport.use(new GoogleTokenStrategy({
    clientID: '342512132953-3ai8t51p0heaor1t6g1pu5s6d1mef9ok.apps.googleusercontent.com',
    clientSecret: '6DNDGBotQYJNszvOHEmG0Lrj',
  },
  function(accessToken, refreshToken, profile, done) {
    done(null, addUser(profile));
  }
));

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: '342512132953-3ai8t51p0heaor1t6g1pu5s6d1mef9ok.apps.googleusercontent.com',
    clientSecret: '6DNDGBotQYJNszvOHEmG0Lrj',
    callbackURL: "http://localhost:8080/auth/google/callback"
  },
    function(accessToken, refreshToken, profile, done) {
        done(null, addUser(profile));
    }
));

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
        function(req, res) {
            res.redirect('/profile');
        });

app.get('/auth/google/token', passport.authenticate('google-token'),
    function(req, res) {
        res.send(req.user);
    });

  app.get('/logout', function(req, res){
    req.logout();
    req.session.destroy();
    res.redirect('/');
  });

  var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()){
        console.log("authenticated",req);
        console.log("authenticated");
        return next();
    }
    console.log("failed authenticated",req);
    console.log("failed authenticated");
    res.redirect('/');
  }

app.get('/profile2', passport.authenticate("google-token"), (req, res) => res.send('Profile Page 2'))
app.get('/profile', isAuthenticated, (req, res) => res.send('Profile Page'))
app.get('/login', (req, res) => res.send('<a href="/auth/google">Sign In with Google</a>'))
app.get('/', (req, res) => res.send('<a href="/login">Login Page</a>'))
app.listen(8080, () => console.log('Example app listening on port 3000!'))