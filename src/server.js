const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const passport = require('passport');
const { Strategy } = require('passport-local');
const { BasicStrategy } = require('passport-http');
const dbApi = require('./db/db_api.js');
// var db = require('./db');
// var bcrypt = require('bcrypt');

console.log("NODE_ENV", process.env);

passport.use(new Strategy(dbApi.authenticateUser));
passport.use(new BasicStrategy(dbApi.authenticateUser));


passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser(dbApi.passportDeserializeUser);

const app = express();
app.use(compression());

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(require('express-session')({ // TODO: put sectet in config file
    secret: 'keyboard cat', resave: true, saveUninitialized: true, cookie: { secure: false },
}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'build')));

console.log(process.env.PORT || 8080);

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    }
    // if they aren't redirect them to the home page
    res.send(404, 'not logged in');
    return null;
}

// TODO: is this used?
// can we replace a call to this with one that does
// something functional as well as authenticate
app.get(
    '/api/me',
    passport.authenticate('basic', { session: false }),
    (req, res) => {
        res.json(req.user);
    },
);

// will return ok if user has valid session
app.get(
    '/me',
    isLoggedIn,
    async (req, res) => {
        res.send(200, 'Ok');
    },
);

app.post('/playlist', isLoggedIn, async (req, res) => {
    const { name, color, icon } = req.body;
    await dbApi.addPlaylist(req.user.id, name, color, icon);
    res.send(200, 'Ok');
});

app.post('/updateplaylist', isLoggedIn, async (req, res) => {
    try {
        const {
            id, name, color, icon,
        } = req.body;
        const result = await dbApi.updatePlaylist(id, req.user.id, name, color, icon);
        console.log(result);
        res.send(200, 'Ok');
    } catch (e) {
        console.error(e);
        res.send(404, 'Error');
    }
});

app.post('/removeplaylist', isLoggedIn, async (req, res) => {
    const result = await dbApi.removePlaylist(req.body.id);
    console.log(result);
    res.send(200, 'Ok');
});

app.post('/playlisttracks', isLoggedIn, async (req, res) => {
    const result = await dbApi.addTracksToPlaylist(req.body.trackIds, req.body.playlistId);
    console.log(result);
    res.send(200, 'Ok');
});


// TODO: find a nice way to return 404 if a sql error occurs in these methods.
app.post('/removeplaylisttracks', isLoggedIn, async (req, res) => {
    const result = await dbApi.removeTracksFromPlaylist(req.body.trackIds, req.body.playlistId);
    console.log(result);
    res.send(200, 'Ok');
});

app.post('/toggleplaylisttracks', isLoggedIn, async (req, res) => {
    console.log("toggleplaylisttracks", req.body);
    const { trackIds, playlistId } = req.body;
    if (!trackIds || trackIds.length === 0) { console.error("no tracks sent"); res.send(404, 'error'); }
    if (!playlistId) { console.error("no playlist sent"); res.send(404, 'error'); }

    const result = await dbApi.togglePlaylistForTracks(trackIds, playlistId);
    console.log(result);
    res.send(200, 'Ok');
});

async function getPlaylistsForUser(req, res) {
    const result = await dbApi.getPlaylistsForUser(req.user.id);
    res.json(result);
}

app.get('/playlists', isLoggedIn, getPlaylistsForUser);
app.get('/mplaylists', passport.authenticate('basic', { session: false }), getPlaylistsForUser);

app.get('/playlisttracks/:playlistId', isLoggedIn, async (req, res) => {
    const result = await dbApi.getPlaylistTrackIds(req.params.playlistId);
    res.json(result);
});

/* get tracks (paths, filenames, hashes) for playlist */
app.get('/mtracks/:playlistId', passport.authenticate('basic', { session: false }), async (req, res) => {
    const result = await dbApi.getTrackPathsForPlaylist(req.params.playlistId);
    res.json(result[0]);
});

/* GET register device */
app.get(
    '/device/:deviceName/:deviceType',
    passport.authenticate('basic', { session: false }),
    (req, res) => {
        const { id } = req.user;
        const { deviceName, deviceType } = req.params;

        let deviceTypeId = -1;
        if (deviceType === 'PC') {
            deviceTypeId = 0;
        }
        if (deviceType === 'ANDROID') {
            deviceTypeId = 1;
        }
        if (deviceTypeId === -1 || deviceName === ''
            || deviceName === undefined) {
            res.send(404, 'Incorrect device details');
        }
        console.log(`tried to register a device, userId=${id}`);
        dbApi.registerDevice(deviceName, deviceTypeId, id)
            .then((device) => {
                res.json(device);
            })
            .catch((e) => {
                res.send(404, "Couldn't register device");
                console.log(e);
            });
    },
);

