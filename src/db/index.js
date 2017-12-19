const Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

var sequelize = null;

var localConfig = null;
try {
    localConfig = require('./db_config.js');
    sequelize = new Sequelize(localConfig.config);
} catch (e) {
    Utility.log('couldnt load local database configuration, must use production config');
    if (process.env.DATABASE_URL && process.env.DATABASE_URL != ''){
      Utility.log('found production config');
      sequelize = new Sequelize(process.env.DATABASE_URL);
    } else {
      Utility.logWarning('couldnt find production config');
    }
}

if(sequelize){
    sequelize.authenticate().then(()=>{
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        throw(err);
    });
} else {
    throw("Unable to connect to the database");
}

var Users = require('./users');
var Devices = require('./devices');
var Playlists = require('./playlists');
var Tracks = require('./tracks');
var PlaylistTracks = require('./playlistTracks');
var DeviceTracks = require('./deviceTracks');

var forceNew = true; //remake tables, clears all data. Otherwise just create tables if they aren't present.

var User;
var Device;
var Playlist;
var Track;
var DeviceTrack;
var PlaylistTrack;

//TODO: does this need to be async?
function makeTables(){
    return new Promise((res,rej)=>{
        Users.buildUserTable(sequelize, forceNew)
        .then((lUser)=>{
            User = lUser;
            return Devices.buildDeviceTable(sequelize, User, forceNew);
        })
        .then((lDevice)=>{
            Device = lDevice;
            return Playlists.buildPlaylistTable(sequelize, User, forceNew);
        })
        .then((lPlaylist)=>{
            Playlist = lPlaylist;
            return Tracks.buildTrackTable(sequelize, forceNew);
        })
        .then((lTrack)=>{
            Track = lTrack;
            return DeviceTracks.buildDeviceTrackTable(sequelize, Device, Track, forceNew);
        })
        .then((lDeviceTrack)=>{
            DeviceTrack = lDeviceTrack;
            return PlaylistTracks.buildPlaylistTrackTable(sequelize, Playlist, Track, forceNew); 
        })
        .then((lPlaylistTrack)=>{
            PlaylistTrack = lPlaylistTrack;
            res();
        }).catch((e)=>{
            console.log(e);
            rej(e);
        })
    });
}

makeTables().then(()=>{
    //TODO: this db functionality should be somewhere else, e.g. user controller?
    if(forceNew){   //insert dummy data
        User.create({
            username: "tom",
            password: bcrypt.hashSync("rap", 8),
            email : "tom@rap.com"
        });
    }
    console.log("finished creating tables");
});


module.exports = {
    User : User,
    Device : Device,
    Playlist : Playlist,
    Track : Track,
    DeviceTrack : DeviceTrack,
    PlaylistTrack : PlaylistTrack
};
