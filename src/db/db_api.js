const bcrypt = require('bcrypt');
const db = require('../db');
const TrackController = require('./controllers/tracks.js');
const YoutubeController = require('./controllers/youtube.js');

function authenticateUser(username, password, cb) {
    db.User.findOne({ where: { username } })
        .then((user) => {
            if (!user) { return cb(null, false); }
            if (!bcrypt.compareSync(password, user.password)) { return cb(null, false); }
            return cb(null, user);
        })
        .catch((e) => {
            console.log(e);
            return cb(e);
        });
}

function passportDeserializeUser(id, cb) {
    db.User.findOne({ where: { id } })
        .then((user) => {
            cb(null, user);
        })
        .catch((e) => {
            console.log(e);
            return cb(e);
        });
}

async function createUser(username, password, email) {
    console.log("creating user");
    try {
        return await db.User.create({
            username,
            password: bcrypt.hashSync(password, 8),
            email,
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
}

function registerDevice(deviceName, deviceTypeId, userId) {
    return db.Device.create({
        name: deviceName,
        typeId: deviceTypeId,
        associated: true,
        userId,
    });
}

async function unregisterDevice(deviceName, deviceId) {
    try {
        const device = await db.Device.findOne({ where: { id: deviceId } });
        if (!device || device.name !== deviceName) {
            throw new Error("Device name didnt match id");
        } else {
            return db.Device.update(
                { associated: false, prevUserId: device.userId },
                { where: { id: deviceId } },
            );
        }
    } catch (e) {
        console.log(e);
        throw (e);
    }
}

// TODO: this is a duplicated function from index.js. Find a way to resolve this
async function getServerStatus() {
    return (await db.ServerStatus.findAll({
        limit: 1,
        order: [['createdAt', 'DESC']],
    }))[0];
}

module.exports = {
    authenticateUser,
    passportDeserializeUser,
    createUser,
    registerDevice,
    unregisterDevice,
    addTracksToDevice: TrackController.addTracksToDevice, //TODO: can we use spread operator here?
    removeTracksFromDevice: TrackController.removeTracksFromDevice,
    getServerStatus,
    getTracks: TrackController.getTracks,
    getYoutubeIdForHash: YoutubeController.getYoutubeIdForHash,
    getUniquePaths: TrackController.getUniquePaths,

    addPlaylist: TrackController.addPlaylist, // (userId, name, color, icon)
    updatePlaylist: TrackController.updatePlaylist,
    removePlaylist: TrackController.removePlaylist, // (id)
    addTracksToPlaylist: TrackController.addTracksToPlaylist, // (trackIds, playlistId)
    removeTracksFromPlaylist: TrackController.removeTracksFromPlaylist, // (tracksIds, playlistId)
    togglePlaylistForTracks: TrackController.togglePlaylistForTracks, // (trackIds, playlistId)
    getPlaylistsForUser: TrackController.getPlaylistsForUser,
    getPlaylistTrackIds: TrackController.getPlaylistTrackIds,
    getTrackPathsForPlaylist: TrackController.getTrackPathsForPlaylist,
};