/* DELETE unregister device */
app.delete(
    '/device/:deviceName/:deviceId',
    passport.authenticate('basic', { session: false }),
    (req, res) => {
        const { deviceName, deviceId } = req.params;

        if (!deviceId || deviceName === ''
                || deviceName === undefined) {
            res.send(404, 'Incorrect device details');
        }
        dbApi.unregisterDevice(deviceName, deviceId)
            .then(() => {
                console.log('device has been unregistered');
                console.log(deviceName);
                console.log(deviceId);
                res.send(200, 'Ok');
            })
            .catch((e) => {
                console.log(e);
                res.send(404, 'Incorrect device details');
            });
    },
);


/* POST remove tracks from device */
app.post(
    '/removetracks',
    passport.authenticate('basic', { session: false }),
    (req, res) => {
        if (!(req.body && req.body.deviceId && req.body.tracks)) {
            res.send(404, 'track data sent incorrectly');
        }
        dbApi.removeTracksFromDevice(req.user.id, req.body.deviceId, req.body.tracks)
            .then(() => {
                console.log('tracks removed from database correctly');
                res.send(200, 'Ok');
            })
            .catch((e) => {
                console.log(e);
                res.send(404, 'Tracks could not be deleted');
            });
    },
);

/* POST send tracks (to server) */
app.post(
    '/tracks',
    passport.authenticate('basic', { session: false }),
    (req, res) => {
        if (!(req.body && req.body.deviceId && req.body.tracks)) {
            res.send(404, 'Tracks sent incorrectly');
        }
        // console.log(req.body);
        dbApi.addTracksToDevice(req.user.id, req.body.deviceId, req.body.tracks)
            .then(() => {
                console.log('tracks added to database correctly');
                res.send(200, 'Ok');
            })
            .catch((e) => {
                console.log(e);
                res.send(404, 'Tracks could not be stored');
            });
    },
);

// client can call this to see if database has been reset or server has been reloaded.
app.get('/status', passport.authenticate('basic', { session: false }), async (req, res) => {
    res.json(await dbApi.getServerStatus());
});

app.get('/youtubeId/:hash', isLoggedIn, async (req, res) => {
    const f = await dbApi.getYoutubeIdForHash(req.params.hash);
    console.log(f);
    res.json(f);
});

app.get(
    '/paths',
    isLoggedIn,
    async (req, res) => {
        try {
            const paths = await dbApi.getUniquePaths(req.user.id);
            res.json(paths ? paths[0] : []);
        } catch (e) {
            console.log(e.name);
            res.send(404, "Couldn't get paths");
        }
    },
);

app.get(
    '/tracks',
    isLoggedIn,
    (req, res) => {
        console.log('getting tracks for user');
        dbApi.getTracks(req.user.id)
            .then((tracks) => {
                console.log(`Returning ${tracks ? tracks[0].length : "0"} tracks`);
                res.json(tracks ? tracks[0] : []);
            })
            .catch((e) => {
                console.log(e.name);
                res.send(404, "Couldn't get tracks");
            });
    },
);


/* GET users listing. */
/*
app.get('/users', (req, res) => {
    res.json([{
        id: 1,
        username: "usrs",
    }, {
        id: 2,
        username: "D0loresH4z11",
    }]);
});
*/


app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
    console.log(`destroyed session for ${req.user}`);
    /*
    console.log("destroying session for " + req.user);
    req.session.destroy(() => {
        console.log("destroyed session for " + req.user);
        res.redirect('/');
    });
    */
});

/*

app.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/main',
        failureRedirect: '/failed', // see text
        failureFlash: true, // optional, see text as well
    }),
    (req, res) => {
        req.login(req.user, () => {
            console.log("logged in");
            res.redirect('/main');
            // return res.send('Login successful');
        }).catch((e) => {
            console.log(e);
            res.redirect('/');
        });
    },
);

*/

app.post('/login', (req, res) => passport.authenticate('local', { successRedirect: '/main', failureRedirect: '/' })(req, res));

app.post('/register', (req, res) => {
    // TODO: think about moving DB calls out of this file.
    dbApi.createUser(req.body.username, req.body.password, req.body.email)
        .then(() => {
            console.log('created registered account');
            res.redirect('/');
        })
        .catch((e) => {
            console.log(e);
        });
});


// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(`${__dirname}/build/index.html`));
});

app.get('*.js', (req, res, next) => {
    req.url += '.gz';
    res.set('Content-Encoding', 'gzip');
    next();
});

app.get('*.jsx', (req, res, next) => {
    req.url += '.gz';
    res.set('Content-Encoding', 'gzip');
    next();
});

app.listen(process.env.PORT || 8080);

module.exports = app;
