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

//TODO: move this into a global config / settings file?
var forceNew = true; //remake tables, clears all data. Otherwise just create tables if they aren't present.

let Tables = {};
//let User = null;
//let Device = null;
//let Playlist = null;
//let Track = null;
//let DeviceTrack = null;
//let PlaylistTrack = null;

//TODO: does this need to be async?
function makeTables(){
    return new Promise((res,rej)=>{
        Users.buildUserTable(sequelize, forceNew)
        .then((lUser)=>{
            Tables.User = lUser;
            return Devices.buildDeviceTable(sequelize, Tables.User, forceNew);
        })
        .then((lDevice)=>{
            Tables.Device = lDevice;
            return Playlists.buildPlaylistTable(sequelize, Tables.User, forceNew);
        })
        .then((lPlaylist)=>{
            Tables.Playlist = lPlaylist;
            return Tracks.buildTrackTable(sequelize, forceNew);
        })
        .then((lTrack)=>{
            Tables.Track = lTrack;
            return DeviceTracks.buildDeviceTrackTable(sequelize, Tables.Device, Tables.Track, forceNew);
        })
        .then((lDeviceTrack)=>{
            Tables.DeviceTrack = lDeviceTrack;
            return PlaylistTracks.buildPlaylistTrackTable(sequelize, Tables.Playlist, Tables.Track, forceNew); 
        })
        .then((lPlaylistTrack)=>{
            Tables.PlaylistTrack = lPlaylistTrack;
            res();
        }).catch((e)=>{
            console.log(e);
            rej(e);
        })
    });
}

makeTables().then(()=>{
    //TODO: this db functionality should be somewhere else, e.g. user controller?
    //if we include dbApi it makes a circular reference... 
    if(forceNew){   //insert dummy data
        Tables.User.create({
            username: "tom",
            password: bcrypt.hashSync("rap", 8),
            email : "tom@rap.com"
        });
    }
    console.log("finished creating tables");
});

console.log("Exporting modules");

module.exports = Tables;

console.log(module.exports);