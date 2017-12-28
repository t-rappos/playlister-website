const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

let sequelize = null;

let localConfig = null;
try {
    localConfig = require('../db/local_config.js');
    sequelize = new Sequelize(localConfig.config);
} catch (e) {
    console.log(e);
    console.log('couldnt load local database configuration, must use production config');
    if (process.env.DATABASE_URL && process.env.DATABASE_URL != '') {
        console.log('found production config');
        sequelize = new Sequelize(process.env.DATABASE_URL);
    } else {
        console.log('couldnt find production config');
    }
}

if (sequelize) {
    sequelize.authenticate().then(() => {
        console.log('Connection has been established successfully.');
    })
        .catch((err) => {
            console.error('Unable to connect to the database:', err);
            throw (err);
        });
} else {
    throw new Error("Unable to connect to the database");
}

const Users = require('./users');
const Devices = require('./devices');
const Playlists = require('./playlists');
const YoutubeTracks = require('./youtubeTracks');
const Tracks = require('./tracks');
const PlaylistTracks = require('./playlistTracks');
const DeviceTracks = require('./deviceTracks');
const ServerStatus = require('./serverStatus');


// TODO: move this into a global config / settings file?
// remake tables, clears all data. Otherwise just create tables if they aren't present.
const forceNew = false; // ^
const Tables = {};

async function makeTables() {
    try {
        Tables.User = await Users.buildUserTable(sequelize, forceNew);
        Tables.Device = await Devices.buildDeviceTable(sequelize, Tables.User, forceNew);
        Tables.Playlist = await Playlists.buildPlaylistTable(sequelize, Tables.User, forceNew);
        Tables.YoutubeTrack = await YoutubeTracks.buildYoutubeTrackTable(sequelize, forceNew);
        Tables.Track = await Tracks.buildTrackTable(sequelize, Tables.YoutubeTrack, forceNew);
        Tables.DeviceTrack = await DeviceTracks.buildDeviceTrackTable(sequelize, Tables.Device, Tables.Track, forceNew);
        Tables.PlaylistTrack = await PlaylistTracks.buildPlaylistTrackTable(sequelize, Tables.Playlist, Tables.Track, forceNew);
        await Tables.Device.belongsToMany(Tables.Track, { through: Tables.DeviceTrack });
        await Tables.Track.belongsToMany(Tables.Device, { through: Tables.DeviceTrack });
        Tables.ServerStatus = await ServerStatus.buildServerStatusTable(sequelize);
    } catch (e) {
        console.error(e);
        throw e;
    }
}

// https://stackoverflow.com/questions/35445849/sequelize-findone-latest-entry
async function getLatestServerStatus() {
    return (await Tables.ServerStatus.findAll({
        limit: 1,
        order: [['createdAt', 'DESC']],
    }))[0];
}

async function initialDBPopulate() {
    await makeTables();

    if (forceNew) {
        await Tables.User.create({
            username: "tom",
            password: bcrypt.hashSync("rap", 8),
            email: "tom@rap.com",
        });
    }

    const lastServerState = await getLatestServerStatus();
    const incrementReset = (forceNew ? 1 : 0);
    const resetId = lastServerState ? lastServerState.dbResetId + incrementReset : 1;

    const ss = await Tables.ServerStatus.create({ dbResetId: resetId });
    console.log(`created first server : reload id : ${ss.reloadId} db reset id : ${ss.dbResetId}`);
    console.log("Populated initial database");
}

initialDBPopulate();
/*
makeTables().then(() => {
    // TODO: this db functionality should be somewhere else, e.g. user controller?
    // if we include dbApi it makes a circular reference...
    if (forceNew) { // insert dummy data
        Tables.User.create({
            username: "tom",
            password: bcrypt.hashSync("rap", 8),
            email: "tom@rap.com",
        });
    }

    console.log("finished creating tables");
});
*/

console.log("Exporting modules");

module.exports = Tables;

console.log(module.exports);
