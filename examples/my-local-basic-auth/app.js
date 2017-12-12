var express  = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function(username, password, done) {
        return done(null, {username:username})

        //if( checkUser(username, password) ){
        //    return done(null, {username:username});
        //} else {
        //    return done(null, false, { message: 'Incorrect username/password.' });
        //}
    }
  ));

var app = express();

var users = [];
users.push({username : 'tom', password: 'pw'});

//returns true if successful in adding new user
function addUser(username, password){
    console.log("add user", username);
    var user = {username : username, password: password};
    var index = users.indexOf(user);
    if(index <=0){
        console.log("adding user", user.username);
        users.push(user);
        return true;
    } else {
        return false;
    }
}

function checkUser(username, password){
    console.log("get user", username);
    for(var i = 0; i < users.length; i++){
        if(users[i].username == username && 
            users[i].password == password){
                console.log("Password correct for user", users[i].username);
                return true;
        }
    }
    return false;
}
app.use(passport.initialize());

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/fail'})
);

app.get('/login', (req,res)=>{
    res.send('<form action="/login" method="post">\
    <div>\
        <label>Username:</label>\
        <input type="text" name="username"/>\
    </div>\
    <div>\
        <label>Password:</label>\
        <input type="password" name="password"/>\
    </div>\
    <div>\
        <input type="submit" value="Log In"/>\
    </div>\
</form>');
});

app.get('/', (req, res) => res.send('Hello World!'))
app.get('/fail', (req, res) => res.send('failed login!'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))