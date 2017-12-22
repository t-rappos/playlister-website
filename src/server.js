const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');

var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var dbApi = require('./db/db_api.js');
//var db = require('./db');
//var bcrypt = require('bcrypt');


passport.use(new Strategy(dbApi.authenticateUser));
passport.use(new BasicStrategy(dbApi.authenticateUser));


passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(dbApi.passportDeserializeUser);

var app = express();

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({ extended: true,limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));
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
      res.send(404,"not logged in");
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

/* GET register device*/
app.get('/device/:deviceName/:deviceType',
        passport.authenticate('basic', { session: false }),
        (req,res)=>{
          let id = req.user.id;
          let deviceName = req.params.deviceName;
          let deviceType = req.params.deviceType;
          let deviceTypeId = -1;
          if(deviceType === 'PC'){
            deviceTypeId = 0;
          }
          if (deviceType === 'ANDROID') {
            deviceTypeId = 1;
          }
          if(deviceTypeId == -1 || deviceName == "" 
            || deviceName == undefined){
            res.send(404,"Incorrect device details");
          }
          console.log("tried to register a device, userId="+id);
          dbApi.registerDevice(deviceName,deviceTypeId,id)
          .then((device)=>{
            res.json(device);
          })
          .catch((e)=>{
            res.send(404,"Couldn't register device");
            console.log(e);
          });
        }
);

/* DELETE unregister device*/
app.delete('/device/:deviceName/:deviceId',
            passport.authenticate('basic', { session: false }),
            (req,res)=>{
              let deviceName = req.params.deviceName;
              let deviceId = req.params.deviceId;
              if( !deviceId  || deviceName == "" 
                || deviceName == undefined){
                res.send(404,"Incorrect device details");
              }
              dbApi.unregisterDevice(deviceName,deviceId)
              .then(()=>{
                console.log("device has been unregistered");
                console.log(deviceName);
                console.log(deviceId);
                res.send(200,"Ok")
              })
              .catch((e)=>{
                console.log(e);
                res.send(404,"Incorrect device details");
              });
            }
);

/* POST send tracks (to server)*/
app.post('/tracks',
        passport.authenticate('basic', { session: false }),
        (req,res)=>{
          if(!(req.body && req.body.deviceId && req.body.tracks)){
            res.send(404,"Tracks sent incorrectly");
          }
          //console.log(req.body);
          dbApi.addTracks(req.user.id, req.body.deviceId, req.body.tracks)
          .then(()=>{
            console.log("tracks added to database correctly");
            res.send(200,"Ok");
          })
          .catch((e)=>{
            console.log(e);
            res.send(404,"Tracks could not be stored");
          })
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
    dbApi.createUser(req.body.username,req.body.password,req.body.email)
    .then((acc)=>{
      console.log("created registered account");
      res.redirect('/login');
    })
    .catch((e)=>{
      console.log(e);
    });
  });


// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/build/index.html'));
});


app.listen(process.env.PORT || 8080);

module.exports = app;